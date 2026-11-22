import Image from "next/image";
import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { MailLink } from "@/components/MailLink";
import gh from "@/content/github-contributions.json";
import { SITE } from "@/content/site";
import { InlineGlyph } from "./InlineGlyph";
import { LondonClock } from "./LondonClock";

const LAST_DAYS = (gh.levels as number[]).slice(-112);

/** Authentic Brass Hands–scale industrial command header:
 *  Generous height, tall stacked wordmark, 3-line London telemetry, 2-row stacked orange nav + GitHub commits,
 *  and tall 4-corner hatched Book a Call CTA. */
export function Hero() {
  return (
    <section className="nh-bh" data-hero="">
      <header className="bh-topbar">
        <Link href="/" className="bh-brand" aria-label="Jawad Jalal home">
          <Image
            src="/design/jawad-die.webp"
            alt="Jawad Jalal"
            width={52}
            height={58}
            sizes="48px"
            priority
            className="bh-head"
          />
          <span className="bh-wordmark">
            <span>JAWAD</span>
            <span>JALAL</span>
          </span>
        </Link>

        <div className="bh-ops-col">
          <span>ADS / BRANDS / SITES / 3D</span>
          <span>STATUS: AVAILABLE NOW</span>
          <span className="bh-ops-time">
            LONDON, UK <i className="bh-ops-sep">/</i> <LondonClock />
          </span>
        </div>

        <div className="bh-nav-col">
          <nav className="bh-topnav" aria-label="Primary">
            <Link href="/work">WORK</Link>
            <Link href="/about">ABOUT</Link>
            <a href={SITE.cv} download>
              CV
            </a>
            <MailLink src="topbar" className="bh-nav-mail">
              EMAIL
            </MailLink>
          </nav>

          <a
            href="https://github.com/jawadjalal"
            target="_blank"
            rel="noopener"
            className="bh-gh"
            aria-label={`${gh.total.toLocaleString()} GitHub contributions in the past year`}
          >
            <span className="bh-gh-grid" aria-hidden="true">
              {LAST_DAYS.map((lvl, i) => (
                <i key={i} data-l={lvl} />
              ))}
            </span>
            <span className="bh-gh-num">{gh.total.toLocaleString()} COMMITS</span>
          </a>
        </div>

        <BookLink src="home-top" className="bh-cta bh-cta-tall">
          <span className="bh-cta-in">BOOK A CALL ↗</span>
        </BookLink>
      </header>

      <div className="bh-hero-center">
        <h1 className="bh-hero-bio">
          I&apos;m <InlineGlyph kind="head" tilt={-4} /> Jawad. I design and build{" "}
          <InlineGlyph kind="ads" tilt={3} /> ads,{" "}
          <InlineGlyph kind="brands" tilt={-3} /> brands,{" "}
          <InlineGlyph kind="sites" tilt={2} /> sites, and{" "}
          <InlineGlyph kind="cube" tilt={-3} /> 3D in London.
        </h1>
      </div>
    </section>
  );
}
