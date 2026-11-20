"use client";

// A scroll-scrubbed frame sequence: the frames sit stacked and scroll progress through the box picks which one
// shows, like a turntable. Today it scrubs real Derelict Depths stills; the rendered 48-frame diorama (A4) drops in
// as the same list. Reduced motion shows the first frame.

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Media } from "@/content/work";

export function Sequence({ frames, label }: { frames: Media[]; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = () => {
      const r = box.current?.getBoundingClientRect();
      if (r && r.bottom > 0 && r.top < innerHeight) {
        const p = Math.min(Math.max((innerHeight - r.top) / (innerHeight + r.height), 0), 0.999);
        setI(Math.floor(p * frames.length));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [frames.length]);
  return (
    <div className="seq media" ref={box} data-plate="" style={{ aspectRatio: `${frames[0].w} / ${frames[0].h}` }}>
      {frames.map((f, n) => (
        <Image key={f.src} src={f.src} width={f.w} height={f.h} alt={n === 0 ? f.alt : ""} sizes="(min-width: 768px) 60vw, 100vw" style={{ opacity: n === i ? 1 : 0 }} />
      ))}
      <span className="lbl seq-count">
        {String(i + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}
      </span>
      <span className="lbl seq-label">{label}</span>
      <i className="plate" />
    </div>
  );
}
