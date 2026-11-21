import localFont from "next/font/local";

// Three faces, all SIL OFL 1.1 (licences in src/fonts). Inter Display, Inter's optical display cut, for the wordmark,
// titles and names; Public Sans for statements, info bars and labels; Inter for running text.

export const display = localFont({
  src: [
    { path: "../fonts/InterDisplay-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/InterDisplay-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../fonts/InterDisplay-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--f-display",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const pub = localFont({
  src: [{ path: "../fonts/PublicSans-var.woff2", weight: "100 900", style: "normal" }],
  variable: "--f-pub",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const text = localFont({
  src: [
    { path: "../fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--f-text",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
  fallback: ["system-ui", "sans-serif"],
});

export const fontVars = [display.variable, pub.variable, text.variable].join(" ");
