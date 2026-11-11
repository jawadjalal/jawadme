/**
 * Glyph atlas: every glyph a renderer needs, drawn once into a canvas at
 * the exact device size of one cell. The GPU renderer uploads the canvas
 * as a texture and samples it pixel for pixel; Canvas2D renderers can copy
 * slots out of it with `drawGlyph`, which is faster than `fillText` and
 * looks the same.
 *
 * Geometric glyphs (blocks, shades, quadrants, Braille, halftone dots, box
 * lines) come from the shapes in `glyphs.ts`, snapped to whole device
 * pixels, so they tile without seams and never depend on what the font
 * covers. Everything else is set in `--ascii-font`, centred on the cell.
 *
 * API (stable):
 * - `getGlyphAtlas({ metrics, glyphs, dynamic })` returns a cached
 *   `GlyphAtlas` for those metrics. With `dynamic`, unknown glyphs passed
 *   to `slot()` are added on demand and `version` goes up.
 * - `atlas.canvas`: the atlas, `columns` slots per row, each slot exactly
 *   `metrics.deviceWidth` by `metrics.deviceHeight` pixels, white glyphs
 *   on transparent.
 * - `atlas.slot(glyph)` → slot index, or -1; `atlas.slotOrigin(slot)` → the
 *   slot's top-left pixel.
 * - `atlas.coverage(glyph)` → the share of the cell the glyph inks, 0..1.
 * - `atlas.drawGlyph(ctx, glyph, x, y, w, h)` copies a glyph into a canvas.
 * - `rampPositions(coverage, count, strength)` and `rampLevel(...)`: the
 *   calibrated tone → glyph mapping the GPU uses for ramps.
 * - `charsetRampPositions({ charset, chars, metrics })`: the positions
 *   `AsciiShader` uploads for a charset, to pass to `mapTones` as
 *   `positions` so the CPU picks the same glyphs.
 */

import {
  BRAILLE_BASE,
  BRAILLE_DOT_BITS,
  resolveCharset,
} from "@/lib/ascii/charsets";
import type { Charset, CharsetName } from "@/lib/ascii/charsets";
import { glyphShape, shapePath } from "@/lib/ascii/glyphs";
import type { GlyphShape } from "@/lib/ascii/glyphs";
import type { CellMetrics } from "@/lib/ascii/measure";

export interface GlyphAtlas {
  /** White glyphs on transparent, one slot per glyph. */
  readonly canvas: HTMLCanvasElement;
  readonly metrics: CellMetrics;
  /** Glyphs in slot order. */
  readonly glyphs: readonly string[];
  /** Slots per atlas row. */
  readonly columns: number;
  /** Bumped whenever the canvas changes (a dynamic glyph, a font load). */
  readonly version: number;
  /** The slot of `glyph`, or -1. A dynamic atlas adds unknown glyphs. */
  slot(glyph: string): number;
  /** Top-left pixel of a slot in the atlas canvas. */
  slotOrigin(slot: number): readonly [number, number];
  /** The share of the cell `glyph` inks, 0 to 1. 0 for unknown glyphs. */
  coverage(glyph: string): number;
  /** The same by slot index, for building GPU lookup tables. */
  slotCoverage(slot: number): number;
  /** Copy `glyph` into `context` at (x, y), scaled to w by h. */
  drawGlyph(
    context: CanvasRenderingContext2D,
    glyph: string,
    x: number,
    y: number,
    w?: number,
    h?: number
  ): void;
}

/** Slots per atlas row; keeps the canvas well under texture size limits. */
const ATLAS_COLUMNS = 32;
/** Most atlases kept alive at once; the oldest is dropped past this. */
const CACHE_LIMIT = 24;

const atlasKey = (metrics: CellMetrics, glyphs: readonly string[] | null) =>
  `${metrics.deviceWidth}x${metrics.deviceHeight}:${metrics.fontSize * metrics.dpr}:${metrics.font}:${glyphs ? glyphs.join("") : "*"}`;

const cache = new Map<string, AtlasImpl>();

if (typeof document !== "undefined") {
  // A web font that finishes loading changes how text glyphs look.
  document.fonts?.addEventListener?.("loadingdone", () => {
    for (const atlas of cache.values()) {
      atlas.redraw();
    }
  });
}

