// /work: the pieces shown large, each with one plain line on the idea, and the prices beside them. Add a piece by adding
// its entry here and its files to public/hire (<file>.webp, <file>-md.webp and <file>-sm.webp at the widths in SIZES).
// A piece goes on only once it is in a crew renders folder or Captain has passed it, and only if every photo in it is
// public domain or CC0, so its credit line can say so. Work made unasked for a real company is `spec`: its line says
// it is unofficial spec work, not commissioned by that company.
//
// The prices are the ad ladder Jawad approved on 8 Nov 2026 (memory note ad-offer-prices; the full terms are in the
// ignaru repo, Claude outputs/ads/deal-engine/OFFER.md). Logos and brand identities have no approved price yet, so the
// page sends those to a call instead of naming one.

export type Kind = "logo" | "board" | "ad";

/** a picture in one shape: the base file name in public/hire, its pixel size, and the widths it is saved at */
export type Shot = { file: string; w: number; h: number };

export type Work = {
  id: string;
  kind: Kind;
  /** whose it is: the company, or the invented brand for a study */
  brand: string;
  /** one plain line on the idea, read straight after the brand's name ("Astranis builds its satellites...") */
  idea: string;
  /** the wide picture, shown on desktop */
  wide: Shot;
  /** the tall picture, shown on phones; the wide one is used when there is none */
  tall?: Shot;
  alt: string;
  /** set for work made unasked for a real company: the page says it is unofficial spec work */
  spec?: boolean;
  /** who took the photo and its licence */
  credit?: string;
};

/** the widths each shape is saved at: [small, medium, full] */
export const SIZES = { wide: [960, 1440, 1920], tall: [540, 810, 1080] } as const;

/** In page order. Empty until Captain passes pieces Jawad has scored 6.5 or higher; the page is a 404 while it is
 *  empty, so it never goes live with nothing on it. An entry looks like this (paths in public/hire):
 *    { id: "astranis-pier70", kind: "ad", brand: "Astranis", idea: "builds its satellites at Pier 70, ...",
 *      wide: wide("ast-pier70-16x9"), tall: tall("ast-pier70-4x5"), alt: "...", spec: true,
 *      credit: "Photo: US Navy, 1942. Public domain." }
 */
export const WORK: Work[] = [];

/** a desktop picture (16:9 unless its size is given) and a phone picture (4:5 unless given); the full file must be at
 *  least as wide as the largest width in SIZES */
export const wide = (file: string, w = 1920, h = 1080): Shot => ({ file, w, h });
export const tall = (file: string, w = 1080, h = 1350): Shot => ({ file, w, h });

/** section names, in the order the page shows them */
export const SECTIONS: { kind: Kind; title: string }[] = [
  { kind: "logo", title: "Logos" },
  { kind: "board", title: "Brand boards" },
  { kind: "ad", title: "Ads" },
];

/** the approved ad ladder, in his words where they exist */
export const PRICES: { name: string; price: string; what: string }[] = [
  { name: "Spec set", price: "free", what: "4 ads made for you before we talk." },
  { name: "First set", price: "$2,400", what: "8 ads, each in 4 sizes, with the copy. Half to start. If you don't run at least four, you don't pay the second half." },
  { name: "Studio", price: "$4,500 a month", what: "12 new ads a month in all four sizes. The first three clients pay $3,500 a month for their first three months." },
  { name: "Campaign", price: "$7,500 a month", what: "20 ads and 4 motion ads a month, around one campaign idea." },
  { name: "Launch partner", price: "$12,000 a month", what: "30 ads, 8 motion ads and one landing or launch page a month." },
];
