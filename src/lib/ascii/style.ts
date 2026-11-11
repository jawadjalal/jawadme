import type { CSSProperties } from "react";

import { BRAILLE_BASE } from "@/lib/ascii/charsets";
import { fillGlyphShape, shapePath } from "@/lib/ascii/glyphs";
import { getThresholdMap } from "@/lib/ascii/matrices";
import type { DitherMatrix } from "@/lib/ascii/matrices";
import { DEFAULT_FONT, GLYPH_ADVANCE, LINE_HEIGHT } from "@/lib/ascii/measure";
import { cssColor } from "@/lib/ascii/tokens";
import type { AsciiColor, AsciiColorName } from "@/lib/ascii/tokens";

/**
 * The fill kit: glyph textures for charts and interface pieces, drawn as
 * CSS masks and SVG patterns tiled on the glyph cell grid, plus phosphor
 * glow and the default series palette. Pure and server-safe. The SVG
 * pieces that use it (`FillPattern`, `AsciiPattern`, `BloomGroup`) live in
 * `fill.tsx` and `pattern.tsx`.
 *
 * Fill textures (`FILL_TEXTURES`):
 * - `shade`: `█▓▒░·`, densest at `edge` and thinning cell by cell. The
 *   classic ANSI-art gradient. Old name: `gradient`.
 * - `ascii`: `#*+=-:.`, the same ramp in ASCII strokes.
 * - `braille`: Braille cells losing dots, `⣿` to `⠂`. Fine and light, good
 *   for line and area charts.
 * - `blocks`: quadrant blocks, `█▛▚▘`. Chunky and bold.
 * - `dots`: halftone dots, `●•·`. Old name `dotted` keeps its even field of
 *   small dots.
 * - `hatch`: `╱` in every cell, which joins into continuous diagonals.
 *   Old name: `hatched`.
 * - `solid`: flat colour.
 *
 * Ramp variants (all but `hatch` and `solid`) take a `level` for one even
 * density instead of a gradient. Between two glyphs of a ramp, cells mix
 * the two by ordered dithering, so any level reads as its true density.
 *
 * Every glyph is drawn from geometry (`lib/ascii/glyphs.ts`), not a font:
 * CSS masks can't load page fonts, and shapes stay crisp and identical on
 * every system. A custom ramp (`chars`) with letters falls back to SVG
 * text in the system monospace font.
 */

/** Every fill texture, in picker order. */
export const FILL_TEXTURES = [
  "shade",
  "ascii",
  "braille",
  "blocks",
  "dots",
  "hatch",
  "solid",
] as const;
export type FillTexture = (typeof FILL_TEXTURES)[number];

/** Names from before the glyph kit, and the texture each now draws. */
export const FILL_ALIASES = {
  dotted: "dots",
  gradient: "shade",
  hatched: "hatch",
} as const satisfies Record<string, FillTexture>;
export type FillAlias = keyof typeof FILL_ALIASES;

/**
 * The four fill names from before the glyph kit. They keep working and
 * draw glyphs (`gradient` is `shade`, `dotted` an even field of `dots`,
 * `hatched` is `hatch`). New code should use `FILL_TEXTURES`.
 */
export const FILL_VARIANTS = [
  "gradient",
  "dotted",
  "hatched",
  "solid",
] as const;
export type FillVariant = (typeof FILL_VARIANTS)[number];

/** Any fill name the kit accepts: a texture or an old name. */
export type FillName = FillTexture | FillAlias;

/** The variants that are density ramps and take a `level`. */
export type RampTexture = Exclude<FillTexture, "hatch" | "solid">;

const isFillAlias = (variant: string): variant is FillAlias =>
  Object.hasOwn(FILL_ALIASES, variant);

/** The texture a name draws: `fillTexture("gradient")` is `"shade"`. */
export const fillTexture = (variant: FillName): FillTexture =>
  isFillAlias(variant) ? FILL_ALIASES[variant] : variant;

/** True for the density-ramp variants. */
export const isRampTexture = (texture: FillTexture): texture is RampTexture =>
  texture !== "hatch" && texture !== "solid";

