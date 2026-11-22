"use client";

import { type CSSProperties, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { Stage } from "@/components/world/kit/Stage";
import "@/components/world/kit/flames.css";
import MARKS from "./marks.json";
import type { SetName } from "./sets";
import "./moments.css";

type Mark = number[];

/** Which flames a device that keeps the poster gets: the world's flipbook (./kit/flames.css), or one still frame of it
 *  for Save-Data, reduced motion and phones under 4 cores or 4 GB. The live scene is the Stage's call (./kit/gate). */
function flameTier(): "pf-play" | "pf-still" {
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (n.connection?.saveData || (n.hardwareConcurrency || 4) < 4 || (n.deviceMemory ?? 4) < 4) return "pf-still";
  return matchMedia("(prefers-reduced-motion: reduce)").matches ? "pf-still" : "pf-play";
}

/**
 * A route's 3D moment: its set from ./sets on the world kit's Stage, in three tiers.
 * - Every device paints the poster first (a render of the set, ./posters.mjs). It is the LCP, so a `first` moment
 *   fetches it with the document at high priority and never lazily.
 * - After the page has loaded and gone idle, a moment near the screen lays its flames over the poster where the scene
 *   left them (./marks.json): the world's CSS flipbook, or one still frame on a weak phone, Save-Data or reduced motion.
 * - A desktop with a hardware GPU (./kit/gate) mounts the live scene, which fades in over both once it has drawn.
 * Children are the page's own HTML laid over it.
 */
export function Moment({ set, first, className = "", children }: { set: SetName; first?: boolean; className?: string; children?: ReactNode }) {
  const d = "/moments/" + set + "-d.webp", ph = "/moments/" + set + "-m.webp";
  if (first) {
    preload(ph, { as: "image", media: "(max-width: 767px)", fetchPriority: "high" });
    preload(d, { as: "image", media: "(min-width: 768px)", fetchPriority: "high" });
  }
  const load = useCallback(() => import("./mount").then((m) => (host: HTMLElement, ctx: Parameters<typeof m.mount>[1]) => m.mount(host, ctx, set)), [set]);
  const frame = useRef<HTMLDivElement>(null);
  const fl = useRef<HTMLSpanElement>(null);
  const [tier, setTier] = useState<"pf-play" | "pf-still" | null>(null);
  const marks = (MARKS as Record<string, { d?: Mark[]; m?: Mark[] }>)[set];

  useEffect(() => {
    const el = frame.current;
    if (!el || !marks) return;
    let io: IntersectionObserver | undefined;
    let dead = false;
    const go = () => {
      if (dead) return;
      io = new IntersectionObserver(
        ([en]) => {
          if (!en.isIntersecting) return;
          io?.disconnect();
          setTier(flameTier());
        },
        { rootMargin: "400px 0px" },
      );
      io.observe(el);
    };
    const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 2000 }) : setTimeout(go, 200));
    if (document.readyState === "complete") idle();
    else addEventListener("load", idle, { once: true });
    return () => {
      dead = true;
      removeEventListener("load", idle);
      io?.disconnect();
    };
  }, [marks]);

  // the flames stand on the poster as drawn, so their box is the picture's own box under object-fit: cover
  useEffect(() => {
    const box = frame.current, span = fl.current, img = box?.querySelector("img");
    if (!tier || !box || !span || !img) return;
    const fit = () => {
      const W = box.clientWidth, H = box.clientHeight, iw = img.naturalWidth, ih = img.naturalHeight;
      if (!iw || !ih) return;
      const s = Math.max(W / iw, H / ih);
      Object.assign(span.style, { inset: "auto", left: (W - iw * s) / 2 + "px", top: (H - ih * s) / 2 + "px", width: iw * s + "px", height: ih * s + "px" });
    };
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    img.addEventListener("load", fit);
    fit();
    return () => {
      ro.disconnect();
      img.removeEventListener("load", fit);
    };
  }, [tier]);

  return (
    <Stage load={load} className={"mo mo-" + set + (className ? " " + className : "")}>
      <div ref={frame} className="stage-poster mo-poster" aria-hidden="true">
        <picture>
          <source media="(max-width: 767px)" srcSet={ph} />
          <img src={d} alt="" decoding="async" loading={first ? "eager" : "lazy"} fetchPriority={first ? "high" : "auto"} />
        </picture>
        {tier && marks ? (
          <span ref={fl} className={"pf " + tier}>
            {(["d", "m"] as const).flatMap((t) =>
              (marks[t] ?? []).map(([x, y, h], i) => (
                <i key={t + i} className={"pf-" + t} style={{ "--x": x, "--y": y, "--h": h, "--d": ((i * 0.37) % 1.6).toFixed(2) } as CSSProperties}>
                  <b />
                </i>
              )),
            )}
          </span>
        ) : null}
      </div>
      {children}
    </Stage>
  );
}
