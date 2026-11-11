/**
 * The look props every ASCII renderer and component shares: which glyphs,
 * which colours, how tones are graded, and the CRT finish. `AsciiShader`
 * (GPU) and `AsciiGrid` (Canvas2D) take the same names, so a scene can
 * switch renderer without changing its API. Types and defaults only.
 */

import type { CharsetName } from "@/lib/ascii/charsets";
import type { DitherMatrix } from "@/lib/ascii/matrices";
import type {
  Ansi16Name,
  ColorMode,
  Grade,
  PhosphorName,
  RampName,
} from "@/lib/ascii/palettes";

/**
 * The CRT finish, each from 0 (off) to 1 (strong). The GPU renderer draws
 * them in the glyph pass; Canvas2D renderers approximate them with a CSS
 * overlay.
 */
export interface PostFx {
  /** Dark lines between pixel rows, like a CRT's raster. */
  scanlines?: number;
  /** Phosphor glow spreading from bright glyphs. */
  bloom?: number;
  /** Barrel distortion toward the corners, like curved glass. */
  curvature?: number;
  /** Rows that jump sideways and glyphs that flip for a frame. */
  glitch?: number;
  /** Brightness flicker from frame to frame. */
  flicker?: number;
  /** Darkened corners. */
  vignette?: number;
}

/** No effects: what every renderer draws unless asked. */
export const NO_FX: Required<PostFx> = {
  bloom: 0,
  curvature: 0,
  flicker: 0,
  glitch: 0,
  scanlines: 0,
  vignette: 0,
};

/** A full CRT look, for presets and the Studio's "CRT" switch. */
export const CRT_FX: Required<PostFx> = {
  bloom: 0.55,
  curvature: 0.35,
  flicker: 0.15,
  glitch: 0,
  scanlines: 0.5,
  vignette: 0.45,
};

/**
 * What the pointer does to the field.
 * - `none`: nothing.
 * - `repel`: glyphs push away from the pointer.
 * - `ripple`: a click or tap sends out rings.
 * - `trail`: the pointer leaves a fading wake of ink.
 */
export const INTERACTIONS = ["none", "repel", "ripple", "trail"] as const;
export type Interaction = (typeof INTERACTIONS)[number];

export interface AsciiLook {
  /** Which glyphs draw the tones. Default `"standard"`. */
  charset?: CharsetName;
  /** A custom ramp from empty to dense, such as `" .oO@"`. Wins over `charset`. */
  chars?: string;
  /** How glyphs are coloured. Defaults vary by component. */
  colorMode?: ColorMode;
  /** `mono`: a CRT phosphor preset for ink and paper. */
  phosphor?: PhosphorName;
  /** `duotone`: a ramp name or stops as `#rrggbb`. */
  ramp?: RampName | readonly string[];
  /** `ansi16`: which 16-colour table. Default `"vga"`. */
  ansi?: Ansi16Name;
  /** Tone grading before glyph choice. */
  grade?: Grade;
  /** Dense glyphs for dark tones instead of bright ones. */
  invert?: boolean;
  /** Braille and quadrants: the tone that lights a dot. Default 0.5. */
  threshold?: number;
  /** Edge set: Sobel strength, 0 to 1, that draws `- / | \`. Default 0.22. */
  edgeThreshold?: number;
  /** Ordered dithering between glyph levels. Default `"none"`. */
  dither?: "none" | DitherMatrix;
  /** `"transparent"` draws glyphs only, so the page shows between them. */
  background?: "paper" | "transparent";
  /**
   * Cells as wide as they are tall, so `dots` lays an even halftone
   * lattice instead of rows. Meant for ramps of round glyphs; Braille and
   * quadrants stretch. `cell` then sets both sides. Default `false`.
   */
  square?: boolean;
  /** CRT post effects. */
  fx?: PostFx;
}
