"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentProps, ReactNode, RefObject } from "react";

import { atlasRampPositions, getGlyphAtlas } from "@/lib/ascii/atlas";
import type { GlyphAtlas } from "@/lib/ascii/atlas";
import { EDGE_GLYPHS, resolveCharset } from "@/lib/ascii/charsets";
import type { Charset } from "@/lib/ascii/charsets";
import { resolveColor, subscribeToTheme } from "@/lib/ascii/color";
import type { AsciiFrame, AsciiHandle } from "@/lib/ascii/frame";
import { COLOR_CODES, KIND_CODES } from "@/lib/ascii/glsl";
import {
  createAsciiRenderer,
  createFrameInput,
  uniformSpecs,
} from "@/lib/ascii/gpu";
import type { AsciiRenderer, AsciiUniforms, FrameInput } from "@/lib/ascii/gpu";
import { INTERACTIONS } from "@/lib/ascii/look";
import type { AsciiLook, Interaction, PostFx } from "@/lib/ascii/look";
import { getThresholdMap } from "@/lib/ascii/matrices";
import type { DitherMatrix } from "@/lib/ascii/matrices";
import { gridSize, measureCell, readCell, readFont } from "@/lib/ascii/measure";
import type { CellMetrics } from "@/lib/ascii/measure";
import { useFrameLoop, usePrefersReducedMotion } from "@/lib/ascii/motion";
import {
  ANSI16,
  hexToRgb,
  PHOSPHORS,
  RAMPS,
  rgbToOklab,
} from "@/lib/ascii/palettes";
import type { ColorMode, Rgb8 } from "@/lib/ascii/palettes";
import { trackPointer } from "@/lib/ascii/pointer";
import type { PointerTracker } from "@/lib/ascii/pointer";
import { cssColor, DEFAULT_PALETTE } from "@/lib/ascii/tokens";
import type { AsciiColor, AsciiPalette, Rgba } from "@/lib/ascii/tokens";
import { cn } from "@/lib/utils";

export type { AsciiUniforms, ShaderUniformValue } from "@/lib/ascii/gpu";
export { GLSL_HELPERS } from "@/lib/ascii/glsl";

export type AsciiShaderState = "fallback" | "running" | "paused" | "static";

/** Audio input as `useAudioBands` returns it: each band 0 to 1. */
export interface AudioInput {
  readonly bass: number;
  readonly mid: number;
  readonly treble: number;
  readonly level: number;
}

/**
 * Browsers cap live WebGL contexts (Chrome drops the oldest past 16), so
 * every AsciiShader on the page shares a budget. A shader holds a context
 * only while it is near the viewport. Past the budget, a shader coming on
 * screen takes the context of one just outside the viewport, seen least
 * recently first. It never takes one from a shader still on screen, so
 * scrolling doesn't flip visible shaders between canvas and fallback;
 * it waits instead, and gets the next context freed.
 */
export const MAX_LIVE_CONTEXTS = 8;

interface ContextSlot {
  near: boolean;
  onScreen: boolean;
  lastSeen: number;
  active: boolean;
  readonly setActive: (active: boolean) => void;
}

const slots = new Set<ContextSlot>();

const activate = (slot: ContextSlot, active: boolean) => {
  slot.active = active;
  slot.setActive(active);
};

const leastRecent = (candidates: Iterable<ContextSlot>) => {
  let oldest: ContextSlot | null = null;
  for (const slot of candidates) {
    if (!oldest || slot.lastSeen < oldest.lastSeen) {
      oldest = slot;
    }
  }
  return oldest;
};

const requestContext = (slot: ContextSlot) => {
  if (slot.active) {
    return;
  }
  const live = [...slots].filter((other) => other.active);
  if (live.length >= MAX_LIVE_CONTEXTS) {
    const offscreen = live.filter((other) => !other.onScreen);
    const victim = slot.onScreen ? leastRecent(offscreen) : null;
    if (!victim) {
      return;
    }
    activate(victim, false);
  }
  activate(slot, true);
};

