import localFont from "next/font/local";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";

// Neo-Industrial editorial typography inspired by Brass Hands, Joyco & Outpace:
// - Space Grotesk: crisp geometric industrial display headlines with tight tracking
// - JetBrains Mono: technical uppercase telemetry, specs, navigation & bracketed indices
// - Geist: ultra-clean variable sans for body copy and long-form UI

export const geist = localFont({
  src: [{ path: "../fonts/Geist-var.woff2", weight: "100 900", style: "normal" }],
  variable: "--f-geist",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--f-display",
  display: "swap",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--f-mono",
  display: "swap",
});

export const fontVars = `${geist.variable} ${display.variable} ${mono.variable}`;
