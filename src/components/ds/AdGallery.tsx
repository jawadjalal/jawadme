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

const vars = (d: Slot, m: Slot) => ({ "--dw": d.w, "--dn": d.n, "--mw": m.w, "--mn": m.n }) as CSSProperties;

/** Height of a hang as a share of its width, each row with room for its captions. */
const tall = (aspects: number[], slots: Slot[]) => {
  let h = 0;
  for (let i = 0; i < slots.length; i += slots[i].n + 1) h += slots[i].w / aspects[i] + 0.04;
  return h;
};

/** A room's opening: the first piece large on the left, and beside it the run of the next pieces whose hang comes
 *  closest to its height (all of them when one or none would be left to hang below). */
function feature(aspects: number[]) {
  const side = (m: number) => hang(aspects.slice(1, 1 + m), 0.6, [0.6]);
  const fit = (l: number) => {
    const off = (m: number) => Math.abs((1 - l) * tall(aspects.slice(1, 1 + m), side(m)) - l / aspects[0] - 0.04);
    let m = 1;
    for (let k = 2; k < aspects.length; k++) if (off(k) < off(m)) m = k;
    return aspects.length - 1 - m < 2 ? aspects.length - 1 : m;
  };
  // a lone piece beside the lead fills the side on its own, so the lead takes the larger share to stay the largest
  const m = fit(aspects[0] >= 1 ? 0.62 : 0.45);
  const l = m === 1 ? 0.62 : aspects[0] >= 1 ? 0.62 : 0.45;
  return { m, l, side: side(m) };
}

/** One hang. `lead` loads its first picture first, for the top of a page; `feature` opens it on one large piece. */
export function Hang({ entries, first = 0.5, cycle = [0.4, 0.3], lead = false, feature: big = false }: { entries: Entry[]; first?: number; cycle?: number[]; lead?: boolean; feature?: boolean }) {
  const aspects = entries.map((e) => e.media.w / e.media.h);
  const phone = hang(aspects, 1.2, [0.62, 0.62, 1.2]);
  const f = big && entries.length > 1 ? feature(aspects) : null;
  const wide = f ? [{ w: f.l, n: 1 }, ...f.side.map((s) => ({ w: s.w * (1 - f.l), n: s.n })), ...hang(aspects.slice(1 + f.m), cycle[0], cycle)] : hang(aspects, first, cycle);
  const item = (e: Entry, i: number) => (
    <TLink key={e.key} id={e.key} href={e.href} vt={e.href.startsWith("/w/") ? "piece" : "cover-" + e.href.split("/").pop()} className="hang-i" data-cursor="view" data-m="tilt" style={vars(f && i > 0 && i <= f.m ? f.side[i - 1] : wide[i], phone[i])}>
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