/** The even level `dotted` stood for: a sparse field of small dots. */
export const DOTTED_LEVEL = 0.3;

/** The side of a shape where a ramp fill is densest. */
export type FillEdge = "top" | "bottom" | "left" | "right";

/** A phosphor glow in the fill's colour around it. */
export const BLOOMS = ["off", "low", "high"] as const;
export type Bloom = (typeof BLOOMS)[number];

/**
 * Series colours in order: distinct hues, so two or more series never
 * rely on texture alone.
 */
export const SERIES_COLORS = [
  "ink",
  "orange",
  "green",
  "pink",
  "purple",
  "blue",
  "red",
  "grey",
] as const satisfies readonly [AsciiColorName, ...AsciiColorName[]];

/** The colour of series `index`: its own, or the next palette colour. */
export const seriesColor = (color: AsciiColor | undefined, index: number) =>
  color ?? SERIES_COLORS[index % SERIES_COLORS.length] ?? "ink";

/** Cell width over height for fills: a 0.6em advance on a 1.2em line. */
export const CELL_ASPECT = GLYPH_ADVANCE / LINE_HEIGHT;

/**
 * A glyph ramp: glyphs from empty to dense, each with the density it
 * stands for (0 to 1, rising, first 0, last 1).
 */
export interface GlyphRamp {
  readonly glyphs: readonly string[];
  readonly levels: readonly number[];
}

const evenly = (glyphs: readonly string[]): GlyphRamp => ({
  glyphs,
  levels: glyphs.map((_, index) => index / Math.max(1, glyphs.length - 1)),
});

// Braille dots added one at a time so each step spreads evenly: four dots
// make a checkerboard, eight a full cell.
const BRAILLE_STEPS = [0, 2, 34, 42, 106, 107, 235, 251, 255].map((mask) =>
  String.fromCodePoint(BRAILLE_BASE + mask)
);

/**
 * The ramp behind each ramp variant. Levels follow how much of the cell
 * each glyph inks, so a level of 0.5 reads half as dense as the full glyph.
 */
export const GLYPH_RAMPS = {
  ascii: evenly([..." .:-=+*#"]),
  blocks: { glyphs: [..." ▘▚▛█"], levels: [0, 0.25, 0.5, 0.75, 1] },
  braille: evenly(BRAILLE_STEPS),
  dots: { glyphs: [..." ·•●"], levels: [0, 0.12, 0.38, 1] },
  shade: { glyphs: [..." ·░▒▓█"], levels: [0, 0.06, 0.25, 0.5, 0.75, 1] },
} as const satisfies Record<RampTexture, GlyphRamp>;

/** A ramp variant's name, or a custom ramp from empty to dense such as `" .oO@"`. */
// oxlint-disable-next-line typescript/ban-types -- `string & {}` keeps editor autocomplete for the names.
export type FillGlyphs = RampTexture | (string & {});

const isRampName = (value: string): value is RampTexture =>
  Object.hasOwn(GLYPH_RAMPS, value);

/**
 * The ramp for a variant name or a custom string. A custom ramp needs at
 * least two glyphs (empty first); anything shorter falls back to `shade`.
 */
export const glyphRamp = (glyphs: FillGlyphs = "shade"): GlyphRamp => {
  if (isRampName(glyphs)) {
    return GLYPH_RAMPS[glyphs];
  }
  const custom = [...glyphs];
  return custom.length >= 2 ? evenly(custom) : GLYPH_RAMPS.shade;
};

/**
 * The glyph for `level` on a ramp. Between two glyphs, `threshold` (0 to
 * 1, from a dither matrix) picks the denser one when the level is past it.
 */
export const rampGlyph = (
  ramp: GlyphRamp,
  level: number,
  threshold = 0.5
): string => {
  const { glyphs, levels } = ramp;
  const clamped = level > 0 ? Math.min(level, 1) : 0;
  for (let index = 1; index < levels.length; index += 1) {
    const high = levels[index] ?? 1;
    if (clamped <= high) {
      const low = levels[index - 1] ?? 0;
      const share = high > low ? (clamped - low) / (high - low) : 1;
      return glyphs[share > threshold ? index : index - 1] ?? " ";
    }
  }
  return glyphs.at(-1) ?? " ";
};

