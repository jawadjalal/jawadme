import Link from "next/link";
import { Embers } from "../Embers";
import { CAL, NAV, SUB } from "../copy";

// Direction 4. Fracture as light, with a studio's restraint: the dark, the name whole for a beat, then one seam of
// crystal light runs down the screen and the name splits along it, the right half settling a few pixels down and
// across, the way the shaft splits in the game. Cold dust drifts in the light. One effect, choreographed once.

function seam(seed: number, x0: number, amp: number) {
  const pts: [number, number][] = [];
  let x = x0;
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let y = -2; y <= 102; y += 1.2 + rnd() * 2.6) {
    x += (rnd() - 0.5) * 1.5 * amp + (x0 - x) * 0.12;
    if (rnd() > 0.9) x += (rnd() - 0.5) * 2.4 * amp;
    pts.push([+x.toFixed(2), +y.toFixed(2)]);
  }
  return pts;
}

const D = seam(7, 57.5, 0.4);
const DM = seam(11, 63, 1);
const poly = (pts: [number, number][], side: "l" | "r") =>
  "polygon(" + [side === "l" ? "0% 0%" : "100% 0%", ...pts.map(([x, y]) => x + "% " + y + "%"), side === "l" ? "0% 100%" : "100% 100%"].join(", ") + ")";
const path = (pts: [number, number][]) => pts.map(([x, y], i) => (i ? "L" : "M") + x + " " + y).join(" ");

export default function Hero4() {
  return (
    <main className="h4x" style={{ ["--cl" as string]: poly(D, "l"), ["--cr" as string]: poly(D, "r"), ["--clm" as string]: poly(DM, "l"), ["--crm" as string]: poly(DM, "r") }}>
      <div className="h4x-warm" aria-hidden="true" />
      <div className="h4x-beam" aria-hidden="true" />
      <Embers count={34} hue="160,240,236" />
      <svg className="h4x-seam h4x-d" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={path(D)} className="h4x-glow1" />
        <path d={path(D)} className="h4x-core" />
      </svg>
      <svg className="h4x-seam h4x-m" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={path(DM)} className="h4x-glow1" />
        <path d={path(DM)} className="h4x-core" />
      </svg>
      <nav className="h4x-nav" aria-label="Site">
        <Link href="/">Jawad Jalal</Link>
        <span className="h4x-links">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href}>
              {n.label}
            </Link>
          ))}
        </span>
      </nav>
      <div className="h4x-name">
        <h1 className="h4x-h h4x-l">
          <span>Design</span> <span>Mastermind</span>
        </h1>
        <p className="h4x-h h4x-r" aria-hidden="true">
          <span>Design</span> <span>Mastermind</span>
        </p>
      </div>
      <div className="h4x-foot">
        <p className="h4x-sub">{SUB}</p>
        <Link href={CAL} className="h4x-cta">
          Book a call ↗
        </Link>
      </div>
    </main>
  );
}
