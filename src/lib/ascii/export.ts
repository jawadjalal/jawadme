import type { AsciiFrame, AsciiHandle } from "@/lib/ascii/frame";
import { frameToText } from "@/lib/ascii/frame";
import { glyphShape, isGeometricGlyph, shapePath } from "@/lib/ascii/glyphs";
import { DEFAULT_CELL, DEFAULT_FONT, measureCell } from "@/lib/ascii/measure";
import type { CellMetrics } from "@/lib/ascii/measure";
import { paintFrame } from "@/lib/ascii/paint";
import {
  ANSI16,
  ansiBackground,
  ansiForeground,
  hexToRgb,
  nearestIndex,
  rgbToHex,
} from "@/lib/ascii/palettes";
import type { Ansi16Name, Rgb8 } from "@/lib/ascii/palettes";

/**
 * ascii-export: save any ASCII frame as a file. Plain text, ANSI escape
 * art for terminals, vector SVG, high-DPI PNG and video recorded from the
 * live canvas. `toText`, `toAnsi` and `toSvg` are pure string builders
 * and run anywhere (scripts, servers, tests); the rest need a browser.
 *
 * Every renderer's `handle` ref (`AsciiHandle`) gives you a frame with
 * `capture()`, the colours in use with `colors()` and the cell size with
 * `metrics()`, which is everything these functions need.
 */

// ---------------------------------------------------------------- text

export interface TextOptions {
  /** Drop trailing spaces from every line. Default `false`. */
  trimEnd?: boolean;
}

/** The frame as plain text, one line per row. */
export const toText = (
  frame: AsciiFrame,
  { trimEnd = false }: TextOptions = {}
): string => frameToText(frame, { trimEnd });

// ---------------------------------------------------------------- ansi

/** A colour for export: `#rrggbb` or bytes. */
export type ExportColor = string | Rgb8;

const toRgb = (color: ExportColor): Rgb8 =>
  typeof color === "string" ? hexToRgb(color) : color;

export interface AnsiOptions {
  /** `truecolor` writes 24-bit SGR colours; `ansi16` snaps to the 16 ANSI colours. Default `"truecolor"`. */
  mode?: "truecolor" | "ansi16";
  /** `ansi16`: the table to snap to. Default `"vga"`. */
  ansi?: Ansi16Name;
  /** Colour of glyphs without their own. Default: the terminal's own foreground. */
  ink?: ExportColor;
  /** Background colour, used with `background`. */
  paper?: ExportColor;
  /** Paint `paper` behind every cell. Default `false` (the terminal's background shows). */
  background?: boolean;
  /** Drop trailing spaces from every line. Default `false`. */
  trimEnd?: boolean;
}

const ESC = "\u001B[";
export const ANSI_RESET = `${ESC}0m`;

