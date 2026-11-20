"use client";

// The home ads rail: on desktop the section pins and vertical scroll moves the rail sideways; on phones it is a
// native scroll-snap row. Reduced motion keeps the native row everywhere.

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function RailPin({ children }: { children: React.ReactNode }) {
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const p = pin.current!;
      const t = track.current!;
      p.classList.add("pinned");
      const dist = () => t.scrollWidth - p.clientWidth;
      gsap.to(t, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: { trigger: p, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      return () => p.classList.remove("pinned");
    });
    return () => mm.revert();
  }, []);
  return (
    <div className="rail-pin" ref={pin}>
      <div className="rail-track" ref={track}>
        {children}
      </div>
    </div>
  );
}