// Box-drawing and block geometry, snapped to whole device pixels: axis
// lines become rectangles of whole-pixel weight centred on the same pixel
// in every glyph, so an arm in one cell meets the arm in the next.
const snappedLine = (
  context: CanvasRenderingContext2D,
  part: Extract<GlyphShape[number], { kind: "line" }>,
  x: number,
  y: number,
  width: number,
  height: number
): boolean => {
  const weight = Math.max(1, Math.round(part.weight * width));
  const offset = Math.floor(weight / 2);
  if (part.x1 === part.x2) {
    const cx = x + Math.floor(part.x1 * width);
    const top = y + Math.round(Math.min(part.y1, part.y2) * height);
    const bottom = y + Math.round(Math.max(part.y1, part.y2) * height);
    context.fillRect(cx - offset, top, weight, Math.max(1, bottom - top));
    return true;
  }
  if (part.y1 === part.y2) {
    const cy = y + Math.floor(part.y1 * height);
    const left = x + Math.round(Math.min(part.x1, part.x2) * width);
    const right = x + Math.round(Math.max(part.x1, part.x2) * width);
    context.fillRect(left, cy - offset, Math.max(1, right - left), weight);
    return true;
  }
  return false;
};

const drawShapeSnapped = (
  context: CanvasRenderingContext2D,
  shape: GlyphShape,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  for (const part of shape) {
    if (part.kind === "rect") {
      const left = Math.round(x + part.x * width);
      const top = Math.round(y + part.y * height);
      const right = Math.round(x + (part.x + part.w) * width);
      const bottom = Math.round(y + (part.y + part.h) * height);
      if (right > left && bottom > top) {
        context.fillRect(left, top, right - left, bottom - top);
      }
      continue;
    }
    if (
      part.kind === "line" &&
      snappedLine(context, part, x, y, width, height)
    ) {
      continue;
    }
    if (part.kind === "dot") {
      const r = Math.max(0.5, part.r * width);
      context.beginPath();
      context.arc(x + part.cx * width, y + part.cy * height, r, 0, Math.PI * 2);
      context.fill();
      continue;
    }
    context.fill(new Path2D(shapePath([part], { height, width, x, y })));
  }
};

/**
 * Braille on an exact 2x4 lattice: the cell splits into two columns and
 * four rows of whole pixels, and each dot sits centred in its box. Small
 * dots are squares (a 1-2px circle is a smudge); from 4px they are round.
 */
const drawBraille = (
  context: CanvasRenderingContext2D,
  mask: number,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const boxW = width / 2;
  const boxH = height / 4;
  const size = Math.max(1, Math.round(Math.min(boxW, boxH) * 0.55));
  for (const [row, bits] of BRAILLE_DOT_BITS.entries()) {
    for (const [column, bit] of bits.entries()) {
      if ((mask & bit) === 0) {
        continue;
      }
      const left = x + Math.round(column * boxW + (boxW - size) / 2);
      const top = y + Math.round(row * boxH + (boxH - size) / 2);
      if (size < 4) {
        context.fillRect(left, top, size, size);
      } else {
        context.beginPath();
        context.arc(left + size / 2, top + size / 2, size / 2, 0, Math.PI * 2);
        context.fill();
      }
    }
  }
};

/**
 * Shades as regular pixel patterns that line up across cells: ░ lights one
 * pixel in four, ▒ a checkerboard, ▓ three in four. The pattern repeats
 * every 2 pixels from the cell origin. Larger cells use 2x2 pixel blocks so
 * the texture stays visible at DPR 2 and 3.
 */
const SHADE_PATTERNS: Record<string, (px: number, py: number) => boolean> = {
  "░": (px, py) => px % 2 === 0 && py % 2 === 0,
  "▒": (px, py) => (px + py) % 2 === 0,
  "▓": (px, py) => !(px % 2 === 1 && py % 2 === 1),
};

const drawShade = (
  context: CanvasRenderingContext2D,
  lit: (px: number, py: number) => boolean,
  x: number,
  y: number,
  width: number,
  height: number,
  dpr: number
) => {
  const unit = Math.max(1, Math.round(dpr));
  for (let py = 0; py * unit < height; py += 1) {
    for (let px = 0; px * unit < width; px += 1) {
      if (lit(px, py)) {
        context.fillRect(x + px * unit, y + py * unit, unit, unit);
      }
    }
  }
};

class AtlasImpl implements GlyphAtlas {
  readonly canvas: HTMLCanvasElement;
  readonly metrics: CellMetrics;
  readonly columns = ATLAS_COLUMNS;
  glyphs: string[];
  version = 0;
  private readonly dynamic: boolean;
  private readonly slots = new Map<string, number>();
  private coverages: number[] = [];
  private context: CanvasRenderingContext2D | null;
  private baseline = 0;

  constructor(
    metrics: CellMetrics,
    glyphs: readonly string[],
    dynamic: boolean
  ) {
    this.metrics = metrics;
    this.dynamic = dynamic;
    this.glyphs = [];
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d", { willReadFrequently: true });
    // Slot = index, duplicates included, so a ramp's level is its slot.
    for (const glyph of glyphs) {
      if (!this.slots.has(glyph)) {
        this.slots.set(glyph, this.glyphs.length);
      }
      this.glyphs.push(glyph);
    }
    this.redraw();
  }