/** SGR codes for one export: foreground per colour, the ink and the background. */
const ansiCodes = ({
  mode = "truecolor",
  ansi = "vga",
  ink,
  paper,
  background = false,
}: AnsiOptions) => {
  const table: readonly Rgb8[] = ANSI16[ansi];
  const foreground = (rgb: Rgb8) =>
    mode === "ansi16"
      ? `${ESC}${ansiForeground(nearestIndex(rgb, table))}m`
      : `${ESC}38;2;${Math.round(rgb[0])};${Math.round(rgb[1])};${Math.round(rgb[2])}m`;
  let backgroundCode = "";
  if (background && paper !== undefined) {
    const rgb = toRgb(paper);
    backgroundCode =
      mode === "ansi16"
        ? `${ESC}${ansiBackground(nearestIndex(rgb, table))}m`
        : `${ESC}48;2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
  }
  const inkCode = ink === undefined ? `${ESC}39m` : foreground(toRgb(ink));
  return { backgroundCode, foreground, inkCode };
};

/**
 * The frame as ANSI escape art: SGR colour codes before each run of
 * same-coloured glyphs, a reset at the end of every line (so a cut-off
 * line never bleeds colour into the shell) and at the very end. `cat` the
 * result in any modern terminal.
 */
export const toAnsi = (
  frame: AsciiFrame,
  options: AnsiOptions = {}
): string => {
  const { backgroundCode, foreground, inkCode } = ansiCodes(options);
  const trim = options.trimEnd === true && backgroundCode === "";
  const { columns, rows, glyphs, colors } = frame;
  const codeAt = (index: number) => {
    const at = index * 4;
    return colors && (colors[at + 3] ?? 0) > 0
      ? foreground([colors[at] ?? 0, colors[at + 1] ?? 0, colors[at + 2] ?? 0])
      : inkCode;
  };
  const lines: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    let end = columns;
    if (trim) {
      while (end > 0 && glyphs[row * columns + end - 1] === " ") {
        end -= 1;
      }
    }
    let line = backgroundCode;
    let current = "";
    for (let column = 0; column < end; column += 1) {
      const index = row * columns + column;
      const glyph = glyphs[index] ?? " ";
      // Spaces keep the current colour: they show no ink.
      const code = glyph === " " ? current : codeAt(index);
      if (code !== current) {
        line += code;
        current = code;
      }
      line += glyph;
    }
    lines.push(line === "" ? line : `${line}${ANSI_RESET}`);
  }
  return `${lines.join("\n")}${ANSI_RESET}`;
};

// ---------------------------------------------------------------- svg

export interface SvgOptions {
  /** Cell size. Default: a 12px cell in the default font (from `metrics`, when a handle gives you one). */
  metrics?: Pick<CellMetrics, "width" | "height"> &
    Partial<Pick<CellMetrics, "fontSize">>;
  /** Colour of glyphs without their own, any CSS colour. Default `#000`. */
  ink?: string;
  /** Background colour, or `null` for transparent. Default `null`. */
  paper?: string | null;
  /** Font family for text glyphs. Default: the engine's monospace stack. */
  font?: string;
  /**
   * Draw blocks, shades, Braille, box lines and dots as vector shapes (the
   * same geometry the renderers use) instead of text, so they join without
   * seams and need no font. Default `true`.
   */
  shapes?: boolean;
}

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const round = (value: number) => Math.round(value * 100) / 100;

const cellColor = (frame: AsciiFrame, index: number): string | null => {
  const { colors } = frame;
  if (!colors) {
    return null;
  }
  const at = index * 4;
  const alpha = colors[at + 3] ?? 0;
  if (alpha === 0) {
    return null;
  }
  const hex = rgbToHex([
    colors[at] ?? 0,
    colors[at + 1] ?? 0,
    colors[at + 2] ?? 0,
  ]);
  return alpha === 255
    ? hex
    : `${hex}${Math.round(alpha).toString(16).padStart(2, "0")}`;
};

interface SvgCell {
  readonly width: number;
  readonly height: number;
  readonly shapes: boolean;
}

/** Columns up to the last glyph that is drawn as text. */
const textEnd = (frame: AsciiFrame, row: number, shapes: boolean): number => {
  const { columns, glyphs } = frame;
  let end = columns;
  while (end > 0) {
    const glyph = glyphs[row * columns + end - 1] ?? " ";
    if (glyph !== " " && !(shapes && isGeometricGlyph(glyph))) {
      break;
    }
    end -= 1;
  }
  return end;
};

/**
 * One row: its text as a `<text>` with a `<tspan>` per colour run (or "" when
 * it has no text), and its geometric glyphs appended to `paths` by colour.
 */
const svgRow = (
  frame: AsciiFrame,
  row: number,
  cell: SvgCell,
  paths: Map<string, string>
): string => {
  const { columns, glyphs } = frame;
  // Trailing spaces and shapes carry no text; stop before them so textLength stays true.
  const end = textEnd(frame, row, cell.shapes);
  let body = "";
  let run = "";
  let current: string | null = null;
  const flush = () => {
    const text = escapeXml(run);
    body +=
      current === null || run === ""
        ? text
        : `<tspan fill="${current}">${text}</tspan>`;
    run = "";
  };
  for (let column = 0; column < columns; column += 1) {
    const index = row * columns + column;
    const glyph = glyphs[index] ?? " ";
    const color: string | null =
      glyph === " " ? current : cellColor(frame, index);
    const shape = cell.shapes && glyph !== " " ? glyphShape(glyph) : undefined;
    if (shape) {
      const key = color ?? "";
      paths.set(
        key,
        (paths.get(key) ?? "") +
          shapePath(shape, {
            height: cell.height,
            width: cell.width,
            x: column * cell.width,
            y: row * cell.height,
          })
      );
    }
    if (column >= end) {
      continue;
    }
    if (color !== current) {
      flush();
      current = color;
    }
    // A shape leaves a space in the text so later columns stay in place.
    run += shape ? " " : glyph;
  }
  flush();
  if (body.trim() === "") {
    return "";
  }
  return `<text xml:space="preserve" y="${round((row + 0.5) * cell.height)}" textLength="${round(end * cell.width)}" lengthAdjust="spacing" dominant-baseline="central">${body}</text>`;
};

/**
 * The frame as a standalone SVG: one `<text>` per row with `<tspan>`s for
 * colour runs, `textLength` pinning every row to exact columns whatever
 * font the viewer has, and geometric glyphs as one path per colour.
 */
export const toSvg = (
  frame: AsciiFrame,
  {
    metrics,
    ink = "#000",
    paper = null,
    font = DEFAULT_FONT,
    shapes = true,
  }: SvgOptions = {}
): string => {
  const cell: SvgCell = {
    height: metrics?.height ?? DEFAULT_CELL,
    shapes,
    width: metrics?.width ?? DEFAULT_CELL / 2,
  };
  const fontSize = metrics?.fontSize ?? cell.height / 1.2;
  const width = round(frame.columns * cell.width);
  const height = round(frame.rows * cell.height);
  const paths = new Map<string, string>();
  const texts: string[] = [];
  for (let row = 0; row < frame.rows; row += 1) {
    texts.push(svgRow(frame, row, cell, paths));
  }
  const text = texts.join("");
  const background =
    paper === null
      ? ""
      : `<rect width="100%" height="100%" fill="${escapeXml(paper)}"/>`;
  const shapeMarkup = [...paths]
    .map(
      ([color, d]) =>
        `<path${color === "" ? "" : ` fill="${color}"`} d="${d}"/>`
    )
    .join("");
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    background,
    `<g fill="${escapeXml(ink)}">`,
    shapeMarkup,
    text === ""
      ? ""
      : `<g font-family="${escapeXml(font)}" font-size="${round(fontSize)}" style="white-space:pre;font-variant-ligatures:none">${text}</g>`,
    "</g></svg>",
  ].join("");
};

