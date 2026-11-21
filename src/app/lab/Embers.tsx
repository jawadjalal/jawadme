"use client";

import { useEffect, useRef } from "react";

/** Sparks rising from the brazier: additive, a few dozen, paused off screen and with reduced motion. */
export function Embers({ count = 60, hue = "255,138,42" }: { count?: number; hue?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const g = c.getContext("2d");
    if (!g) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    const size = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const P = Array.from({ length: count }, () => ({ x: Math.random(), y: Math.random(), s: 0.4 + Math.random(), v: 0.2 + Math.random() * 0.6, p: Math.random() * 6.28 }));
    let raf = 0;
    let seen = true;
    let t0 = performance.now();
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    io.observe(c);
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (t - t0) / 1000);
      t0 = t;
      if (!seen) return;
      g.clearRect(0, 0, w, h);
      g.globalCompositeOperation = "lighter";
      for (const p of P) {
        p.y -= (p.v * dt * 60) / h * 1.4;
        p.p += dt * 1.3;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = 0.3 + Math.random() * 0.4;
        }
        const life = Math.min(1, (1 - p.y) * 3) * Math.min(1, p.y * 2.5);
        const x = p.x * w + Math.sin(p.p) * 14 * p.s;
        const y = p.y * h;
        const r = 1.1 * p.s;
        g.fillStyle = "rgba(" + hue + "," + (0.75 * life).toFixed(3) + ")";
        g.beginPath();
        g.arc(x, y, r, 0, 6.283);
        g.fill();
        g.fillStyle = "rgba(" + hue + "," + (0.12 * life).toFixed(3) + ")";
        g.beginPath();
        g.arc(x, y, r * 5, 0, 6.283);
        g.fill();
      }
    };
    raf = requestAnimationFrame(tick);
    addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("resize", size);
    };
  }, [count, hue]);
  return <canvas ref={ref} className="embers" aria-hidden="true" />;
}
