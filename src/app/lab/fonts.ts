import localFont from "next/font/local";

// Lab faces, all SIL OFL 1.1 (licences in src/fonts/lab). Inter Display is Inter's optical display cut: tighter
// spacing and finer details for 32 px and up, the closest open face to Helvetica Now Display (Outpace). Public Sans is
// the face Joyco ships for its statement and labels.

export const disp = localFont({
  src: [
    { path: "../../fonts/lab/InterDisplay-Medium.woff2", weight: "500" },
    { path: "../../fonts/lab/InterDisplay-SemiBold.woff2", weight: "600" },
    { path: "../../fonts/lab/InterDisplay-Bold.woff2", weight: "700" },
    { path: "../../fonts/lab/InterDisplay-ExtraBold.woff2", weight: "800" },
    { path: "../../fonts/lab/InterDisplay-Black.woff2", weight: "900" },
  ],
  variable: "--l-disp",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const text = localFont({
  src: [
    { path: "../../fonts/lab/Inter-Regular.woff2", weight: "400" },
    { path: "../../fonts/lab/Inter-Medium.woff2", weight: "500" },
    { path: "../../fonts/lab/Inter-SemiBold.woff2", weight: "600" },
    { path: "../../fonts/lab/Inter-Bold.woff2", weight: "700" },
  ],
  variable: "--l-text",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const pub = localFont({
  src: [{ path: "../../fonts/lab/PublicSans-var.woff2", weight: "100 900" }],
  variable: "--l-pub",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const labFonts = [disp.variable, text.variable, pub.variable].join(" ");