// ---------------------------------------------------------------- png

export interface PngOptions {
  /**
   * Device pixels per CSS pixel. For a handle without `scale`, the live
   * canvas is saved as it is (CRT effects included). With `scale`, or for
   * a frame, the frame is re-rendered at that density. Default 2 when
   * re-rendering.
   */
  scale?: number;
  /** Re-render: colour of glyphs without their own. Default: the handle's ink, or `#000`. */
  ink?: string;
  /** Re-render: background, or `null` for transparent. Default: the handle's paper. */
  paper?: string | null;
  /** Re-render: cell height in CSS pixels. Default: the handle's, or 12. */
  cell?: number;
  /** Re-render: font family. Default: the handle's, or the engine's monospace stack. */
  font?: string;
}

const isHandle = (
  value: AsciiHandle | AsciiFrame | HTMLCanvasElement
): value is AsciiHandle => "capture" in value;

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  // oxlint-disable-next-line promise/avoid-new -- wraps a callback API.
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("ascii-export: the canvas could not be encoded"));
      }
    }, "image/png");
  });

// The largest canvas side every current browser accepts.
const MAX_CANVAS_SIDE = 16_384;

/** Re-render a frame on a fresh canvas at `scale` device pixels per CSS pixel. */
export const renderFrame = (
  frame: AsciiFrame,
  {
    scale = 2,
    ink = "#000",
    paper = null,
    cell = DEFAULT_CELL,
    font = DEFAULT_FONT,
  }: PngOptions = {}
): HTMLCanvasElement => {
  const probe = measureCell({ cell, dpr: 1, font });
  const largest = Math.max(
    frame.columns * probe.width,
    frame.rows * probe.height,
    1
  );
  const dpr = Math.max(0.25, Math.min(scale, MAX_CANVAS_SIDE / largest));
  const metrics = measureCell({ cell, dpr, font });
  const canvas = document.createElement("canvas");
  canvas.width = frame.columns * metrics.deviceWidth;
  canvas.height = frame.rows * metrics.deviceHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("ascii-export: no 2D canvas context");
  }
  paintFrame(context, frame, metrics, { ink, paper });
  return canvas;
};

/**
 * Encode a PNG: a canvas as it is, a handle's live canvas, or a frame
 * re-rendered crisp at `scale`.
 *
 * ```ts
 * const blob = await toPng(handle.current, { scale: 3 });
 * downloadBlob(blob, "scene.png");
 * ```
 */
export const toPng = async (
  source: AsciiHandle | AsciiFrame | HTMLCanvasElement,
  options: PngOptions = {}
): Promise<Blob> => {
  if (source instanceof HTMLCanvasElement) {
    return await canvasToBlob(source);
  }
  if (isHandle(source)) {
    if (options.scale === undefined && source.canvas) {
      return await canvasToBlob(source.canvas);
    }
    const frame = source.capture();
    if (!frame) {
      throw new Error("ascii-export: the renderer has not drawn a frame yet");
    }
    const colors = source.colors();
    const metrics = source.metrics();
    return await canvasToBlob(
      renderFrame(frame, {
        cell: metrics?.height,
        font: metrics?.font,
        ink: colors.ink,
        paper: colors.paper,
        ...options,
      })
    );
  }
  return await canvasToBlob(renderFrame(source, options));
};

