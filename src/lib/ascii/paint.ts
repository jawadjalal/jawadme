/**
 * Paint an `AsciiFrame` on a 2D canvas. `AsciiGrid` paints with it and
 * `toPng` re-renders frames with it. Browser only.
 *
 * Glyphs are copied out of the shared glyph atlas (`atlas.ts`, the same
 * one the GPU renderer samples), so geometric glyphs look identical in
 * both renderers and no glyph is rasterised twice. Colour is one pass for
 * the whole frame: the glyphs are drawn white on a layer, then a tiny
 * canvas holding one pixel per cell is stretched over it with
 * `source-in`, which tints every glyph with its cell's colour at once.
 * The cost doesn't grow with the number of distinct colours.
 */

import { getGlyphAtlas } from "@/lib/ascii/atlas";
import type { AsciiFrame } from "@/lib/ascii/frame";
import type { CellMetrics } from "@/lib/ascii/measure";

export interface PaintColors {
  /** Colour of glyphs without their own, as any CSS colour. */
  readonly ink: string;
  /** Background, or `null` to leave the canvas transparent. */
  readonly paper: string | null;
}

type Context2D = CanvasRenderingContext2D;

interface Scratch {
  layer: HTMLCanvasElement;
  layerContext: Context2D;
  tint: HTMLCanvasElement;
  tintContext: Context2D;
  pixels: ImageData | null;
}

// One scratch pair per target canvas, dropped with it.
const scratches = new WeakMap<HTMLCanvasElement, Scratch>();

const createContext = (canvas: HTMLCanvasElement): Context2D | null =>
  canvas.getContext("2d");

const scratchFor = (target: HTMLCanvasElement): Scratch | null => {
  const existing = scratches.get(target);
  if (existing) {
    return existing;
  }
  const layer = document.createElement("canvas");
  const tint = document.createElement("canvas");
  const layerContext = createContext(layer);
  const tintContext = tint.getContext("2d", { willReadFrequently: false });
  if (!(layerContext && tintContext)) {
    return null;
  }
  const scratch = { layer, layerContext, pixels: null, tint, tintContext };
  scratches.set(target, scratch);
  return scratch;
};

const inkCache = new Map<string, readonly [number, number, number, number]>();
let inkProbe: Context2D | null = null;

/** Any CSS colour as RGBA bytes, through a 1x1 canvas. */
const colorBytes = (css: string): readonly [number, number, number, number] => {
  const hit = inkCache.get(css);
  if (hit) {
    return hit;
  }
  if (!inkProbe) {
    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    inkProbe = probe.getContext("2d", { willReadFrequently: true });
  }
  if (!inkProbe) {
    return [255, 255, 255, 255];
  }
  inkProbe.clearRect(0, 0, 1, 1);
  inkProbe.fillStyle = css;
  inkProbe.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = inkProbe.getImageData(0, 0, 1, 1).data;
  const bytes = [r, g, b, a] as const;
  if (inkCache.size > 64) {
    inkCache.clear();
  }
  inkCache.set(css, bytes);
  return bytes;
};

/** Copy every non-space glyph out of the atlas, white, into its cell. */
const blitGlyphs = (
  layer: Context2D,
  frame: AsciiFrame,
  metrics: CellMetrics
): void => {
  const atlas = getGlyphAtlas({ dynamic: true, glyphs: [" "], metrics });
  const { deviceWidth, deviceHeight } = metrics;
  const { glyphs, columns } = frame;
  for (let index = 0; index < glyphs.length; index += 1) {
    const glyph = glyphs[index];
    const slot =
      glyph === undefined || glyph === " " || glyph === ""
        ? -1
        : atlas.slot(glyph);
    if (slot < 0) {
      continue;
    }
    const [sx, sy] = atlas.slotOrigin(slot);
    const column = index % columns;
    const row = (index - column) / columns;
    layer.drawImage(
      atlas.canvas,
      sx,
      sy,
      deviceWidth,
      deviceHeight,
      column * deviceWidth,
      row * deviceHeight,
      deviceWidth,
      deviceHeight
    );
  }
};

/** One pixel per cell: the cell's own colour, or ink where it has none. */
const fillTint = (
  data: Uint8ClampedArray,
  colors: Uint8ClampedArray,
  [ir, ig, ib, ia]: readonly [number, number, number, number]
): void => {
  for (let at = 0; at < data.length; at += 4) {
    const own = (colors[at + 3] ?? 0) > 0;
    data[at] = own ? (colors[at] ?? 0) : ir;
    data[at + 1] = own ? (colors[at + 1] ?? 0) : ig;
    data[at + 2] = own ? (colors[at + 2] ?? 0) : ib;
    data[at + 3] = own ? (colors[at + 3] ?? 255) : ia;
  }
};

/**
 * Paint `frame` onto `context`'s canvas, one cell per
 * `metrics.deviceWidth` x `metrics.deviceHeight` pixels from the top-left.
 * The canvas should already be `columns * deviceWidth` by
 * `rows * deviceHeight`.
 */
export const paintFrame = (
  context: Context2D,
  frame: AsciiFrame,
  metrics: CellMetrics,
  { ink, paper }: PaintColors
): void => {
  const { canvas } = context;
  const { width, height } = canvas;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.globalCompositeOperation = "source-over";
  // Clear first: a translucent paper drawn over the last frame would let
  // it show through, and animated grids would smear.
  context.clearRect(0, 0, width, height);
  if (paper) {
    context.fillStyle = paper;
    context.fillRect(0, 0, width, height);
  }
  const { columns, rows, colors } = frame;
  const scratch = columns * rows === 0 ? null : scratchFor(canvas);
  if (!scratch) {
    return;
  }
  const { layer, layerContext, tint, tintContext } = scratch;
  if (layer.width !== width || layer.height !== height) {
    layer.width = width;
    layer.height = height;
  } else {
    layerContext.globalCompositeOperation = "source-over";
    layerContext.clearRect(0, 0, width, height);
  }

  // 1. White glyphs, copied from the atlas.
  blitGlyphs(layerContext, frame, metrics);

  // 2. Tint: one colour for the frame, or one pixel per cell stretched over it.
  layerContext.globalCompositeOperation = "source-in";
  if (colors) {
    if (tint.width !== columns || tint.height !== rows || !scratch.pixels) {
      tint.width = columns;
      tint.height = rows;
      scratch.pixels = tintContext.createImageData(columns, rows);
    }
    fillTint(scratch.pixels.data, colors, colorBytes(ink));
    tintContext.putImageData(scratch.pixels, 0, 0);
    layerContext.imageSmoothingEnabled = false;
    layerContext.drawImage(tint, 0, 0, columns, rows, 0, 0, width, height);
  } else {
    layerContext.fillStyle = ink;
    layerContext.fillRect(0, 0, width, height);
  }
  layerContext.globalCompositeOperation = "source-over";

  // 3. Onto the paper.
  context.drawImage(layer, 0, 0);
};
