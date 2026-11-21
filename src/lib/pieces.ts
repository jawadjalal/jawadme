// Every piece that has its own address at /w/<id>: the gallery's pieces first, in the order /work hangs them, then
// every older permalink from the previous wall, whose files are unchanged, as pieces on their own.

import { FEED, type Picture } from "@/content/feed";
import { GALLERY, type Piece } from "@/lib/gallery";

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
  credit: "designed by Jawad Jalal",
  kind: "Ad design",
  spec: Boolean(p.unsolicited),
}));

export const CURATED = GALLERY;
export const PIECES: Piece[] = [...GALLERY, ...OLD.filter((o) => !GALLERY.some((c) => c.id === o.id))];
export const pieceById = (id: string) => PIECES.find((p) => p.id === id);
