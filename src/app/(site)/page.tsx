import type { Metadata } from "next";
import { Footer } from "@/components/ds/Footer";
import { Hero } from "@/components/ds/Hero";
import { OrbitMarquee } from "@/components/ds/OrbitMarquee";
import { Timeline } from "@/components/ds/Timeline";
import { WorkShowcase, type ShowcaseItem } from "@/components/ds/WorkShowcase";
import { LoaderB } from "@/components/loader/LoaderB";
import { ADS } from "@/content/ads";
import { projectBySlug } from "@/content/work";
import { COSMOS, SITES } from "@/lib/design";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const MARQUEE_ADS = ADS.slice(0, 18);

const adCard = (a: (typeof ADS)[number]): ShowcaseItem => ({
  id: `ad-${a.id}`,
  href: `/w/${a.id}`,
  title: a.campaign,
  category: "ads",
  src: a.src,
  w: a.w,
  h: a.h,
  alt: a.alt,
  span: "third",
});

const ignaru = projectBySlug("ignaru")!;
const ignuraSeo = projectBySlug("ignura-seo")!;
const ignura = projectBySlug("ignura")!;
const coresrent = projectBySlug("coresrent")!;
const fracture = projectBySlug("fracture")!;
const menufit = SITES.find((s) => s.id === "site-menufit");

// Heavy on work: 50+ pieces right on the home page in crisp multiples of 4 (4-up desktop, 2-up mobile, zero orphans).
const ALL_WORK: ShowcaseItem[] = [
  ...ADS.slice(0, 8).map(adCard),
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
  ...ADS.slice(8, 16).map(adCard),
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
    id: coresrent.slug,
    href: `/work/${coresrent.slug}`,
    title: "Coresrent",
    category: "brand-web",
    src: coresrent.cover.src,
    w: coresrent.cover.w,
    h: coresrent.cover.h,
    alt: coresrent.cover.alt,
    span: "half",
  },
  ...ADS.slice(16, 24).map(adCard),
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
  ...ADS.slice(24, 32).map(adCard),
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
          span: "half" as const,
        },
      ]
    : []),
  ...ADS.slice(32, 40).map(adCard),
  ...COSMOS.slice(0, 4).map((c) => ({
    id: c.id,
    href: `/w/${c.id}`,
    title: c.group,
    category: "3d-roblox" as const,
    src: c.src,
    w: c.w,
    h: c.h,
    alt: c.alt,
    span: "third" as const,
  })),
  ...ADS.slice(40, 52).map(adCard),
];

export default function Home() {
  return (
    <main className="neo-home">
      <LoaderB />
      <Hero />

      <section className="om-sec" id="marquee" aria-label="Selected work">
        <OrbitMarquee ads={MARQUEE_ADS} />
      </section>

      <WorkShowcase items={ALL_WORK} totalAds={ADS.length} />

      <Timeline />

      <Footer src="home-footer" />
    </main>
  );
}
