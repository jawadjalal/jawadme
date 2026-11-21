import type { Metadata } from "next";
import Link from "next/link";
import { AdGallery } from "@/components/ds/AdGallery";
import { Footer } from "@/components/ds/Footer";
import { Hero, RING } from "@/components/ds/Hero";
import { Media } from "@/components/ds/Media";
import { Sequence } from "@/components/ds/Sequence";
import { TLink } from "@/components/ds/TLink";
import { Timeline } from "@/components/ds/Timeline";
import { TitleTab } from "@/components/ds/TitleTab";
import { ADS } from "@/content/ads";
import { SITE } from "@/content/site";
import { SELECTED, projectBySlug } from "@/content/work";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const FR = projectBySlug("derelict-depths")!;
const IN_RING = new Set(RING.map((a) => a.id));
const GALLERY = ADS.filter((a) => !IN_RING.has(a.id)).slice(0, 12);

export default function Home() {
  return (
    <main>
      <Hero />
      <Timeline />

      <section className="ads-home" data-room="hall" aria-labelledby="ads-h">
        <TitleTab id="ads-h" tag={ADS.length + " ads"} side={<Link href="/ads">All ads ↗</Link>}>
          Ads
        </TitleTab>
        <AdGallery ads={GALLERY} />
      </section>

      <section className="idx" aria-labelledby="idx-h">
        <TitleTab id="idx-h" tag="Brands, sites and products" side={<Link href="/work">All work ↗</Link>}>
          Selected work
        </TitleTab>
        {SELECTED.map((p, i) => {
          const tall = p.cover.h > p.cover.w;
          return (
            <TLink key={p.slug} href={"/work/" + p.slug} vt={"cover-" + p.slug} className={"g16 idx-row" + (i % 2 ? " flip" : "") + (tall ? " tall" : "")} data-cursor="view">
              <span className="idx-media">
                <Media m={p.cover} ratio={tall ? "4 / 5" : "16 / 10"} sizes={tall ? "(min-width: 768px) 36vw, 100vw" : "(min-width: 768px) 62vw, 100vw"} />
              </span>
              <span className="idx-text">
                <span className="idx-name">{p.name}</span>
                <span className="idx-line">{p.lines[0]}</span>
                <span className="lbl dim">
                  {p.disciplines.slice(0, 2).join(", ")}, {p.year}
                </span>
              </span>
            </TLink>
          );
        })}
      </section>

      <section className="room" data-room="ink" aria-labelledby="room-h">
        <TitleTab id="room-h" tag="A Roblox game I design and build" side={<Link href="/work/derelict-depths">Fracture ↗</Link>}>
          3D &amp; Roblox
        </TitleTab>
        <div className="wrap room-one">
          <Sequence frames={[FR.cover, ...FR.blocks.flatMap((b) => (Array.isArray(b.media) ? b.media : [b.media]))]} label="Fracture key art · scroll to step through" />
        </div>
      </section>

      <section className="about g16" aria-label="About">
        <div className="about-pic">
          <Media m={SITE.portrait} ratio="1 / 1" sizes="(min-width: 768px) 25vw, 60vw" />
        </div>
        <p className="t-line about-line" data-lines="">
          {SITE.about}
        </p>
      </section>

      <Footer src="home-footer" />
    </main>
  );
}
