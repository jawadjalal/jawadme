import Image from "next/image";
import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { SITE } from "@/content/site";

const TICKER = [
  "IGNARU",
  "MENUFIT · 1.5M USERS",
  "OKARA · 14M LAUNCH VIEWS",
  "IGNURA STUDIO",
  "CORESRENT",
  "FRACTURE",
  "BLADE BALL · 3D",
  "FISH IT · 3D",
  "BEVEL",
];

/** Neo-Industrial Hero combining Brass Hands' telemetry authority with a framed
 *  ember-graded Hades isometric architectural diagram. Zero broken 3D scroll hijacking. */
export function Hero() {
  return (
    <section className="nh" data-hero="">
      {/* Top Brass Hands–style telemetry bar */}
      <header className="nh-top">
        <Link href="/" className="nh-brand" aria-label="Jawad Jalal home">
          <span className="nh-mark" aria-hidden="true">
            <Image src="/design/jawad-die.webp" alt="" width={64} height={72} sizes="36px" priority />
          </span>
          <span className="nh-word">
            <span>JAWAD</span>
            <span>JALAL</span>
          </span>
        </Link>

        <div className="nh-telemetry">
          <span>DESIGN &amp; ENGINEERING FOR FRONTIER TECH</span>
          <span>
            <i className="nh-dot" aria-hidden="true" /> STATUS: {SITE.available.toUpperCase()}
          </span>
          <span>BRANDS / ADS / 3D / ROBLOX</span>
        </div>

        <nav className="nh-top-nav" aria-label="Primary">
          <Link href="/work">WORK</Link>
          <Link href="/about">ABOUT</Link>
          <Link href="/contact">CONTACT</Link>
          <span className="nh-loc">LONDON, UK</span>
        </nav>

        <BookLink src="home-top" className="bh-cta">
          <span className="bh-cta-in">BOOK A CALL ↗</span>
        </BookLink>
      </header>

      {/* Dashed Brass Hands ticker */}
      <div className="nh-ticker" aria-label="Selected companies and projects">
        <div className="nh-ticker-track">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="nh-ticker-item">
              <span className="nh-ticker-sep" aria-hidden="true">◆</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Main asymmetric hero grid */}
      <div className="nh-grid">
        <div className="nh-copy">
          <div className="nh-kicker">
            <span>[00] // PORTFOLIO 2026</span>
            <span>AGE 15 · LONDON</span>
          </div>
          <h1 className="nh-h1">
            DESIGNING &amp; BUILDING AT{" "}
            <span className="nh-accent">STUDIO SCALE.</span>
          </h1>
          <p className="nh-lead">
            I&apos;m <strong>Jawad Jalal</strong> — designer and builder in London. Founder of{" "}
            <a href="https://ignura.com" target="_blank" rel="noopener">
              Ignura Studio
            </a>
            . Previously product design at <strong>MenuFit</strong> (1.5M users) and{" "}
            <strong>Okara</strong> (14M launch views). I design brands, 70+ ad concepts, websites,
            and 3D Roblox worlds — and ship them myself.
          </p>

          <div className="nh-actions">
            <BookLink src="home-hero" className="bh-cta bh-cta-lg">
              <span className="bh-cta-in">BOOK A 15-MIN CALL ↗</span>
            </BookLink>
            <a href="#marquee" className="bh-btn-sec">
              EXPLORE WORK ↓
            </a>
          </div>

          <dl className="nh-stats">
            <div>
              <dt>AD CONCEPTS</dt>
              <dd>70+</dd>
            </div>
            <div>
              <dt>PRODUCT SCALE</dt>
              <dd>1.5M USERS</dd>
            </div>
            <div>
              <dt>3D GAME VISITS</dt>
              <dd>11B+</dd>
            </div>
            <div>
              <dt>RESPONSE TIME</dt>
              <dd>&lt; 24 HRS</dd>
            </div>
          </dl>
        </div>

        {/* Framed Hades-style isometric diagram */}
        <figure className="nh-diagram">
          <div className="nh-diagram-head">
            <span>FIG. 00 // THE GATE</span>
            <span>ISO 30° · HADES II PALETTE</span>
          </div>
          <div className="nh-diagram-frame">
            <Image
              src="/world/poster/gate-d.webp"
              alt="Hades-style isometric architectural gate diagram"
              width={1440}
              height={900}
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="nh-diagram-img"
            />
            <span className="nh-pin nh-pin-1">
              <i aria-hidden="true" />
              <span>01 · BRAND SYSTEMS</span>
            </span>
            <span className="nh-pin nh-pin-2">
              <i aria-hidden="true" />
              <span>02 · 70+ AD CONCEPTS</span>
            </span>
            <span className="nh-pin nh-pin-3">
              <i aria-hidden="true" />
              <span>03 · 3D &amp; ROBLOX</span>
            </span>
          </div>
          <figcaption className="nh-diagram-foot">
            <span>ARCHITECTURE: ISOMETRIC TEMPLE PLATE</span>
            <span>51.5074° N, 0.1278° W</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
