import type { Metadata } from "next";
import Link from "next/link";
import "./landing.css";
import Landing from "./Landing";

// A redesign of okara.ai's marketing page, sitting next to the dashboard
// teardown at /okara. Same reason to stay out of the index: it reworks another
// company's page, and it is meant for one reader at a time.
export const metadata: Metadata = {
  title: "Okara landing page, redesigned",
  description: "A rebuilt marketing page for Okara, the AI CMO.",
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    title: "Okara landing page, redesigned",
    description: "A rebuilt marketing page for Okara, the AI CMO.",
    url: "/okara/landing",
    siteName: "jawad jalal",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Okara landing page, redesigned",
    description: "A rebuilt marketing page for Okara, the AI CMO.",
  },
};

export default function Page() {
  return (
    <>
      {/* The design is a 1440px artboard. On a phone it scales to fit, which
          makes the type small, so say so rather than let it look broken. */}
      <p className="okara-narrow-note">A 1440px design, scaled to fit. Pinch to zoom, or open it on a laptop.</p>
      <Landing />
      <p className="okara-backlink">
        <Link href="/okara">Back to the dashboard changes</Link>
      </p>
    </>
  );
}