  /** Redraw every slot, as after a font load. */
  redraw(): void {
    const { deviceWidth: w, deviceHeight: h } = this.metrics;
    const rows = Math.max(1, Math.ceil(this.glyphs.length / ATLAS_COLUMNS));
    // Room to grow without resizing on every new dynamic glyph.
    const capacity = this.dynamic ? rows + 2 : rows;
    this.canvas.width = w * ATLAS_COLUMNS;
    this.canvas.height = h * capacity;
    this.context = this.canvas.getContext("2d", { willReadFrequently: true });
    const { context } = this;
    if (!context) {
      return;
    }
    context.font = `${this.metrics.fontSize * this.metrics.dpr}px ${this.metrics.font}`;
    const probe = context.measureText("Mg");
    const ascent =
      probe.fontBoundingBoxAscent ||
      this.metrics.fontSize * this.metrics.dpr * 0.8;
    const descent =
      probe.fontBoundingBoxDescent ||
      this.metrics.fontSize * this.metrics.dpr * 0.2;
    // The font's line box, centred in the cell, so baselines line up across glyphs.
    this.baseline = Math.round((h - (ascent + descent)) / 2 + ascent);
    this.coverages = [];
    for (let slot = 0; slot < this.glyphs.length; slot += 1) {
      this.paint(slot);
    }
    this.version += 1;
  }

  private paint(slot: number): void {
    const { context } = this;
    const glyph = this.glyphs[slot];
    if (!context || glyph === undefined) {
      return;
    }
    const { deviceWidth: w, deviceHeight: h, dpr } = this.metrics;
    const [x, y] = this.slotOrigin(slot);
    context.clearRect(x, y, w, h);
    context.save();
    context.beginPath();
    context.rect(x, y, w, h);
    context.clip();
    context.fillStyle = "#fff";
    const code = glyph.codePointAt(0) ?? 0;
    const shade = SHADE_PATTERNS[glyph];
    const shape = glyphShape(glyph);
    if (
      code >= BRAILLE_BASE &&
      code <= BRAILLE_BASE + 255 &&
      glyph.length === 1
    ) {
      drawBraille(context, code - BRAILLE_BASE, x, y, w, h);
    } else if (shade) {
      drawShade(context, shade, x, y, w, h, dpr);
    } else if (shape) {
      drawShapeSnapped(context, shape, x, y, w, h);
    } else if (glyph.trim() !== "") {
      context.font = `${this.metrics.fontSize * dpr}px ${this.metrics.font}`;
      context.textAlign = "center";
      context.textBaseline = "alphabetic";
      const advance = context.measureText(glyph).width;
      // Wide glyphs (full-width forms, emoji) squeeze into one cell.
      const squeeze = advance > w * 1.05 ? w / advance : 1;
      context.translate(x + w / 2, y + this.baseline);
      context.scale(squeeze, 1);
      context.fillText(glyph, 0, 0);
    }
    context.restore();
    this.coverages[slot] = this.measure(x, y, w, h);
  }

  private measure(x: number, y: number, w: number, h: number): number {
    const { context } = this;
    if (!context) {
      return 0;
    }
    const { data } = context.getImageData(x, y, w, h);
    let sum = 0;
    for (let index = 3; index < data.length; index += 4) {
      sum += data[index] ?? 0;
    }
    return sum / (w * h * 255);
  }

  slot(glyph: string): number {
    const found = this.slots.get(glyph);
    if (found !== undefined) {
      return found;
    }
    if (!this.dynamic) {
      return -1;
    }
    const slot = this.glyphs.length;
    this.slots.set(glyph, slot);
    this.glyphs.push(glyph);
    const rows = Math.ceil(this.glyphs.length / ATLAS_COLUMNS);
    if (rows * this.metrics.deviceHeight > this.canvas.height) {
      this.redraw();
    } else {
      this.paint(slot);
      this.version += 1;
    }
    return slot;
  }

  slotOrigin(slot: number): readonly [number, number] {
    return [
      (slot % ATLAS_COLUMNS) * this.metrics.deviceWidth,
      Math.floor(slot / ATLAS_COLUMNS) * this.metrics.deviceHeight,
    ];
  }

  coverage(glyph: string): number {
    const slot = this.slots.get(glyph);
    return slot === undefined ? 0 : (this.coverages[slot] ?? 0);
  }

  slotCoverage(slot: number): number {
    return this.coverages[slot] ?? 0;
  }

  drawGlyph(
    context: CanvasRenderingContext2D,
    glyph: string,
    x: number,
    y: number,
    w: number = this.metrics.deviceWidth,
    h: number = this.metrics.deviceHeight
  ): void {
    const slot = this.slot(glyph);
    if (slot < 0) {
      return;
    }
    const [sx, sy] = this.slotOrigin(slot);
    context.drawImage(
      this.canvas,
      sx,
      sy,
      this.metrics.deviceWidth,
      this.metrics.deviceHeight,
      x,
      y,
      w,
      h
    );
  }
}

