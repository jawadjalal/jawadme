/**
 * The CPU side of the engine: a frame of glyphs, a field of tones on a
 * sample grid, and `mapTones`, which turns one into the other for any
 * charset. Pure and server-safe.
 *
 * `mapTones` is the reference mapping. The GPU shader in `shader.tsx`
 * implements the same rules in GLSL. One difference by default: the GPU
 * places ramp glyphs on the tone axis by their measured ink coverage
 * (`rampPositions` in `atlas.ts`), while `mapTones` spaces them evenly,
 * because it has no font to measure. Pass the GPU's positions as
 * `positions` (from `charsetRampPositions`) and the two agree glyph for
 * glyph. Change both together.
 */

import { rampLevel } from "@/lib/ascii/atlas";
import {
  BRAILLE_DOT_BITS,
  edgeChar,
  QUADRANT_BITS,
  QUADRANT_GLYPHS,
  resolveCharset,
} from "@/lib/ascii/charsets";
import type { Charset, CharsetName } from "@/lib/ascii/charsets";
import { getThresholdMap } from "@/lib/ascii/matrices";
import type { DitherMatrix } from "@/lib/ascii/matrices";
import type { CellMetrics } from "@/lib/ascii/measure";
import {
  ANSI16,
  gradeRgb,
  gradeTone,
  hexToRgb,
  nearestIndex,
  RAMPS,
  sampleRamp,
} from "@/lib/ascii/palettes";
import type {
  Ansi16Name,
  ColorMode,
  Grade,
  RampName,
  Rgb8,
} from "@/lib/ascii/palettes";

/** One frame of ASCII: a grid of glyphs and, optionally, a colour each. */
export interface AsciiFrame {
  readonly columns: number;
  readonly rows: number;
  /** Row-major, one glyph per cell. A space is an empty cell. */
  readonly glyphs: readonly string[];
  /**
   * RGBA bytes per cell, row-major, or `null` when every glyph takes the
   * renderer's ink colour. Alpha 0 on a non-space glyph also means ink.
   */
  readonly colors: Uint8ClampedArray | null;
}

/**
 * What a renderer's `handle` ref exposes, so the Studio and export tools
 * can save any ASCII component as .txt, .ans, .svg, .png or video. Every
 * renderer (AsciiShader, AsciiGrid, AsciiImage, ...) fills one.
 */
export interface AsciiHandle {
  /**
   * The latest frame as glyphs and colours, or `null` before the first
   * draw. Post effects that move or shade pixels (glitch row shifts,
   * curvature, scanlines, bloom, flicker, vignette, RGB split) are visual
   * only and never reach the frame; glitch glyph flips do, as they change
   * the glyph grid itself. `canvas` has the effects, for PNG and video.
   */
  capture(): AsciiFrame | null;
  /** The canvas being drawn to, for PNG and video capture. */
  readonly canvas: HTMLCanvasElement | null;
  /** Ink and paper as CSS colours right now. `paper` is null when transparent. */
  colors(): { ink: string; paper: string | null };
  /** Cell metrics in use, or `null` before the first layout. */
  metrics(): CellMetrics | null;
}

/** RGBA bytes for one glyph. */
export type Rgba8 = readonly [number, number, number, number];

/**
 * A frame you can draw into. Writes outside the grid are ignored, so
 * scenes can draw shapes that run off the edges without clipping maths.
 */
export class MutableFrame implements AsciiFrame {
  columns: number;
  rows: number;
  glyphs: string[];
  colors: Uint8ClampedArray | null;

  constructor(columns: number, rows: number, { color = false } = {}) {
    this.columns = Math.max(0, Math.floor(columns));
    this.rows = Math.max(0, Math.floor(rows));
    this.glyphs = Array.from({ length: this.columns * this.rows }, () => " ");
    this.colors = color
      ? new Uint8ClampedArray(this.columns * this.rows * 4)
      : null;
  }

  /** Resize, keeping colour on if it was on. Clears the frame. */
  resize(columns: number, rows: number): void {
    const color = this.colors !== null;
    this.columns = Math.max(0, Math.floor(columns));
    this.rows = Math.max(0, Math.floor(rows));
    this.glyphs = Array.from({ length: this.columns * this.rows }, () => " ");
    this.colors = color
      ? new Uint8ClampedArray(this.columns * this.rows * 4)
      : null;
  }

