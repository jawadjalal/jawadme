import localFont from "next/font/local";

// Two files, both SIL OFL 1.1 (licence in src/fonts). Geist for the body and the UI, the variable file subset to Latin,
// so every weight the site sets comes from one request. Mastermind Display for the headings: Geist lettered by
// src/components/ds/display/letter.py, the face the name on home is drawn in, one static weight that serves 600 to 900.

export const geist = localFont({
  src: [{ path: "../fonts/Geist-var.woff2", weight: "100 900", style: "normal" }],
  variable: "--f-geist",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const display = localFont({
  src: [{ path: "../fonts/Mastermind-Display.woff2", weight: "600 900", style: "normal" }],
  variable: "--f-display",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const fontVars = geist.variable + " " + display.variable;
