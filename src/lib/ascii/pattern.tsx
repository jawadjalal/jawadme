import type { CSSProperties } from "react";

import type { DitherMatrix } from "@/lib/ascii/matrices";
import { DEFAULT_CELL, LINE_HEIGHT } from "@/lib/ascii/measure";
import {
  CELL_ASPECT,
  drawTile,
  levelMaskStyle,
  levelTile,
  tileSvg,
  svgUrl,
} from "@/lib/ascii/style";
import type { FillGlyphs, GlyphTile } from "@/lib/ascii/style";
import { cssColor } from "@/lib/ascii/tokens";
import type { AsciiColor } from "@/lib/ascii/tokens";

/**
 * Glyph textures without a canvas: an SVG `<pattern>` for chart fills and
 * a CSS mask for any element, both tiled from real glyphs on the cell
 * grid. Pure and render on the server. `level` is the density from 0
 * (empty cells) to 1 (the ramp's densest glyph in every cell).
 */

/**
 * Path data for one tile of `level`, each glyph drawn into a square 1x1
 * cell. Kept for code written before the glyph kit; prefer `levelTile`
 * and `drawTile`, which keep the cell's real shape.
 */
export const asciiPath = (
  level: number,
  matrix: DitherMatrix = "bayer4",
  glyphs: FillGlyphs = "shade"
): string => drawTile(levelTile(level, { glyphs, matrix }), 1, 1).path;

export interface AsciiMaskOptions {
  /** Threshold matrix that mixes glyphs between levels. Default `"bayer4"`. */
  matrix?: DitherMatrix;
  /** The ramp: a variant name or custom glyphs from empty to dense. Default `"shade"`. */
  glyphs?: FillGlyphs;
  /**
   * Glyph cell height in CSS pixels. When set, the image has its real size
   * and tiles without a `mask-size`. Leave it unset to size the tile
   * yourself, for example with `asciiMaskStyle`.
   */
  cell?: number;
}

/**
 * A CSS `mask-image` value: one tile of glyphs at `level`. Paint the
 * element with the ink colour and mask it.
 */
export const asciiMask = (
  level: number,
  { matrix = "bayer4", glyphs = "shade", cell }: AsciiMaskOptions = {}
): string => {
  const tile = levelTile(level, { glyphs, matrix });
  return svgUrl(
    tileSvg(
      tile,
      cell === undefined
        ? {}
        : {
            size: {
              height: tile.rows * cell,
              width: tile.columns * cell * CELL_ASPECT,
            },
          }
    )
  );
};

export interface AsciiMaskStyleOptions {
  /** Threshold matrix that mixes glyphs between levels. Default `"bayer4"`. */
  matrix?: DitherMatrix;
  /** The ramp: a variant name or custom glyphs from empty to dense. Default `"shade"`. */
  glyphs?: FillGlyphs;
  /** Glyph cell height: CSS pixels, or any CSS length. Default `var(--ascii-cell)`. */
  cell?: number | string;
}

/**
 * Inline styles that mask an element to one level of glyphs, tiled at the
 * cell size. Pair with a background colour such as `bg-ascii-ink`.
 *
 * ```tsx
 * <div className="bg-ascii-ink" style={asciiMaskStyle(0.5)} />
 * ```
 */
export const asciiMaskStyle = (
  level: number,
  {
    matrix = "bayer4",
    glyphs = "shade",
    cell = "var(--ascii-cell)",
  }: AsciiMaskStyleOptions = {}
): CSSProperties => levelMaskStyle(level, { cell, glyphs, matrix });

export interface TileGlyphsProps {
  /** The tile to draw. */
  tile: GlyphTile;
  /** Cell width in user units. */
  cellWidth: number;
  /** Cell height in user units. */
  cellHeight: number;
  /** Glyph colour. */
  fill: string;
}

/**
 * A tile's glyphs as SVG: one path for every geometric glyph, and `<text>`
 * in `--ascii-font` for any glyph that needs a font.
 */
export const TileGlyphs = ({
  tile,
  cellWidth,
  cellHeight,
  fill,
}: TileGlyphsProps) => {
  const drawing = drawTile(tile, cellWidth, cellHeight);
  return (
    <>
      {drawing.path === "" ? null : <path d={drawing.path} style={{ fill }} />}
      {drawing.text.map(({ glyph, x, y }) => (
        <text
          key={`${x}:${y}`}
          x={x + cellWidth / 2}
          y={y + cellHeight / 2}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fill,
            fontFamily: "var(--ascii-font, ui-monospace, monospace)",
            fontSize: cellHeight / LINE_HEIGHT,
          }}
        >
          {glyph}
        </text>
      ))}
    </>
  );
};

export interface AsciiPatternProps {
  /** The id to reference, as in `fill="url(#id)"`. */
  id: string;
  /** Density, 0 to 1. */
  level: number;
  /** Threshold matrix that mixes glyphs between levels. Default `"bayer4"`. */
  matrix?: DitherMatrix;
  /** The ramp: a variant name or custom glyphs from empty to dense. Default `"shade"`. */
  glyphs?: FillGlyphs;
  /** Glyph cell height in SVG user units (CSS pixels when the SVG is not scaled). Default 12. */
  cell?: number;
  /** Cell width over height. Default 0.5, a monospace cell. */
  aspect?: number;
  /** Glyph colour. Default `--ascii-ink`. */
  color?: AsciiColor;
  /** Colour behind the glyphs. Default: transparent. */
  background?: AsciiColor;
}

/**
 * An SVG `<pattern>` of glyphs at one level. Place it inside `<defs>` and
 * fill shapes with `url(#id)`. Colours accept CSS variables, so the fill
 * follows the theme.
 */
export const AsciiPattern = ({
  id,
  level,
  matrix = "bayer4",
  glyphs = "shade",
  cell = DEFAULT_CELL,
  aspect = CELL_ASPECT,
  color = "--ascii-ink",
  background,
}: AsciiPatternProps) => {
  const tile = levelTile(level, { glyphs, matrix });
  const cellWidth = cell * aspect;
  const width = tile.columns * cellWidth;
  const height = tile.rows * cell;
  return (
    <pattern
      id={id}
      width={width}
      height={height}
      patternUnits="userSpaceOnUse"
    >
      {background === undefined ? null : (
        <rect
          width={width}
          height={height}
          style={{ fill: cssColor(background) }}
        />
      )}
      <TileGlyphs
        tile={tile}
        cellWidth={cellWidth}
        cellHeight={cell}
        fill={cssColor(color)}
      />
    </pattern>
  );
};