/** A repeating block of glyphs, `columns` by `rows`, row-major. */
export interface GlyphTile {
  readonly columns: number;
  readonly rows: number;
  readonly glyphs: readonly string[];
}

const tileCache = new Map<string, GlyphTile>();

const cached = (key: string, build: () => GlyphTile): GlyphTile => {
  const hit = tileCache.get(key);
  if (hit !== undefined) {
    return hit;
  }
  const tile = build();
  tileCache.set(key, tile);
  return tile;
};

/**
 * One even density: one matrix of cells, each the ramp glyph for `level`
 * at that cell's threshold. A level that lands exactly on a glyph tiles
 * that glyph alone.
 */
export const levelTile = (
  level: number,
  {
    glyphs = "shade",
    matrix = "bayer4",
  }: { glyphs?: FillGlyphs; matrix?: DitherMatrix } = {}
): GlyphTile =>
  cached(`level:${glyphs}:${matrix}:${level}`, () => {
    const ramp = glyphRamp(glyphs);
    const { size, thresholds } = getThresholdMap(matrix);
    const cells = Array.from({ length: size * size }, (_, index) =>
      rampGlyph(ramp, level, thresholds[index] ?? 0.5)
    );
    return cells.every((glyph) => glyph === cells[0])
      ? { columns: 1, glyphs: [cells[0] ?? " "], rows: 1 }
      : { columns: size, glyphs: cells, rows: size };
  });

export interface RampOptions {
  /** Side where the ramp is densest. */
  edge: FillEdge;
  /** Length of the fade in cells. */
  length: number;
  /** Total length of the tile in cells, at least `length`. Past the fade it holds `to`. */
  extent?: number;
  /** Density at the edge, 0 to 1. */
  from: number;
  /** Density at the far end of the fade, 0 to 1. */
  to: number;
  /** Threshold matrix that mixes neighbouring glyphs. Default `bayer4`. */
  matrix?: DitherMatrix;
  /** The ramp's glyphs. Default `shade`. */
  glyphs?: FillGlyphs;
}

/**
 * A ramp tile: density falls linearly from `from` at `edge` to `to` over
 * `length` cells, then holds. One matrix wide across the ramp, its length
 * rounded up to whole matrices so it lines up with an even fill.
 */
export const edgeTile = ({
  edge,
  length,
  extent = length,
  from,
  to,
  matrix = "bayer4",
  glyphs = "shade",
}: RampOptions): GlyphTile =>
  cached(
    `edge:${edge}:${length}:${extent}:${from}:${to}:${matrix}:${glyphs}`,
    () => {
      const ramp = glyphRamp(glyphs);
      const { size, thresholds } = getThresholdMap(matrix);
      const fade = Math.max(1, Math.round(length));
      const along = Math.ceil(Math.max(fade, extent) / size) * size;
      const vertical = edge === "top" || edge === "bottom";
      const columns = vertical ? size : along;
      const rows = vertical ? along : size;
      const levelAt = (index: number) => {
        const step =
          edge === "top" || edge === "left" ? index : along - 1 - index;
        return step >= fade ? to : from + (to - from) * ((step + 0.5) / fade);
      };
      const cells: string[] = [];
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < columns; x += 1) {
          cells.push(
            rampGlyph(
              ramp,
              levelAt(vertical ? y : x),
              thresholds[(y % size) * size + (x % size)] ?? 0.5
            )
          );
        }
      }
      return { columns, glyphs: cells, rows };
    }
  );

/** `╱` in every cell: neighbouring cells join into unbroken diagonals. */
export const HATCH_TILE: GlyphTile = { columns: 1, glyphs: ["╱"], rows: 1 };

/** A glyph the tile draws with a font, at its cell's top-left corner. */
export interface TileText {
  readonly glyph: string;
  readonly x: number;
  readonly y: number;
}

/** A tile drawn into cells of `cellWidth` by `cellHeight` user units. */
export interface TileDrawing {
  /** Path data for every geometric glyph, filled. */
  readonly path: string;
  /** Glyphs that need a font. Usually empty. */
  readonly text: readonly TileText[];
  readonly width: number;
  readonly height: number;
}