const releaseContext = (slot: ContextSlot) => {
  if (!slot.active) {
    return;
  }
  activate(slot, false);
  // A freed context goes to the shader that waited longest, on screen first.
  const waiting = [...slots].filter((other) => other.near && !other.active);
  const onScreen = waiting.filter((other) => other.onScreen);
  const next = leastRecent(onScreen.length > 0 ? onScreen : waiting);
  if (next) {
    activate(next, true);
  }
};

const hasOnScreenWaiter = () =>
  [...slots].some((other) => other.onScreen && other.near && !other.active);

/** Holds a slot in the shared context budget while `ref` is near the viewport. */
const useContextSlot = (ref: RefObject<Element | null>): boolean => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const slot: ContextSlot = {
      active: false,
      lastSeen: 0,
      near: false,
      onScreen: false,
      setActive,
    };
    slots.add(slot);
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        slot.near = entry?.isIntersecting ?? false;
        if (slot.near) {
          slot.lastSeen = performance.now();
          requestContext(slot);
        } else {
          releaseContext(slot);
        }
      },
      { rootMargin: "200px" }
    );
    // Coming on screen can take a context from one that is only nearby, and
    // leaving the screen hands it to an on-screen shader that is waiting.
    const screenObserver = new IntersectionObserver(([entry]) => {
      slot.onScreen = entry?.isIntersecting ?? false;
      if (slot.onScreen && slot.near) {
        slot.lastSeen = performance.now();
        requestContext(slot);
      } else if (!slot.onScreen && slot.active && hasOnScreenWaiter()) {
        releaseContext(slot);
      }
    });
    nearObserver.observe(el);
    screenObserver.observe(el);
    return () => {
      nearObserver.disconnect();
      screenObserver.disconnect();
      // Leave the set first, so the freed context goes to someone else.
      slots.delete(slot);
      releaseContext(slot);
    };
  }, [ref]);

  return active;
};

export interface AsciiShaderProps
  extends AsciiLook, Omit<ComponentProps<"div">, "children"> {
  /**
   * GLSL (ES 1.00) that defines `float field(vec2 uv, vec2 res, float t)`,
   * returning the tone in [0, 1] at one sample: 0 is empty, 1 the densest
   * glyph. `uv` is the sample centre in [0, 1] with y up. `res.y` is the
   * number of sample rows and `res.x / res.y` the box's true aspect ratio,
   * so `1.0 / res.y` is one sample row. Braille samples 2x4 per cell and
   * quadrants 2x2, so don't assume one sample per glyph. `t` is seconds
   * scaled by `speed`. May define helpers too.
   */
  field: string;
  /**
   * GLSL that defines `colorField(vec2 uv, vec2 res, float t)`, returning
   * an sRGB colour as `vec3` or `vec4` in [0, 1], with the same arguments
   * as `field`. Each glyph takes the mean colour of its samples in
   * `truecolor` and the nearest ANSI colour in `ansi16`. Setting it makes
   * `truecolor` the default colour mode.
   */
  colorField?: string;
  /**
   * Extra uniforms, declared for you by name: numbers become `float`,
   * tuples `vec2` to `vec4`. Names must not start with `u_` or `ascii_`.
   * Changing values never recompiles; adding a name does.
   */
  uniforms?: AsciiUniforms;
  /**
   * Colours from paper to ink. Default `["--ascii-paper", "--ascii-ink"]`.
   * The first is the paper behind the glyphs; in `palette` mode glyphs are
   * coloured by tone along the rest (`paletteColor(x)` reads them too).
   */
  palette?: AsciiPalette;
  /** Glyph colour in `mono`. Default: the phosphor's ink, else the last palette colour. */
  ink?: AsciiColor;
  /** Paper behind glyphs. Default: the phosphor's paper, else `palette[0]`. */
  paper?: AsciiColor;
  /** Glyph cell height in CSS pixels. Default `--ascii-cell`, or 12. */
  cell?: number;
  /** Time multiplier. Default 1. */
  speed?: number;
  /**
   * `false` stops the motion. A shader that never moved draws `stillTime`;
   * one that was moving holds its current frame. Default `true`.
   */
  animate?: boolean;
  /** Frame rate cap. Default 30. */
  fps?: number;
  /** The moment shown when motion is off or reduced, in field seconds. Default 0. */
  stillTime?: number;
  /** A number fields read as `u_seed`, for seeded variations. Default 0. */
  seed?: number;
  /** What the pointer does to the field. Default `"none"`. */
  interaction?: Interaction;
  /** Audio bands from `useAudioBands`, read by fields as `u_audio`. Default none. */
  audio?: AudioInput | null;
  /**
   * Filled with a handle for export: `capture()` returns the glyph grid,
   * without post effects such as glitch row shifts or curvature.
   */
  handle?: RefObject<AsciiHandle | null>;
  /**
   * Painted until the first WebGL frame, while the shader is far offscreen,
   * and whenever WebGL2 is unavailable. Default: flat paper.
   */
  fallback?: ReactNode;
  /** @deprecated Use `dither`. Mapped to `dither` when that isn't set. */
  matrix?: DitherMatrix;
  /** @deprecated Tones snap to this many steps before glyph choice, 2 to 256. */
  levels?: number;
}

