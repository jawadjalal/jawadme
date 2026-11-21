"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { callHref, openBooking } from "@/components/cal";
import "./bookcallB.css";

const TILT = ["--tx", "--ty", "--mx", "--my"];

const inView = new Set<Element>();
const mark = () => {
  document.documentElement.dataset.callSeen = "";
  if (inView.size) document.documentElement.dataset.callInView = "";
  else delete document.documentElement.dataset.callInView;
};

function Grain({ id, matrix }: { id: string; matrix: string }) {
  return (
    <svg className="bcb-gn" aria-hidden="true">
      <filter id={id} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix values={matrix} />
      </filter>
      <rect width="100%" height="100%" filter={"url(#" + id + ")"} />
    </svg>
  );
}

/** The call as a printed ticket: ivory paper body, accent stub on a perforated seam, a hand-drawn arrow. The pointer
 *  tilts the card; the stub lifts on hover and tears back on press. All the states live in bookcallB.css. A hero ticket on
 *  screen sets html[data-call-in-view], which hides the dock's, so there is one call in view at a time. A dock ticket
 *  with `hold` is server-rendered hidden (layout kept) until the first hero observation sets html[data-call-seen], so on
 *  a route with a hero ticket above the fold the hero ticket is the only call painted, and the only LCP candidate. */
export function BookCallB({ src, size, hold }: { src: string; size: "dock" | "hero"; hold?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const id = "g" + useId().replace(/\W/g, "");
  useEffect(() => {
    const el = ref.current;
    if (size !== "hero" || !el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) inView.add(el);
      else inView.delete(el);
      mark();
    });
    io.observe(el);
    return () => {
      io.disconnect();
      inView.delete(el);
      mark();
    };
  }, [size]);
  return (
    <Link
      ref={ref}
      href={callHref(src)}
      onClick={openBooking(src)}
      className="bcb"
      data-size={size}
      data-hold={hold ? "" : undefined}
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
          <Grain id={id + "b"} matrix="0 0 0 0 .25 0 0 0 0 .18 0 0 0 0 .1 .4 0 0 0 -.14" />
          <Image className="bcb-face" src="/design/jawad-face-96.webp" alt="" width={96} height={96} sizes="48px" />
          <span className="bcb-text">
            <b>book a call</b>
            <small>15 min, video</small>
          </span>
          <i className="bcb-stamp" aria-hidden="true" />
        </span>
        <span className="bcb-stub">
          <Grain id={id + "s"} matrix="0 0 0 0 .4 0 0 0 0 .1 0 0 0 0 0 .4 0 0 0 -.14" />
          <svg className="bcb-arrow" viewBox="0 0 28 20" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path pathLength="1" d="M3.2 11.6C8 10.5 13.5 12.3 23.4 10.7" />
            <path pathLength="1" d="M17.6 4.6C19.6 6.9 21.9 8.9 24.2 10.8 22 12.9 19.6 15 17.2 17.4" />
          </svg>
        </span>
      </span>
    </Link>
  );
}
