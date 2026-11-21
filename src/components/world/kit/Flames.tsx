import type { CSSProperties } from "react";
import MARKS from "../marks.json";
import "./flames.css";

type Mark = number[];

/** A poster's flames as a CSS flipbook (public/world/flame, frames of ./flame's shader flame), standing where the
 *  poster's scene left them (data-marks, collected by ./posters.mjs into ../marks.json), on desktop and phone posters. */
export function Flames({ of }: { of: string }) {
  const m = (MARKS as Record<string, { d?: Mark[]; m?: Mark[] }>)[of];
  if (!m) return null;
  return (
    <span className="pf" aria-hidden="true">
      {(["d", "m"] as const).flatMap((t) =>
        (m[t] ?? []).map(([x, y, h], i) => <i key={t + i} className={"pf-" + t} style={{ "--x": x, "--y": y, "--h": h, "--d": ((i * 0.37) % 1.6).toFixed(2) } as CSSProperties}><b /></i>),
      )}
    </span>
  );
}