  /** Turn per-glyph colour on (allocating it) or off. */
  setColored(color: boolean): void {
    if (color && !this.colors) {
      this.colors = new Uint8ClampedArray(this.columns * this.rows * 4);
    } else if (!color) {
      this.colors = null;
    }
  }

  /** Every cell back to `glyph` (a space by default) with no colour. */
  clear(glyph = " "): void {
    this.glyphs.fill(glyph);
    this.colors?.fill(0);
  }

  /** The glyph at a cell, or `undefined` outside the grid. */
  get(x: number, y: number): string | undefined {
    if (x < 0 || y < 0 || x >= this.columns || y >= this.rows) {
      return undefined;
    }
    return this.glyphs[Math.floor(y) * this.columns + Math.floor(x)];
  }

  /** Set one cell. `rgba` colours it when the frame has colour. */
  put(x: number, y: number, glyph: string, rgba?: Rgba8 | Rgb8): void {
    const cx = Math.floor(x);
    const cy = Math.floor(y);
    if (cx < 0 || cy < 0 || cx >= this.columns || cy >= this.rows) {
      return;
    }
    const index = cy * this.columns + cx;
    this.glyphs[index] = glyph;
    if (rgba && this.colors) {
      const [r, g, b, a = 255] = rgba;
      this.colors.set([r, g, b, a], index * 4);
    }
  }

  /** Write text left to right from (x, y), one code point per cell. */
  write(x: number, y: number, text: string, rgba?: Rgba8 | Rgb8): void {
    let column = Math.floor(x);
    for (const glyph of text) {
      this.put(column, y, glyph, rgba);
      column += 1;
    }
  }

  /** Fill a rectangle of cells with one glyph. */
  fillRect(
    x: number,
    y: number,
    width: number,
    height: number,
    glyph: string,
    rgba?: Rgba8 | Rgb8
  ): void {
    for (let row = 0; row < height; row += 1) {
      for (let column = 0; column < width; column += 1) {
        this.put(x + column, y + row, glyph, rgba);
      }
    }
  }
}

/** The frame's rows as strings. */
export const frameLines = (frame: AsciiFrame): string[] => {
  const lines: string[] = [];
  for (let row = 0; row < frame.rows; row += 1) {
    const start = row * frame.columns;
    lines.push(frame.glyphs.slice(start, start + frame.columns).join(""));
  }
  return lines;
};

/** The frame as plain text, one line per row. `trimEnd` drops trailing spaces. */
export const frameToText = (
  frame: AsciiFrame,
  { trimEnd = false }: { trimEnd?: boolean } = {}
): string =>
  frameLines(frame)
    .map((line) => (trimEnd ? line.trimEnd() : line))
    .join("\n");

/**
 * Tones on a sample grid: `columns * grid[0]` by `rows * grid[1]` samples,
 * row-major, row 0 at the top. 0 is empty, 1 is full ink. `colors` holds
 * RGBA bytes per sample when the source has colour.
 */
export interface ToneField {
  readonly width: number;
  readonly height: number;
  readonly tones: Float32Array;
  readonly colors: Uint8ClampedArray | null;
}

/** A blank tone field sized for `columns` by `rows` cells of `charset`. */
export const createToneField = (
  columns: number,
  rows: number,
  charset: CharsetName | Charset = "standard",
  { color = false } = {}
): ToneField => {
  const { grid } = resolveCharset(charset);
  const width = Math.max(0, Math.floor(columns)) * grid[0];
  const height = Math.max(0, Math.floor(rows)) * grid[1];
  return {
    colors: color ? new Uint8ClampedArray(width * height * 4) : null,
    height,
    tones: new Float32Array(width * height),
    width,
  };
};

/**
 * Fill a tone field from a function of the sample centre, with `u` and `v`
 * in [0, 1] and `v` 0 at the top. Return a tone, or `[tone, r, g, b]` with
 * bytes for colour.
 */
