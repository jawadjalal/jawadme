/**
 * Geometric glyphs drawn as shapes instead of font text: block elements,
 * shades, quadrants, Braille, dots, box lines and diagonals. Fonts draw
 * these glyphs at different weights, leave gaps between cells or lack
 * them, so every renderer draws them from this one geometry. A block in
 * `AsciiGrid`, in a CSS mask and in the GPU glyph atlas is the same block,
 * and neighbouring cells join without seams. Pure and server-safe.
 *
 * A shape lives in a unit cell: `x` runs 0 to 1 across the cell's width
 * and `y` 0 to 1 down its height. Line weights and dot radii are in cell
 * widths, so dots stay round and lines keep one weight in cells of any
 * aspect ratio.
 */

import {
  BRAILLE_BASE,
  BRAILLE_DOT_BITS,
  QUADRANT_GLYPHS,
} from "@/lib/ascii/charsets";

export type GlyphPrimitive =
  /** A filled rectangle. */
  | {
      readonly kind: "rect";
      readonly x: number;
      readonly y: number;
      readonly w: number;
      readonly h: number;
    }
  /** A filled circle; `r` is in cell widths. */
  | {
      readonly kind: "dot";
      readonly cx: number;
      readonly cy: number;
      readonly r: number;
    }
  /** A straight stroke with flat ends; `weight` is in cell widths. */
  | {
      readonly kind: "line";
      readonly x1: number;
      readonly y1: number;
      readonly x2: number;
      readonly y2: number;
      readonly weight: number;
    }
  /**
   * A stroked quarter ellipse centred on (cx, cy) from angle `from` to
   * `to` (radians, y down), for rounded box corners.
   */
  | {
      readonly kind: "arc";
      readonly cx: number;
      readonly cy: number;
      readonly rx: number;
      readonly ry: number;
      readonly from: number;
      readonly to: number;
      readonly weight: number;
    };

export type GlyphShape = readonly GlyphPrimitive[];

/**
 * Cell width over height: a 0.6em advance over a 1.2em line. Only used to
 * keep double lines and stroke joins even; shapes stretch to any cell.
 */
const ASPECT = 0.5;

/** Stroke weights in cell widths: box-drawing light, heavy and the double gap. */
export const GLYPH_WEIGHTS = { heavy: 0.26, light: 0.13 } as const;

const rect = (x: number, y: number, w: number, h: number): GlyphPrimitive => ({
  h,
  kind: "rect",
  w,
  x,
  y,
});

const dot = (cx: number, cy: number, r: number): GlyphPrimitive => ({
  cx,
  cy,
  kind: "dot",
  r,
});

const line = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  weight: number = GLYPH_WEIGHTS.light
): GlyphPrimitive => ({ kind: "line", weight, x1, x2, y1, y2 });

const shapes = new Map<string, GlyphShape>();
const define = (glyph: string, shape: GlyphShape) => shapes.set(glyph, shape);

define(" ", []);
define("█", [rect(0, 0, 1, 1)]);

// Eighth blocks: from the bottom (bars, sparklines) and from the left (progress).
for (const [index, glyph] of [..."▁▂▃▄▅▆▇"].entries()) {
  const share = (index + 1) / 8;
  define(glyph, [rect(0, 1 - share, 1, share)]);
}
for (const [index, glyph] of [..."▏▎▍▌▋▊▉"].entries()) {
  define(glyph, [rect(0, 0, (index + 1) / 8, 1)]);
}
define("▀", [rect(0, 0, 1, 0.5)]);
define("▔", [rect(0, 0, 1, 0.125)]);
define("▐", [rect(0.5, 0, 0.5, 1)]);
define("▕", [rect(0.875, 0, 0.125, 1)]);

// Quadrants: one rectangle per set bit (top-left 1, top-right 2, bottom-left 4, bottom-right 8).
for (const [mask, glyph] of QUADRANT_GLYPHS.entries()) {
  if (mask === 0 || mask === 15 || shapes.has(glyph)) {
    continue;
  }
  const parts: GlyphPrimitive[] = [];
  for (let bit = 0; bit < 4; bit += 1) {
    if (mask & (1 << bit)) {
      parts.push(rect((bit % 2) * 0.5, Math.floor(bit / 2) * 0.5, 0.5, 0.5));
    }
  }
  define(glyph, parts);
}

/**
 * Shades on a 2x4 sub-grid, the way terminal fonts draw them: a quarter of
 * the squares, half (a checkerboard) and three quarters. The pattern
 * continues across neighbouring cells, so a run of shades reads as one
 * even tone.
 */
