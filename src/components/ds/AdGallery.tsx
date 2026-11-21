import Link from "next/link";
import { Media } from "@/components/ds/Media";
import type { Ad } from "@/content/ads";

/** The ads as a gallery: three columns of pieces hung at their own proportions, nothing cropped to fit a cell.
 *  Each piece rises out of its own plate as it enters; the caption names the brand. */
export function AdGallery({ ads }: { ads: Ad[] }) {
  return (
    <div className="wrap gal">
      {ads.map((a, i) => (
        <Link key={a.id} href={"/w/" + a.id} className="gal-item" data-cursor="view">
          <Media m={{ src: a.src, w: a.w, h: a.h, alt: a.alt }} sizes="(min-width: 768px) 33vw, 50vw" delay={(i % 3) * 70} />
          <span className="gal-cap">
            <span>{a.campaign}</span>
            <span className="dim">Spec</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
