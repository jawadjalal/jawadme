import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { Pixelify_Sans } from "next/font/google";
import { IDENTITY, SUMMARY, SKILLS } from "@/lib/profile";
import "./globals.css";

// The wordmark only. A pixel face is a signature, not a text face, so it is
// scoped to one element rather than exposed as a body option.
const pixel = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(IDENTITY.site),
  title: `${IDENTITY.properName} · ${IDENTITY.role}`,
  description: SUMMARY,
  openGraph: {
    title: `${IDENTITY.properName} · ${IDENTITY.role}`,
    description: SUMMARY,
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
  address: {
    "@type": "PostalAddress",
    addressLocality: IDENTITY.locality,
    addressRegion: IDENTITY.region,
    addressCountry: IDENTITY.country,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistMono.variable} ${pixel.variable}`}>
      <head>
        {/* Satoshi, the reference site's face. Preconnected so the first
            paragraph is not drawn twice. */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        {/* Two requests, not one. Fontshare's API silently drops the second
            family when both are asked for in a single call: the combined URL
            returned Satoshi's four faces and no Chillax at all, so every
            heading fell back to Satoshi and the display face was never once
            on the page. Asked for separately, both arrive. */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=chillax@400,500,600,700&display=swap"
        />
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
