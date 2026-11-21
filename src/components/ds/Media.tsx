import Image from "next/image";
import type { CSSProperties } from "react";
import { LoopVideo } from "@/components/ds/LoopVideo";
import type { Media as M } from "@/content/work";

/** A picture behind a plate of ground that slides off when it enters (Motion registers it). `fit` keeps an off-ratio
 *  piece whole on a backdrop instead of cropping it. */
export function Media({
  m,
  ratio,
  sizes = "100vw",
  priority,
  fit = "cover",
  vt,
  delay,
  className = "",
}: {
  m: M;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  vt?: string;
  delay?: number;
  className?: string;
}) {
  const style: CSSProperties = { aspectRatio: ratio ?? `${m.w} / ${m.h}` };
  if (vt) style.viewTransitionName = vt;
  return (
    <div className={`media ${fit === "contain" ? "contain" : ""} ${className}`} data-plate="" style={style}>
      {m.loop ? (
        <LoopVideo src={m.loop} poster={m.src} label={m.alt} />
      ) : (
        <Image src={m.src} width={m.w} height={m.h} alt={m.alt} sizes={sizes} priority={priority} quality={86} />
      )}
      <i className="plate" style={delay ? { transitionDelay: `${delay}ms` } : undefined} />
    </div>
  );
}
