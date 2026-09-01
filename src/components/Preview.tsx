"use client";

// The hover card: a look at whatever a link names.
//
// Three decisions worth writing down.
//
// **It is a local file, never a fetch.** The old site had a route that took a
// URL and fetched its og:image. An endpoint that fetches whatever URL a caller
// hands it is an open proxy: it will reach into a private network or an
// instance metadata endpoint on the caller's behalf. Every shot here comes
// from `profile.ts`, so the set of things this can ever show is written down.
//
// **It mounts on first hover and stays mounted.** Eleven screenshots loaded
// eagerly is most of the page's weight spent on cards a given reader will
// mostly never open. Once opened it is kept, so returning to a link is
// instant rather than re-running the loader.
//
// **It centres on the link, but clamps.** Centring alone put the card at
// x = -65 for links near the column's left margin, which is where most of
// these sit, so half of it was clipped. The transform below centres it and
// then pulls it back inside the viewport when that would overhang.

import Image from "next/image";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";

export type PreviewProps = {
  /** The screenshot, under /public. */
  shot?: string;
  /** Shown instead of a screenshot when there is nothing to shoot yet. */
  emoji?: string;
  /** Named under the art, so the card says where the link goes. */
  label?: string;
  children: React.ReactNode;
};

/** Kept clear of the viewport edge by this much. */
const MARGIN = 12;

export function Preview({ shot, emoji, label, children }: PreviewProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [shift, setShift] = useState(0);
  const card = useRef<HTMLSpanElement>(null);
  const timer = useRef(0);
  const id = useId();

  // Measured after layout, before paint, so the card is never seen in the
  // wrong place for a frame.
  const clamp = useCallback(() => {
    const el = card.current;
    if (!el) return;
    const prev = el.style.getPropertyValue("--pv-shift");
    el.style.setProperty("--pv-shift", "0px");
    const r = el.getBoundingClientRect();
    let dx = 0;
    if (r.left < MARGIN) dx = MARGIN - r.left;
    else if (r.right > window.innerWidth - MARGIN) dx = window.innerWidth - MARGIN - r.right;
    el.style.setProperty("--pv-shift", prev);
    setShift(dx);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    clamp();
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, [open, clamp]);

  if (!shot && !emoji) return <>{children}</>;

  // A short hold before opening, or dragging the pointer across a paragraph
  // fires every card on the way past.
  const show = () => {
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setMounted(true);
      setOpen(true);
    }, 90);
  };

  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <span
      className="pv-anchor"
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {mounted && (
        <span
          ref={card}
          id={id}
          role="tooltip"
          className={`pv-card ${open ? "is-open" : ""}`}
          style={{ ["--pv-shift" as string]: `${shift}px` }}
        >
          <span className="pv-frame">
            {emoji ? (
              <span className="pv-emoji" aria-hidden="true">
                {emoji}
              </span>
            ) : (
              <>
                {/* Under the image, removed on load, so the frame is never
                    empty and never flashes a broken box. */}
                {!loaded && <span className="pv-load" aria-hidden="true" />}
                <Image
                  src={shot!}
                  alt=""
                  width={640}
                  height={400}
                  className="pv-shot"
                  onLoad={() => setLoaded(true)}
                  aria-hidden="true"
                />
              </>
            )}
          </span>
          {label && <span className="pv-foot font-mono">{label}</span>}
        </span>
      )}
    </span>
  );
}
