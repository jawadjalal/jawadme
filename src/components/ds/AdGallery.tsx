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

/** One hang. `lead` loads the opening row first, for the top of a page. */
export function Hang({ entries, first = 0.5, cycle = [0.4, 0.3], lead = false }: { entries: Entry[]; first?: number; cycle?: number[]; lead?: boolean }) {
  const aspects = entries.map((e) => e.media.w / e.media.h);
  const wide = hang(aspects, first, cycle);
  const phone = hang(aspects, 1.2, [0.62, 0.62, 1.2]);
  const opening = wide[0].n + 1;
  return (
    <div className="wrap hang">
      {entries.map((e, i) => (
        <TLink key={e.key} id={e.key} href={e.href} vt={e.href.startsWith("/w/") ? "piece" : "cover-" + e.href.split("/").pop()} className="hang-i" data-cursor="view" style={vars(wide[i], phone[i])}>
          <Media m={e.media} sizes={`(min-width: 768px) ${Math.ceil(wide[i].w * 100)}vw, ${Math.ceil(phone[i].w * 100)}vw`} priority={lead && i < opening} delay={(i % 4) * 70} />
          <span className="hang-cap">
            <span className="hang-co">{e.title}</span>
            <span className="hang-hl">{e.line}</span>
          </span>
        </TLink>
      ))}
    </div>
  );
}

/** The ads on the home page: one hang, linking through to the viewer. */
export function AdGallery({ ads }: { ads: Ad[] }) {
  return <Hang entries={ads.map(adEntry)} first={0.56} />;
}
