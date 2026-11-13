import type { Metadata } from "next";
import { IDENTITY } from "@/lib/profile";
import { HOME_DESCRIPTION, HOME_TITLE, siteGraph } from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(IDENTITY.site),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: IDENTITY.site,
    siteName: IDENTITY.properName,
    type: "profile",
    // Built by scripts/og.mjs: the name and one line on black beside a
    // wall of his ads. Rebuild with `npm run og` after changing either.
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Jawad Jalal. I design ads, brands and sites for startups. Beside it, a wall of his ads." }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@jawadmakes",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/og.png"],
  },
  alternates: { canonical: IDENTITY.site },
};

// Applied before first paint. Running this in an effect instead would give
// every dark-mode reader a white flash on load, which is the one thing a
// theme toggle exists to prevent.
const THEME_SCRIPT = `
try {
  var s = localStorage.getItem('theme');
  var d = s ? s === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  if (d) document.documentElement.dataset.theme = 'dark';
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph()) }}
        />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        {/* The wobble every drawn line on the page shares: `filter: url(#hand)`. */}
        <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
          <filter id="hand">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="3" />
          </filter>
        </svg>
        {children}
      </body>
    </html>
  );
}