const shade = (lit: (x: number, y: number) => boolean): GlyphShape => {
  const parts: GlyphPrimitive[] = [];
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 2; x += 1) {
      if (lit(x, y)) {
        parts.push(rect(x / 2, y / 4, 0.5, 0.25));
      }
    }
  }
  return parts;
};
define(
  "░",
  shade((x, y) => (y === 0 && x === 0) || (y === 2 && x === 1))
);
define(
  "▒",
  shade((x, y) => (x + y) % 2 === 0)
);
define(
  "▓",
  shade((x, y) => !((y === 1 && x === 1) || (y === 3 && x === 0)))
);

// Braille: 2x4 dots, the same positions for all 255 patterns.
const BRAILLE_RADIUS = 0.17;
for (let mask = 1; mask < 256; mask += 1) {
  const parts: GlyphPrimitive[] = [];
  for (const [row, bits] of BRAILLE_DOT_BITS.entries()) {
    for (const [column, bit] of bits.entries()) {
      if (mask & bit) {
        parts.push(
          dot(column === 0 ? 0.3 : 0.7, (row + 0.5) / 4, BRAILLE_RADIUS)
        );
      }
    }
  }
  define(String.fromCodePoint(BRAILLE_BASE + mask), parts);
}
define(String.fromCodePoint(BRAILLE_BASE), []);

// Halftone dots, smallest to largest.
define("·", [dot(0.5, 0.5, 0.07)]);
define("∙", [dot(0.5, 0.5, 0.13)]);
define("•", [dot(0.5, 0.5, 0.24)]);
define("⦁", [dot(0.5, 0.5, 0.33)]);
define("●", [dot(0.5, 0.5, 0.42)]);

// Diagonals run corner to corner, so they join into continuous lines.
define("╱", [line(0, 1, 1, 0)]);
define("╲", [line(0, 0, 1, 1)]);
define("╳", [line(0, 1, 1, 0), line(0, 0, 1, 1)]);

/**
 * Box drawing. Each glyph is up to four arms from the centre (up, right,
 * down, left) at a weight: light, heavy or double.
 */
type Arm = "l" | "h" | "d" | null;
const arms = (
  glyph: string,
  up: Arm,
  right: Arm,
  down: Arm,
  left: Arm
): void => {
  const parts: GlyphPrimitive[] = [];
  const gap = GLYPH_WEIGHTS.light * 1.2;
  // Arms are rectangles that overlap at the centre, so joins stay square.
  const vertical = (kind: Arm, from: number, to: number) => {
    if (kind === null) {
      return;
    }
    if (kind === "d") {
      for (const offset of [-gap, gap]) {
        parts.push(line(0.5 + offset, from, 0.5 + offset, to));
      }
      return;
    }
    parts.push(
      line(0.5, from, 0.5, to, kind === "h" ? GLYPH_WEIGHTS.heavy : undefined)
    );
  };
  const horizontal = (kind: Arm, from: number, to: number) => {
    if (kind === null) {
      return;
    }
    // A double line's gap is in cell widths; across the height it is smaller.
    if (kind === "d") {
      for (const offset of [-gap * ASPECT, gap * ASPECT]) {
        parts.push(line(from, 0.5 + offset, to, 0.5 + offset));
      }
      return;
    }
    parts.push(
      line(from, 0.5, to, 0.5, kind === "h" ? GLYPH_WEIGHTS.heavy : undefined)
    );
  };
  // Extend each arm past the centre by half a stroke so corners close.
  const reach = GLYPH_WEIGHTS.heavy / 2;
  vertical(up, 0, 0.5 + reach * ASPECT);
  vertical(down, 0.5 - reach * ASPECT, 1);
  horizontal(left, 0, 0.5 + reach);
  horizontal(right, 0.5 - reach, 1);
  define(glyph, parts);
};

arms("─", null, "l", null, "l");
arms("│", "l", null, "l", null);
arms("┌", null, "l", "l", null);
arms("┐", null, null, "l", "l");
arms("└", "l", "l", null, null);
arms("┘", "l", null, null, "l");
arms("├", "l", "l", "l", null);
arms("┤", "l", null, "l", "l");
arms("┬", null, "l", "l", "l");
arms("┴", "l", "l", null, "l");
arms("┼", "l", "l", "l", "l");
arms("━", null, "h", null, "h");
arms("┃", "h", null, "h", null);
arms("┏", null, "h", "h", null);
arms("┓", null, null, "h", "h");
arms("┗", "h", "h", null, null);
arms("┛", "h", null, null, "h");
arms("┣", "h", "h", "h", null);
arms("┫", "h", null, "h", "h");
arms("┳", null, "h", "h", "h");
arms("┻", "h", "h", null, "h");
arms("╋", "h", "h", "h", "h");
arms("═", null, "d", null, "d");
arms("║", "d", null, "d", null);
arms("╬", "d", "d", "d", "d");

