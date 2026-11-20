import Image from "next/image";
import type { CSSProperties } from "react";
import type { Media as M } from "@/content/work";

/** A picture behind an ink plate that slides off when it enters (Motion registers it). `fit` keeps an off-ratio
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
        <video src={m.loop} poster={m.src} muted loop playsInline autoPlay preload="metadata" aria-label={m.alt} />
      ) : (
        <Image src={m.src} width={m.w} height={m.h} alt={m.alt} sizes={sizes} priority={priority} quality={86} />
      )}
      <i className="plate" style={delay ? { transitionDelay: `${delay}ms` } : undefined} />
    </div>
  );
}

/** A marked stand-in where Jawad's media is still to come. Never pretends to be work. */
export function Placeholder({ label, ratio = "4 / 5", tone = "paper", art }: { label: string; ratio?: string; tone?: "paper" | "ink"; art?: string }) {
  return (
    <div className={`ph hatch ${tone === "ink" ? "ph-ink" : ""}`} style={{ aspectRatio: ratio }}>
      {art ? <Image className="ph-art" src={art} alt="" width={1100} height={744} sizes="40vw" /> : null}
      <span className="marks"><i /></span>
      <span className="lbl">Placeholder</span>
      <span className="lbl dim">{label}</span>
    </div>
  );
}
