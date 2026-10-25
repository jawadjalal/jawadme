import type { Metadata } from "next";
import { IDENTITY, SUMMARY, SKILLS, SOCIALS } from "@/lib/profile";

const TITLE = `${IDENTITY.properName}, designer and founder of Ignura`;
const DESCRIPTION =
  "Designer and founder in London. I run Ignura (ignura.com), an agency that builds growth solutions for startups, and design at MenuFit and Okara.";
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
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SUMMARY }],
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
  jobTitle: IDENTITY.role,
  description: SUMMARY,
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
        <link rel="preload" href="/fonts/satoshi-400.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/satoshi-700.woff2" as="font" type="font/woff2" crossOrigin="" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
