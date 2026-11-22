import Image from "next/image";
import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { MailLink } from "@/components/MailLink";
import gh from "@/content/github-contributions.json";
import { SITE } from "@/content/site";
import { LondonClock } from "./LondonClock";

const LAST_DAYS = (gh.levels as number[]).slice(-112);

/** Brass Hands industrial top bar with live London time, GitHub contributions, CV, Email,
 *  and square glossy orange Book a Call CTA. Clean centered bio without age. */
export function Hero() {
  return (
    <section className="nh-bh" data-hero="">
      <header className="bh-topbar">
        <Link href="/" className="bh-brand" aria-label="Jawad Jalal home">
          <Image
            src="/design/jawad-die.webp"
            alt="Jawad Jalal"
            width={40}
            height={45}
            sizes="34px"
            priority
            className="bh-head"
          />
          <span className="bh-wordmark">
            <span>JAWAD</span>
            <span>JALAL</span>
          </span>
        </Link>

        <div className="bh-ops">
          <div className="bh-ops-line">
            <span>LONDON, UK</span>
            <span className="bh-ops-sep">/</span>
            <LondonClock />
          </div>
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

        <nav className="bh-topnav" aria-label="Primary">
          <Link href="/work">WORK</Link>
          <a href={SITE.cv} download>
            CV
          </a>
          <MailLink src="topbar" className="bh-nav-mail">
            EMAIL
          </MailLink>
        </nav>

        <BookLink src="home-top" className="bh-cta">
          <span className="bh-cta-in">BOOK A CALL ↗</span>
        </BookLink>
      </header>

      <div className="bh-hero-center">
        <h1 className="bh-hero-bio">
          I&apos;m Jawad in London. I design and build ads, brands, sites, and 3D.
        </h1>
      </div>
    </section>
  );
}
