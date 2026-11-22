"use client";

// A scroll-scrubbed frame sequence: the frames sit stacked and scroll progress through the box picks which one
// shows, like a turntable. Today it scrubs real fracture stills; the rendered 48-frame diorama (A4) drops in
// as the same list. Reduced motion shows the first frame.

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Media } from "@/content/work";

export function Sequence({ frames, label }: { frames: Media[]; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const set = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(Math.max((innerHeight - r.top) / (innerHeight + r.height), 0), 0.999);
      setI(Math.floor(p * frames.length));
    };
    const on = () => void (raf ||= requestAnimationFrame(set));
    // measured only on scroll while the box is on screen, never every frame
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        addEventListener("scroll", on, { passive: true });
        on();
      } else removeEventListener("scroll", on);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, [frames.length]);
  return (
    <div className="seq media" ref={box} data-plate="" style={{ aspectRatio: `${frames[0].w} / ${frames[0].h}` }}>
      {frames.map((f, n) => (
        <Image key={f.src} src={f.src} width={f.w} height={f.h} alt={n === 0 ? f.alt : ""} sizes="(min-width: 768px) 60vw, 100vw" style={{ opacity: n === i ? 1 : 0 }} />
      ))}
      <span className="lbl seq-count">
        {i + 1} / {frames.length}
      </span>
      <span className="lbl seq-label">{label}</span>
      <i className="plate" />
    </div>
  );
}
