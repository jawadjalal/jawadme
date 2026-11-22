"use client";

import { useEffect, useRef } from "react";
import type { Ad } from "@/content/ads";

// An ad full-screen, opened from a banner in the rooms world. A native modal <dialog>: the page behind is inert, so
// focus stays inside; Esc, the close button or a click on the margin closes it, and the opener gets focus back
// (World). The page cannot scroll while it is open (Lenis is stopped too); it fades in only without reduced motion.

type Lenis = { stop: () => void; start: () => void };

export function AdDialog({ ad, onClose }: { ad: Ad; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const done = useRef(onClose);
  done.current = onClose;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const root = document.documentElement;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    root.classList.add("ad-open");
    lenis?.stop();
    d.showModal();
    const close = () => void (d.open || done.current());
    d.addEventListener("close", close);
    return () => {
      d.removeEventListener("close", close);
      if (d.open) d.close();
      root.classList.remove("ad-open");
      lenis?.start();
    };
  }, []);

  return (
    <dialog ref={ref} className="ad-dialog" aria-labelledby="ad-dialog-h" onClick={(e) => e.target === e.currentTarget && ref.current?.close()}>
      <figure className="ad-dialog-f">
        <img src={ad.src} alt={ad.alt} width={ad.w} height={ad.h} decoding="async" />
        <figcaption>
          <b id="ad-dialog-h">{ad.campaign}</b>
          <span>{ad.alt}</span>
        </figcaption>
      </figure>
      <button type="button" className="ad-dialog-x" onClick={() => ref.current?.close()} autoFocus>
        close
      </button>
    </dialog>
  );
}
