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

/** The button's icon as a little sticker: a green phone handset or a yellow envelope, drawn as objects with a white
 *  die-cut edge (the stroke painted under the fill), tilted a few degrees. It wobbles when the button is pointed at. */
function Glyph({ icon }: { icon: Icon }) {
  return icon === "phone" ? (
    <span className="sq-stk" style={{ "--t": "-8deg" } as React.CSSProperties}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          className="sq-cut"
          d="M6.6 2.6c.8-.5 1.9-.3 2.4.5l1.6 2.6c.5.8.3 1.8-.4 2.4l-1.1.9c.9 2 2.5 3.6 4.5 4.5l.9-1.1c.6-.7 1.6-.9 2.4-.4l2.6 1.6c.8.5 1 1.6.5 2.4l-.9 1.5c-.7 1.1-2 1.7-3.3 1.4C9.6 18.9 5.1 14.4 3.5 8.2c-.3-1.3.3-2.6 1.4-3.3Z"
        />
        <path
          d="M6.6 2.6c.8-.5 1.9-.3 2.4.5l1.6 2.6c.5.8.3 1.8-.4 2.4l-1.1.9c.9 2 2.5 3.6 4.5 4.5l.9-1.1c.6-.7 1.6-.9 2.4-.4l2.6 1.6c.8.5 1 1.6.5 2.4l-.9 1.5c-.7 1.1-2 1.7-3.3 1.4C9.6 18.9 5.1 14.4 3.5 8.2c-.3-1.3.3-2.6 1.4-3.3Z"
          fill="#2fc764"
        />
        <path d="M5.4 5.2c.3-.4.7-.7 1.1-.9" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M15.9 16.6l1.9 1.2" fill="none" stroke="#1d9a48" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </span>
  ) : (
    <span className="sq-stk" style={{ "--t": "7deg" } as React.CSSProperties}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect className="sq-cut" x="2.6" y="5.4" width="18.8" height="13.2" rx="2.2" />
        <rect x="2.6" y="5.4" width="18.8" height="13.2" rx="2.2" fill="#ffd043" />
        <path d="M3.4 6.5 12 12.4l8.6-5.9" fill="none" stroke="#b07a00" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
        <rect x="16.4" y="13.6" width="3" height="3.2" rx=".4" fill="#e3322b" />
      </svg>
    </span>
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
