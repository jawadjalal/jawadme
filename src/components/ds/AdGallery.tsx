import type { CSSProperties } from "react";
import { Media } from "@/components/ds/Media";
import { TLink } from "@/components/ds/TLink";
import type { Ad } from "@/content/ads";
import { adEntry, type Entry } from "@/lib/gallery";

/** Pieces hung salon style: rows that run edge to edge, each piece at its own proportions and every piece in a row the
 *  same height, so nothing is cropped, no tile is left empty and the last row closes flush. The rhythm comes from the
 *  target height of each row, as a share of the width: one large opening row, then denser runs. A wide screen and a
 *  phone get their own hang, both worked out here; the stylesheet picks one, so the markup is one list of links. */

type Slot = { w: number; n: number };

function hang(aspects: number[], first: number, cycle: number[]): Slot[] {
  const out: Slot[] = [];
  const target = (r: number) => (r === 0 ? first : cycle[(r - 1) % cycle.length]);
  let i = 0;
  for (let r = 0; i < aspects.length; r++) {
    const t = target(r);
    let k = i;
    let sum = 0;
    while (k < aspects.length && sum + aspects[k] <= 1 / t) sum += aspects[k++];
    if (k < aspects.length && (k === i || Math.abs(1 / (sum + aspects[k]) - t) < Math.abs(1 / sum - t))) sum += aspects[k++];
    const rest = aspects.slice(k).reduce((a, b) => a + b, 0);
    if (k < aspects.length && rest < 0.6 / target(r + 1)) {
      sum += rest;
      k = aspects.length;
    }
    for (let j = i; j < k; j++) out.push({ w: aspects[j] / sum, n: k - i - 1 });
    i = k;
  }
  return out;
}

/** the piece's share of its row on each screen, and its file's own width, which a hang may hold it under */
const vars = (d: Slot, m: Slot, nw: number) => ({ "--dw": d.w, "--dn": d.n, "--mw": m.w, "--mn": m.n, "--nw": nw + "px" }) as CSSProperties;

/** The wide hang's size on a 1440 screen, and what a row adds besides its pictures: the gap beside each piece, the
 *  caption under it and the gap down to the next row. */
const W = 1416;
const GAP = 16;
const CAP = 53;
const ROW = 34;

/** A room's opening: the first piece large on the left, and beside it a run of the next pieces in rows. Every way of
 *  cutting each run into rows is tried, the lead's width solved so its column ends level with the run's, and the one
 *  whose lead comes closest to 0.6 of the width wins. A lead held under its file's width, narrower than 0.4 or wider
 *  than 0.72 of the hang, or taller than 0.85 of its width is out, as is a run leaving one piece alone below; with no
 *  opening left, the room hangs as plain rows. */
function feature(aspects: number[], files: number[]) {
  let best: { m: number; l: number; side: Slot[] } | null = null;
  let off = Infinity;
  for (let m = 1; m < aspects.length; m++) {
    if (aspects.length - 1 - m === 1) continue;
    for (let cuts = 0; cuts < 1 << (m - 1); cuts++) {
      const rows: number[][] = [[1]];
      for (let j = 2; j <= m; j++) (cuts >> (j - 2)) & 1 ? rows.push([j]) : rows[rows.length - 1].push(j);
      const sums = rows.map((r) => r.reduce((s, j) => s + aspects[j], 0));
      const p = sums.reduce((s, x) => s + 1 / x, 0);
      const q = rows.reduce((s, r, k) => s + (GAP * (r.length - 1)) / sums[k], 0);
      const wl = ((W - GAP) * p - q + (CAP + ROW) * (rows.length - 1)) / (1 / aspects[0] + p);
      const l = wl / (W - GAP);
      if (l < 0.4 || l > 0.72 || wl > files[0] || wl / aspects[0] > 0.55 * W || Math.abs(l - 0.6) >= off) continue;
      const ws = W - GAP - wl;
      const side = rows.flatMap((r, k) => r.map((j) => ({ w: aspects[j] / sums[k], n: r.length - 1 })));
      if (side.some((s, i) => (ws - GAP * s.n) * s.w > files[i + 1])) continue;
      best = { m, l, side };
      off = Math.abs(l - 0.6);
    }
  }
  return best;
}

/** One hang. `lead` loads its first picture first, for the top of a page; `feature` opens it on one large piece. */
export function Hang({ entries, first = 0.5, cycle = [0.4, 0.3], lead = false, feature: big = false }: { entries: Entry[]; first?: number; cycle?: number[]; lead?: boolean; feature?: boolean }) {
  const aspects = entries.map((e) => e.media.w / e.media.h);
  const phone = hang(aspects, 1.2, [0.62, 0.62, 1.2]);
  const f = big && entries.length > 1 ? feature(aspects, entries.map((e) => e.media.w)) : null;
  const wide = f ? [{ w: f.l, n: 1 }, ...f.side.map((s) => ({ w: s.w * (1 - f.l), n: s.n })), ...hang(aspects.slice(1 + f.m), cycle[0], cycle)] : hang(aspects, first, cycle);
  const item = (e: Entry, i: number) => (
    <TLink key={e.key} id={e.key} href={e.href} vt={e.href.startsWith("/w/") ? "piece" : "cover-" + e.href.split("/").pop()} className="hang-i" data-cursor="view" data-m="tilt" style={vars(f && i > 0 && i <= f.m ? f.side[i - 1] : wide[i], phone[i], e.media.w)}>
      <Media m={e.media} sizes={`(min-width: 768px) ${Math.ceil(wide[i].w * 100)}vw, calc(${Math.ceil(phone[i].w * 100)}vw - ${Math.round(24 * phone[i].w)}px)`} priority={lead && i === 0} delay={(i % 4) * 70} quality={75} />
      <span className="hang-cap">
        <span className="hang-co">{e.title}</span>
        <span className="hang-hl">{e.line.startsWith(e.title + ": ") ? e.line.slice(e.title.length + 2) : e.line}</span>
      </span>
    </TLink>
  );
  if (!f) return <div className="wrap hang">{entries.map(item)}</div>;
  return (
    <div className="wrap hang">
      <div className="hang-top">
        {item(entries[0], 0)}
        <div className="hang-side">{entries.slice(1, 1 + f.m).map((e, j) => item(e, j + 1))}</div>
      </div>
      {entries.slice(1 + f.m).map((e, j) => item(e, j + 1 + f.m))}
    </div>
  );
}

/** The ads on the home page: one hang, linking through to the viewer. */
export function AdGallery({ ads }: { ads: Ad[] }) {
  return <Hang entries={ads.map(adEntry)} first={0.56} />;
}
