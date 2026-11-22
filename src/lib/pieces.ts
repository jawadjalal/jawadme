// Every piece that has its own address at /w/<id>: the gallery's pieces first, in the order /work hangs them, then the
// home hall's ads that are off the wall, then every older permalink from the previous wall, whose files are unchanged,
// as pieces on their own.

import { ADS, HALL } from "@/content/ads";
import { FEED, type Picture } from "@/content/feed";
import sizes from "@/content/feed-sizes.json";
import { GALLERY, adPiece, type Piece } from "@/lib/gallery";

export type { Piece };

/** The piece's own line: its alt text up to the picture's description. */
const lineOf = (alt: string) => alt.split(". ").slice(0, -1).join(". ") || alt.replace(/\.$/, "");

const OLD: Piece[] = FEED.filter((e): e is Picture => "file" in e && !("embed" in e)).map((p) => ({
  id: p.file,
  src: `/work/2026-11/${p.file}.webp`,
  sm: `/work/2026-11/${p.file}-sm.webp`,
  w: p.w,
  h: p.h,
  alt: p.alt,
  line: lineOf(p.alt),
  group: p.brand,
  credit: "designed by jawad jalal",
  kind: "ad design",
  spec: Boolean(p.unsolicited),
  slides: p.slides?.map((f) => {
    const [w, h] = (sizes as Record<string, number[]>)[f];
    return { src: `/work/2026-11/${f}.webp`, w, h };
  }),
  video: p.video && `/work/2026-11/${p.video}`,
}));

export const CURATED = GALLERY;
/** the hall's ads that are off the wall (thauma) keep their addresses, outside the wall's order */
const HALL_ONLY = HALL.filter((a) => !ADS.includes(a)).map(adPiece);
export const PIECES: Piece[] = [...GALLERY, ...HALL_ONLY, ...OLD.filter((o) => !GALLERY.some((c) => c.id === o.id))];
export const pieceById = (id: string) => PIECES.find((p) => p.id === id);
