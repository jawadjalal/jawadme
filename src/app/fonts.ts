import localFont from "next/font/local";

// One face, SIL OFL 1.1 (licence in src/fonts): Public Sans, the neo-grotesk Joyco ships for its statement, bars and
// labels. Hierarchy comes from size, weight and the layout, not from a second family.

export const pub = localFont({
  src: [{ path: "../fonts/PublicSans-var.woff2", weight: "100 900", style: "normal" }],
  variable: "--f-pub",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const fontVars = pub.variable;
