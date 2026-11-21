import Link from "next/link";
import { Media } from "@/components/ds/Media";
import type { Ad } from "@/content/ads";

/** The ads as rooms of a gallery. Each room opens on one piece hung large, its name beside it at display size and
 *  two smaller pieces standing on the same floor; the rest of the room hangs in three columns at their own
 *  proportions, nothing cropped to fit a cell. The large piece swaps sides from room to room. */
export function AdGallery({ ads }: { ads: Ad[] }) {
  const rooms: Ad[][] = [];
  for (let i = 0; i < ads.length; i += 9) rooms.push(ads.slice(i, i + 9));
  const piece = (a: Ad, i: number, sizes: string) => (
    <Link key={a.id} href={"/w/" + a.id} className="gal-item" data-cursor="view">
      <Media m={{ src: a.src, w: a.w, h: a.h, alt: a.alt }} sizes={sizes} delay={(i % 3) * 70} />
      <span className="gal-cap">{a.campaign}</span>
    </Link>
  );
  return (
    <div className="gal-rooms">
      {rooms.map(([lead, ...rest], k) => (
        <div key={lead.id} className="wrap gal-room">
          <div className={"gal-feat" + (k % 2 ? " flip" : "")} style={{ "--r": lead.w / lead.h } as React.CSSProperties}>
            <Link href={"/w/" + lead.id} className="gal-lead" data-cursor="view">
              <Media m={{ src: lead.src, w: lead.w, h: lead.h, alt: lead.alt }} sizes="(min-width: 768px) 50vw, 100vw" />
            </Link>
            <div className="gal-side">
              <Link href={"/w/" + lead.id} className="gal-feat-cap">
                <span className="gal-feat-co">{lead.campaign}</span>
                <span className="dim">Spec ad, made unasked</span>
              </Link>
              {rest.length ? <div className="gal-pair">{rest.slice(0, 2).map((a, i) => piece(a, i, "(min-width: 768px) 22vw, 50vw"))}</div> : null}
            </div>
          </div>
          {rest.length > 2 ? <div className="gal">{rest.slice(2).map((a, i) => piece(a, i, "(min-width: 768px) 33vw, 50vw"))}</div> : null}
        </div>
      ))}
    </div>
  );
}
