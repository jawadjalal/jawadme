import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/ds/Footer";
import { Art } from "@/components/ds/Art";
import { AdWall, Hero } from "@/components/ds/Hero";
import { Media } from "@/components/ds/Media";
import { RailPin } from "@/components/ds/RailPin";
import { Sequence } from "@/components/ds/Sequence";
import { TLink } from "@/components/ds/TLink";
import { TitleTab } from "@/components/ds/TitleTab";
import { RAIL, fitsFrame } from "@/content/ads";
import { EXPERIENCE, FIGURES, SITE } from "@/content/site";
import { SELECTED, laneLabel, projectBySlug } from "@/content/work";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const DD = projectBySlug("derelict-depths")!;
const SIDE = [
  { src: "/derelictdepths/img/look-king-front-1280.jpg", w: 1280, h: 873, alt: "The Mole King, modelled for Fracture", name: "Mole King", note: "model" },
  { src: "/derelictdepths/img/smeltery-1280.jpg", w: 1280, h: 720, alt: "The smeltery in Fracture", name: "Smeltery", note: "level" },
  { src: "/derelictdepths/img/ore-room-1280.jpg", w: 1280, h: 720, alt: "An ore room in Fracture", name: "Ore room", note: "level" },
];

export default function Home() {
  const big = SELECTED.slice(0, 2);
  const rows = SELECTED.slice(2);
  return (
    <main>
      <Hero />
      <AdWall />

      <section className="xp" aria-labelledby="xp-h">
        <TitleTab id="xp-h" tag="Where I've worked" side={<a href={SITE.cv}>CV ↗</a>}>
          Experience
        </TitleTab>
        <ol className="xp-rows">
          {EXPERIENCE.map((x, i) => (
            <li key={x.co} data-in="" style={{ "--i": i } as React.CSSProperties}>
              <TLink href={x.href} vt={"cover-" + x.href.split("/").pop()} className="g16 xp-row" data-cursor="view">
                <span className="xp-co">{x.co}</span>
                <span className="xp-role">{x.role}</span>
                <span className="xp-yr">{x.years}</span>
                <span className="xp-go" aria-hidden="true">
                  →
                </span>
              </TLink>
            </li>
          ))}
        </ol>
        <div className="g16 figs">
          {FIGURES.map((f, i) => (
            <div key={f.l} className="fig" data-in="" style={{ "--i": i } as React.CSSProperties}>
              <p className="fig-n">{f.n}</p>
              <p className="fig-l">{f.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sel" aria-labelledby="sel-h">
        <TitleTab id="sel-h" tag={SELECTED.length + " projects"} side={<Link href="/work">All work ↗</Link>}>
          Selected work
        </TitleTab>
        <div className="g16 sel-big">
          {big.map((p) => (
            <TLink key={p.slug} href={"/work/" + p.slug} vt={"cover-" + p.slug} className="card" data-cursor="view">
              <Media m={p.cover} ratio="4 / 5" sizes="(min-width: 768px) 50vw, 100vw" />
              <span className="card-meta">
                <span className="d-name">{p.name}</span>
                <span className="lbl dim">{laneLabel(p.lane)}</span>
              </span>
            </TLink>
          ))}
        </div>
        <div className="sel-rows">
          {rows.map((p) => (
            <TLink key={p.slug} href={"/work/" + p.slug} vt={"cover-" + p.slug} className="g16 sel-row hair" data-cursor="view">
              <span className="c-name">
                <span className="d-name">{p.name}</span>
              </span>
              <span className="c-media">
                <Media m={p.cover} ratio="16 / 10" sizes="(min-width: 768px) 28vw, 100vw" />
              </span>
              <span className="c-disc">{p.disciplines.join(", ")}</span>
              <span className="c-year lbl">
                {p.year}
                {p.spec ? " · Spec" : ""}
              </span>
            </TLink>
          ))}
        </div>
      </section>

      <section className="rail" aria-labelledby="rail-h">
        <TitleTab id="rail-h" tag={RAIL.length + " spec ads"} side={<Link href="/ads">All ads ↗</Link>}>
          Ads
        </TitleTab>
        <RailPin>
          {RAIL.map((a, i) => (
            <Link key={a.id} href={"/w/" + a.id} className="rail-item" data-cursor="view">
              <Media m={{ src: a.src, w: a.w, h: a.h, alt: a.alt }} ratio="4 / 5" fit={fitsFrame(a) ? "cover" : "contain"} sizes="(min-width: 1024px) 28vw, 78vw" delay={(i % 4) * 60} />
              <span className="lbl rail-cap">
                <span>{a.campaign}</span>
                <span className="dim">Spec</span>
              </span>
            </Link>
          ))}
          <Link href="/ads" className="rail-end" data-cursor="view">
            <span className="d-tab">All ads ↗</span>
          </Link>
        </RailPin>
      </section>

      <Art k="break" sizes="100vw" className="art-band" />

      <section className="room" data-room="ink" aria-labelledby="room-h">
        <TitleTab id="room-h" tag="Fracture" side={<Link href="/derelictdepths">The game ↗</Link>}>
          3D &amp; Roblox
        </TitleTab>
        <div className="g16 room-grid">
          <div className="room-seq">
            <Sequence frames={[DD.cover, ...DD.blocks.flatMap((b) => ("media" in b ? (Array.isArray(b.media) ? b.media : [b.media]) : []))].filter((m) => m.w / m.h > 1.7)} label="Fracture · scroll to step through" />
            <span className="room-name">
              <span className="d-name">Fracture</span>
              <span className="lbl dim">Roblox · 2026</span>
            </span>
          </div>
          <div className="room-side">
            {SIDE.map((s) => (
              <figure key={s.name}>
                <Media m={s} ratio="4 / 3" sizes="25vw" />
                <figcaption className="lbl">
                  {s.name} <span className="dim">· {s.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="clients wrap" aria-labelledby="cl-h">
        <h2 id="cl-h" className="d-name cl-h">
          Worked with
        </h2>
        <ul className="clients-row">
          {[
            ["/logos/menufit.png", "MenuFit"],
            ["/logos/okara.png", "Okara"],
            ["/logos/bevel.png", "Bevel"],
          ].map(([src, name]) => (
            <li key={name}>
              <Image src={src} alt={name} width={56} height={56} />
              <span>{name}</span>
            </li>
          ))}
        </ul>
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
