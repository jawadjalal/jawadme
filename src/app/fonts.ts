import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export const display = localFont({
  src: [
    { path: "../fonts/CabinetGrotesk-800.woff2", weight: "800", style: "normal" },
    { path: "../fonts/CabinetGrotesk-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--f-display",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Arial", "sans-serif"],
});

export const fontVars = `${display.variable} ${GeistSans.variable} ${GeistMono.variable}`;