/** Path data (and any font glyphs) for a tile at a cell size. */
export const drawTile = (
  tile: GlyphTile,
  cellWidth: number,
  cellHeight: number
): TileDrawing => {
  let path = "";
  const text: TileText[] = [];
  for (const [index, glyph] of tile.glyphs.entries()) {
    if (glyph === " ") {
      continue;
    }
    const x = (index % tile.columns) * cellWidth;
    const y = Math.floor(index / tile.columns) * cellHeight;
    const shape = fillGlyphShape(glyph);
    if (shape === undefined) {
      text.push({ glyph, x, y });
    } else {
      path += shapePath(shape, { height: cellHeight, width: cellWidth, x, y });
    }
  }
  return {
    height: tile.rows * cellHeight,
    path,
    text,
    width: tile.columns * cellWidth,
  };
};

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");

// Mask tiles are drawn at this cell size and scaled by `mask-size`.
const UNIT_HEIGHT = 12;
const UNIT_WIDTH = UNIT_HEIGHT * CELL_ASPECT;

/**
 * A tile as a standalone SVG document, black on transparent, for masks and
 * data URLs. Font glyphs use the system monospace stack: an SVG loaded as
 * an image can't see the page's web fonts.
 */
export const tileSvg = (
  tile: GlyphTile,
  {
    cellWidth = UNIT_WIDTH,
    cellHeight = UNIT_HEIGHT,
    size,
  }: {
    cellWidth?: number;
    cellHeight?: number;
    /** Intrinsic size in CSS pixels, so the image tiles without `mask-size`. */
    size?: { width: number; height: number };
  } = {}
): string => {
  const drawing = drawTile(tile, cellWidth, cellHeight);
  const dimensions =
    size === undefined
      ? ""
      : ` width="${size.width}" height="${size.height}" preserveAspectRatio="none"`;
  const text = drawing.text
    .map(
      ({ glyph, x, y }) =>
        `<text x="${x + cellWidth / 2}" y="${y + cellHeight / 2}">${escapeXml(glyph)}</text>`
    )
    .join("");
  const font =
    drawing.text.length === 0
      ? ""
      : `<style>text{font:${cellHeight / LINE_HEIGHT}px ${escapeXml(DEFAULT_FONT)};text-anchor:middle;dominant-baseline:central}</style>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${drawing.width} ${drawing.height}"${dimensions}>${font}<path d="${drawing.path}"/>${text}</svg>`;
};

