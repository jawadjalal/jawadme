import type { Metadata } from "next";
import { Footer } from "@/components/ds/Footer";
import { Hero } from "@/components/ds/Hero";
import { LogoMarquee } from "@/components/ds/LogoMarquee";
import { OrbitMarquee } from "@/components/ds/OrbitMarquee";
import { WorkShowcase, type ShowcaseItem } from "@/components/ds/WorkShowcase";
import { ADS } from "@/content/ads";
import { projectBySlug } from "@/content/work";
import { SITES } from "@/lib/design";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Lead the hero carousel with the ON Running ad + top concepts
const ON_AD = ADS.find((a) => a.id === "on");
const MARQUEE_ADS = [
  ...(ON_AD ? [ON_AD] : []),
  ...ADS.filter((a) => a.id !== "on").slice(0, 17),
];

const adCard = (a: (typeof ADS)[number]): ShowcaseItem => ({
  id: `ad-${a.id}`,
  href: `/w/${a.id}`,
  title: a.campaign,
  category: "ads",
  src: a.sm || a.src,
  w: a.w,
  h: a.h,
  alt: a.alt,
  span: "third",
});

const ignaru = projectBySlug("ignaru")!;
const ignuraSeo = projectBySlug("ignura-seo")!;
const ignura = projectBySlug("ignura")!;
const fracture = projectBySlug("fracture")!;
const menufit = SITES.find((s) => s.id === "site-menufit");

// Pure Brass Hands work stream: ad groups in multiples of 12 (divisible by 4, 3, and 2 = ZERO missing slots at any width).
const ALL_WORK: ShowcaseItem[] = [
  ...ADS.slice(0, 12).map(adCard),
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
    span: "full",
  },
  ...ADS.slice(12, 24).map(adCard),
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
    span: "half",
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
    span: "half",
  },
  ...ADS.slice(24, 36).map(adCard),
  {
    id: fracture.slug,
    href: `/work/${fracture.slug}`,
    title: "Fracture",
    category: "3d-roblox",
    src: fracture.cover.src,
    w: fracture.cover.w,
    h: fracture.cover.h,
    alt: fracture.cover.alt,
    span: "full",
  },
  ...ADS.slice(36, 48).map(adCard),
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
          span: "full" as const,
        },
      ]
    : []),
  ...ADS.slice(48, 60).map(adCard),
];

export default function Home() {
  return (
    <main className="neo-home">
      <Hero />

      <section className="om-sec" id="marquee" aria-label="Selected work">
        <OrbitMarquee ads={MARQUEE_ADS} />
      </section>

      <LogoMarquee />

      <WorkShowcase items={ALL_WORK} />

      <Footer src="home-footer" />
    </main>
  );
}
