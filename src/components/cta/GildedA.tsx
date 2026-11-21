"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { callHref, openBooking } from "@/components/cal";
import "./gildedA.css";

type Props =
  | { variant: "cta"; src: string; size: "dock" | "hero" }
  | { variant: "arm"; src: string }
  | { variant: "email"; href: string; children: string }
  | { variant: "pill" | "filter"; href: string; children: string; selected?: boolean };

/** Every button and button-like link on the site, gilded: a gold-leaf bezel with an engraved fret, a black-enamel face
 *  and a mint inlay that lights on hover. cta is the book-a-call that slides open to "[jawad] + you"; arm is the same
 *  call as the footer pillar's pointing sign; email is the frame with a quieter face; pill and filter are the small
 *  rounded forms, with a selected state. The cta's plate is drawn at its open width and clipped back to the label,
 *  and its right end cap rides the clip edge on a transform, so the label never reflows and nothing lays out on hover.
 *  The open width is the only measurement (--mw); before it lands the button is closed and correct. */
export function GildedA(p: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const more = useRef<HTMLSpanElement>(null);
  const router = useRouter();
  useEffect(() => {
    const m = more.current;
    if (!m) return;
    const ro = new ResizeObserver(() => ref.current?.style.setProperty("--mw", m.offsetWidth + "px"));
    ro.observe(m);
    return () => ro.disconnect();
  }, []);
  const book = "src" in p;
  const href = book ? callHref(p.src) : p.href;
  const cta = p.variant === "cta";
  const framed = cta || p.variant === "email" || p.variant === "arm";
  const selected = "selected" in p && p.selected;
  return (
    <Link
      ref={ref}
      href={href}
      className="gd"
      data-v={p.variant}
      data-size={cta ? p.size : undefined}
      data-cursor={book ? "book" : undefined}
      aria-current={selected ? (p.variant === "pill" ? "page" : "true") : undefined}
      onPointerDown={cta ? (e) => e.pointerType !== "mouse" && (e.currentTarget.dataset.open = "") : undefined}
      onPointerUp={cta ? (e) => { const el = e.currentTarget; setTimeout(() => delete el.dataset.open, 900); } : undefined}
      onPointerCancel={cta ? (e) => delete e.currentTarget.dataset.open : undefined}
      onClick={
        book
          ? (e) => {
              openBooking(p.src)(e);
              const t = (e.nativeEvent as PointerEvent).pointerType;
              if (!cta || e.defaultPrevented || (t !== "touch" && t !== "pen")) return;
              e.preventDefault();
              setTimeout(() => router.push(href), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 340);
            }
          : undefined
      }
    >
      <span className="gd-s" aria-hidden="true">
        <span className="gd-p">
          <i className="gd-sw" />
          {framed && <i className="gd-fr gd-fl" />}
          {framed && <i className="gd-fr" />}
          <i className="gd-f" />
          {cta && (
            <span className="gd-m" ref={more}>
              <b>·</b>
              <Image className="gd-a" src="/design/jawad-face-96.webp" alt="" width={96} height={96} sizes="40px" />
              <b>+ you</b>
            </span>
          )}
        </span>
        {framed && <i className="gd-c" />}
        {cta && <i className="gd-c gd-cr" />}
      </span>
      <span className="gd-t">{book ? "book a call" : p.children}</span>
    </Link>
  );
}
