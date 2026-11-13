// Packs a list of feed entries into what WorkFeed draws: rows of pieces and story lines.
//
// Rules, in order: a story line stands alone; a wide piece (wider than 1.2 to 1) or a single live component that asks
// for the full width stands alone; the rest fill rows two, then three, then two... at a time; live components and icons
// never share a row with pictures, so a row of icons stays a row of icons. A row left with one piece joins the row
// before it rather than blowing a portrait up to the full width.

import type { Entry, Piece, Story } from "@/content/feed";

export type Row = { type: "row"; pieces: Piece[]; key: string } | { type: "story"; story: Story; key: string };

export const ratio = (p: Piece) => ("ratio" in p ? p.ratio : p.w / p.h);
const family = (p: Piece) => (p.kind === "icon" ? "icon" : p.kind === "component" ? "component" : "picture");
const alone = (p: Piece) => ratio(p) > 1.2;
const keyOf = (p: Piece) => ("file" in p ? p.file : p.embed);

export function pack(entries: Entry[], prefix = "r"): Row[] {
  const rows: Row[] = [];
  let run: Piece[] = [];
  let turn = 0;

  const flushRun = () => {
    if (!run.length) return;
    const groups: Piece[][] = [];
    let i = 0;
    while (i < run.length) {
      const want = turn++ % 2 === 0 ? 2 : 3;
      groups.push(run.slice(i, i + want));
      i += want;
    }
    const last = groups[groups.length - 1];
    if (groups.length > 1 && last.length === 1) groups[groups.length - 2].push(...groups.pop()!);
    // one portrait on its own between two wide pieces joins the picture row before it, if there is one
    if (groups.length === 1 && groups[0].length === 1) {
      const prev = rows[rows.length - 1];
      if (prev?.type === "row" && prev.pieces.length < 3 && !alone(prev.pieces[0]) && family(prev.pieces[0]) === family(groups[0][0])) {
        prev.pieces.push(groups[0][0]);
        run = [];
        return;
      }
    }
    for (const g of groups) rows.push({ type: "row", pieces: g, key: `${prefix}-${keyOf(g[0])}` });
    run = [];
  };

  for (const e of entries) {
    if ("story" in e) {
      flushRun();
      rows.push({ type: "story", story: e, key: `${prefix}-s-${e.story.slice(0, 16)}` });
      continue;
    }
    if (alone(e)) {
      flushRun();
      rows.push({ type: "row", pieces: [e], key: `${prefix}-${keyOf(e)}` });
      continue;
    }
    if (run.length && family(run[0]) !== family(e)) flushRun();
    run.push(e);
  }
  flushRun();
  return rows;
}

/** A fresh order of the pictures for the next pass of the wall: shuffled, and never two of one brand side by side. */
export function reshuffle(entries: Entry[]): Piece[] {
  const pics = entries.filter((e): e is Piece => !("story" in e) && "file" in e);
  const a = [...pics];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  for (let i = 1; i < a.length; i++) {
    const same = (x: Piece, y: Piece) => "brand" in x && "brand" in y && x.brand === y.brand;
    if (same(a[i], a[i - 1])) {
      const k = a.findIndex((p, n) => n > i && !same(p, a[i - 1]));
      if (k > 0) [a[i], a[k]] = [a[k], a[i]];
    }
  }
  return a;
}
