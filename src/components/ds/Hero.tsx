import Image from "next/image";
import { BookLink } from "@/components/BookLink";
import { AdRing } from "@/components/ds/AdRing";
import { Statement } from "@/components/ds/Statement";
import { Wordmark } from "@/components/ds/Wordmark";
import { Sound } from "@/components/world/Sound";
import { World } from "@/components/world/World";
import { ADS } from "@/content/ads";
import { SITE } from "@/content/site";

// The home hero is a world (World): an underworld of colonnades, braziers and a river of souls that the page walks
// through as it scrolls. Four stops: the gate, with the statement, the call and the lettered name (Wordmark); the hall,
// where the ads turn on a drum (AdRing); the head of the stair, with the statement set large (Statement); the river,
// where the ember bar closes it. The HTML stays on top of the scene and works without it.

const SUB = "Hi! I'm Jawad Jalal. I'm 15 and in London, designing and building things.";
export const RING = ADS.filter((a) => a.w * 5 === a.h * 4).slice(0, 24);

export function Hero() {
  return (
    <section className="hero world" data-hero="" data-world="">
      <World />
      <div className="world-flow">
        <div className="w-entrance" data-world-stop="entrance">
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
            <div className="hero-side">
              <BookLink src="home-hero" className="hero-who" cursor>
                <Image src="/design/jawad-die.webp" alt="" width={697} height={781} sizes="44px" priority />
                <span>Book a 15 min call ↗</span>
              </BookLink>
              <Sound />
            </div>
          </div>
          <Wordmark label={SITE.headline} />
        </div>
        <div className="hero-ring" data-world-stop="hall">
          <AdRing ads={RING} />
        </div>
        <Statement />
        <div className="w-floor" data-world-stop="floor">
          <div className="bar hero-bar">
            <span>Jawad Jalal</span>
            <span>{SITE.available}</span>
            <span>London</span>
          </div>
        </div>
      </div>
    </section>
  );
}
