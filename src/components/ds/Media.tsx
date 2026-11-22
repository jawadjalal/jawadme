import Image from "next/image";
import type { CSSProperties } from "react";
import { LoopVideo } from "@/components/ds/LoopVideo";
import type { Crop, Media as M } from "@/content/work";

/** The frame's shape and where the picture sits in it, for the wide crop and the phone crop. */
const place = (w: number, h: number, [x, y, cw, ch]: Crop, [px, py, pw, ph]: Crop) =>
  ({ "--ca": cw / ch, "--cw": w / cw, "--cx": x / cw, "--cy": y / ch, "--pa": pw / ph, "--pw": w / pw, "--px": px / pw, "--py": py / ph }) as CSSProperties;

/** A picture behind a plate of ground that slides off when it enters (Motion registers it); a priority picture, the
 *  page's first, paints at once. `fit` keeps an off-ratio
 *  piece whole on a backdrop instead of cropping it. A picture with a crop shows only that rectangle, filling the frame,
 *  and its phone crop on a phone, so the text in a screenshot reads at its own size; it stays a still. */

export function Media({
  m,
  ratio,
  sizes = "100vw",
  priority,
  fit = "cover",
  vt,
  delay,
  quality = 86,
  className = "",
}: {
  m: M;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  vt?: string;
  delay?: number;
  quality?: 75 | 86 | 90;
  className?: string;
}) {
  const c = m.crop || m.cropM;
  const wide = m.crop ?? [0, 0, m.w, m.h];
  const phone = m.cropM ?? wide;
  const style: CSSProperties = c ? place(m.w, m.h, wide, phone) : { aspectRatio: ratio ?? `${m.w} / ${m.h}` };
  if (vt) style.viewTransitionName = vt;
  return (
    <div className={`media ${fit === "contain" ? "contain" : ""} ${className}`} data-plate={priority ? undefined : ""} data-crop={c ? "" : undefined} style={style}>
      {m.loop && !c ? (
        <LoopVideo src={m.loop} poster={m.src} label={m.alt} />
      ) : (
        <Image src={m.src} width={m.w} height={m.h} alt={m.alt} sizes={c ? `(min-width: 768px) ${Math.ceil((100 * m.w) / wide[2])}vw, ${Math.ceil((100 * m.w) / phone[2])}vw` : sizes} priority={priority} fetchPriority={priority ? "high" : undefined} quality={quality} />
      )}
      {priority ? null : <i className="plate" style={delay ? { transitionDelay: `${delay}ms` } : undefined} />}
    </div>
  );
}
