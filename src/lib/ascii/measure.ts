/**
 * Cell metrics: how big one glyph cell is, in CSS and device pixels. Every
 * renderer (WebGL, Canvas2D, DOM) sizes cells through `measureCell`, so a
 * frame drawn by one lines up with the same frame drawn by another.
 *
 * `cell` is always the cell height in CSS pixels, read from `--ascii-cell`
 * when a component doesn't set it. The width follows the font's advance,
 * or matches the height for `square` cells.
 */

/** Cell height when `--ascii-cell` is unset, in CSS pixels. */
export const DEFAULT_CELL = 12;

/** Glyph advance per em in most monospace fonts, used when nothing can be measured. */
export const GLYPH_ADVANCE = 0.6;

/** Cell height per em: the line height glyphs are set at. */
export const LINE_HEIGHT = 1.2;

/** The font stack glyphs fall back to when `--ascii-font` is unset. */
export const DEFAULT_FONT =
  'ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace';

export interface CellMetrics {
  /** Cell width in CSS pixels, snapped to whole device pixels. */
  readonly width: number;
  /** Cell height in CSS pixels, snapped to whole device pixels. */
  readonly height: number;
  /** Cell size in device pixels. */
  readonly deviceWidth: number;
  readonly deviceHeight: number;
  /** Device pixel ratio the metrics were snapped to. */
  readonly dpr: number;
  /** Font size in CSS pixels. */
  readonly fontSize: number;
  /** The CSS font family. */
  readonly font: string;
}

let probe: CanvasRenderingContext2D | null = null;
const advanceCache = new Map<string, number>();

// A web font that finishes loading changes the advance: measure again.
if (typeof document !== "undefined") {
  document.fonts?.addEventListener?.("loadingdone", () => advanceCache.clear());
}

/** The font's advance per em, measured once per family. */
const measureAdvance = (font: string): number => {
  const cached = advanceCache.get(font);
  if (cached !== undefined) {
    return cached;
  }
  if (typeof document === "undefined") {
    return GLYPH_ADVANCE;
  }
  probe ??= document.createElement("canvas").getContext("2d");
  if (!probe) {
    return GLYPH_ADVANCE;
  }
  probe.font = `100px ${font}`;
  const advance = probe.measureText("M").width / 100;
  const value =
    Number.isFinite(advance) && advance > 0.3 && advance < 1.2
      ? advance
      : GLYPH_ADVANCE;
  advanceCache.set(font, value);
  return value;
};

/**
 * Metrics for a cell `cell` CSS pixels tall in `font`. Both sides snap to
 * whole device pixels, so every cell on the canvas is the same size and
 * glyph edges stay sharp. `square` cells are as wide as they are tall:
 * text glyphs sit centred with room around them, and the round dots of
 * the `dots` charset (drawn as shapes, sized by the cell) form an even
 * lattice instead of rows twice as far apart as their columns.
 */
export const measureCell = ({
  cell = DEFAULT_CELL,
  font = DEFAULT_FONT,
  dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
  square = false,
}: {
  cell?: number;
  font?: string;
  dpr?: number;
  /** Cells as wide as they are tall, for an even lattice of dot glyphs. */
  square?: boolean;
} = {}): CellMetrics => {
  const height = Math.max(2, cell);
  const fontSize = height / LINE_HEIGHT;
  const width = square ? height : fontSize * measureAdvance(font);
  const deviceHeight = Math.max(1, Math.round(height * dpr));
  const deviceWidth = Math.max(1, Math.round(width * dpr));
  return {
    deviceHeight,
    deviceWidth,
    dpr,
    font,
    fontSize,
    height: deviceHeight / dpr,
    width: deviceWidth / dpr,
  };
};

/** Columns and rows of whole cells that cover a box. */
export const gridSize = (
  metrics: CellMetrics,
  boxWidth: number,
  boxHeight: number
): { columns: number; rows: number } => ({
  columns: Math.max(1, Math.ceil(boxWidth / metrics.width)),
  rows: Math.max(1, Math.ceil(boxHeight / metrics.height)),
});

/** `--ascii-cell` on `el` in CSS pixels, or `DEFAULT_CELL`. */
export const readCell = (el?: Element | null): number => {
  if (typeof document === "undefined") {
    return DEFAULT_CELL;
  }
  const host = el ?? document.documentElement;
  const value = Number.parseFloat(
    getComputedStyle(host).getPropertyValue("--ascii-cell")
  );
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_CELL;
};

/** `--ascii-font` on `el`, or `DEFAULT_FONT`. */
export const readFont = (el?: Element | null): string => {
  if (typeof document === "undefined") {
    return DEFAULT_FONT;
  }
  const host = el ?? document.documentElement;
  const value = getComputedStyle(host).getPropertyValue("--ascii-font").trim();
  return value === "" ? DEFAULT_FONT : value;
};