export const fillToneField = (
  field: ToneField,
  sample: (
    u: number,
    v: number
  ) => number | readonly [number, number, number, number]
): void => {
  const { width, height, tones, colors } = field;
  for (let y = 0; y < height; y += 1) {
    const v = (y + 0.5) / height;
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const value = sample((x + 0.5) / width, v);
      if (typeof value === "number") {
        tones[index] = value;
      } else {
        const [tone, r, g, b] = value;
        tones[index] = tone;
        colors?.set([r, g, b, 255], index * 4);
      }
    }
  }
};

/** How `mapTones` turns tones into glyphs and colours. */
export interface MapOptions {
  /** Default `"standard"`. */
  charset?: CharsetName | Charset;
  /** A custom ramp from empty to dense, such as `" .oO@"`. Wins over `charset`. */
  chars?: string;
  /** Tone grading before glyph choice. */
  grade?: Grade;
  /** Dense glyphs for dark tones instead of bright ones. Default `false`. */
  invert?: boolean;
  /** Braille and quadrants: the tone that lights a dot. Default 0.5. */
  threshold?: number;
  /**
   * Ramps and the edge set's interior: where each glyph sits on the tone
   * axis, 0 for the first and 1 for the last, one entry per glyph. Default
   * evenly spaced, so tone 0.5 picks the middle glyph. `AsciiShader`
   * spaces glyphs by measured ink coverage instead; pass
   * `charsetRampPositions(...)` here to pick exactly the glyphs it draws.
   */
  positions?: ArrayLike<number>;
  /** Edge set: Sobel magnitude, 0 to 1, that draws a directional glyph. Default 0.22. */
  edgeThreshold?: number;
  /**
   * Ordered dithering between glyph levels (and dots), which smooths
   * gradients drawn with few glyphs. Default `"none"`.
   */
  dither?: "none" | DitherMatrix;
  /** Default `"mono"`, which leaves `colors` null. */
  colorMode?: ColorMode;
  /** `duotone`: a ramp name or stops as `#rrggbb`. Default `"mainframe"`. */
  ramp?: RampName | readonly string[];
  /** `ansi16`: which 16-colour table. Default `"vga"`. */
  ansi?: Ansi16Name;
  /** `palette`: paper, then the inks glyphs take by tone, as bytes. */
  palette?: readonly Rgb8[];
}

const clamp01 = (value: number) => (value > 0 ? Math.min(value, 1) : 0);

const rampStops = (ramp: MapOptions["ramp"]): readonly Rgb8[] => {
  if (ramp === undefined) {
    return RAMPS.mainframe.map(hexToRgb);
  }
  if (typeof ramp === "string") {
    return (RAMPS[ramp as RampName] ?? RAMPS.mainframe).map(hexToRgb);
  }
  return ramp.map(hexToRgb);
};

interface Sampler {
  /** The graded (and inverted) tone of one sample. */
  readonly tone: (x: number, y: number) => number;
  /** The dither threshold at a sample, or 0.5 without dithering. */
  readonly cut: (x: number, y: number) => number;
  readonly dithered: boolean;
}

const createSampler = (field: ToneField, options: MapOptions): Sampler => {
  const { grade, invert = false, dither = "none" } = options;
  const map = dither === "none" ? null : getThresholdMap(dither);
  const { width, tones } = field;
  return {
    cut: (x, y) =>
      map
        ? (map.thresholds[(y % map.size) * map.size + (x % map.size)] ?? 0.5)
        : 0.5,
    dithered: map !== null,
    tone: (x, y) => {
      const raw = tones[y * width + x] ?? 0;
      const graded = gradeTone(Number.isFinite(raw) ? raw : 0, grade);
      return invert ? 1 - graded : graded;
    },
  };
};

interface CellResult {
  readonly glyph: string;
  /** The cell's mean tone, which colours `duotone` and `palette`. */
  readonly tone: number;
}

/** RGBA bytes for one cell, written in place without a temporary array. */
const writeColor = (colors: Uint8ClampedArray, index: number, rgb: Rgb8) => {
  const [r, g, b] = rgb;
  const at = index * 4;
  colors[at] = r;
  colors[at + 1] = g;
  colors[at + 2] = b;
  colors[at + 3] = 255;
};

// Graded tones for a whole field, reused between calls so animated scenes
// don't allocate a buffer every frame.
let gradedScratch = new Float32Array(0);

