"use client";

// The pull a control exerts on its own label.
//
// Small on purpose: a few pixels, eased, capped well before the text could
// leave its box. A magnetic control that visibly chases the cursor turns a
// link into a toy and makes it harder to click, which is the opposite of what
// a call to action should do. This is meant to be felt rather than noticed.
//
// It does not run under reduced motion, or on a coarse pointer where there is
// no cursor to lean toward. Both are checked here rather than at each call
// site, so a new button cannot forget them.

import { useEffect, useRef } from "react";

/** How far the label may travel, in px. */
const PULL = 5;
/** How much of the remaining distance is applied per frame. */
const EASE = 0.16;

export function useMagnetic<H extends HTMLElement, I extends HTMLElement>() {
  const host = useRef<H>(null);
  const inner = useRef<I>(null);

  useEffect(() => {
    const el = host.current;
    const move = inner.current;
    if (!el || !move) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let tx = 0, ty = 0, x = 0, y = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      // Normalised to the control's own size, so a wide button does not pull
      // harder than a narrow one sitting next to it.
      tx = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * PULL;
      ty = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * PULL;
    };
    const onLeave = () => { tx = 0; ty = 0; };

    const loop = () => {
      x += (tx - x) * EASE;
      y += (ty - y) * EASE;
      // Cleared rather than left at a sub-pixel value: text resampled onto a
      // fraction every frame reads as a shimmer at this size.
      move.style.transform =
        Math.abs(x) < 0.05 && Math.abs(y) < 0.05
          ? ""
          : `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      move.style.transform = "";
    };
  }, []);

  return { host, inner };
}
