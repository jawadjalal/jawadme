import type { Metadata } from "next";
import { IDENTITY, SKILLS, SOCIALS } from "@/lib/profile";

// The same who and what as the home page: a design engineer who makes Ignaru, and designs sites and ads for startups.
const TITLE = `${IDENTITY.properName}, design engineer building Ignaru`;
const DESCRIPTION =
  "Design engineer in London. I make Ignaru (ignaru.com), an agent-native design tool: it opens your repo, and your coding agent fixes what you circle. I design sites and ads for startups. Before that, product development intern at Okara and new screens for MenuFit as a client.";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(IDENTITY.site),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: IDENTITY.site,
    siteName: IDENTITY.properName,
    type: "profile",
    // Built by scripts/og.mjs from the site's own screenshots, so the card
    // shows the work rather than describing it. Rebuild with `npm run og`
    // after changing which projects lead.
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Jawad Jalal, design engineer building Ignaru, with felt pieces from his site" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@jawadmakes",
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

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: IDENTITY.properName,
  url: IDENTITY.site,
  email: `mailto:${IDENTITY.email}`,
  jobTitle: "Design engineer",
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
      </body>
    </html>
  );
}
