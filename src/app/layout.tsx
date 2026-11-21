import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { IDENTITY } from "@/lib/profile";
import { JsonLd, person, website } from "@/lib/seo";
import "@/styles/accent-arena.css";

const TITLE = "jawad jalal, design mastermind: brand, ad, 3d and roblox design";
const DESCRIPTION = "brands, ads, 3d and roblox games. designed by jawad jalal in london. book a 15 minute call.";

export const metadata: Metadata = {
  metadataBase: new URL(IDENTITY.site),
  title: { default: TITLE, template: "%s · jawad jalal" },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: IDENTITY.site,
    siteName: IDENTITY.properName,
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@jawadmakes",
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
var acc = new URLSearchParams(location.search).get('accent');
if (acc === 'a' || acc === 'b' || acc === 'c') document.documentElement.dataset.accent = acc;
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <JsonLd data={[person(), website()]} />
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
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
