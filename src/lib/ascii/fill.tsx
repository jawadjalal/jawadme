import type { ComponentProps } from "react";

import type { DitherMatrix } from "@/lib/ascii/matrices";
import { DEFAULT_CELL } from "@/lib/ascii/measure";
import { AsciiPattern, TileGlyphs } from "@/lib/ascii/pattern";
import {
  bloomFilter,
  bloomLayerStyle,
  CELL_ASPECT,
  DOTTED_LEVEL,
  edgeTile,
  fillTexture,
  HATCH_TILE,
} from "@/lib/ascii/style";
import type { Bloom, FillEdge, FillName } from "@/lib/ascii/style";
import { cssColor } from "@/lib/ascii/tokens";
import type { AsciiColor } from "@/lib/ascii/tokens";

/**
 * SVG and DOM pieces of the fill kit: a glyph pattern for every fill
 * variant and two ways to draw phosphor glow. Server-safe.
 */

/** Where a ramp fill's dense edge sits, in SVG user units. */
export interface FillRamp {
  /** The dense side. */
  edge: FillEdge;
  /** Coordinate of that side: y for `top`/`bottom`, x for `left`/`right`. */
  at: number;
  /** How far the fade runs from the edge. */
  length: number;
  /** How far the fill reaches past the edge in total. Default `length`. Past the fade it holds `floor`. */
  extent?: number;
}

export interface FillPatternProps {
  /** The id to reference, as in `fill="url(#id)"`. */
  id: string;
  /** The texture (old names work too). */
  fill: FillName;
  /** Colour: a palette name or any CSS colour. Default `ink`. */
  color?: AsciiColor;
  /** Glyph cell height in SVG user units. Default 12. */
  cell?: number;
  /** Cell width over height. Default 0.5, a monospace cell. */
  aspect?: number;
  /** Ramp variants: a custom ramp from empty to dense, such as `" .oO@"`. */
  chars?: string;
  /** Ramp variants: density at the dense edge (or everywhere, without `ramp`), 0 to 1. Default 1. */
  level?: number;
  /** Ramp variants: density at the far end of the fade. Default 0.06. */
  floor?: number;
  /** Matrix that mixes neighbouring glyphs between levels. Default `bayer4`. */
  matrix?: DitherMatrix;
  /** Ramp variants: where the dense edge sits. Without it, the fill is one even `level`. */
  ramp?: FillRamp;
}

/**
 * An SVG `<pattern>` of glyphs for any fill variant. Place it inside
 * `<defs>` and fill shapes with `url(#id)`. To reuse one ramp at several
 * positions (one per bar), reference it with
 * `<pattern id="b2" href="#id" y={top} />`.
 */
export const FillPattern = ({
  id,
  fill,
  color = "ink",
  cell = DEFAULT_CELL,
  aspect = CELL_ASPECT,
  chars,
  level = 1,
  floor = 0.06,
  matrix = "bayer4",
  ramp,
}: FillPatternProps) => {
  const ink = cssColor(color);
  const cellWidth = cell * aspect;
  const texture = fillTexture(fill);
  if (texture === "solid") {
    return (
      <pattern
        id={id}
        width={cellWidth}
        height={cell}
        patternUnits="userSpaceOnUse"
      >
        <rect width={cellWidth} height={cell} style={{ fill: ink }} />
      </pattern>
    );
  }
  if (texture === "hatch") {
    return (
      <pattern
        id={id}
        width={cellWidth}
        height={cell}
        patternUnits="userSpaceOnUse"
      >
        <TileGlyphs
          tile={HATCH_TILE}
          cellWidth={cellWidth}
          cellHeight={cell}
          fill={ink}
        />
      </pattern>
    );
  }
  const glyphs = chars ?? texture;
  if (ramp === undefined || fill === "dotted") {
    return (
      <AsciiPattern
        id={id}
        level={fill === "dotted" ? DOTTED_LEVEL : level}
        matrix={matrix}
        glyphs={glyphs}
        cell={cell}
        aspect={aspect}
        color={color}
      />
    );
  }
  const tile = edgeTile({
    edge: ramp.edge,
    extent:
      ramp.edge === "top" || ramp.edge === "bottom"
        ? (ramp.extent ?? ramp.length) / cell
        : (ramp.extent ?? ramp.length) / cellWidth,
    from: level,
    glyphs,
    length:
      ramp.edge === "top" || ramp.edge === "bottom"
        ? ramp.length / cell
        : ramp.length / cellWidth,
    matrix,
    to: floor,
  });
  const width = tile.columns * cellWidth;
  const height = tile.rows * cell;
  const origin = {
    bottom: { x: 0, y: ramp.at - height },
    left: { x: ramp.at, y: 0 },
    right: { x: ramp.at - width, y: 0 },
    top: { x: 0, y: ramp.at },
  }[ramp.edge];
  return (
    <pattern
      id={id}
      x={origin.x}
      y={origin.y}
      width={width}
      height={height}
      patternUnits="userSpaceOnUse"
    >
      <TileGlyphs
        tile={tile}
        cellWidth={cellWidth}
        cellHeight={cell}
        fill={ink}
      />
    </pattern>
  );
};

export interface BloomGroupProps extends ComponentProps<"g"> {
  bloom: Bloom;
}

/**
 * An SVG group drawn as a phosphor glow: put solid copies of your shapes
 * inside and render it before (under) the real fills. Renders nothing
 * when off.
 */
export const BloomGroup = ({ bloom, style, ...props }: BloomGroupProps) => {
  const layer = bloomLayerStyle(bloom);
  return layer === undefined ? null : (
    <g aria-hidden="true" {...props} style={{ ...layer, ...style }} />
  );
};

export type BloomBoxProps = ComponentProps<"div"> & {
  /** Glow colour: a palette name or any CSS colour. Default `ink`. */
  color?: AsciiColor;
  bloom: Bloom;
};

/**
 * A wrapper that glows around whatever it holds, in `color`. A CSS
 * drop-shadow, so the glow hugs each glyph and skips the gaps between.
 */
export const BloomBox = ({
  color = "ink",
  bloom,
  style,
  ...props
}: BloomBoxProps) => (
  <div {...props} style={{ filter: bloomFilter(color, bloom), ...style }} />
);
