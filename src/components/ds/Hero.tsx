import Image from "next/image";
import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { ADS } from "@/content/ads";
import { ROOMS, headline } from "@/lib/gallery";
import { HeroRibbon } from "./HeroRibbon";
import { LogoRow } from "./LogoRow";
import { LondonClock } from "./LondonClock";
import "@/styles/hero.css";

const count = (section: string) => ROOMS.filter((r) => r.section === section).reduce((n, r) => n + r.entries.length, 0);
const ON = ADS.find((a) => a.id === "on");
const RIBBON = [...(ON ? [ON] : []), ...ADS.filter((a) => a.id !== "on").slice(0, 17)];
const CAPTIONS = RIBBON.map((a) => a.campaign + " / " + headline(a));

const G = ({ src, w, h }: { src: string; w: number; h: number }) => (
  <Image src={src} alt="" width={w} height={h} sizes="96px" className="hx-g" aria-hidden="true" />
);

/** The whole home page: Brass Hands' ruled frame (brand, status, London clock, the call) around Outpace's statement
 *  and curved ad ribbon, with a status line that names the ad in front. */
export function Hero() {
  return (
    <section className="hx" data-hero="">
      <header className="hx-top">
        <Link href="/" className="hx-brand" aria-label="jawad jalal, home">
          <Image src="/design/jawad-die.webp" alt="" width={52} height={58} sizes="44px" priority className="hx-head" />
          <span className="hx-mark">
            <span>JAWAD</span>
            <span>JALAL</span>
          </span>
        </Link>
        <dl className="hx-tele">
          <div>
            <dt>DISCIPLINE</dt>
            <dd>ADS / BRANDS / SITES / 3D</dd>
          </div>
          <div>
            <dt>STATUS</dt>
            <dd>
              <i className="hx-live" aria-hidden="true" />
              AVAILABLE NOW
            </dd>
          </div>
          <div>
            <dt>LONDON, UK</dt>
            <dd>
              <LondonClock />
            </dd>
          </div>
        </dl>
        <BookLink src="home-hero" className="bh-cta hx-cta">
          <span className="bh-cta-in">BOOK A CALL ↗</span>
        </BookLink>
      </header>

      <div className="hx-head-row">
        <h1 className="hx-h1">
          i&apos;m <G src="/design/jawad-die.webp" w={44} h={48} /> jawad. i design and build{" "}
          <G src="/ads/new/on-480.webp" w={96} h={120} />
          <Link href="/work">
            ads
          </Link>
          <sup>{ADS.length}</sup>
          , <G src="/logos/clean/ignaru.png" w={32} h={32} /> brands,{" "}
          <G src="/work/ignaru.webp" w={140} h={88} />
          <Link href="/work">
            sites
          </Link>
          <sup>{count("web")}</sup>{" "}
          and <G src="/work/fracture/mole-king.webp" w={120} h={80} />
          <Link href="/work">
            3d
          </Link>
          <sup>{count("3d")}</sup>{" "}
          in london.
        </h1>
      </div>

      <LogoRow />

      <HeroRibbon ads={RIBBON} captions={CAPTIONS} />
    </section>
  );
}
