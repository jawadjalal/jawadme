import { BookLink } from "@/components/BookLink";
import { BookCallB } from "@/components/cta/BookCallB";
import { AdRing } from "@/components/ds/AdRing";
import { Statement } from "@/components/ds/Statement";
import { Wordmark } from "@/components/ds/Wordmark";
import { Sound } from "@/components/world/Sound";
import { World } from "@/components/world/World";
import { ADS } from "@/content/ads";
import { SITE } from "@/content/site";

// The home hero is a world (World): an isometric underworld the page pans across chamber by chamber. The gate court,
// with the name in his own lettering (Wordmark) at the top, the line and the call under it; the hall of ads, where the ads stand
// in the scene and a real list of links (AdRing) serves keyboards, screen readers and the poster fallback; the
// theatre, whose dark orchestra holds the statement (Statement); the landing on the river, where the signpost points
// to a call. The HTML stays on top of the scene and works without it.

const SUB = "hi! i'm jawad jalal. i'm 15 and in london, designing and building things.";
const RING_ADS = ADS.filter((a) => a.w * 5 === a.h * 4).slice(0, 24);
const BY_CAMPAIGN = Object.values(Object.groupBy(RING_ADS, (a) => a.campaign)) as (typeof RING_ADS)[];
export const RING = Array.from({ length: Math.max(...BY_CAMPAIGN.map((g) => g.length)) }, (_, k) => BY_CAMPAIGN.map((g) => g[k]))
  .flat()
  .filter(Boolean);
const WORLD_ADS = RING.map(({ id, campaign, alt, src }) => ({ id, campaign, alt, src }));

export function Hero() {
  return (
    <section className="hero world" data-hero="" data-world="">
      <World ads={WORLD_ADS} />
      <div className="world-flow">
        <div className="w-gate" data-world-stop="gate">
          <div className="w-say">
            <Wordmark label={SITE.headline} />
            <p className="hero-say">
              <span className="vh">{SUB}</span>
              {SUB.split(" ").map((w, i) => (
                <span key={i} aria-hidden="true">
                  <span className="hero-sw">
                    <span style={{ animationDelay: 520 + i * 16 + "ms" }}>{w}</span>
                  </span>{" "}
                </span>
              ))}
            </p>
            <BookCallB src="home-hero" size="hero" />
          </div>
        </div>
        <section className="w-hall" data-world-stop="hall" aria-labelledby="hall-h">
          <div className="w-hall-head">
            <h2 id="hall-h" className="w-hall-h">
              the hall of ads
            </h2>
            <p className="w-hall-p">{RING.length} ads. pick one to open it.</p>
          </div>
          <AdRing ads={RING} />
        </section>
        <Statement />
        <div className="w-river" data-world-stop="river">
          <div className="w-sign">
            <BookLink src="home-world" className="w-sign-board" cursor>
              book a call <span aria-hidden="true">↗</span>
            </BookLink>
            <p className="w-sign-p">15 minutes, on a day that suits you.</p>
            <Sound />
          </div>
          <div className="bar hero-bar">
            <span>jawad jalal</span>
            <span>{SITE.available}</span>
            <span>london</span>
          </div>
        </div>
      </div>
    </section>
  );
}