const gradeField = (field: ToneField, options: MapOptions): Float32Array => {
  const { grade, invert = false } = options;
  const { tones } = field;
  if (gradedScratch.length < tones.length) {
    gradedScratch = new Float32Array(tones.length);
  }
  const out = gradedScratch;
  const plain = grade === undefined;
  for (let index = 0; index < tones.length; index += 1) {
    const raw = tones[index] ?? 0;
    const finite = Number.isFinite(raw) ? raw : 0;
    const graded = plain ? clamp01(finite) : gradeTone(finite, grade);
    out[index] = invert ? 1 - graded : graded;
  }
  return out;
};

// Sample bit for each position in a cell, row by row.
const BRAILLE_BITS_FLAT = BRAILLE_DOT_BITS.flat();
const QUADRANT_BITS_FLAT = QUADRANT_BITS.flat();

/**
 * Braille and quadrants in one tight pass: each sample above the threshold
 * (or its dither threshold) sets its bit, and the mask indexes the
 * charset's glyph table. Same rule as before, minus a closure call, an
 * object and a string per cell, which dominated CPU scenes in Braille.
 */
const mapPacked = (
  field: ToneField,
  columns: number,
  rows: number,
  charset: Charset,
  options: MapOptions,
  frame: MutableFrame,
  paint: ((column: number, row: number, tone: number) => Rgb8) | null
): void => {
  const [gx, gy] = charset.grid;
  const braille = charset.kind === "braille";
  const bits = braille ? BRAILLE_BITS_FLAT : QUADRANT_BITS_FLAT;
  const table = braille ? charset.glyphs : QUADRANT_GLYPHS;
  const { dither = "none" } = options;
  const map = dither === "none" ? null : getThresholdMap(dither);
  const threshold = options.threshold ?? 0.5;
  const tones = gradeField(field, options);
  const { width } = field;
  const samples = gx * gy;
  const { glyphs, colors } = frame;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      let mask = 0;
      let sum = 0;
      let bit = 0;
      for (let dy = 0; dy < gy; dy += 1) {
        const y = row * gy + dy;
        const base = y * width + column * gx;
        for (let dx = 0; dx < gx; dx += 1) {
          const tone = tones[base + dx] ?? 0;
          sum += tone;
          const cut = map
            ? (map.thresholds[
                (y % map.size) * map.size + ((column * gx + dx) % map.size)
              ] ?? 0.5)
            : threshold;
          if (tone > cut) {
            // Each sample owns one distinct bit, so adding sets it.
            mask += bits[bit] ?? 0;
          }
          bit += 1;
        }
      }
      const index = row * columns + column;
      glyphs[index] = mask === 0 ? " " : (table[mask] ?? " ");
      if (paint && colors) {
        writeColor(colors, index, paint(column, row, sum / samples));
      }
    }
  }
};

/** A ramp level, or for the edge set a directional glyph on strong gradients. */
const rampCell = (
  sampler: Sampler,
  charset: Charset,
  column: number,
  row: number,
  columns: number,
  rows: number,
  options: MapOptions
): CellResult => {
  const tone = sampler.tone(column, row);
  if (charset.kind === "edge") {
    const at = (x: number, y: number) =>
      sampler.tone(
        Math.min(columns - 1, Math.max(0, x)),
        Math.min(rows - 1, Math.max(0, y))
      );
    const sobelX =
      at(column + 1, row - 1) +
      2 * at(column + 1, row) +
      at(column + 1, row + 1) -
      at(column - 1, row - 1) -
      2 * at(column - 1, row) -
      at(column - 1, row + 1);
    const sobelY =
      at(column - 1, row + 1) +
      2 * at(column, row + 1) +
      at(column + 1, row + 1) -
      at(column - 1, row - 1) -
      2 * at(column, row - 1) -
      at(column + 1, row - 1);
    if (Math.hypot(sobelX, sobelY) / 4 > (options.edgeThreshold ?? 0.22)) {
      return { glyph: edgeChar(sobelX, sobelY), tone };
    }
  }
  const { glyphs } = charset;
  const cut = sampler.cut(column, row);
  const { positions } = options;
  // Positions only apply when there is one per glyph; a stale set from
  // another charset falls back to even spacing rather than misindexing.
  if (positions && positions.length === glyphs.length) {
    return { glyph: glyphs[rampLevel(tone, positions, cut)] ?? " ", tone };
  }
  const last = glyphs.length - 1;
  const level = Math.min(last, Math.max(0, Math.floor(tone * last + cut)));
  return { glyph: glyphs[level] ?? " ", tone };
};

