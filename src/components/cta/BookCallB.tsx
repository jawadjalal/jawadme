"use client";

import Image from "next/image";
import Link from "next/link";
import { callHref, openBooking } from "@/components/cal";
import "./bookcallB.css";

const TILT = ["--tx", "--ty", "--mx", "--my"];

/** The call as a printed ticket: ivory paper body, ember stub on a perforated seam, a hand-drawn arrow. The pointer
 *  tilts the card; the stub lifts on hover and tears back on press. All the states live in bookcallB.css. */
export function BookCallB({ src, size }: { src: string; size: "dock" | "hero" }) {
  return (
    <Link
      href={callHref(src)}
      onClick={openBooking(src)}
      className="bcb"
      data-size={size}
      data-cursor="book"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--tx", String(x * 2 - 1));
        el.style.setProperty("--ty", String(y * 2 - 1));
        el.style.setProperty("--mx", `${x * 100}%`);
        el.style.setProperty("--my", `${y * 100}%`);
      }}
      onPointerLeave={(e) => TILT.forEach((p) => e.currentTarget.style.removeProperty(p))}
    >
      <span className="bcb-card">
        <span className="bcb-body">
          <Image className="bcb-face" src="/design/jawad-face-96.webp" alt="" width={96} height={96} sizes="48px" />
          <span className="bcb-text">
            <b>book a call</b>
            <small>15 min, video</small>
          </span>
          <i className="bcb-stamp" aria-hidden="true" />
        </span>
        <span className="bcb-stub">
          <svg className="bcb-arrow" viewBox="0 0 28 20" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path pathLength="1" d="M3.2 11.6C8 10.5 13.5 12.3 23.4 10.7" />
            <path pathLength="1" d="M17.6 4.6C19.6 6.9 21.9 8.9 24.2 10.8 22 12.9 19.6 15 17.2 17.4" />
          </svg>
        </span>
      </span>
    </Link>
  );
}
