import localFont from "next/font/local";

// One face for the body and the UI, SIL OFL 1.1 (licence in src/fonts): Geist, the variable file subset to Latin, so
// every weight the site sets comes from one 26 KB request. The display slot (--display in ds.css) points at it too
// until the display face is chosen.

export const geist = localFont({
  src: [{ path: "../fonts/Geist-var.woff2", weight: "100 900", style: "normal" }],
  variable: "--f-geist",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const fontVars = geist.variable;
