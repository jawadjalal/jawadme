// Packs a list of feed entries into what WorkFeed draws: rows of pieces and story lines.
//
// Rules, in order: a story line stands alone; a wide piece (wider than 1.2 to 1) stands alone at the full width; the
// rest go two to a row, never three; app icons go three to a strip, set as one piece on one black ground. A portrait
// left over on its own shares a row with the wide piece next to it, so the wall never blows a portrait up to the full
// width and never sets three small pictures side by side.

import type { Entry, Piece, Story } from "@/content/feed";

export type Row = { type: "row"; pieces: Piece[]; key: string } | { type: "story"; story: Story; key: string };

export const ratio = (p: Piece) => ("ratio" in p ? p.ratio : p.w / p.h);
const family = (p: Piece) => (p.kind === "icon" ? "icon" : p.kind === "component" ? "component" : "picture");
const wide = (p: Piece) => ratio(p) > 1.2;
const keyOf = (p: Piece) => ("file" in p ? p.file : p.embed);

export function pack(entries: Entry[], prefix = "r"): Row[] {
  const rows: Row[] = [];
  let run: Piece[] = [];

  const flushRun = () => {
    if (!run.length) return;
    const per = family(run[0]) === "icon" ? 3 : 2;
    for (let i = 0; i < run.length; i += per) {
      const g = run.slice(i, i + per);
      rows.push({ type: "row", pieces: g, key: `${prefix}-${keyOf(g[0])}` });
    }
    run = [];
  };

  for (const e of entries) {
    if ("story" in e) {
      flushRun();
      rows.push({ type: "story", story: e, key: `${prefix}-s-${e.story.slice(0, 16)}` });
      continue;
    }
    if (wide(e)) {
      flushRun();
      rows.push({ type: "row", pieces: [e], key: `${prefix}-${keyOf(e)}` });
      continue;
    }
    if (run.length && family(run[0]) !== family(e)) flushRun();
    run.push(e);
  }
  flushRun();

  // a lone portrait joins the wide piece after it (or before it); failing both, the pair before it
  const lone = (r: Row | undefined): r is Extract<Row, { type: "row" }> =>
    r?.type === "row" && r.pieces.length === 1 && !wide(r.pieces[0]) && family(r.pieces[0]) === "picture";
  const soloWide = (r: Row | undefined): r is Extract<Row, { type: "row" }> =>
    r?.type === "row" && r.pieces.length === 1 && wide(r.pieces[0]) && family(r.pieces[0]) === "picture";
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!lone(r)) continue;
    const next = rows[i + 1];
    const prev = rows[i - 1];
    if (soloWide(next)) {
      next.pieces.unshift(r.pieces[0]);
      rows.splice(i--, 1);
    } else if (soloWide(prev)) {
      prev.pieces.push(r.pieces[0]);
      rows.splice(i--, 1);
    } else {
      const before = rows[i - 1] as Row | undefined;
      if (!(before?.type === "row" && family(before.pieces[0]) === "picture" && before.pieces.length === 2)) continue;
      before.pieces.push(r.pieces[0]);
      rows.splice(i--, 1);
    }
  }
  return rows;
}

/** A fresh order of the pictures for the next pass of the wall: shuffled, never two of one brand side by side, and
 *  laid out as a wide piece, then a few pairs, then the next wide piece, so big pieces keep coming round. */
export function reshuffle(entries: Entry[]): Piece[] {
  const pics = entries.filter((e): e is Piece => !("story" in e) && "file" in e);
  const a = [...pics];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  const wides = a.filter(wide);
  const rest = a.filter((p) => !wide(p));
  const same = (x: Piece, y: Piece) => "brand" in x && "brand" in y && x.brand === y.brand;
  for (let i = 1; i < rest.length; i++) {
    if (same(rest[i], rest[i - 1])) {
      const k = rest.findIndex((p, n) => n > i && !same(p, rest[i - 1]));
      if (k > 0) [rest[i], rest[k]] = [rest[k], rest[i]];
    }
  }
  if (rest.length % 2) rest.pop(); // an even run, so every row is a pair
  const out: Piece[] = [];
  const gap = Math.max(4, Math.floor(rest.length / Math.max(1, wides.length)) & ~1);
  for (let i = 0; i < rest.length; i += gap) {
    const w = wides.shift();
    if (w) out.push(w);
    out.push(...rest.slice(i, i + gap));
  }
  out.push(...wides);
  return out;
}
