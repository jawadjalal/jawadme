import Image from "next/image";
import { BookLink } from "@/components/BookLink";
import { AdRing } from "@/components/ds/AdRing";
import { Art } from "@/components/ds/Art";
import { ADS } from "@/content/ads";
import { SITE } from "@/content/site";

// The home hero. The statement and the call sit on the top line; under them the name runs the full width as a mark,
// with one crystal seam drawn down through "Mastermind" that splits it a few pixels along the cut and cools to a
// hairline. Below the mark the hall opens: the painted underworld gallery (public/art/hero.webp), or until it lands the
// same space in plum-black, lit from the floor, and in it the ads turn on a ring (AdRing). Load, about 1.6 s: letters
// rise, the seam draws and splits, the hall opens, the ring curves into place and the ember bar wipes in.
// Reduced motion: everything at rest and no seam.

const SUB = "Hi! I'm Jawad Jalal. I'm 15 and in London, designing and building things.";
const [W1, W2] = SITE.headline.split(" ");
export const RING = ADS.filter((a) => a.w * 5 === a.h * 4).slice(0, 20);

type Pt = [number, number];

function seam(seed: number, x0: number, amp: number) {
  const pts: Pt[] = [];
  let x = x0;
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = -2; y < 102; y += 3 + rnd() * 6) {
    x += (rnd() - 0.5) * 1.6 * amp + (x0 - x) * 0.15;
    if (rnd() > 0.86) x += (rnd() - 0.5) * 3 * amp;
    pts.push([+x.toFixed(2), +y.toFixed(2)]);
  }
  pts.push([+x.toFixed(2), 102]);
  return pts;
}

const CUT = seam(5, 50, 1);
const D = CUT.map(([x, y], i) => (i ? "L" : "M") + x + " " + y).join(" ");
const poly = (side: "l" | "r") => {
  const edge = side === "l" ? "0%" : "100%";
  return "polygon(" + [edge + " 0%", ...CUT.map(([x, y]) => x + "% " + y + "%"), edge + " 100%"].join(", ") + ")";
};

const chars = (w: string, from: number) =>
  [...w].map((ch, j) => (
    <span key={j} className="hero-ch" style={{ animationDelay: 40 + (from + j) * 22 + "ms" }}>
      {ch}
    </span>
  ));

export function Hero() {
  return (
    <section className="hero" data-hero="">
      <div className="hero-top">
        <p className="hero-say" aria-label={SUB}>
          {SUB.split(" ").map((w, i) => (
            <span key={i}>
              <span className="hero-sw" aria-hidden="true">
                <span style={{ animationDelay: 520 + i * 14 + "ms" }}>{w}</span>
              </span>{" "}
            </span>
          ))}
        </p>
        <BookLink src="home-hero" className="hero-who" cursor>
          <Image src="/design/jawad-die.webp" alt="" width={697} height={781} sizes="44px" priority />
          <span>Book a 15 min call ↗</span>
        </BookLink>
      </div>
      <h1 className="hero-mark" aria-label={SITE.headline}>
        <span className="hero-w" aria-hidden="true">
          {chars(W1, 0)}
        </span>
        <span className="hero-w hero-mm" aria-hidden="true" style={{ "--cl": poly("l"), "--cr": poly("r") } as React.CSSProperties}>
          <span className="hero-half l">{chars(W2, W1.length)}</span>
          <span className="hero-half r">{chars(W2, W1.length)}</span>
          <svg className="hero-seam" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d={D} className="hero-glow" />
            <path d={D} className="hero-core" />
          </svg>
        </span>
      </h1>
      <div className="hero-ring">
        <div className="hall" aria-hidden="true">
          <Art k="hero" priority className="hall-art" fallback={<span className="hall-light" />} />
        </div>
        <AdRing ads={RING} />
      </div>
      <div className="bar hero-bar">
        <span>Jawad Jalal</span>
        <span>{SITE.available}</span>
        <span>London</span>
      </div>
    </section>
  );
}
