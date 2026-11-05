import meta from "./meta.json";

export type DoodleName = keyof typeof meta.doodle;

/**
 * One of the chalk doodles on the desk: a monid sketch box-filtered down to
 * 1-bit cells (art/pixelate.py). The sprite holds two frames sampled half a
 * cell apart, and flipping between them is the "boil" hand-drawn animation
 * has, done in whole cells.
 */
export function Doodle({
  name,
  cell = 3,
  className = "",
  style,
}: {
  name: DoodleName;
  cell?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [w, h] = meta.doodle[name];
  return (
    <span
      aria-hidden="true"
      className={`doodle ${className}`}
      style={{ width: w * cell, height: h * cell, backgroundImage: `url(/px/d-${name}.png)`, ...style }}
    />
  );
}

/** A single-frame icon from the same sketches, 24 cells on its long side. */
export function Icon({
  name,
  tone = "b",
  cell = 2,
  className = "",
}: {
  name: DoodleName;
  /** b: blue, i: paper, k: ink */
  tone?: "b" | "i" | "k";
  cell?: number;
  className?: string;
}) {
  const [w, h] = meta.icon[name];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/px/${tone}-${name}.png`}
      alt=""
      aria-hidden="true"
      className={`pxi ${className}`}
      width={w * cell}
      height={h * cell}
    />
  );
}

export const ART = meta.art;