/**
 * The atlas for `glyphs` at `metrics`, cached. A static atlas holds exactly
 * `glyphs` in that order (slot = index, duplicates included); a dynamic
 * one starts with them and grows as `slot()` meets new glyphs. Browser only.
 */
export const getGlyphAtlas = ({
  metrics,
  glyphs,
  dynamic = false,
}: {
  metrics: CellMetrics;
  glyphs: readonly string[];
  dynamic?: boolean;
}): GlyphAtlas => {
  const key = atlasKey(metrics, dynamic ? null : glyphs);
  const cached = cache.get(key);
  if (cached) {
    // Refresh its place as most recently used.
    cache.delete(key);
    cache.set(key, cached);
    if (dynamic) {
      for (const glyph of glyphs) {
        cached.slot(glyph);
      }
    }
    return cached;
  }
  const atlas = new AtlasImpl(metrics, glyphs, dynamic);
  cache.set(key, atlas);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }
  return atlas;
};

/**
 * Where each ramp glyph sits on the tone axis, 0 for the first and 1 for
 * the last, strictly increasing. `strength` 0 spaces glyphs evenly (the
 * rule `mapTones` uses); 1 spaces them by measured ink coverage, so tone
 * 0.5 picks the glyph that inks half as much as the densest. The default
 * blends the two, which keeps every glyph reachable even where the font
 * draws two neighbours at almost the same weight.
 */
export const rampPositions = (
  coverage: (index: number) => number,
  count: number,
  strength = 0.6
): Float32Array => {
  const positions = new Float32Array(Math.max(count, 0));
  if (count < 2) {
    return positions;
  }
  const first = coverage(0);
  const last = coverage(count - 1);
  const span = last - first;
  const step = 1 / (count - 1);
  let previous = 0;
  for (let index = 0; index < count; index += 1) {
    const even = index * step;
    const measured = span > 1e-4 ? (coverage(index) - first) / span : even;
    const blended =
      even + (Math.min(1, Math.max(0, measured)) - even) * strength;
    // Monotonic, with a small minimum gap so no glyph collapses to nothing.
    const floor = index === 0 ? 0 : previous + step * 0.15;
    previous = index === count - 1 ? 1 : Math.max(blended, floor);
    positions[index] = previous;
  }
  // Squeeze back under 1 if the minimum gaps pushed past it.
  const top = positions[count - 2] ?? 0;
  if (top >= 1) {
    for (let index = 1; index < count - 1; index += 1) {
      positions[index] = index * step;
    }
  }
  return positions;
};

/**
 * The ramp level for `tone` given glyph `positions`: the fractional index
 * between the two glyphs around the tone, then `floor(level + cut)` with
 * `cut` 0.5 (or a dither threshold). With evenly spaced positions this is
 * exactly `floor(tone * (n - 1) + cut)`, the `mapTones` rule.
 */
export const rampLevel = (
  tone: number,
  positions: ArrayLike<number>,
  cut = 0.5
): number => {
  const count = positions.length;
  if (count < 2) {
    return 0;
  }
  const clamped = tone > 0 ? Math.min(tone, 1) : 0;
  let low = 0;
  let high = count - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if ((positions[mid] ?? 0) <= clamped) {
      low = mid;
    } else {
      high = mid;
    }
  }
  const from = positions[low] ?? 0;
  const to = positions[high] ?? 1;
  const level = low + (to > from ? (clamped - from) / (to - from) : 0);
  return Math.min(count - 1, Math.max(0, Math.floor(level + cut)));
};

/** The calibrated positions of the first `count` glyphs in `atlas`. */
export const atlasRampPositions = (
  atlas: GlyphAtlas,
  count: number
): Float32Array => rampPositions((index) => atlas.slotCoverage(index), count);

/**
 * The ramp positions `AsciiShader` uses for a charset at `metrics`, or
 * `null` for Braille and quadrants, which have no ramp. Pass them to
 * `mapTones` as `positions` and it picks the glyph the GPU would. Browser
 * only: the coverage is measured from the glyph atlas.
 */
export const charsetRampPositions = ({
  charset,
  chars,
  metrics,
}: {
  charset?: CharsetName | Charset;
  chars?: string;
  metrics: CellMetrics;
}): Float32Array | null => {
  const resolved = resolveCharset(charset, chars);
  if (resolved.kind === "braille" || resolved.kind === "quadrants") {
    return null;
  }
  const atlas = getGlyphAtlas({ glyphs: resolved.glyphs, metrics });
  return atlasRampPositions(atlas, resolved.glyphs.length);
};
