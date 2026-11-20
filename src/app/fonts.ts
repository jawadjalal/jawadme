import localFont from "next/font/local";

// Two faces, both SIL OFL 1.1 (licences in src/fonts). Cinzel, Roman inscriptional capitals, for names and titles
// (the temple-stone voice of Hades' halls); Fira Sans, Fracture's own text face, for everything else, with SemiBold
// caps where Hades uses small caps.

export const display = localFont({
  src: [{ path: "../fonts/cinzel-vf.woff2", weight: "400 900", style: "normal" }],
  variable: "--f-display",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "serif"],
});

export const text = localFont({
  src: [
    { path: "../fonts/fira-sans-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/fira-sans-400i.woff2", weight: "400", style: "italic" },
    { path: "../fonts/fira-sans-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/fira-sans-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/fira-sans-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--f-text",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["system-ui", "sans-serif"],
});

export const fontVars = `${display.variable} ${text.variable}`;
