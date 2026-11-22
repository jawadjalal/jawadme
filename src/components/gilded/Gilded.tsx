"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { callHref, openBooking } from "@/components/cal";
import { MAIL, copyEmail, trackEmail } from "@/lib/mail";
import "./gilded.css";

type Props =
  | { variant: "cta"; src: string; size: "dock" | "hero"; hold?: boolean }
  | { variant: "arm"; src: string }
  | { variant: "email"; src: string; children?: ReactNode }
  | { variant: "pill"; href: string; selected?: boolean; onClick?: () => void; call?: boolean; children: ReactNode }
  | { variant: "filter"; href: string; selected?: boolean; children: ReactNode }
  | { variant: "filter"; onClick: () => void; selected?: boolean; children: ReactNode };

const inView = new Set<Element>();
const mark = () => {
  document.documentElement.dataset.callSeen = "";
  if (inView.size) document.documentElement.dataset.callInView = "";
  else delete document.documentElement.dataset.callInView;
};

/** Every button and button-like link on the site, gilded: a gold-leaf frame of flat hard-edged bands with our own fret
 *  cut into it, a dark enamel face, mint-inlaid rivets and a mint groove under the label that lights on hover and focus.
 *  cta is the book-a-call that opens to "· [jawad] + you": its plate is drawn at the open width and clipped back to the
 *  label, the right cap rides the clip edge, so the label never moves and nothing lays out. A tap holds it open on touch,
 *  then navigates. arm is the call as the footer pillar's sign, email the frame with a warmer face, pill and filter the
 *  small rounded forms with a thin fret rim and a selected state. Like BookCallB, a hero cta in view sets
 *  html[data-call-in-view] and the first observation sets html[data-call-seen], which releases a dock cta with `hold`; a
 *  pill with `call` (the call set as a pill) counts the same way. */
export function Gilded(p: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const more = useRef<HTMLSpanElement>(null);
  const touch = useRef(false);
  const copiedFor = useRef(0);
  const [copied, setCopied] = useState(false);
  useEffect(() => () => window.clearTimeout(copiedFor.current), []);
  const router = useRouter();
  const cta = p.variant === "cta";
  const watch = (cta && p.size === "hero") || (p.variant === "pill" && !!p.call);
  useEffect(() => {
    const el = ref.current;
    const m = more.current;
    if (!el) return;
    const ro = m ? new ResizeObserver(() => el.style.setProperty("--mw", m.offsetWidth + "px")) : null;
    if (m) ro?.observe(m);
    if (!watch) return () => ro?.disconnect();
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) inView.add(el);
      else inView.delete(el);
      mark();
    });
    io.observe(el);
    return () => {
      ro?.disconnect();
      io.disconnect();
      inView.delete(el);
      mark();
    };
  }, [watch]);

  const face = (label: ReactNode) => (
    <>
      <span className="gl-s" aria-hidden="true">
        <span className="gl-p">
          <i className="gl-fr" />
          <i className="gl-fr" />
          {(cta || p.variant === "email" || p.variant === "arm") && <i className="gl-c" />}
          {(cta || p.variant === "email") && <i className="gl-c gl-cr" />}
          <i className="gl-sw" />
          <i className="gl-f" />
          {cta && (
            <span className="gl-m" ref={more}>
              <b>·</b>
              <Image className="gl-a" src="/design/jawad-face-96.webp" alt="" width={96} height={96} sizes="40px" />
              <b>+ you</b>
            </span>
          )}
        </span>
      </span>
      <span className="gl-t">{label}</span>
    </>
  );

  if (p.variant === "filter" && !("href" in p)) {
    return (
      <button type="button" className="gl" data-v="filter" aria-pressed={!!p.selected} onClick={p.onClick}>
        {face(p.children)}
      </button>
    );
  }
  if (p.variant === "email") {
    return (
      <a
        href={MAIL}
        className="gl"
        data-v="email"
        data-mail=""
        data-copied={copied ? "" : undefined}
        onClick={() => {
          trackEmail(p.src);
          copyEmail().then((ok) => {
            if (!ok) return;
            setCopied(true);
            window.clearTimeout(copiedFor.current);
            copiedFor.current = window.setTimeout(() => setCopied(false), 1800);
          });
        }}
      >
        {face(p.children ?? "email me")}
        <span className="mail-tag" aria-hidden="true">
          copied
        </span>
      </a>
    );
  }
  if (p.variant === "pill" || p.variant === "filter") {
    return (
      <Link
        ref={ref}
        href={p.href}
        className="gl"
        data-v={p.variant}
        aria-current={p.selected ? "page" : undefined}
        scroll={p.variant === "filter" ? false : undefined}
        onClick={p.variant === "pill" ? p.onClick : undefined}
      >
        {face(p.children)}
      </Link>
    );
  }

  const href = callHref(p.src);
  const click = (e: MouseEvent<HTMLAnchorElement>) => {
    openBooking(p.src)(e);
    const tapped = touch.current;
    touch.current = false;
    if (!cta || !tapped || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setTimeout(() => router.push(href), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 340);
  };
  return (
    <Link
      ref={ref}
      href={href}
      className="gl"
      data-v={p.variant}
      data-size={cta ? p.size : undefined}
      data-hold={cta && p.hold ? "" : undefined}
      data-cursor="book"
      onPointerDown={(e) => {
        touch.current = e.pointerType !== "mouse";
        if (cta && touch.current) e.currentTarget.dataset.open = "";
      }}
      onPointerUp={(e) => {
        const el = e.currentTarget;
        if (el.dataset.open !== undefined) setTimeout(() => delete el.dataset.open, 900);
      }}
      onPointerCancel={(e) => delete e.currentTarget.dataset.open}
      onClick={click}
    >
      {face("book a call")}
    </Link>
  );
}
