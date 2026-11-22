import Image from "next/image";
import { BookLink } from "@/components/BookLink";
import { HeroPillars } from "./HeroPillars";

/** Minimal centered Hero flanked by Joyco-style 3D Hades II obsidian & gilded pillars.
 *  Zero eyebrow text, zero fake telemetry, zero clutter. */
export function Hero() {
  return (
    <section className="nh-min" data-hero="">
      <HeroPillars />
      <div className="nh-min-in">
        <div className="nh-min-id">
          <Image src="/design/jawad-die.webp" alt="Jawad Jalal" width={40} height={45} sizes="36px" priority />
          <span>jawad jalal</span>
        </div>
        <h1 className="nh-min-bio">
          I&apos;m 15 in London — designing &amp; building{" "}
          <span className="nh-accent">ads, brands, sites &amp; 3D.</span>
        </h1>
        <BookLink src="home-hero" className="bh-cta">
          <span className="bh-cta-in">Book a call ↗</span>
        </BookLink>
      </div>
    </section>
  );
}
