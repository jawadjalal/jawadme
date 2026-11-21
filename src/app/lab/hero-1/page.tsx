import Image from "next/image";
import Link from "next/link";
import { CAL, HEAD, NAV, SHOW, SUB } from "../copy";

// Direction 1. Joyco's structure without its costume: the name set as a mark across the full width, one signal bar of
// facts, the statement in Public Sans Bold at Joyco's own size and tracking, and the work as the world below it.
// Load: the letters rise one by one, the bar wipes in under them, the statement follows word by word, then the wall.

export default function Hero1() {
  const wall = [...SHOW, ...SHOW];
  let n = 0;
  return (
    <main className="h1x">
      <h1 className="h1x-mark" aria-label={HEAD}>
        {HEAD.split(" ").map((w) => (
          <span key={w} className="h1x-w" aria-hidden="true">
            {[...w].map((ch, j) => (
              <span key={j} className="h1x-ch" style={{ animationDelay: 60 + n++ * 28 + "ms" }}>
                {ch}
              </span>
            ))}
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
        <p className="h1x-say" aria-label={SUB}>
          {SUB.split(" ").map((w, i) => (
            <span key={i}>
              <span className="h1x-sw" aria-hidden="true">
                <span style={{ animationDelay: 640 + i * 22 + "ms" }}>{w}</span>
              </span>{" "}
            </span>
          ))}
        </p>
      </div>
      <div className="h1x-world" aria-label="Recent ads">
        <div className="h1x-track">
          {wall.map((a, i) => (
            <Link key={a.id + i} href={"/w/" + a.id} className="h1x-card" style={{ animationDelay: 900 + Math.min(i, 6) * 80 + "ms" }} tabIndex={i < SHOW.length ? 0 : -1} aria-hidden={i >= SHOW.length}>
              <Image src={a.src} alt={i < SHOW.length ? a.alt : ""} width={a.w} height={a.h} sizes="(min-width: 768px) 24vw, 56vw" priority={i < 4} />
              <span className="h1x-tag">{a.brand}</span>
            </Link>
          ))}
        </div>
      </div>
      <nav className="h1x-nav" aria-label="Site">
        <span className="h1x-links">
          {NAV.map((x) => (
            <Link key={x.label} href={x.href}>
              {x.label}
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
