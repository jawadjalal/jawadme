import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // The canonical host. This repo deploys to the `jawadme` Vercel project, whose
  // production aliases are jawadjalal.com, www.jawadjalal.com and
  // jawadme.vercel.app — the custom domain is the one to advertise, so share
  // cards and canonical URLs resolve there rather than to the vercel.app alias.
  metadataBase: new URL("https://jawadjalal.com"),
  title: "jawad jalal",
  description: "designer & founder",
  openGraph: {
    title: "jawad jalal",
    description: "designer and founder in london, mostly working on his own stuff.",
    url: "/",
    siteName: "jawad jalal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "jawad jalal",
    description: "designer and founder in london, mostly working on his own stuff.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Inter, from the source. The variable build is what the homepage
            sets its type in; the Google-hosted families below are still what
            /design and /writing use. */}
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Inter:wght@400;450;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=chillax@400,500,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
