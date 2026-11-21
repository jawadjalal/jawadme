import Image from "next/image";
import Link from "next/link";
import { CAL, HEAD, NAV, SHOW, SUB } from "../copy";

// Direction 2. Outpace's restraint: one small centred headline in Inter Display Bold, the sentence, one black button,
// and the work on the inside of a slowly turning ring, so the hero is the portfolio.

const N = 14;

export default function Hero2() {
  const ring = Array.from({ length: N }, (_, i) => SHOW[i % SHOW.length]);
  return (
    <main className="h2x">
      <nav className="h2x-nav" aria-label="Site">
        <span className="h2x-links">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href}>
              {n.label}
            </Link>
          ))}
        </span>
        <Link href="/" className="h2x-mark" aria-label="Jawad Jalal, home">
          <Image src="/design/jawad-die.webp" alt="" width={697} height={781} priority />
        </Link>
        <Link href={CAL} className="h2x-btn">
          Book a call
        </Link>
      </nav>
      <header className="h2x-hero">
        <p className="h2x-name">Jawad Jalal™</p>
        <h1 className="h2x-h">{HEAD}</h1>
        <p className="h2x-sub">{SUB}</p>
        <Link href={CAL} className="h2x-btn">
          Book a 15 min call
        </Link>
      </header>
      <div className="h2x-ring" aria-label="Recent ads">
        <div className="h2x-spin" style={{ ["--n" as string]: N }}>
          {ring.map((a, i) => (
            <Link key={i} href={"/w/" + a.id} className="h2x-card" style={{ ["--i" as string]: i }} tabIndex={i < SHOW.length ? 0 : -1} aria-hidden={i >= SHOW.length}>
              <Image src={a.src} alt={i < SHOW.length ? a.alt : ""} width={a.w} height={a.h} sizes="(min-width: 768px) 18vw, 46vw" priority={i < 3 || i > N - 3} />
              <span className="h2x-cap">
                <b>{a.brand}</b>
                <span>Spec ad</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
