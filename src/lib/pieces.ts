// Every piece that has its own address at /w/<id>: the curated ads first, in curation order, then every older
// permalink from the previous wall, whose files are unchanged, as pieces on their own.

import { ADS } from "@/content/ads";
import { FEED, type Picture } from "@/content/feed";

export type Piece = { id: string; src: string; w: number; h: number; alt: string; group: string; spec: boolean };

export const CURATED: (Piece & { sm: string })[] = ADS.map((a) => ({ id: a.id, src: a.src, sm: a.sm, w: a.w, h: a.h, alt: a.alt, group: a.campaign, spec: a.spec }));

const OLD: Piece[] = FEED.filter((e): e is Picture => "file" in e && !("embed" in e)).map((p) => ({
  id: p.file,
  src: `/work/2026-11/${p.file}.webp`,
  w: p.w,
  h: p.h,
  alt: p.alt,
  group: p.brand,
  spec: Boolean(p.unsolicited),
}));

export const PIECES: Piece[] = [...CURATED, ...OLD.filter((o) => !CURATED.some((c) => c.id === o.id))];
export const pieceById = (id: string) => PIECES.find((p) => p.id === id);

/** The piece's own line: its alt text up to the picture's description. */
export const pieceLine = (p: { alt: string }) => p.alt.split(". ").slice(0, -1).join(". ") || p.alt.replace(/\.$/, "");