/** A CSS `url(...)` for an SVG document. */
export const svgUrl = (svg: string): string =>
  `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/** A tile as a CSS `url(...)` image. */
export const tileUrl = (tile: GlyphTile): string => svgUrl(tileSvg(tile));

const times = (cell: number | string, count: number) =>
  typeof cell === "number"
    ? `${Math.round(cell * count * 1000) / 1000}px`
    : `calc(${cell} * ${Math.round(count * 1000) / 1000})`;

/** CSS `mask-size` for a tile with cells `cell` tall (a CSS length or pixels). */
export const tileSize = (tile: GlyphTile, cell: number | string): string =>
  `${times(cell, tile.columns * CELL_ASPECT)} ${times(cell, tile.rows)}`;

/** One tile of a texture in square cell units. Kept for code written before the glyph kit. */
export interface FillTile {
  /** Side of the tile in cells. */
  size: number;
  /** The glyphs drawn into square 1x1 cells. */
  path: string;
  /** The glyphs themselves. */
  tile: GlyphTile;
}

/**
 * The repeating tile of the old textured variants, with each glyph drawn
 * into a square cell. Prefer `levelTile` / `HATCH_TILE` with `drawTile`,
 * which keep the glyph cell's real shape.
 */
export const fillTile = (
  variant: "dotted" | "hatched" | "dots" | "hatch"
): FillTile => {
  const tile =
    variant === "hatch" || variant === "hatched"
      ? HATCH_TILE
      : levelTile(DOTTED_LEVEL, { glyphs: "dots" });
  return {
    path: drawTile(tile, 1, 1).path,
    size: Math.max(tile.columns, tile.rows),
    tile,
  };
};

export interface RampTile {
  /** Tile width in cells. */
  width: number;
  /** Tile height in cells. */
  height: number;
  /** The glyphs drawn into square 1x1 cells. */
  path: string;
  /** The glyphs themselves. */
  tile: GlyphTile;
}

/**
 * `edgeTile` with its glyphs drawn into square cells, for code written
 * before the glyph kit. Prefer `edgeTile` with `drawTile` or `tileSvg`.
 */
export const asciiRamp = (options: RampOptions): RampTile => {
  const tile = edgeTile(options);
  return {
    height: tile.rows,
    path: drawTile(tile, 1, 1).path,
    tile,
    width: tile.columns,
  };
};

const EDGE_POSITION = {
  bottom: "left bottom",
  left: "left top",
  right: "right top",
  top: "left top",
} as const satisfies Record<FillEdge, string>;

export interface FillStyleOptions {
  /** Colour, a palette name or any CSS colour. Default `ink`. */
  color?: AsciiColor;
  /** Glyph cell height: CSS pixels or any CSS length. Default `var(--ascii-cell)`. */
  cell?: number | string;
  /** Ramp variants: one even density, 0 to 1, instead of a ramp from `edge`. */
  level?: number;
  /** Ramp variants: a custom ramp from empty to dense, such as `" .oO@"`. */
  chars?: string;
  /** Ramps: the dense side. Default `bottom`. */
  edge?: FillEdge;
  /** Ramps: length of the fade in cells. Default 24. */
  length?: number;
  /** Ramps: density at the edge. Default 1. */
  from?: number;
  /** Ramps: density past the fade. Default 0.06 (a sparse field of the lightest glyph). */
  to?: number;
  /** Matrix that mixes neighbouring glyphs between levels. Default `bayer4`. */
  matrix?: DitherMatrix;
}

const maskStyle = (
  layers: readonly {
    image: string;
    size: string;
    position?: string;
    repeat?: string;
  }[],
  composite?: readonly ("add" | "subtract")[]
): CSSProperties => {
  const join = (pick: (layer: (typeof layers)[number]) => string) =>
    layers.map(pick).join(", ");
  const image = join((layer) => layer.image);
  const size = join((layer) => layer.size);
  const position = join((layer) => layer.position ?? "left top");
  const repeat = join((layer) => layer.repeat ?? "repeat");
  const style: CSSProperties = {
    WebkitMaskImage: image,
    WebkitMaskPosition: position,
    WebkitMaskRepeat: repeat,
    WebkitMaskSize: size,
    maskImage: image,
    maskPosition: position,
    maskRepeat: repeat,
    maskSize: size,
  };
  if (composite !== undefined) {
    style.maskComposite = composite.join(", ");
    style.WebkitMaskComposite = composite
      .map((op) => (op === "add" ? "source-over" : "source-out"))
      .join(", ");
  }
  return style;
};

/**
 * Inline styles that mask an element to a glyph tile at one even level,
 * tiled on the cell grid. Pair with a background colour.
 */
export const levelMaskStyle = (
  level: number,
  {
    cell = "var(--ascii-cell)",
    glyphs = "shade",
    matrix = "bayer4",
  }: { cell?: number | string; glyphs?: FillGlyphs; matrix?: DitherMatrix } = {}
): CSSProperties => {
  const tile = levelTile(level, { glyphs, matrix });
  return maskStyle([{ image: tileUrl(tile), size: tileSize(tile, cell) }]);
};

/**
 * Inline styles that paint an element with a fill variant: a background
 * colour and, for every variant but `solid`, a CSS mask tiled from glyphs.
 * The element needs a size; children are masked too, so put content in a
 * sibling.
 *
 * ```tsx
 * <div className="absolute inset-0" style={fillStyle("shade", { color: "green", edge: "left" })} />
 * ```
 */
export const fillStyle = (
  variant: FillName,
  {
    color = "ink",
    cell = "var(--ascii-cell)",
    level,
    chars,
    edge = "bottom",
    length = 24,
    from = 1,
    to = 0.06,
    matrix = "bayer4",
  }: FillStyleOptions = {}
): CSSProperties => {
  const backgroundColor = cssColor(color);
  const texture = fillTexture(variant);
  if (texture === "solid") {
    return { backgroundColor };
  }
  if (texture === "hatch") {
    return {
      backgroundColor,
      ...maskStyle([
        { image: tileUrl(HATCH_TILE), size: tileSize(HATCH_TILE, cell) },
      ]),
    };
  }
  const glyphs = chars ?? texture;
  const even = variant === "dotted" ? (level ?? DOTTED_LEVEL) : level;
  if (even !== undefined) {
    return {
      backgroundColor,
      ...levelMaskStyle(even, { cell, glyphs, matrix }),
    };
  }
  const ramp = edgeTile({ edge, from, glyphs, length, matrix, to });
  const vertical = edge === "top" || edge === "bottom";
  const rampLayer = {
    image: tileUrl(ramp),
    position: EDGE_POSITION[edge],
    repeat: vertical ? "repeat-x" : "repeat-y",
    size: tileSize(ramp, cell),
  };
  const floor = levelTile(to, { glyphs, matrix });
  if (floor.glyphs.every((glyph) => glyph === " ")) {
    return { backgroundColor, ...maskStyle([rampLayer]) };
  }
  // Past the ramp the floor level carries on. The floor is cut away under
  // the ramp (subtract) so the two never stack glyphs in one cell.
  const reach = vertical
    ? `100% ${times(cell, ramp.rows)}`
    : `${times(cell, ramp.columns * CELL_ASPECT)} 100%`;
  return {
    backgroundColor,
    ...maskStyle(
      [
        rampLayer,
        {
          image: tileUrl(floor),
          position: EDGE_POSITION[edge],
          size: tileSize(floor, cell),
        },
        {
          image: "linear-gradient(#000, #000)",
          position: EDGE_POSITION[edge],
          repeat: "no-repeat",
          size: reach,
        },
      ],
      ["add", "subtract", "add"]
    ),
  };
};

/** Blur radius and strength of each glow level. */
export const BLOOM_LEVELS = {
  high: { blur: 18, strength: 0.55 },
  low: { blur: 10, strength: 0.3 },
} as const satisfies Record<
  Exclude<Bloom, "off">,
  { blur: number; strength: number }
>;

/** Glow strength per theme: `--ascii-glow`, or the older `--ascii-bloom`. */
export const GLOW_VAR = "var(--ascii-glow, var(--ascii-bloom, 1))";

/**
 * Styles for a glow layer: a blurred, translucent copy of a fill drawn
 * behind it, like phosphor light bleeding past the glyphs. `--ascii-glow`
 * scales it per theme (strong in dark, low in light, where glows turn
 * muddy). `undefined` when off.
 */
export const bloomLayerStyle = (bloom: Bloom): CSSProperties | undefined => {
  if (bloom === "off") {
    return undefined;
  }
  const { blur, strength } = BLOOM_LEVELS[bloom];
  return {
    filter: `blur(${blur}px)`,
    opacity: `calc(${GLOW_VAR} * ${strength})`,
  };
};

/**
 * A CSS `filter` that glows around an element in `color`: a tight bright
 * halo hugging each glyph and a wide soft one. For DOM pieces (buttons,
 * bars) where a copy of the fill is not handy. `undefined` when off.
 */
export const bloomFilter = (
  color: AsciiColor,
  bloom: Bloom
): string | undefined => {
  if (bloom === "off") {
    return undefined;
  }
  const { blur, strength } = BLOOM_LEVELS[bloom];
  const tint = (share: number) =>
    `color-mix(in oklab, ${cssColor(color)} calc(${GLOW_VAR} * ${Math.round(share * 100)}%), transparent)`;
  return `drop-shadow(0 0 ${Math.round(blur / 4)}px ${tint(strength * 1.5)}) drop-shadow(0 0 ${blur}px ${tint(strength)})`;
};

/** `{ filter }` for `bloomFilter`, ready to spread into `style`. */
export const bloomStyle = (color: AsciiColor, bloom: Bloom): CSSProperties => {
  const filter = bloomFilter(color, bloom);
  return filter === undefined ? {} : { filter };
};
