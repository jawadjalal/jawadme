import Image from "next/image";
import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { ADS } from "@/content/ads";
import { SITE } from "@/content/site";

// The home hero. The name is set as a mark across the full width; one crystal seam draws down through "Mastermind",
// splits it a few pixels along the cut and cools to a hairline that stays. The ember bar of facts wipes in under it,
// the statement follows word by word and the wall of ads rises, then drifts; each ad opens in the viewer.
// Reduced motion: everything at rest and no seam.

const SUB = "Hi! I'm Jawad Jalal. I'm 15 and in London, designing and building things.";
const SHOW = ADS.slice(0, 9);
const [W1, W2] = SITE.headline.split(" ");

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
    <span key={j} className="hero-ch" style={{ animationDelay: 40 + (from + j) * 18 + "ms" }}>
      {ch}
    </span>
  ));

export function Hero() {
  const wall = [...SHOW, ...SHOW];
  return (
    <section className="hero" data-hero="">
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
      <div className="bar hero-bar">
        <span>Jawad Jalal</span>
        <span className="hide-s">[ Brands, ads, 3D, Roblox ]</span>
        <span>London</span>
        <span>{SITE.available}</span>
      </div>
      <div className="hero-row">
        <BookLink src="home-hero" className="hero-who" cursor>
          <Image src="/design/jawad-die.webp" alt="" width={697} height={781} sizes="52px" priority />
          <span>Book a 15 min call ↗</span>
        </BookLink>
        <p className="hero-say" aria-label={SUB}>
          {SUB.split(" ").map((w, i) => (
            <span key={i}>
              <span className="hero-sw" aria-hidden="true">
                <span style={{ animationDelay: 600 + i * 12 + "ms" }}>{w}</span>
              </span>{" "}
            </span>
          ))}
        </p>
      </div>
      <nav className="hero-wall" aria-label="Recent ads">
        <div className="hero-track">
          {wall.map((a, i) => {
            const copy = i >= SHOW.length;
            return (
              <Link key={a.id + i} href={"/w/" + a.id} className="hero-card" data-cursor="view" style={{ animationDelay: 700 + Math.min(i, 5) * 40 + "ms" }} tabIndex={copy ? -1 : undefined} aria-hidden={copy || undefined}>
                <Image src={a.src} alt={copy ? "" : a.alt} width={a.w} height={a.h} sizes="(min-width: 768px) 30vw, 56vw" priority={i < 4} />
                <span className="hero-tag">{a.campaign}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </section>
  );
}
