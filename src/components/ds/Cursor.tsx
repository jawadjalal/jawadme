"use client";

// A 10 px ink dot that becomes a 72 px disc over work ("View") and an orange one over a booking link ("Book").
// Fine pointers only, and never under reduced motion.

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const x = gsap.quickTo(el, "x", { duration: 0.22, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.22, ease: "power3" });
    let mode: string | null = null;
    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
      const m = (e.target as Element | null)?.closest?.("[data-cursor]")?.getAttribute("data-cursor") ?? null;
      if (m === mode) return;
      mode = m;
      if (m) el.dataset.mode = m;
      else delete el.dataset.mode;
      if (label.current) label.current.textContent = m === "book" ? "Book" : m === "view" ? "View" : "";
    };
    const leave = () => gsap.to(el, { opacity: 0, duration: 0.2 });
    const enter = () => gsap.to(el, { opacity: 1, duration: 0.2 });
    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    return () => {
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);
  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <div className="cursor-dot">
        <span ref={label} />
      </div>
    </div>
  );
}
