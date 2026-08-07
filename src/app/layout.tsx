import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // The canonical host. This repo deploys to the `jawadme` Vercel project, whose
  // production aliases are jawadjalal.com, www.jawadjalal.com and
  // jawadme.vercel.app — the custom domain is the one to advertise, so share
  // cards and canonical URLs resolve there rather than to the vercel.app alias.
  metadataBase: new URL("https://jawadjalal.com"),
  title: "Jawad Jalal — designer, running jawadOS",
  description:
    "Jawad Jalal is a designer and founder. This site is jawadOS: a desktop you scroll through — the work, the CV, the prices, and a brief you can send in one sitting.",
  openGraph: {
    title: "Jawad Jalal — designer, running jawadOS",
    description:
      "Design, build and ship. A desktop you scroll through — the work, the CV, the prices, and a brief you can send in one sitting.",
    url: "/",
    siteName: "jawadOS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jawad Jalal — designer, running jawadOS",
    description:
      "Design, build and ship. A desktop you scroll through — the work, the CV, the prices, and a brief you can send in one sitting.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
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
