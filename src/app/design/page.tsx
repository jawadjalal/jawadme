// /design — the studio pitch.
//
// Was jawadOS: a scroll-driven CRT on a desk, five windows, a fake cursor, and
// roughly four thousand lines of scene markup generated from HTML templates.
// The offer, the prices, the work and the brief form all survived the move; the
// desk did not. It now reads as the same person as the homepage, because it is.

import type { Metadata } from "next";
import { IDENTITY } from "@/lib/profile";
import { STUDIO } from "@/lib/studio";
import Studio from "./Studio";
import "../home/home.css";
import "./design.css";

const DESCRIPTION =
  "design, build and ship — brand identity, ui/ux and full site builds, by one " +
  "person, start to live. prices are on the page and the brief takes a minute.";

export const metadata: Metadata = {
  title: `${STUDIO.title} — ${IDENTITY.name}`,
  description: DESCRIPTION,
  alternates: { canonical: "/design" },
  openGraph: {
    title: `${STUDIO.title} — ${IDENTITY.name}`,
    description: DESCRIPTION,
    url: "/design",
    siteName: IDENTITY.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${STUDIO.title} — ${IDENTITY.name}`,
    description: DESCRIPTION,
  },
};

// Priced services, stated in a form a search engine can read as an offer rather
// than as decoration.
function structuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: STUDIO.title,
    provider: { "@id": `${IDENTITY.site}/#person` },
    areaServed: "Worldwide",
    description: DESCRIPTION,
    url: `${IDENTITY.site}/design`,
  };
}

export default function DesignPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
      />
      <div className="hm">
        <Studio />
      </div>
    </>
  );
}