// ---------------------------------------------------------------- video

/** Containers tried in order: VP9 WebM, VP8 WebM, then MP4 (Safari). */
export const VIDEO_TYPES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
  "video/mp4;codecs=avc1",
  "video/mp4",
] as const;

/** The first video type this browser can record, or `undefined`. */
export const pickVideoType = (preferred?: string): string | undefined => {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }
  const candidates =
    preferred === undefined ? VIDEO_TYPES : [preferred, ...VIDEO_TYPES];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
};

/** The file extension for a recorded type: `"webm"` or `"mp4"`. */
export const videoExtension = (mimeType: string): "webm" | "mp4" =>
  mimeType.startsWith("video/mp4") ? "mp4" : "webm";

export interface RecorderOptions {
  /** Capture rate. Default 60. */
  fps?: number;
  /** Container and codec; falls back through `VIDEO_TYPES`. */
  mimeType?: string;
  /** Target bitrate. Default 8 Mbps, which keeps small glyphs sharp. */
  bitsPerSecond?: number;
  /** Called about ten times a second while recording with the elapsed milliseconds. */
  onProgress?: (elapsedMs: number) => void;
}

export interface CanvasRecorder {
  /** The type being recorded, such as `"video/webm;codecs=vp9"`. */
  readonly mimeType: string;
  /** `"inactive"` before start and after stop. */
  readonly state: RecordingState;
  start(): void;
  /** Stop and resolve with the video. */
  stop(): Promise<Blob>;
}

/**
 * A start/stop recorder for a canvas, for record buttons. Uses
 * `captureStream` and `MediaRecorder`; throws where neither exists.
 */
export const createRecorder = (
  canvas: HTMLCanvasElement,
  {
    fps = 60,
    mimeType,
    bitsPerSecond = 8_000_000,
    onProgress,
  }: RecorderOptions = {}
): CanvasRecorder => {
  const type = pickVideoType(mimeType);
  if (type === undefined || typeof canvas.captureStream !== "function") {
    throw new Error("ascii-export: this browser can't record a canvas");
  }
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: type,
    videoBitsPerSecond: bitsPerSecond,
  });
  const chunks: Blob[] = [];
  let started = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  });
  const halt = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    for (const track of stream.getTracks()) {
      track.stop();
    }
  };
  return {
    mimeType: type,
    start: () => {
      if (recorder.state !== "inactive") {
        return;
      }
      started = performance.now();
      recorder.start(250);
      if (onProgress) {
        timer = setInterval(() => onProgress(performance.now() - started), 100);
      }
    },
    get state() {
      return recorder.state;
    },
    stop: () =>
      // oxlint-disable-next-line promise/avoid-new -- wraps a callback API.
      new Promise<Blob>((resolve) => {
        const finish = () => {
          halt();
          resolve(new Blob(chunks, { type }));
        };
        if (recorder.state === "inactive") {
          finish();
          return;
        }
        recorder.addEventListener("stop", finish, { once: true });
        recorder.stop();
      }),
  };
};

/**
 * Record a canvas for `durationMs` and resolve with the video. Keep the
 * renderer animating while it records: a paused canvas records a still.
 *
 * ```ts
 * const video = await recordCanvas(handle.current.canvas, { durationMs: 4000 });
 * downloadBlob(video, `scene.${videoExtension(video.type)}`);
 * ```
 */
export const recordCanvas = async (
  canvas: HTMLCanvasElement,
  {
    durationMs = 4000,
    ...options
  }: RecorderOptions & { durationMs?: number } = {}
): Promise<Blob> => {
  const recorder = createRecorder(canvas, options);
  recorder.start();
  // oxlint-disable-next-line promise/avoid-new -- a timer has no promise form here.
  await new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
  return await recorder.stop();
};

// ---------------------------------------------------------------- files

/** Save a blob as a file through a temporary link. */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  // Give the download a moment to start before the URL goes away.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Save text as a file. Default type plain UTF-8 text. */
export const downloadText = (
  text: string,
  filename: string,
  mime = "text/plain;charset=utf-8"
): void => downloadBlob(new Blob([text], { type: mime }), filename);

/** Copy text to the clipboard. Resolves `false` when the browser refuses. */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and insecure origins: a hidden textarea and execCommand.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    // oxlint-disable-next-line typescript/no-deprecated -- the only fallback where the Clipboard API is missing.
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  }
};