const NO_UNIFORMS: AsciiUniforms = {};

// Above this many device pixels the canvas drops to DPR 2: a 1440x900 box
// at DPR 3 is 11.7M pixels, too many for integrated GPUs at 60fps.
const PIXEL_BUDGET = 8_300_000;

const CANVAS_CLASS =
  "absolute top-0 left-0 block opacity-100 transition-opacity duration-700 ease-out group-data-[state=fallback]/ascii:opacity-0 group-data-[state=fallback]/ascii:duration-0 motion-reduce:transition-none";

const clamp01 = (value: number | undefined) =>
  value === undefined || !Number.isFinite(value)
    ? 0
    : Math.min(1, Math.max(0, value));

const POINTER_UNIFORMS = /\bu_(pointer|pointerVelocity|click)\b/;

const ANSI_TABLES = Object.fromEntries(
  Object.entries(ANSI16).map(([name, table]) => {
    const rgb = new Float32Array(48);
    const lab = new Float32Array(48);
    for (const [index, color] of table.entries()) {
      rgb.set(
        color.map((channel) => channel / 255),
        index * 3
      );
      lab.set(rgbToOklab(color), index * 3);
    }
    return [name, { lab, rgb }];
  })
) as Record<keyof typeof ANSI16, { rgb: Float32Array; lab: Float32Array }>;

/** `mono` with a phosphor, `truecolor` with a colour field, else `palette`. */
const defaultColorMode = ({
  phosphor,
  colorField,
}: {
  phosphor: AsciiLook["phosphor"];
  colorField: string | undefined;
}): ColorMode => {
  if (phosphor) {
    return "mono";
  }
  return colorField === undefined ? "palette" : "truecolor";
};

interface Resolved {
  charset: Charset;
  colorMode: ColorMode;
  colorKey: string;
}

/** The charset and colour mode the props ask for, and a key for the colours they need. */
const resolveLook = (props: {
  charset: AsciiLook["charset"];
  chars: string | undefined;
  colorMode: ColorMode | undefined;
  phosphor: AsciiLook["phosphor"];
  colorField: string | undefined;
  palette: AsciiPalette;
  ink: AsciiColor | undefined;
  paper: AsciiColor | undefined;
  ramp: AsciiLook["ramp"];
  ansi: AsciiLook["ansi"];
  background: AsciiLook["background"];
}): Resolved => {
  const charset = resolveCharset(props.charset ?? "standard", props.chars);
  const colorMode = props.colorMode ?? defaultColorMode(props);
  const rampKey =
    typeof props.ramp === "string" ? props.ramp : props.ramp?.join(",");
  const colorKey = [
    colorMode,
    props.palette.join(","),
    props.ink,
    props.paper,
    props.phosphor,
    rampKey,
    props.ansi,
    props.background,
  ].join("|");
  return { charset, colorKey, colorMode };
};

