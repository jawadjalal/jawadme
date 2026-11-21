"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { callHref, openBooking } from "@/components/cal";
import { MAIL, trackEmail } from "@/components/MailLink";
import "./gildedB.css";

type Size = "dock" | "hero";

export type GildedProps =
  | { variant: "cta"; src: string; size: Size }
  | { variant: "arm"; src: string }
  | { variant: "email"; src: string; size?: Size; children?: ReactNode }
  | { variant: "pill"; href: string; src?: string; selected?: boolean; children: ReactNode }
  | { variant: "filter"; selected: boolean; onClick?: () => void; children: ReactNode };

/** A frame at the left end and one at the right: a stepped fret, our own square meander, cut as a stroke. */
const Fret = () => (
  <svg className="g-ft" viewBox="0 0 16 12" aria-hidden="true">
    <path d="M1 11V1h14v10H5V5h6v3" />
  </svg>
);

/** The frame, the label and, for the cta, the drawer. Every state lives in gildedB.css as three numbers on the root
 *  (--hv hover, --pr press, --fc focus), so the server-rendered markup is the collapsed state and nothing here needs JS. */
function Parts({ you, children }: { you?: boolean; children: ReactNode }) {
  return (
    <>
      <span className="g-box" aria-hidden="true">
        <i className="g-bed" />
        <i className="g-body">
          <i className="g-a" />
          <i className="g-c" />
          <i className="g-sw" />
          <i className="g-face">
            <Fret />
            <Fret />
            <i className="g-gr" />
          </i>
        </i>
      </span>
      <span className="g-lbl">{children}</span>
      {you && (
        <span className="g-x" aria-hidden="true">
          <i className="g-dia" />
          <Image src="/design/jawad-face-96.webp" alt="" width={96} height={96} sizes="32px" />
          <span className="g-you">
            {[..."+ you"].map((c, i) => (
              <b key={i} style={{ "--i": i } as React.CSSProperties}>
                {c === " " ? "\u00a0" : c}
              </b>
            ))}
          </span>
        </span>
      )}
    </>
  );
}

/** One gilded frame for every button and button-like link on the site: a hand-tooled gold plate with stepped lintel
 *  corners and an engraved line, a deep ink face, a mint inlay groove under the label. Hover sweeps light across the
 *  gold; press drops the face into the frame. The cta also opens like a drawer to "+ you" and the avatar; on touch the
 *  press shows that, then navigates. Reduced motion skips every transition and shows the opened state at once. */
export function GildedB(p: GildedProps) {
  const router = useRouter();
  const ref = useRef<HTMLAnchorElement>(null);
  const touch = useRef(false);

  if (p.variant === "filter") {
    return (
      <button type="button" className="g" data-v="filter" aria-pressed={p.selected} onClick={p.onClick}>
        <Parts>{p.children}</Parts>
      </button>
    );
  }

  if (p.variant === "email") {
    return (
      <a className="g" data-v="email" data-size={p.size ?? "dock"} href={MAIL} onClick={() => trackEmail(p.src)}>
        <Parts>{p.children ?? "email me"}</Parts>
      </a>
    );
  }

  const href = p.variant === "pill" ? p.href : callHref(p.src);
  const src = p.src;
  const click = (e: MouseEvent<HTMLAnchorElement>) => {
    if (src) openBooking(src)(e);
    const el = ref.current;
    if (p.variant !== "cta" || !touch.current || !el || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    el.dataset.held = "";
    window.setTimeout(() => router.push(href), 240);
    window.setTimeout(() => delete el.dataset.held, 1400);
  };
  return (
    <Link
      ref={ref}
      href={href}
      className="g"
      data-v={p.variant}
      data-size={p.variant === "cta" ? p.size : undefined}
      aria-current={p.variant === "pill" && p.selected ? "page" : undefined}
      data-cursor={src ? "book" : undefined}
      onPointerDown={(e) => (touch.current = e.pointerType !== "mouse")}
      onTouchStart={() => {}}
      onClick={click}
    >
      <Parts you={p.variant === "cta"}>{p.variant === "pill" ? p.children : "book a call"}</Parts>
    </Link>
  );
}
