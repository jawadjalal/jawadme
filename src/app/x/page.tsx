// /x — a fresh URL that lands on the homepage.
//
// It exists to get a share card re-scraped. Card caches are keyed on the URL
// that was posted, and once a scraper has seen jawadjalal.com it will keep
// serving whatever art it saw the first time. A new path is the only reliable
// way to force a new fetch.
//
// So this is deliberately not a 3xx. A redirect would hand the scraper the
// homepage, which is the cached response we are trying to get out of. Instead
// the path answers 200 with the homepage's metadata and the homepage's card
// art — the sibling opengraph-image/twitter-image re-export it — and the bounce
// to / happens in the browser, where only people are.

import type { Metadata } from "next";
import Link from "next/link";
import { IDENTITY } from "@/lib/profile";

export const metadata: Metadata = {
  alternates: { canonical: "/x" },
  // Next replaces the openGraph block wholesale rather than merging it, so the
  // layout's copy is repeated here — leave a field out and the card loses it.
  // The url is pointed at /x rather than /, on purpose: scrapers that
  // canonicalise on og:url (Facebook does) would otherwise fold this straight
  // back into the homepage's cache entry and defeat the point of the path.
  openGraph: {
    title: "jawad jalal",
    description: "designer and founder in london, mostly working on his own stuff.",
    url: "/x",
    siteName: "jawad jalal",
    type: "website",
  },
};

export default function X() {
  return (
    <>
      {/* Synchronous and inline: a deferred script would paint this page first.
          replace(), not assign(), so Back goes where the visitor came from
          rather than bouncing them through here again. */}
      <script dangerouslySetInnerHTML={{ __html: `location.replace("/")` }} />
      <noscript>
        <meta httpEquiv="refresh" content="0; url=/" />
      </noscript>
      {/* Never seen with JS on, and only seen for an instant without it. */}
      <p style={{ font: "16px/1.5 Inter, system-ui, sans-serif", padding: "2rem" }}>
        <Link href="/">{IDENTITY.name}</Link>
      </p>
    </>
  );
}
