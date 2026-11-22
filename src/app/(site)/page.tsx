import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/ds/Footer";
import { Hero } from "@/components/ds/Hero";
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

const COMPACT_ADS = [
  "on",
  "cisco",
  "subaru",
  "asana",
  "tesla",
  "spacex",
  "vercel-c",
  "linear-a",
  "midjourney-a",
  "strava",
  "whoop",
  "palantir-carrier",
]
  .map(adTile)
  .filter((x): x is ShowcaseItem => Boolean(x));

// Compact, high-density work showcase: 2 flagship builds + 12-tile 6-across ad sheet + 3 studio/product builds
const COMPACT_WORK: ShowcaseItem[] = [
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
  ...COMPACT_ADS,
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

      {/* Joyco-inspired ruled editorial statement section */}
      <section className="joy-stmt" aria-label="Statement">
        <div className="joy-stmt-grid">
          <div className="joy-stmt-main">
            <h2 className="joy-stmt-h">
              Sharp brands, scroll-stopping ads, and high-craft sites built from scratch.
            </h2>
          </div>
          <div className="joy-stmt-side">
            <p className="joy-stmt-p">
              Founder of Ignura Studio. Previously product design at MenuFit (1.5M users) and Okara (14M launch views), plus 3D art for Roblox games with 11B+ visits.
            </p>
            <div className="joy-stmt-links">
              <Link href="/work" className="joy-link">
                EXPLORE ALL 110+ PIECES ↗
              </Link>
              <Link href="/about" className="joy-link joy-link-dim">
                ABOUT ME ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Compact, high-density work showcase */}
      <WorkShowcase items={COMPACT_WORK} />

      <div className="ws-archive-strip">
        <Link href="/work" className="ws-archive-link">
          <span>OPEN THE EXPLORABLE WORK WORLD</span>
          <span className="ws-archive-n">110+ PIECES ↗</span>
        </Link>
      </div>

      {/* Heavily refined Brass Hands × Signpost footer */}
      <Footer src="home-footer" />
    </main>
  );
}
