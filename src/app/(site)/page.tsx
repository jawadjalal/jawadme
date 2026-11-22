import type { Metadata } from "next";
import { Footer } from "@/components/ds/Footer";
import { Hero } from "@/components/ds/Hero";
import { LogoMarquee } from "@/components/ds/LogoMarquee";
import { OrbitMarquee } from "@/components/ds/OrbitMarquee";
import { ScrollMorph } from "@/components/ds/ScrollMorph";
import { Timeline } from "@/components/ds/Timeline";
import { WorkShowcase, type ShowcaseItem } from "@/components/ds/WorkShowcase";
import { LoaderB } from "@/components/loader/LoaderB";
import { ADS } from "@/content/ads";
import { projectBySlug } from "@/content/work";
import { COSMOS, SITES } from "@/lib/design";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const MARQUEE_IDS = [
  "cisco",
  "subaru",
  "asana",
  "tesla",
  "twilio",
  "strava",
  "on",
  "spacex",
  "whoop",
  "vercel-c",
  "midjourney-a",
  "mistral-a",
  "lovable-a",
  "linear-a",
  "cursor-a",
  "perplexity-a",
  "elevenlabs-a",
  "palantir-carrier",
];
const MARQUEE_ADS = MARQUEE_IDS.map((id) => ADS.find((a) => a.id === id)).filter(
  (a): a is (typeof ADS)[number] => Boolean(a),
);

const adCard = (id: string, title: string): ShowcaseItem | null => {
  const a = ADS.find((x) => x.id === id);
  if (!a) return null;
  return {
    id: `ad-${a.id}`,
    href: `/w/${a.id}`,
    title,
    category: "ads",
    src: a.src,
    w: a.w,
    h: a.h,
    alt: a.alt,
    span: "third",
  };
};

const ignaru = projectBySlug("ignaru")!;
const ignuraSeo = projectBySlug("ignura-seo")!;
const ignura = projectBySlug("ignura")!;
const coresrent = projectBySlug("coresrent")!;
const fracture = projectBySlug("fracture")!;
const palantir = projectBySlug("palantir")!;
const whop = projectBySlug("whop")!;
const outpace = projectBySlug("outpace")!;

const menufit = SITES.find((s) => s.id === "site-menufit");
const cosmosLead = COSMOS[0];

const TOP_WORK: ShowcaseItem[] = [
  ...[
    adCard("cisco", "Cisco"),
    adCard("subaru", "Subaru"),
    adCard("asana", "Asana"),
    adCard("tesla", "Tesla"),
    adCard("spacex", "SpaceX"),
    adCard("vercel-c", "Vercel"),
  ].filter((x): x is ShowcaseItem => Boolean(x)),
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
];

const BOTTOM_WORK: ShowcaseItem[] = [
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
  {
    id: palantir.slug,
    href: `/work/${palantir.slug}`,
    title: "Palantir",
    category: "ads",
    src: palantir.cover.src,
    w: palantir.cover.w,
    h: palantir.cover.h,
    alt: palantir.cover.alt,
    span: "third",
  },
  {
    id: whop.slug,
    href: `/work/${whop.slug}`,
    title: "Whop",
    category: "ads",
    src: whop.cover.src,
    w: whop.cover.w,
    h: whop.cover.h,
    alt: whop.cover.alt,
    span: "third",
  },
  {
    id: outpace.slug,
    href: `/work/${outpace.slug}`,
    title: "Outpace",
    category: "ads",
    src: outpace.cover.src,
    w: outpace.cover.w,
    h: outpace.cover.h,
    alt: outpace.cover.alt,
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
  ...(cosmosLead
    ? [
        {
          id: cosmosLead.id,
          href: `/w/${cosmosLead.id}`,
          title: "Cosmos Models · 3D",
          category: "3d-roblox" as const,
          src: cosmosLead.src,
          w: cosmosLead.w,
          h: cosmosLead.h,
          alt: cosmosLead.alt,
          span: "full" as const,
        },
      ]
    : []),
];

export default function Home() {
  return (
    <main className="neo-home">
      <LoaderB />

      {/* Centered bio flanked by Joyco-style 3D Hades II gilded pillars */}
      <Hero />

      {/* Outpace-style curved 3D rotating ad showcase right above the fold */}
      <section className="om-sec om-sec-tight" id="marquee" aria-label="Selected ads">
        <OrbitMarquee ads={MARQUEE_ADS} />
      </section>

      {/* Real company & project logos marquee */}
      <LogoMarquee />

      {/* Brass Hands–framed pure visual work stream (Ads first + flagship web) */}
      <WorkShowcase items={TOP_WORK} totalAds={ADS.length} />

      {/* Scroll-morphing 3D Hades II gilded artifact in the middle of the work */}
      <ScrollMorph />

      {/* Second Brass Hands visual block (3D, Roblox, campaigns & products) */}
      <WorkShowcase items={BOTTOM_WORK} totalAds={ADS.length} showBar={false} />

      {/* Clean 4-line experience */}
      <Timeline />

      {/* Minimal footer with framed Hades II signpost */}
      <Footer src="home-footer" />
    </main>
  );
}
