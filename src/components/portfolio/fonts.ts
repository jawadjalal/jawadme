import { Archivo, Instrument_Sans } from "next/font/google";

// The portfolio pages' type: Instrument Sans for everything (his app's face, OFL), and Archivo's black italic at extra
// condensed width for the print look of the story lines (shown with ?lines=print), and its upright cut, condensed, for
// the manga lettering of the home column (the headline, the panel tags and the speech balloon).
export const sans = Instrument_Sans({ subsets: ["latin"], display: "swap", variable: "--pf-sans" });
export const print = Archivo({ subsets: ["latin"], style: ["normal", "italic"], axes: ["wdth"], display: "swap", variable: "--pf-print" });
