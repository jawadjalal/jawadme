// Metadata and structured data for the site group, in one place. Every page passes its own title, line and path, so
// its canonical URL, its Open Graph and X tags and its JSON-LD agree; the share picture comes from the page's own
// opengraph-image file. Facts come from src/content and src/lib/profile.ts only.

import type { Metadata } from "next";
import { SITE, TIMELINE } from "@/content/site";
import { laneLabel, type Project } from "@/content/work";
import type { Piece } from "@/lib/gallery";
import { IDENTITY, SOCIALS } from "@/lib/profile";

export const URL_ = IDENTITY.site;
export const abs = (path: string) => new URL(path, URL_).toString();
export const PERSON_ID = URL_ + "/#person";
export const SITE_ID = URL_ + "/#website";

/** The sentence an answer engine should lift: who he is, in the third person, built from the subheadline and the
 *  experience list. */
export const ENTITY =
  "jawad jalal is a 15-year-old designer and founder in london who designs and builds brands, ads, websites, 3d and roblox games. " +
  "he runs ignura studio, a design studio that designs and builds websites for startups from scratch, and builds ignaru, an agent-native design tool. " +
  "he was product designer at menufit, an 8-figure startup at 7-figure mrr, and a product development intern at okara, an 8-figure ai startup.";

export function meta({ title, description, path, type = "website" }: { title: string; description: string; path: string; type?: "website" | "article" | "profile" }): Metadata {
  const full = title + " · jawad jalal";
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: full, description, url: path, siteName: IDENTITY.properName, type, locale: "en_GB" },
    twitter: { card: "summary_large_image", creator: "@jawadmakes", title: full, description },
  };
}

export const person = () => ({
  "@type": "Person",
  "@id": PERSON_ID,
  name: IDENTITY.properName,
  url: URL_,
  image: abs(SITE.portrait.src),
  email: "mailto:" + IDENTITY.email,
  jobTitle: "designer and founder",
  description: ENTITY,
  homeLocation: { "@type": "Place", name: "london, england" },
  address: { "@type": "PostalAddress", addressLocality: IDENTITY.locality, addressRegion: IDENTITY.region, addressCountry: IDENTITY.country },
  knowsAbout: ["brand design", "advertising design", "art direction", "web design", "product design", "3d art", "roblox game design", "front-end engineering"],
  worksFor: TIMELINE.filter((t) => t.now).map((t) => ({ "@type": "Organization", name: t.co, url: t.href })),
  sameAs: SOCIALS.filter((s) => s.href.startsWith("https:")).map((s) => s.href),
});

export const website = () => ({
  "@type": "WebSite",
  "@id": SITE_ID,
  url: URL_,
  name: IDENTITY.properName,
  alternateName: SITE.headline,
  description: SITE.line,
  inLanguage: "en-GB",
  publisher: { "@id": PERSON_ID },
});

export const caseWork = (p: Project) => ({
  "@type": "CreativeWork",
  "@id": abs("/work/" + p.slug) + "#work",
  name: p.name,
  headline: p.lines[0],
  description: p.lines.join(" "),
  url: abs("/work/" + p.slug),
  image: abs(p.cover.src),
  dateCreated: String(p.year),
  genre: laneLabel(p.lane),
  keywords: p.disciplines.join(", "),
  creator: { "@id": PERSON_ID },
  ...(p.link && !p.link.href.startsWith("/") ? { sameAs: p.link.href } : {}),
});

/** One picture at /w/<id>. Only pieces he made carry him as creator; the Bevel team's pieces are left out by callers. */
export const pieceWork = (p: Piece) => ({
  "@type": "VisualArtwork",
  "@id": abs("/w/" + p.id) + "#work",
  name: `${p.group}: ${p.line}`,
  description: p.alt,
  artform: p.kind,
  url: abs("/w/" + p.id),
  image: { "@type": "ImageObject", url: abs(p.src), width: p.w, height: p.h },
  creator: { "@id": PERSON_ID },
  isPartOf: { "@id": abs("/work") + "#gallery" },
});

/** One JSON-LD script. `<` is escaped so no string in the data can close the tag. */
export function JsonLd({ data }: { data: object | object[] }) {
  const graph = { "@context": "https://schema.org", "@graph": Array.isArray(data) ? data : [data] };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />;
}
