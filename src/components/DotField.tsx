"use client";

// The band of dots across the top of the page, which the pointer pushes
// around.
//
// A canvas rather than a few hundred DOM nodes: this redraws every frame
// while the pointer is inside it, and the same thing in elements would spend
// the whole budget on layout. It is decorative, so it is `aria-hidden` and it
// simply does not run for anyone on reduced motion, who gets the empty band
// and the rule under it.

import { useEffect, useRef } from "react";

const GAP = 22;      // spacing between dots, css px
const RADIUS = 1.1;  // dot radius at rest
const REACH = 105;   // how close the pointer has to get to move a dot
const PUSH = 0.34;   // how far a dot is shoved, as a fraction of the distance

/** Blends two "r g b" strings. */
function mix(a: string, b: string, t: number) {
  const pa = a.split(/\s+/).map(Number);
  const pb = b.split(/\s+/).map(Number);
  return pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(" ");
}

export function DotField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dots: { x: number; y: number }[] = [];
    let w = 0, h = 0;
    let raf = 0;
    // Off screen until the pointer arrives, so nothing is displaced at rest.
    let mx = -9999, my = -9999;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = [];
      // Insets so the grid does not clip a half dot against either rule.
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) dots.push({ x, y });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const style = getComputedStyle(document.documentElement);
      const ink = style.getPropertyValue("--dot-ink").trim() || "0 0 0";
      const hot = style.getPropertyValue("--dot-hot").trim() || ink;

      for (const d of dots) {
        const dx = d.x - mx;
        const dy = d.y - my;
        const dist = Math.hypot(dx, dy);

        let x = d.x, y = d.y, r = RADIUS, a = 0.32, tint = 0;
        if (dist < REACH) {
          // Nearer the pointer means shoved further and drawn brighter, so
          // the field reads as being pushed rather than as randomly twitching.
          const f = (1 - dist / REACH) ** 2;
          x += (dx / (dist || 1)) * REACH * PUSH * f;
          y += (dy / (dist || 1)) * REACH * PUSH * f;
          r = RADIUS + f * 1.5;
          a = 0.32 + f * 0.55;
          tint = f;
        }

        // Grey at rest, warm where the pointer is. Mixing rather than swapping
        // keeps the edge of the reach soft instead of drawing a hard ring.
        const rgb = tint > 0 ? mix(ink, hot, tint) : ink;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${rgb} / ${a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const move = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    };
    const leave = () => { mx = -9999; my = -9999; };

    build();
    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="block h-full w-full" />;
}
