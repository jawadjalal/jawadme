"use client";

import { useEffect, useRef } from "react";

/** A case loop that fetches nothing until the page has loaded and it is near the screen (the poster too), plays only
 *  while seen, and never plays with reduced motion or Save-Data (the poster stays). */
export function LoopVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const still = saveData || matchMedia("(prefers-reduced-motion: reduce)").matches;
    let io: IntersectionObserver | undefined;
    const start = () => {
      io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return v.pause();
          if (!v.poster) v.poster = poster;
          if (still) return;
          if (!v.getAttribute("src")) v.src = src;
          v.play().catch(() => {});
        },
        { rootMargin: "300px 0px" },
      );
      io.observe(v);
    };
    if (document.readyState === "complete") start();
    else addEventListener("load", start, { once: true });
    return () => {
      removeEventListener("load", start);
      io?.disconnect();
    };
  }, [src, poster]);
  return <video ref={ref} muted loop playsInline preload="none" aria-label={label} />;
}
