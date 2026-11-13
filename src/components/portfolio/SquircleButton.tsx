"use client";

// His buttons: ignura.com's squircle button (corner-shape squircle, 52px, swells on a spring, sinks a pixel on press),
// with a small drawn icon inside. It is magnetic: within a short reach the button leans toward the pointer and its
// icon leans further, and both spring back when the pointer leaves. On hover the label grows a "+ you" ("call me +
// you"), revealed on the same spring. Shape and motion are in portfolio.css (.sq).

import { useEffect, useRef } from "react";

type Size = "md" | "sm";
type Icon = "phone" | "mail";

/** how far the pull reaches past the button's edge, and how far it leans at most, in px */
const REACH = 70;
const LEAN = 6;

function Glyph({ icon }: { icon: Icon }) {
  return icon === "phone" ? (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M6.2 2.8 4.4 3.4c-.9.3-1.5 1.2-1.4 2.2.5 5.4 5 9.9 10.4 10.4 1 .1 1.9-.5 2.2-1.4l.6-1.8a1 1 0 0 0-.5-1.2l-2.6-1.3a1 1 0 0 0-1.2.3l-.9 1.1a8 8 0 0 1-4.4-4.4l1.1-.9a1 1 0 0 0 .3-1.2L7.4 3.3a1 1 0 0 0-1.2-.5Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="2.6" y="4.4" width="14.8" height="11.2" rx="2.4" />
      <path d="m3.6 6 6.4 4.6L16.4 6" />
    </svg>
  );
}

export function SquircleButton({
  href,
  children = "call me",
  icon = "phone",
  size = "md",
  className = "",
  label,
  onClick,
}: {
  href: string;
  children?: React.ReactNode;
  icon?: Icon;
  size?: Size;
  className?: string;
  /** an accessible name when the visible label needs more context */
  label?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const external = /^https?:/.test(href);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce), (hover: none)").matches) return;
    let raf = 0;
    let px = -1e4, py = -1e4;
    let on = false;
    const apply = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = px - cx, dy = py - cy;
      // distance from the button's edge, not its centre, so a wide button pulls as readily as a narrow one
      const ex = Math.max(0, Math.abs(dx) - r.width / 2), ey = Math.max(0, Math.abs(dy) - r.height / 2);
      const near = Math.hypot(ex, ey) < REACH;
      if (!near && !on) return;
      on = near;
      const k = near ? 1 : 0;
      el.style.setProperty("--mx", `${(Math.max(-1, Math.min(1, dx / (r.width / 2 + REACH))) * LEAN * k).toFixed(2)}px`);
      el.style.setProperty("--my", `${(Math.max(-1, Math.min(1, dy / (r.height / 2 + REACH))) * LEAN * k).toFixed(2)}px`);
    };
    const move = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    addEventListener("pointermove", move, { passive: true });
    return () => {
      removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      className={`sq ${className}`}
      data-size={size}
      aria-label={label}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
    >
      <span className="sq-ic">
        <Glyph icon={icon} />
      </span>
      <span className="sq-t">{children}</span>
      <span className="sq-you" aria-hidden="true">
        <span className="sq-plus">+</span>
        <span className="sq-y">you</span>
      </span>
    </a>
  );
}
