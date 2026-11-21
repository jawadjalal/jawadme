import Image from "next/image";
import Link from "next/link";
import { CAL, HEAD, NAV, SHOW, SUB } from "../copy";

// Direction 1. Joyco's structure without its costume: the name set as a mark across the full width, one signal bar of
// facts, the statement in Public Sans Bold at Joyco's own size and tracking, and the work as the world below it.

export default function Hero1() {
  const wall = [...SHOW, ...SHOW];
  return (
    <main className="h1x">
      <h1 className="h1x-mark" aria-label={HEAD}>
        {HEAD.split(" ").map((w, i) => (
          <span key={w} className="h1x-w" style={{ animationDelay: 80 + i * 90 + "ms" }}>
            {w}
          </span>
        ))}
      </h1>
      <div className="h1x-bar">
        <span>Jawad Jalal</span>
        <span className="h1x-hide">[ Brands, ads, 3D, Roblox ]</span>
        <span className="h1x-hide">[ 51°30′26″N 0°07′39″W ]</span>
        <span>2026©</span>
      </div>
      <div className="h1x-row">
        <Link href={CAL} className="h1x-who">
          <Image src="/design/jawad-die.webp" alt="" width={697} height={781} priority />
          <span>Book a 15 min call ↗</span>
        </Link>
        <p className="h1x-say">{SUB}</p>
      </div>
      <div className="h1x-world" aria-label="Recent ads">
        <div className="h1x-track">
          {wall.map((a, i) => (
            <Link key={a.id + i} href={"/w/" + a.id} className="h1x-card" tabIndex={i < SHOW.length ? 0 : -1} aria-hidden={i >= SHOW.length}>
              <Image src={a.src} alt={i < SHOW.length ? a.alt : ""} width={a.w} height={a.h} sizes="(min-width: 768px) 24vw, 56vw" priority={i < 4} />
            </Link>
          ))}
        </div>
      </div>
      <nav className="h1x-nav" aria-label="Site">
        <span className="h1x-links">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href}>
              {n.label}
            </Link>
          ))}
        </span>
        <Link href={CAL} className="h1x-cta">
          Book a call ↗
        </Link>
      </nav>
    </main>
  );
}