// Double corners and tees: draw both strokes and let them cross.
for (const [glyph, up, right, down, left] of [
  ["╔", null, "d", "d", null],
  ["╗", null, null, "d", "d"],
  ["╚", "d", "d", null, null],
  ["╝", "d", null, null, "d"],
  ["╠", "d", "d", "d", null],
  ["╣", "d", null, "d", "d"],
  ["╦", null, "d", "d", "d"],
  ["╩", "d", "d", null, "d"],
] as const) {
  arms(glyph, up, right, down, left);
}

// Rounded corners: a quarter ellipse from the middle of one side to the next.
const corner = (
  glyph: string,
  cx: number,
  cy: number,
  from: number,
  to: number
) =>
  define(glyph, [
    {
      cx,
      cy,
      from,
      kind: "arc",
      rx: 0.5,
      ry: 0.5,
      to,
      weight: GLYPH_WEIGHTS.light,
    },
  ]);
corner("╭", 1, 1, Math.PI, Math.PI * 1.5);
corner("╮", 0, 1, Math.PI * 1.5, Math.PI * 2);
corner("╰", 1, 0, Math.PI * 0.5, Math.PI);
corner("╯", 0, 0, 0, Math.PI * 0.5);

/**
 * ASCII drawn as strokes, for fills only: `. : - = + * # / \ | x o`.
 * Renderers draw these with the page font; CSS masks can't load page
 * fonts, so the fill kit draws them from strokes and stays the same on
 * every system.
 */
const strokes = new Map<string, GlyphShape>();
const ascii = (glyph: string, shape: GlyphShape) => strokes.set(glyph, shape);
ascii(".", [dot(0.5, 0.78, 0.12)]);
ascii(":", [dot(0.5, 0.36, 0.12), dot(0.5, 0.74, 0.12)]);
ascii("-", [line(0.18, 0.55, 0.82, 0.55)]);
ascii("_", [line(0.08, 0.9, 0.92, 0.9)]);
ascii("=", [line(0.18, 0.44, 0.82, 0.44), line(0.18, 0.66, 0.82, 0.66)]);
ascii("+", [line(0.16, 0.55, 0.84, 0.55), line(0.5, 0.33, 0.5, 0.77)]);
ascii("*", [
  line(0.5, 0.3, 0.5, 0.72),
  line(0.2, 0.4, 0.8, 0.62),
  line(0.2, 0.62, 0.8, 0.4),
]);
ascii("x", [line(0.2, 0.38, 0.8, 0.82), line(0.2, 0.82, 0.8, 0.38)]);
ascii("o", [
  {
    cx: 0.5,
    cy: 0.6,
    from: 0,
    kind: "arc",
    rx: 0.3,
    ry: 0.2,
    to: Math.PI * 2,
    weight: GLYPH_WEIGHTS.light,
  },
]);
ascii("#", [
  line(0.38, 0.22, 0.3, 0.86),
  line(0.72, 0.22, 0.64, 0.86),
  line(0.12, 0.42, 0.9, 0.42),
  line(0.1, 0.66, 0.88, 0.66),
]);
ascii("/", [line(0.18, 0.88, 0.82, 0.12)]);
ascii("\\", [line(0.18, 0.12, 0.82, 0.88)]);
ascii("|", [line(0.5, 0.08, 0.5, 0.92)]);

/**
 * The shape of a geometric glyph, or `undefined` for glyphs a font should
 * draw (letters, digits, punctuation, katakana). Renderers use this.
 */
export const glyphShape = (glyph: string): GlyphShape | undefined =>
  shapes.get(glyph);

/** True when renderers draw `glyph` from geometry rather than a font. */
export const isGeometricGlyph = (glyph: string): boolean => shapes.has(glyph);

/**
 * The shape the fill kit draws for `glyph`: the geometric set plus ASCII
 * strokes (`. : - = + * # / \ | x o`). `undefined` means it needs a font.
 */
export const fillGlyphShape = (glyph: string): GlyphShape | undefined =>
  shapes.get(glyph) ?? strokes.get(glyph);

/** Every glyph the fill kit can draw without a font. */
export const FILL_GLYPHS: readonly string[] = [
  ...shapes.keys(),
  ...strokes.keys(),
];

type Point = readonly [number, number];

const round = (value: number) => Math.round(value * 100) / 100;

