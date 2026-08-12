// Jawad Jalal — personal site.
//
// The front door is a single column: portrait, name, and a handful of
// paragraphs. No scene, no windows, no desktop metaphor — jawadOS still runs at
// /design, which is the studio pitch, but the homepage is now just the person.
//
// The words are server-rendered in full. The typing animation replays them on
// the client afterwards; it is not what puts them on the page. See HomeClient.

import type { Metadata } from "next";
import { SOCIALS } from "@/lib/content";
import { ARCHIVE, IDENTITY, PROJECTS, SKILLS, SUMMARY } from "@/lib/profile";
import HomeClient from "./home/HomeClient";
import "./home/home.css";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    // Agents that would rather read prose than parse a React tree. Advertised
    // here so it is discoverable from the document itself, not just guessable.
    types: { "text/markdown": "/index.md" },
  },
};

// Structured data. The page says these things in prose; this says the same
// things in a form a search or answer engine can lift without guessing — which
// of the words is his name, where "london" refers to, which accounts are his.
//
// Everything here reads from src/lib/profile.ts, so it cannot drift away from
// what the page actually says.
function structuredData() {
  const url = IDENTITY.site;
  const person = {
    "@type": "Person",
    "@id": `${url}/#person`,
    name: IDENTITY.properName,
    alternateName: IDENTITY.name,
    url,
    image: `${url}${IDENTITY.avatar}`,
    email: `mailto:${IDENTITY.email}`,
    jobTitle: "Designer & founder",
    description: SUMMARY,
    knowsAbout: SKILLS,
    address: {
      "@type": "PostalAddress",
      addressLocality: IDENTITY.locality,
      addressRegion: IDENTITY.region,
      addressCountry: IDENTITY.country,
    },
    // Every account that is verifiably his. This is what lets an engine merge
    // the site, the profiles and the person into one entity.
    sameAs: SOCIALS.map((s) => s.href),
    owns: [...PROJECTS, ...ARCHIVE].map((p) => ({
      "@type": "SoftwareApplication",
      name: p.name,
      url: p.href,
      description: p.blurb,
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: IDENTITY.name,
        publisher: { "@id": `${url}/#person` },
        inLanguage: "en-GB",
      },
      {
        "@type": "ProfilePage",
        "@id": `${url}/#profile`,
        url,
        name: `${IDENTITY.name} — ${IDENTITY.role}`,
        about: { "@id": `${url}/#person` },
        isPartOf: { "@id": `${url}/#website` },
        // The same page, as prose, for anything that would rather read that.
        significantLink: `${url}/index.md`,
      },
    ],
  };
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
      />
      {/* Runs before the column is painted, so the finished page in the HTML is
          hidden from anyone whose browser is about to animate it. Inline and
          synchronous on purpose: a deferred script would paint first. */}
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.dataset.js="1"` }} />
      <HomeClient />
    </>
  );
}
