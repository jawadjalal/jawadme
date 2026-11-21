"use client";

import { useEffect, useRef } from "react";

/** A looping clip whose poster and video only download once it comes near the screen; it pauses when it leaves. */
export function LoopVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return void v.pause();
        if (!v.getAttribute("src")) {
          v.poster = poster;
          v.src = src;
        }
        void v.play().catch(() => {});
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src, poster]);
  return <video ref={ref} muted loop playsInline preload="none" aria-label={label} />;
}
