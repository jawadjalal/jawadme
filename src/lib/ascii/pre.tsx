import type { ComponentProps, ReactNode } from "react";

import type { AsciiFrame } from "@/lib/ascii/frame";
import { DEFAULT_CELL, LINE_HEIGHT } from "@/lib/ascii/measure";
import { cssColor } from "@/lib/ascii/tokens";
import type { AsciiColor } from "@/lib/ascii/tokens";
import { cn } from "@/lib/utils";

/**
 * A frame as real text in a `<pre>`: no canvas, no JavaScript, renders on
 * the server. Each run of same-coloured glyphs in a row is one `<span>`.
 * For static art, banners, SSR fallbacks and anything readers should be
 * able to select and copy.
 */

export interface AsciiPreProps extends Omit<ComponentProps<"pre">, "children"> {
  /** The frame to show, or plain text with one line per row. */
  frame: AsciiFrame | string;
  /** Colour of glyphs without their own. Default `--ascii-ink`. */
  ink?: AsciiColor;
  /** Background. Default: none. */
  paper?: AsciiColor;
  /** Cell height in CSS pixels: the line height. Default `--ascii-cell`, or 12. */
  cell?: number;
}

const rgba = (colors: Uint8ClampedArray, index: number): string | null => {
  const at = index * 4;
  const alpha = colors[at + 3] ?? 0;
  if (alpha === 0) {
    return null;
  }
  const rgb = `${colors[at]} ${colors[at + 1]} ${colors[at + 2]}`;
  return alpha === 255
    ? `rgb(${rgb})`
    : `rgb(${rgb} / ${Math.round((alpha / 255) * 100) / 100})`;
};

/** One row as text runs, a span per colour change. Spaces join any run. */
const rowRuns = (frame: AsciiFrame, row: number): ReactNode[] => {
  const { columns, glyphs, colors } = frame;
  const start = row * columns;
  const line = glyphs.slice(start, start + columns);
  if (!colors) {
    return [line.join("")];
  }
  const runs: ReactNode[] = [];
  let text = "";
  let current: string | null = null;
  const flush = (key: number) => {
    if (text === "") {
      return;
    }
    runs.push(
      current === null ? (
        text
      ) : (
        <span key={key} style={{ color: current }}>
          {text}
        </span>
      )
    );
    text = "";
  };
  for (let column = 0; column < columns; column += 1) {
    const glyph = line[column] ?? " ";
    const color: string | null =
      glyph === " " ? current : rgba(colors, start + column);
    if (color !== current) {
      flush(column);
      current = color;
    }
    text += glyph;
  }
  flush(columns);
  return runs;
};

/** A server-renderable `<pre>` of a frame, one line per row, cells exactly `cell` tall. */
export const AsciiPre = ({
  frame,
  ink = "--ascii-ink",
  paper,
  cell,
  className,
  style,
  ...props
}: AsciiPreProps) => {
  const height =
    cell === undefined ? `var(--ascii-cell, ${DEFAULT_CELL}px)` : `${cell}px`;
  const rows =
    typeof frame === "string"
      ? frame.split("\n")
      : Array.from({ length: frame.rows }, (_, row) => rowRuns(frame, row));
  return (
    <pre
      className={cn("m-0 overflow-hidden whitespace-pre", className)}
      style={{
        background: paper === undefined ? undefined : cssColor(paper),
        color: cssColor(ink),
        fontFamily: "var(--ascii-font, ui-monospace, monospace)",
        fontSize: `calc(${height} / ${LINE_HEIGHT})`,
        fontVariantLigatures: "none",
        letterSpacing: 0,
        lineHeight: height,
        ...style,
      }}
      {...props}
    >
      {rows.map((row, index) => (
        // Rows are positional; they never reorder.
        // oxlint-disable-next-line react/no-array-index-key
        <span key={index}>
          {row}
          {index < rows.length - 1 ? "\n" : null}
        </span>
      ))}
    </pre>
  );
};
