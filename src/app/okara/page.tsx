import type { Metadata } from "next";
import "./okara.css";
import Walkthrough from "./Walkthrough";

// Private pitch to one reader. Kept out of the index on purpose: it critiques
// another company's product, and neither of us wants it ranking.
//
// The openGraph block is spelled out rather than left to inherit, because this
// link's whole job is to be pasted into a chat and unfurl as something the
// reader was expecting. The card image itself comes from opengraph-image.tsx,
// which the App Router picks up by filename.
export const metadata: Metadata = {
  title: "Okara dashboard, three changes",
  description: "Three changes to the Okara AI CMO dashboard, with the evidence behind each.",
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    title: "Three changes to the Okara dashboard",
    description: "From a week on the free tier. Every number came off that account.",
    url: "/okara",
    siteName: "jawad jalal",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Three changes to the Okara dashboard",
    description: "From a week on the free tier. Every number came off that account.",
  },
};

export default function OkaraPage() {
  return <Walkthrough />;
}
