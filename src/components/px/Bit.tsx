import { BITS, type BitName } from "./bits";

/** A hand-set bitmap from bits.ts as crisp SVG cells. One path, so a glyph
 *  costs one DOM node however many cells it has. */
export function Bit({ name, cell = 2, className }: { name: BitName; cell?: number; className?: string }) {
  const rows = BITS[name];
  const w = rows[0].length;
  const h = rows.length;
  let d = "";
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === "#") d += `M${x} ${y}h1v1h-1z`;
  });
  return (
    <svg
      className={className}
      width={w * cell}
      height={h * cell}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}