const writeRgb = (into: Float32Array, at: number, [r, g, b]: Rgba) => {
  into[at] = r;
  into[at + 1] = g;
  into[at + 2] = b;
};

const toCss = ([r, g, b, a]: Rgba) =>
  `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;

/** Stops the fragment shader holds (`u_stops[8]` in glsl.ts). */
const MAX_STOPS = 8;

/**
 * `stops` cut down to at most `limit`, sampled evenly in t the way
 * `sampleRamp` reads them, so both ends stay exact and tone 1 is still the
 * last stop. Shorter ramps pass through unchanged.
 */
export const fitStops = (
  stops: readonly Rgba[],
  limit: number = MAX_STOPS
): readonly Rgba[] => {
  if (stops.length <= limit || limit < 2) {
    return stops.slice(0, Math.max(1, limit));
  }
  const span = stops.length - 1;
  return Array.from({ length: limit }, (_, step): Rgba => {
    const scaled = (step / (limit - 1)) * span;
    const index = Math.min(span - 1, Math.floor(scaled));
    const mix = scaled - index;
    const from = stops[index] ?? [0, 0, 0, 1];
    const to = stops[index + 1] ?? from;
    return [
      from[0] + (to[0] - from[0]) * mix,
      from[1] + (to[1] - from[1]) * mix,
      from[2] + (to[2] - from[2]) * mix,
      from[3] + (to[3] - from[3]) * mix,
    ];
  });
};

/** Ramp stops: duotone reads a named or custom ramp, palette the inks. */
const writeStops = (
  input: FrameInput,
  {
    colorMode,
    palette,
    ramp,
  }: {
    colorMode: ColorMode;
    palette: readonly Rgba[];
    ramp: AsciiLook["ramp"];
  }
) => {
  const last = palette.at(-1) ?? [1, 1, 1, 1];
  let stops: readonly Rgba[] = palette.length > 1 ? palette.slice(1) : [last];
  if (colorMode === "duotone") {
    const source =
      typeof ramp === "string" || ramp === undefined
        ? RAMPS[ramp ?? "mainframe"]
        : ramp;
    stops = source.map((hex): Rgba => {
      const [r, g, b]: Rgb8 = hexToRgb(hex);
      return [r / 255, g / 255, b / 255, 1];
    });
  }
  // Longer ramps are resampled, not truncated, so their far end still shows.
  const fitted = fitStops(stops);
  const count = Math.max(1, fitted.length);
  for (let index = 0; index < count; index += 1) {
    writeRgb(input.stops, index * 3, fitted[index] ?? last);
  }
  input.stopCount = count;
};

/** `--ascii-glow`, the theme's bloom strength; 0.7 when unset. */
const readGlow = (root: Element): number => {
  const glow = Number.parseFloat(
    getComputedStyle(root).getPropertyValue("--ascii-glow")
  );
  return Number.isFinite(glow) ? Math.max(0, glow) : 0.7;
};

const writeAudio = (
  input: FrameInput,
  bands: AudioInput | null | undefined
) => {
  input.audio[0] = bands?.bass ?? 0;
  input.audio[1] = bands?.mid ?? 0;
  input.audio[2] = bands?.treble ?? 0;
  input.audio[3] = bands?.level ?? 0;
};

const writeLook = (
  input: FrameInput,
  state: {
    levels: number | undefined;
    mode: Interaction;
    grade: AsciiLook["grade"];
    invert: boolean | undefined;
    threshold: number | undefined;
    edgeThreshold: number | undefined;
    colorMode: ColorMode;
  }
) => {
  input.levels =
    state.levels === undefined
      ? 0
      : Math.min(256, Math.max(2, Math.round(state.levels)));
  input.interaction = INTERACTIONS.indexOf(state.mode);
  input.grade[0] = state.grade?.brightness ?? 0;
  input.grade[1] = state.grade?.contrast ?? 1;
  input.grade[2] = state.grade?.gamma ?? 1;
  input.grade[3] = state.grade?.saturation ?? 1;
  input.invert = state.invert ?? false;
  input.threshold = state.threshold ?? 0.5;
  input.edgeThreshold = state.edgeThreshold ?? 0.22;
  input.colorMode = COLOR_CODES[state.colorMode];
};

const writeFx = (input: FrameInput, fx: PostFx | undefined, glow: number) => {
  input.scanlines = clamp01(fx?.scanlines);
  input.bloom = clamp01(fx?.bloom) * glow;
  input.curvature = clamp01(fx?.curvature);
  input.glitch = clamp01(fx?.glitch);
  input.flicker = clamp01(fx?.flicker);
  input.vignette = clamp01(fx?.vignette);
};

/**
 * A WebGL2 canvas that draws a GLSL `field` as real glyphs: any charset
 * (ramps, Braille 2x4, quadrants, Sobel edges), any colour mode, CRT post
 * effects, pointer interaction and audio input. Glyphs come from an atlas
 * drawn at the exact device size of a cell, so they stay crisp at any DPR.
 * Pauses offscreen and in hidden tabs, holds a still frame under reduced
 * motion, follows the theme, and shows `fallback` without WebGL2 or while
 * far offscreen. `data-state` reports `fallback`, `running`, `paused` or
 * `static`.
 */
export const AsciiShader = ({
  field,
  colorField,
  uniforms = NO_UNIFORMS,
  palette = DEFAULT_PALETTE,
  ink,
  paper,
  charset,
  chars,
  colorMode,
  phosphor,
  ramp,
  ansi,
  grade,
  invert,
  threshold,
  edgeThreshold,
  dither,
  background,
  fx,
  matrix,
  levels,
  cell,
  square,
  speed = 1,
  animate = true,
  fps,
  stillTime = 0,
  seed,
  interaction,
  audio,
  handle,
  fallback,
  className,
  "aria-hidden": ariaHidden = true,
  ref,
  ...props
}: AsciiShaderProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  // The root is ours and the caller's: keep both refs pointing at it.
  const setRoot = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") {
      return ref(node);
    }
    if (ref) {
      ref.current = node;
    }
  };
  const rendererRef = useRef<AsciiRenderer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const metricsRef = useRef<CellMetrics | null>(null);
  const atlasRef = useRef<GlyphAtlas | null>(null);
  const inputRef = useRef<FrameInput | null>(null);
  inputRef.current ??= createFrameInput();
  const pointerRef = useRef<PointerTracker | null>(null);
  const cssColorsRef = useRef({ ink: "#ffffff", paper: null as string | null });
  const timeRef = useRef(stillTime);
  const deltaRef = useRef(0);
  const [hasFrame, setHasFrame] = useState(false);
  const hasFrameRef = useRef(false);
  const hasContext = useContextSlot(rootRef);

  const look = resolveLook({
    ansi,
    background,
    chars,
    charset,
    colorField,
    colorMode,
    ink,
    palette,
    paper,
    phosphor,
    ramp,
  });
  const charsetId = `${look.charset.kind}:${look.charset.glyphs.join("")}`;
  const ditherMatrix = dither ?? matrix ?? "none";
  const specs = uniformSpecs(uniforms);
  const specKey = specs.map(({ name, size }) => `${name}:${size}`).join(",");
  const mode: Interaction =
    interaction && INTERACTIONS.includes(interaction) ? interaction : "none";
  const tracksPointer =
    mode !== "none" ||
    POINTER_UNIFORMS.test(field) ||
    (colorField !== undefined && POINTER_UNIFORMS.test(colorField));

  const markFrame = (drawn: boolean) => {
    if (hasFrameRef.current !== drawn) {
      hasFrameRef.current = drawn;
      setHasFrame(drawn);
    }
  };

  // Everything a draw reads, kept current without restarting effects.
  const live = useRef({
    audio,
    charset: look.charset,
    colorKey: look.colorKey,
    colorMode: look.colorMode,
    edgeThreshold,
    fx,
    grade,
    invert,
    levels,
    mode,
    speed,
    threshold,
    uniforms,
  });
  const resolveColorsRef = useRef<(() => void) | null>(null);
  const relayoutRef = useRef<(() => void) | null>(null);
  const drawRef = useRef<(() => void) | null>(null);
  const settings = {
    ansi,
    background,
    ink,
    palette,
    paper,
    phosphor,
    ramp,
  };
  const settingsRef = useRef(settings);
  const glowRef = useRef(1);
  const cellRef = useRef(cell);
  const squareRef = useRef(square);
  const ditherRef = useRef(ditherMatrix);

  useEffect(() => {
    live.current = {
      audio,
      charset: look.charset,
      colorKey: look.colorKey,
      colorMode: look.colorMode,
      edgeThreshold,
      fx,
      grade,
      invert,
      levels,
      mode,
      speed,
      threshold,
      uniforms,
    };
    settingsRef.current = settings;
    drawRef.current = () => {
      const renderer = rendererRef.current;
      const input = inputRef.current;
      if (!(renderer && input && metricsRef.current)) {
        return;
      }
      const state = live.current;
      const tracker = pointerRef.current;
      if (tracker) {
        tracker.update(deltaRef.current);
        input.pointer.set(tracker.pointer);
        input.pointerVelocity.set(tracker.velocity);
        input.click.set(tracker.click);
      }
      writeAudio(input, state.audio);
      input.time = timeRef.current;
      input.delta = deltaRef.current;
      input.frame += 1;
      input.seed = seed ?? 0;
      input.uniforms = state.uniforms;
      writeLook(input, state);
      writeFx(input, state.fx, glowRef.current);
      renderer.draw(input);
      markFrame(true);
    };
  });

  // Once motion has run, turning `animate` off holds the frame on screen
  // instead of jumping to `stillTime`. A new `stillTime` still applies, and
  // reduced motion always shows it.
  const reducedMotion = usePrefersReducedMotion();
  const hasRunRef = useRef(false);
  useEffect(() => {
    hasRunRef.current = false;
  }, [stillTime]);

  const loopState = useFrameLoop(
    (time, delta) => {
      deltaRef.current = delta;
      if (delta > 0) {
        // Accumulate so a change of `speed` never jumps the motion.
        timeRef.current += delta * live.current.speed;
        hasRunRef.current = true;
      } else if (reducedMotion || !hasRunRef.current) {
        timeRef.current = time;
      }
      drawRef.current?.();
    },
    { enabled: animate, fps, stillTime, target: rootRef }
  );

  // Context, renderer, field program, size, theme and fonts. A fresh canvas
  // per context, so a released context never has to be restored.
  useEffect(() => {
    const root = rootRef.current;
    if (!(root && hasContext)) {
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.className = CANVAS_CLASS;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
      premultipliedAlpha: true,
      // PNG export and video capture read the canvas after the frame.
      preserveDrawingBuffer: true,
      stencil: false,
    });
    if (!gl) {
      return;
    }
    root.append(canvas);
    canvasRef.current = canvas;
    let fieldSize = { columns: 0, rows: 0 };

    const resolveColors = () => {
      const input = inputRef.current;
      if (!input) {
        return;
      }
      const s = settingsRef.current;
      const preset = s.phosphor ? PHOSPHORS[s.phosphor] : undefined;
      const resolvedPalette = s.palette.map((color) =>
        resolveColor(color, root)
      );
      rendererRef.current?.setPalette(resolvedPalette);
      const last = resolvedPalette.at(-1) ?? [1, 1, 1, 1];
      const inkColor = s.ink ?? preset?.ink;
      const paperColor = s.paper ?? preset?.paper;
      const inkRgba = inkColor ? resolveColor(inkColor, root) : last;
      const paperRgba = paperColor
        ? resolveColor(paperColor, root)
        : (resolvedPalette[0] ?? [0, 0, 0, 1]);
      writeRgb(input.ink, 0, inkRgba);
      const transparent = s.background === "transparent";
      const alpha = transparent ? 0 : paperRgba[3];
      input.paper[0] = paperRgba[0] * alpha;
      input.paper[1] = paperRgba[1] * alpha;
      input.paper[2] = paperRgba[2] * alpha;
      input.paper[3] = alpha;
      cssColorsRef.current = {
        ink: toCss(inkRgba),
        paper: transparent ? null : toCss(paperRgba),
      };
      writeStops(input, {
        colorMode: live.current.colorMode,
        palette: resolvedPalette,
        ramp: s.ramp,
      });
      const table = ANSI_TABLES[s.ansi ?? "vga"];
      input.ansi.set(table.rgb);
      input.ansiLab.set(table.lab);
      glowRef.current = readGlow(root);
    };

    // Metrics, atlas and grid size: on mount, resize, a new charset or cell.
    const relayout = () => {
      const renderer = rendererRef.current;
      if (!renderer) {
        return;
      }
      const style = getComputedStyle(root);
      // Layout size, not the painted box, so a scaled parent (a zoom-in
      // animation, a thumbnail) doesn't shrink the grid.
      const width = Number.parseFloat(style.width) || root.offsetWidth;
      const height = Number.parseFloat(style.height) || root.offsetHeight;
      const device = window.devicePixelRatio || 1;
      const dpr =
        width * height * device * device > PIXEL_BUDGET
          ? Math.min(device, 2)
          : Math.min(device, 3);
      const metrics = measureCell({
        cell: cellRef.current ?? readCell(root),
        dpr,
        font: readFont(root),
        square: squareRef.current,
      });
      const { charset: current } = live.current;
      const glyphs =
        current.kind === "edge"
          ? [...current.glyphs, ...EDGE_GLYPHS]
          : current.glyphs;
      const atlas = getGlyphAtlas({ glyphs, metrics });
      const isRamp = current.kind === "ramp" || current.kind === "edge";
      const count = current.glyphs.length;
      renderer.setAtlas(atlas, {
        count,
        grid: current.grid,
        kind: KIND_CODES[current.kind],
        positions: isRamp ? atlasRampPositions(atlas, count) : null,
      });
      atlasRef.current = atlas;
      metricsRef.current = metrics;
      const { columns, rows } = gridSize(metrics, width, height);
      fieldSize = { columns, rows };
      canvas.width = columns * metrics.deviceWidth;
      canvas.height = rows * metrics.deviceHeight;
      canvas.style.width = `${columns * metrics.width}px`;
      canvas.style.height = `${rows * metrics.height}px`;
      renderer.resize({
        canvasHeight: canvas.height,
        canvasWidth: canvas.width,
        columns,
        dpr,
        rows,
      });
      drawRef.current?.();
    };

    const build = () => {
      rendererRef.current?.dispose();
      const renderer = createAsciiRenderer(gl);
      rendererRef.current = renderer;
      if (!renderer) {
        return;
      }
      if (!renderer.setField({ colorField, field, specs })) {
        renderer.dispose();
        rendererRef.current = null;
        return;
      }
      const map =
        ditherRef.current === "none"
          ? null
          : getThresholdMap(ditherRef.current);
      renderer.setMatrix(map);
      resolveColors();
      relayout();
    };

    resolveColorsRef.current = () => {
      resolveColors();
      drawRef.current?.();
    };
    relayoutRef.current = relayout;

    const onThemeChange = () => {
      resolveColors();
      drawRef.current?.();
    };
    let fontFrame = 0;
    const onFontsLoaded = () => {
      // Let the atlas cache redraw first, then re-measure ramps.
      cancelAnimationFrame(fontFrame);
      fontFrame = requestAnimationFrame(relayout);
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      rendererRef.current = null;
      markFrame(false);
    };
    const onContextRestored = () => {
      build();
    };

    build();
    const resizeObserver = new ResizeObserver(relayout);
    resizeObserver.observe(root);
    // Browser zoom and moving to another screen change the DPR, not the box.
    window.addEventListener("resize", relayout);
    const unsubscribe = subscribeToTheme(onThemeChange);
    document.fonts?.addEventListener?.("loadingdone", onFontsLoaded);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    if (handle) {
      handle.current = {
        get canvas() {
          return canvasRef.current;
        },
        capture: (): AsciiFrame | null => {
          const renderer = rendererRef.current;
          const atlas = atlasRef.current;
          if (!(renderer && atlas && hasFrameRef.current)) {
            return null;
          }
          const cells = renderer.readCells();
          if (!cells || cells.columns !== fieldSize.columns) {
            return null;
          }
          const braille = live.current.charset.kind === "braille";
          const glyphs = Array.from(cells.slots, (slot) =>
            // An empty Braille cell is a space, as `mapTones` writes it.
            braille && slot === 0 ? " " : (atlas.glyphs[slot] ?? " ")
          );
          const colors =
            live.current.colorMode === "mono"
              ? null
              : new Uint8ClampedArray(cells.colors);
          return { colors, columns: cells.columns, glyphs, rows: cells.rows };
        },
        colors: () => cssColorsRef.current,
        metrics: () => metricsRef.current,
      };
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", relayout);
      unsubscribe();
      cancelAnimationFrame(fontFrame);
      document.fonts?.removeEventListener?.("loadingdone", onFontsLoaded);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      rendererRef.current?.dispose();
      rendererRef.current = null;
      resolveColorsRef.current = null;
      relayoutRef.current = null;
      if (handle?.current) {
        handle.current = null;
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
      canvasRef.current = null;
      markFrame(false);
    };
    // `specs` is described by `specKey`; charset and colours update live.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field, colorField, specKey, hasContext, handle]);

  // A new charset or cell size re-measures and rebuilds the atlas, no recompile.
  useEffect(() => {
    cellRef.current = cell;
    squareRef.current = square;
    relayoutRef.current?.();
  }, [cell, square, charsetId]);

  useEffect(() => {
    ditherRef.current = ditherMatrix;
    rendererRef.current?.setMatrix(
      ditherMatrix === "none" ? null : getThresholdMap(ditherMatrix)
    );
  }, [ditherMatrix]);

  // New colours resolve without recompiling.
  useEffect(() => {
    resolveColorsRef.current?.();
  }, [look.colorKey]);

  // Pointer tracking only while something reads it.
  useEffect(() => {
    const root = rootRef.current;
    if (!(root && tracksPointer)) {
      return;
    }
    const tracker = trackPointer(root);
    pointerRef.current = tracker;
    return () => {
      tracker.dispose();
      pointerRef.current = null;
    };
  }, [tracksPointer]);

  // Props changed while nothing is animating: redraw the held frame.
  useEffect(() => {
    if (loopState !== "running") {
      drawRef.current?.();
    }
  });

  const state: AsciiShaderState = hasFrame ? loopState : "fallback";

  return (
    <div
      ref={setRoot}
      aria-hidden={ariaHidden}
      data-state={state}
      className={cn(
        "group/ascii pointer-events-none relative overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        data-ascii-fallback
        className="absolute inset-0 opacity-0 transition-opacity delay-700 duration-0 group-data-[state=fallback]/ascii:opacity-100 group-data-[state=fallback]/ascii:delay-0"
      >
        {fallback ?? (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor:
                background === "transparent"
                  ? "transparent"
                  : cssColor(
                      paper ??
                        (phosphor ? PHOSPHORS[phosphor].paper : palette[0])
                    ),
            }}
          />
        )}
      </div>
    </div>
  );
};
