import Image from "next/image";
import { BookLink } from "@/components/BookLink";
import { AdRing } from "@/components/ds/AdRing";
import { Art } from "@/components/ds/Art";
import { Wordmark } from "@/components/ds/Wordmark";
import { ADS } from "@/content/ads";
import { SITE } from "@/content/site";

// The home hero. The statement and the call sit on the top line; under them the name runs the full width, lettered
// (Wordmark). Below it the hall: one flat field of warm ink with a whisper of grain, so the ads carry all the colour,
// or the painting (public/art/hero.webp) once it lands; in it the ads turn on a drum (AdRing). Load, about 1.4 s: the
// statement and the letters rise, the drum curves into place and the ember bar wipes in. Reduced motion: at rest.

const SUB = "Hi! I'm Jawad Jalal. I'm 15 and in London, designing and building things.";
export const RING = ADS.filter((a) => a.w * 5 === a.h * 4).slice(0, 24);

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
      <Wordmark label={SITE.headline} />
      <div className="hero-ring">
        <div className="hall" aria-hidden="true">
          <Art k="hero" priority className="hall-art" />
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
