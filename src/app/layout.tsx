import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { IDENTITY, SKILLS, SOCIALS } from "@/lib/profile";

const TITLE = "Jawad Jalal, Design Mastermind: brand, ad, 3D and Roblox design";
const DESCRIPTION = "Brands, ads, 3D and Roblox games. Designed by Jawad Jalal in London. Book a 15 minute call.";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(IDENTITY.site),
  title: { default: TITLE, template: "%s · Jawad Jalal" },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: IDENTITY.site,
    siteName: IDENTITY.properName,
    type: "profile",
    // Built by scripts/og-cards.mjs (npm run og:cards): the home page's own headline on white.
    images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "Too young to drive, but I'm a design mastermind. Jawad Jalal: brand design, ads, design engineering." }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@jawadmakes",
    images: ["/og/home.png"],
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

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: IDENTITY.properName,
  url: IDENTITY.site,
  email: `mailto:${IDENTITY.email}`,
  jobTitle: "Designer",
  description: DESCRIPTION,
  knowsAbout: SKILLS,
  worksFor: { "@type": "Organization", name: "Ignura", url: "https://ignura.com" },
  sameAs: SOCIALS.filter((s) => /^https:/.test(s.href)).map((s) => s.href),
  address: {
    "@type": "PostalAddress",
    addressLocality: IDENTITY.locality,
    addressRegion: IDENTITY.region,
    addressCountry: IDENTITY.country,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
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
        <Analytics />
      </body>
    </html>
  );
}
