import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { PostHog } from "@/components/PostHog";
import { IDENTITY } from "@/lib/profile";
import { JsonLd, X_HANDLE, person, website } from "@/lib/seo";
import { ACCENT_CSS } from "@/lib/accent";
import { MOTION_CSS } from "@/lib/motion";

const TITLE = "Jawad Jalal | Ads, Brands, Sites & 3D";
const DESCRIPTION = "Designing and building ads, brands, sites, and 3D in London. Book a 15-minute call.";

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
    creator: X_HANDLE,
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
        <style dangerouslySetInnerHTML={{ __html: ACCENT_CSS + MOTION_CSS }} />
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
        <PostHog />
      </body>
    </html>
  );
}
