import type { Metadata } from "next";
import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { Footer } from "@/components/ds/Footer";
import { HadesDiagrams } from "@/components/ds/HadesDiagrams";
import { Hero } from "@/components/ds/Hero";
import { OrbitMarquee } from "@/components/ds/OrbitMarquee";
import { Timeline } from "@/components/ds/Timeline";
import { WorkShowcase, type ShowcaseItem } from "@/components/ds/WorkShowcase";
import { LoaderB } from "@/components/loader/LoaderB";
import { ADS } from "@/content/ads";
import { projectBySlug } from "@/content/work";
import { COSMOS, SITES } from "@/lib/design";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Curate 18 diverse standout ads for the Outpace-style curved 3D rotating marquee
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

const SHOWCASE: ShowcaseItem[] = [
  {
    id: ignaru.slug,
    href: `/work/${ignaru.slug}`,
    title: "IGNARU",
    subtitle: "Design tool: circle what's wrong on canvas, your coding agent fixes it in your files.",
    category: "brand-web",
    disciplines: "PRODUCT · BRAND · WEB · ENGINEERING",
    metric: "LIVE PRODUCT",
    year: "2026",
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
    title: "IGNURA STUDIO SEO",
    subtitle: "AI-native SEO & GEO launch site with custom 3D pipe machinery.",
    category: "brand-web",
    disciplines: "BRAND · WEBSITE · 3D",
    metric: "SIX-FIGURE ARR",
    year: "2026",
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
    title: "CORESRENT",
    subtitle: "Fund real GPUs in verified data centres with a live WebGL hero.",
    category: "brand-web",
    disciplines: "WEBSITE · WEBGL · FRONTEND",
    year: "2026",
    src: coresrent.cover.src,
    w: coresrent.cover.w,
    h: coresrent.cover.h,
    alt: coresrent.cover.alt,
    span: "half",
  },
  {
    id: fracture.slug,
    href: `/work/${fracture.slug}`,
    title: "FRACTURE",
    subtitle: "Roblox mining game I design & build — 68 ores, six floors, one Mole King.",
    category: "3d-roblox",
    disciplines: "GAME DESIGN · 3D · UI · ENGINEERING",
    metric: "IN PRODUCTION",
    year: "2026",
    src: fracture.cover.src,
    w: fracture.cover.w,
    h: fracture.cover.h,
    alt: fracture.cover.alt,
    span: "full",
  },
  {
    id: palantir.slug,
    href: `/work/${palantir.slug}`,
    title: "PALANTIR CAMPAIGN",
    subtitle: "The mark formed by a carrier deck crew and a ship's wake at sea.",
    category: "ads",
    disciplines: "AD CAMPAIGN · ART DIRECTION",
    metric: "SPEC CONCEPT",
    year: "2026",
    src: palantir.cover.src,
    w: palantir.cover.w,
    h: palantir.cover.h,
    alt: palantir.cover.alt,
    span: "third",
  },
  {
    id: whop.slug,
    href: `/work/${whop.slug}`,
    title: "WHOP CAMPAIGN",
    subtitle: "The new economy, painted, printed, and flown across outdoor formats.",
    category: "ads",
    disciplines: "AD CAMPAIGN · ART DIRECTION",
    metric: "SPEC CONCEPT",
    year: "2026",
    src: whop.cover.src,
    w: whop.cover.w,
    h: whop.cover.h,
    alt: whop.cover.alt,
    span: "third",
  },
  {
    id: outpace.slug,
    href: `/work/${outpace.slug}`,
    title: "OUTPACE STUDIOS",
    subtitle: "Their signature orange reimagined as a running track across every frame.",
    category: "ads",
    disciplines: "AD CAMPAIGN · ART DIRECTION",
    metric: "SPEC CONCEPT",
    year: "2026",
    src: outpace.cover.src,
    w: outpace.cover.w,
    h: outpace.cover.h,
    alt: outpace.cover.alt,
    span: "third",
  },
  {
    id: ignura.slug,
    href: `/work/${ignura.slug}`,
    title: "IGNURA STUDIO",
    subtitle: "My ad & brand studio's flagship site — ads and brands people stop for.",
    category: "brand-web",
    disciplines: "BRAND · WEBSITE",
    metric: "FOUNDER",
    year: "2026",
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
          title: "MENUFIT",
          subtitle: "Product design for the healthy dining app at 7-figure MRR.",
          category: "brand-web" as const,
          disciplines: "PRODUCT DESIGN · WEB",
          metric: "1.5M USERS",
          year: "2026",
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
          title: "COSMOS MODELS · 3D",
          subtitle: "3D weapons, creatures & worlds for Blade Ball and Fish It.",
          category: "3d-roblox" as const,
          disciplines: "3D ART · MODELING · ROBLOX",
          metric: "11B+ VISITS",
          year: "2025",
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
      <Hero />

      {/* Outpace Studios–inspired curved 3D perspective rotated marquee */}
      <section className="om-sec" id="marquee" aria-labelledby="om-heading">
        <div className="sec-head">
          <div className="sec-head-l">
            <span className="sec-idx">[01] // AD CONCEPTS &amp; ART DIRECTION</span>
            <h2 id="om-heading" className="sec-title">
              {ADS.length} ADS. DRAG TO SPIN.
            </h2>
          </div>
          <div className="sec-head-r">
            <span className="sec-note">INDEPENDENT SPEC CONCEPTS &amp; BRAND WORK</span>
            <Link href="/work" className="sec-all-link">
              VIEW ALL {ADS.length} ADS ↗
            </Link>
          </div>
        </div>
        <OrbitMarquee ads={MARQUEE_ADS} />
        <p className="om-disclose">
          INDEPENDENT WORK. NOT COMMISSIONED BY OR AFFILIATED WITH THE BRANDS SHOWN. CLICK ANY CARD TO INSPECT FULL RESOLUTION.
        </p>
      </section>

      {/* Brass Hands–inspired filterable visual work archive */}
      <WorkShowcase items={SHOWCASE} totalAds={ADS.length} />

      {/* Mid-page high-conversion call booking strip */}
      <section className="book-strip" aria-label="Book an intro call">
        <div className="book-strip-in">
          <div className="book-strip-copy">
            <span className="sec-idx">
              <i className="nh-dot" aria-hidden="true" /> AVAILABLE NOW · 2 SLOTS OPEN THIS MONTH
            </span>
            <h2 className="book-strip-h">
              NEED BRAND, ADS, OR A SITE THAT <span className="nh-gold">ACTUALLY CONVERTS?</span>
            </h2>
            <p className="book-strip-p">
              15-minute video call directly with me. No account managers, no fluff — we scope your project and ship fast.
            </p>
          </div>
          <div className="book-strip-cta">
            <BookLink src="home-mid-strip" className="bh-cta bh-cta-lg">
              <span className="bh-cta-in">BOOK A 15-MIN CALL ↗</span>
            </BookLink>
            <span className="book-strip-note">INSTANT CAL.COM BOOKING · LONDON GMT</span>
          </div>
        </div>
      </section>

      {/* Framed Hades-style isometric architectural diagrams */}
      <HadesDiagrams />

      {/* Brass Hands–style Experience Field Record */}
      <Timeline />

      {/* Clean Architectural Wayfinder Footer */}
      <Footer src="home-footer" />
    </main>
  );
}