/** The colour mapping for one cell, built once per `mapTones` call. */
const cellColorizer = (
  field: ToneField,
  charset: Charset,
  options: MapOptions
): ((column: number, row: number, tone: number) => Rgb8) => {
  const { colorMode = "mono", grade } = options;
  if (colorMode === "duotone") {
    const stops = rampStops(options.ramp);
    return (_column, _row, tone) => sampleRamp(stops, tone);
  }
  if (
    colorMode === "palette" &&
    options.palette &&
    options.palette.length > 0
  ) {
    // The first entry is the paper behind the glyphs; glyphs take the inks
    // after it, as the GPU renderer does.
    const inks =
      options.palette.length > 1 ? options.palette.slice(1) : options.palette;
    return (_column, _row, tone) => sampleRamp(inks, tone);
  }
  const ansiTable: readonly Rgb8[] = ANSI16[options.ansi ?? "vga"];
  const [gx, gy] = charset.grid;
  const { width, colors } = field;
  return (column, row, tone) => {
    let rgb: Rgb8;
    if (colors) {
      // truecolor and ansi16 read the source colour, averaged over the cell.
      let r = 0;
      let g = 0;
      let b = 0;
      for (let dy = 0; dy < gy; dy += 1) {
        for (let dx = 0; dx < gx; dx += 1) {
          const at = ((row * gy + dy) * width + column * gx + dx) * 4;
          r += colors[at] ?? 0;
          g += colors[at + 1] ?? 0;
          b += colors[at + 2] ?? 0;
        }
      }
      const count = gx * gy;
      rgb = gradeRgb([r / count, g / count, b / count], grade);
    } else {
      const grey = clamp01(tone) * 255;
      rgb = [grey, grey, grey];
    }
    return colorMode === "ansi16"
      ? (ansiTable[nearestIndex(rgb, ansiTable)] ?? rgb)
      : rgb;
  };
};

/**
 * Map a tone field to glyphs. The field must be `columns * grid[0]` by
 * `rows * grid[1]` for the charset's grid. Writes into `into` when given
 * (resizing it if needed) and returns it, so a scene can reuse one frame.
 *
 * Rules, shared with the GPU:
 * - ramps: grade, invert, then level `floor(tone * (n - 1) + t)`, where `t`
 *   is 0.5 or the dither threshold at the cell. With `positions`, the
 *   fractional level is measured between the two glyphs around the tone
 *   instead (`rampLevel`), which is the GPU's rule;
 * - braille and quadrants: each sample lights its dot when its graded tone
 *   is above `threshold` (or the dither threshold at that sample);
 * - edge: a 3x3 Sobel on graded tones; above `edgeThreshold` the cell
 *   draws `- / | \` across the gradient, otherwise the interior ramp;
 * - colour: the cell's colour is the mean of its samples' colours (or
 *   tones, for `duotone` and `palette`), then the mode's mapping.
 */
export const mapTones = (
  field: ToneField,
  columns: number,
  rows: number,
  options: MapOptions = {},
  into?: MutableFrame
): MutableFrame => {
  const charset = resolveCharset(options.charset, options.chars);
  const colorMode = options.colorMode ?? "mono";
  const colored = colorMode !== "mono";
  const frame = into ?? new MutableFrame(columns, rows, { color: colored });
  if (frame.columns !== columns || frame.rows !== rows) {
    frame.resize(columns, rows);
  }
  frame.setColored(colored);

  const paint = colored ? cellColorizer(field, charset, options) : null;
  if (charset.kind === "braille" || charset.kind === "quadrants") {
    mapPacked(field, columns, rows, charset, options, frame, paint);
    return frame;
  }
  const sampler = createSampler(field, options);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const { glyph, tone } = rampCell(
        sampler,
        charset,
        column,
        row,
        columns,
        rows,
        options
      );
      const index = row * columns + column;
      frame.glyphs[index] = glyph;
      if (paint && frame.colors) {
        writeColor(frame.colors, index, paint(column, row, tone));
      }
    }
  }
  return frame;
};
