"use client";

import { useEffect, useRef } from "react";

/** A case loop that fetches nothing until the page has loaded and it is on screen, plays only while seen, and never
 *  plays with reduced motion or Save-Data (the poster stays). */
export function LoopVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!v || saveData || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let io: IntersectionObserver | undefined;
    const start = () => {
      io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return v.pause();
          if (!v.src) v.src = src;
          v.play().catch(() => {});
        },
        { threshold: 0.25 },
      );
      io.observe(v);
    };
    if (document.readyState === "complete") start();
    else addEventListener("load", start, { once: true });
    return () => {
      removeEventListener("load", start);
      io?.disconnect();
    };
  }, [src]);
  return <video ref={ref} poster={poster} muted loop playsInline preload="none" aria-label={label} />;
}
