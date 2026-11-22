"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Gilded } from "@/components/gilded/Gilded";

/** One horizontal rail: the slides scroll and snap on their own (a swipe, a trackpad, shift and the wheel), the gilded
 *  prev and next step one slide, and the count says which slide leads. A /work#<id> address, the viewer's way back,
 *  brings its slide to the front. */
export function Rail({ label, n, children }: { label: string; n: number; children: ReactNode }) {
  const track = useRef<HTMLOListElement>(null);
  const [at, setAt] = useState(0);
  const slides = () => [...track.current!.children] as HTMLElement[];
  const lead = () => {
    const t = track.current!;
    const k = slides().findIndex((s) => s.offsetLeft + s.offsetWidth / 2 > t.scrollLeft + t.offsetLeft);
    return k < 0 ? n - 1 : k;
  };
  const go = (k: number) => {
    const t = track.current!;
    const s = slides()[Math.max(0, Math.min(n - 1, k))];
    t.scrollTo({ left: s.offsetLeft - t.offsetLeft, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  useEffect(() => {
    const t = track.current!;
    const mark = location.hash.length > 1 ? t.querySelector<HTMLElement>(`[id="${CSS.escape(decodeURIComponent(location.hash.slice(1)))}"]`) : null;
    const li = mark?.closest("li");
    if (li) t.scrollLeft = li.offsetLeft - t.offsetLeft;
    let raf = 0;
    const scroll = () => (raf ||= requestAnimationFrame(() => ((raf = 0), setAt(lead()))));
    scroll();
    t.addEventListener("scroll", scroll, { passive: true });
    return () => {
      t.removeEventListener("scroll", scroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="rail">
      <div className="wrap rail-bar">
        <span className="rail-count" aria-live="polite">
          {at + 1} / {n}
        </span>
        <span className="rail-step">
          <Gilded variant="pill" onClick={() => go(lead() - 1)}>
            ← prev
          </Gilded>
          <Gilded variant="pill" onClick={() => go(lead() + 1)}>
            next →
          </Gilded>
        </span>
      </div>
      <ol className="rail-track" ref={track} aria-label={label} tabIndex={0}>
        {children}
      </ol>
    </div>
  );
}
