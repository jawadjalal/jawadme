import Image from "next/image";
import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { LogoMarquee } from "./LogoMarquee";

/** Brass Hands top bar + real logo marquee at the top of the hero + clean centered bio.
 *  No em dashes, no 3D pillars, no gold box behind Jawad's head. */
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
            sizes="36px"
            priority
            className="bh-head"
          />
          <span className="bh-wordmark">
            <span>JAWAD</span>
            <span>JALAL</span>
          </span>
        </Link>

        <nav className="bh-topnav" aria-label="Primary">
          <Link href="/work">WORK</Link>
          <Link href="/about">ABOUT</Link>
          <Link href="/contact">CONTACT</Link>
        </nav>

        <BookLink src="home-top" className="bh-cta">
          <span className="bh-cta-in">BOOK A CALL ↗</span>
        </BookLink>
      </header>

      <LogoMarquee />

      <div className="bh-hero-center">
        <h1 className="bh-hero-bio">
          I&apos;m Jawad, 15 in London. I design and build ads, brands, sites, and 3D.
        </h1>
      </div>
    </section>
  );
}