// A closed polygon, always wound clockwise (on screen), so overlapping
// parts of a glyph union under the nonzero fill rule instead of cancelling.
const polygon = (points: readonly Point[]): string => {
  let area = 0;
  for (const [index, [x1, y1]] of points.entries()) {
    const [x2, y2] = points[(index + 1) % points.length] ?? [x1, y1];
    area += x1 * y2 - x2 * y1;
  }
  const ordered = area < 0 ? [...points].toReversed() : points;
  return `${ordered
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${round(x)} ${round(y)}`)
    .join("")}Z`;
};

/** A box in user units that a glyph is drawn into. */
export interface GlyphBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const ARC_STEPS = 10;

/**
 * SVG path data for a shape drawn into `box`, filled only (strokes become
 * outlines). One path per glyph or per tile keeps masks and patterns small.
 */
export const shapePath = (shape: GlyphShape, box: GlyphBox): string => {
  const { x, y, width, height } = box;
  const px = (u: number) => x + u * width;
  const py = (v: number) => y + v * height;
  let path = "";
  for (const part of shape) {
    switch (part.kind) {
      case "rect": {
        path += `M${round(px(part.x))} ${round(py(part.y))}h${round(part.w * width)}v${round(part.h * height)}h${round(-part.w * width)}Z`;
        break;
      }
      case "dot": {
        const r = round(part.r * width);
        path += `M${round(px(part.cx) - r)} ${round(py(part.cy))}a${r} ${r} 0 1 1 ${round(2 * r)} 0a${r} ${r} 0 1 1 ${round(-2 * r)} 0Z`;
        break;
      }
      case "line": {
        const x1 = px(part.x1);
        const y1 = py(part.y1);
        const x2 = px(part.x2);
        const y2 = py(part.y2);
        const length = Math.hypot(x2 - x1, y2 - y1) || 1;
        const half = (part.weight * width) / 2;
        const nx = ((y2 - y1) / length) * half;
        const ny = (-(x2 - x1) / length) * half;
        path += polygon([
          [x1 + nx, y1 + ny],
          [x2 + nx, y2 + ny],
          [x2 - nx, y2 - ny],
          [x1 - nx, y1 - ny],
        ]);
        break;
      }
      case "arc": {
        const half = (part.weight * width) / 2;
        const outer: Point[] = [];
        const inner: Point[] = [];
        for (let step = 0; step <= ARC_STEPS; step += 1) {
          const angle = part.from + ((part.to - part.from) * step) / ARC_STEPS;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const ax = px(part.cx) + cos * part.rx * width;
          const ay = py(part.cy) + sin * part.ry * height;
          outer.push([ax + cos * half, ay + sin * half]);
          inner.push([ax - cos * half, ay - sin * half]);
        }
        path += polygon([...outer, ...inner.toReversed()]);
        break;
      }
      default: {
        const exhaustive: never = part;
        return exhaustive;
      }
    }
  }
  return path;
};

/** SVG path data for a glyph in `box`, or `""` when it needs a font. */
export const glyphPath = (glyph: string, box: GlyphBox): string => {
  const shape = fillGlyphShape(glyph);
  return shape === undefined ? "" : shapePath(shape, box);
};

/** Draw any shape (including fill-only ASCII strokes) into a canvas cell. */
export const drawShape = (
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  shape: GlyphShape,
  x: number,
  y: number,
  width: number,
  height: number
): void => {
  let path: Path2D | null = null;
  for (const part of shape) {
    if (part.kind === "rect") {
      // Snap both edges, not the size, so adjacent rectangles share edges.
      const left = Math.round(x + part.x * width);
      const top = Math.round(y + part.y * height);
      const right = Math.round(x + (part.x + part.w) * width);
      const bottom = Math.round(y + (part.y + part.h) * height);
      if (right > left && bottom > top) {
        context.fillRect(left, top, right - left, bottom - top);
      }
      continue;
    }
    path ??= new Path2D();
    if (part.kind === "dot") {
      const r = Math.max(0.5, part.r * width);
      const cx = x + part.cx * width;
      const cy = y + part.cy * height;
      path.moveTo(cx + r, cy);
      path.arc(cx, cy, r, 0, Math.PI * 2);
    } else {
      path.addPath(
        new Path2D(
          shapePath([part], { height, width: Math.max(width, 1), x, y })
        )
      );
    }
  }
  if (path) {
    context.fill(path);
  }
};

/**
 * Draw a geometric glyph on a 2D canvas into the cell at (x, y) of size
 * (width, height) in canvas pixels, with the current `fillStyle`. Block
 * edges snap to whole pixels, so neighbouring cells meet without seams.
 * Returns false (drawing nothing) when the glyph needs a font.
 */
export const drawGlyph = (
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  glyph: string,
  x: number,
  y: number,
  width: number,
  height: number
): boolean => {
  const shape = shapes.get(glyph);
  if (shape === undefined) {
    return false;
  }
  drawShape(context, shape, x, y, width, height);
  return true;
};
