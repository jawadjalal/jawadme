import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/ds/Footer";
import { Hero } from "@/components/ds/Hero";
import { BeatIcon, InlinePill } from "@/components/ds/InlineGlyph";
import { LogoMarquee } from "@/components/ds/LogoMarquee";
import { OrbitMarquee } from "@/components/ds/OrbitMarquee";
import { WorkShowcase, type ShowcaseItem } from "@/components/ds/WorkShowcase";
import { ADS } from "@/content/ads";
import { projectBySlug } from "@/content/work";
import { SITES } from "@/lib/design";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const ON_AD = ADS.find((a) => a.id === "on");
const MARQUEE_ADS = [
  ...(ON_AD ? [ON_AD] : []),
  ...ADS.filter((a) => a.id !== "on").slice(0, 17),
];

const adTile = (id: string): ShowcaseItem | null => {
  const a = ADS.find((x) => x.id === id);
  if (!a) return null;
  return {
    id: `ad-${a.id}`,
    href: `/w/${a.id}`,
    title: a.campaign,
    category: "ads",
    src: a.sm || a.src,
    w: a.w,
    h: a.h,
    alt: a.alt,
    span: "sixth",
  };
};

const ignaru = projectBySlug("ignaru")!;
const ignuraSeo = projectBySlug("ignura-seo")!;
const ignura = projectBySlug("ignura")!;
const fracture = projectBySlug("fracture")!;
const menufit = SITES.find((s) => s.id === "site-menufit");

// Band 1: 2 flagship builds (wide 2-up)
const FLAGSHIP_BAND: ShowcaseItem[] = [
  {
    id: ignaru.slug,
    href: `/work/${ignaru.slug}`,
    title: "Ignaru",
    category: "brand-web",
    src: ignaru.cover.src,
    w: ignaru.cover.w,
    h: ignaru.cover.h,
    alt: ignaru.cover.alt,
    loop: ignaru.cover.loop,
    span: "half",
  },
  {
    id: fracture.slug,
    href: `/work/${fracture.slug}`,
    title: "Fracture",
    category: "3d-roblox",
    src: fracture.cover.src,
    w: fracture.cover.w,
    h: fracture.cover.h,
    alt: fracture.cover.alt,
    span: "half",
  },
];

// Band 2: 6 selected ads in one crisp 6-across strip
const ADS_BAND: ShowcaseItem[] = [
  "on",
  "cisco",
  "subaru",
  "asana",
  "tesla",
  "spacex",
]
  .map(adTile)
  .filter((x): x is ShowcaseItem => Boolean(x));

// Band 3: 3 studio & product builds (3-up)
const STUDIO_BAND: ShowcaseItem[] = [
  {
    id: ignuraSeo.slug,
    href: `/work/${ignuraSeo.slug}`,
    title: "Ignura SEO",
    category: "brand-web",
    src: ignuraSeo.cover.src,
    w: ignuraSeo.cover.w,
    h: ignuraSeo.cover.h,
    alt: ignuraSeo.cover.alt,
    loop: ignuraSeo.cover.loop,
    span: "third",
  },
  {
    id: ignura.slug,
    href: `/work/${ignura.slug}`,
    title: "Ignura Studio",
    category: "brand-web",
    src: ignura.cover.src,
    w: ignura.cover.w,
    h: ignura.cover.h,
    alt: ignura.cover.alt,
    span: "third",
  },
  ...(menufit
    ? [
        {
          id: menufit.id,
          href: `/w/${menufit.id}`,
          title: "MenuFit",
          category: "brand-web" as const,
          src: menufit.src,
          w: menufit.w,
          h: menufit.h,
          alt: menufit.alt,
          span: "third" as const,
        },
      ]
    : []),
];

export default function Home() {
  return (
    <main className="neo-home">
      <Hero />

      <section className="om-sec" id="marquee" aria-label="Selected work">
        <OrbitMarquee ads={MARQUEE_ADS} />
      </section>

      <LogoMarquee />

      {/* Clean single-column Joyco-style editorial statement */}
      <section className="joy-stmt" aria-label="Statement">
        <div className="joy-stmt-single">
          <h2 className="joy-stmt-h">
            Sharp <InlinePill kind="brands" /> brands,{" "}
            <InlinePill kind="campaign" /> scroll-stopping ads, and high-craft{" "}
            <InlinePill kind="sites" /> sites built from scratch.
          </h2>
        </div>
      </section>

      {/* Band 1: 2 Flagship Builds */}
      <WorkShowcase id="work" items={FLAGSHIP_BAND} />

      {/* Short editorial beat breaking up the work */}
      <div className="ed-beat">
        <p className="ed-beat-text">
          <BeatIcon kind="frame" />
          <span>Campaign art &amp; static ads built for fast-moving teams.</span>
        </p>
        <Link href="/work" className="ed-beat-link">
          ALL WORK ↗
        </Link>
      </div>

      {/* Band 2: 6 Selected Ads (1 tight row) */}
      <WorkShowcase items={ADS_BAND} />

      {/* Short editorial beat about Jawad */}
      <div className="ed-beat">
        <p className="ed-beat-text">
          <BeatIcon kind="layers" />
          <span>Product design for MenuFit (1.5M users) &amp; Okara (14M launch views), plus</span>
          <BeatIcon kind="cube" />
          <span>3D art for Roblox worlds with 11B+ visits.</span>
        </p>
      </div>

      {/* Band 3: 3 Studio & Product Builds */}
      <WorkShowcase items={STUDIO_BAND} />

      {/* Heavily refined Brass Hands × Signpost footer */}
      <Footer src="home-footer" />
    </main>
  );
}
