"use client";

/*
 * The bar, after ignaru.com's (components/home/Dock.tsx, v10.4 to v12.2): a tab hanging flush from the screen's top edge.
 * On the left Jawad's face and name; three links with their own small felt marks (Work and About open drawers, Blog is
 * a page); "more", whose sheet drops down with every drawer; and on the right a quiet email link and one key, Book a
 * call. Every link is a real link underneath, so it works without script. With a drawer open the bar recedes into the
 * column beside it and keeps only the name and a drawn "close" (the page under a modal drawer is inert, so a press
 * there lands on the drawer's backdrop, which closes it). The notch at the foot holds the socials and the CV and steps
 * down while a drawer is open. On a phone the bar is one row: the face, the name, "more" and the key. Styles: felt.css
 * (`fh-bar`, `fh-notch`).
 */
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { BOOK, CV, DRAWERS, EMAIL, NAV, feltSrc, type DrawerId } from "./copy";
import { MeetMark } from "./Meet";
import { Socials } from "./Socials";

const plain = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

export function Nav({ at, onGo }: { at: DrawerId | null; onGo: (id: DrawerId) => void }) {
  const [more, setMore] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const moreBtn = useRef<HTMLButtonElement>(null);
  // the sheet moves focus into itself when it opens; Escape closes it and puts focus back on "More"
  useEffect(() => {
    if (!more) return;
    box.current?.querySelector<HTMLElement>("#fh-more a")?.focus();
    const off = (e: Event) => {
      if (e instanceof KeyboardEvent) {
        if (e.key !== "Escape") return;
        setMore(false);
        moreBtn.current?.focus();
      } else if (!box.current?.contains(e.target as Node)) setMore(false);
    };
    document.addEventListener("pointerdown", off);
    document.addEventListener("keydown", off);
    return () => {
      document.removeEventListener("pointerdown", off);
      document.removeEventListener("keydown", off);
    };
  }, [more]);
  const inMain = at !== null && NAV.some((n) => n.id === at);
  return (
    <>
      <header className={`fh-bar${at ? " is-drawn" : ""}`}>
        <div className="fh-bar-in" ref={box}>
          <a
            className="fh-me"
            href="/#about"
            onClick={(e) => {
              if (!plain(e)) return;
              e.preventDefault();
              onGo("about");
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/felt/jawad-av-96.webp" srcSet="/felt/jawad-av-96.webp 1x, /felt/jawad-av.webp 2x" alt="" width={28} height={28} />
            <b>Jawad Jalal</b>
          </a>
          <span className="fh-bar-x" aria-hidden="true">
            <svg viewBox="0 0 12 12" width="11" height="11" focusable="false">
              <path d="M3 3l6 6M9 3 3 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            close
            <small>esc</small>
          </span>
          <nav className="fh-nav" aria-label="Jawad Jalal">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={n.href}
                className={`fh-nl${at === n.id ? " is-on" : ""}`}
                aria-haspopup={n.id === "blog" ? undefined : "dialog"}
                onClick={(e) => {
                  if (n.id === "blog" || !plain(e)) return;
                  e.preventDefault();
                  setMore(false);
                  onGo(n.id);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={feltSrc(n.art).src} alt="" width={48} height={48} decoding="async" />
                <span>{n.label}</span>
              </a>
            ))}
            <button ref={moreBtn} type="button" className={`fh-nl fh-nl-more${at && !inMain ? " is-on" : ""}`} aria-expanded={more} aria-controls="fh-more" onClick={() => setMore((m) => !m)}>
              <span className="fh-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>More</span>
            </button>
          </nav>
          <div className="fh-keys">
            <a className="fh-quiet" href={`mailto:${EMAIL}`}>
              Email
              <Arrow />
            </a>
            <a className="fh-key" href={BOOK} target="_blank" rel="noreferrer">
              <MeetMark size={17} />
              <span>
                Book<span className="fh-key-long"> a call</span>
              </span>
            </a>
          </div>
          <div id="fh-more" className="fh-more" hidden={!more}>
            {DRAWERS.map((d) => (
              <a
                key={d.id}
                className={`fh-nl${at === d.id ? " is-on" : ""}`}
                href={`/#${d.id}`}
                aria-haspopup="dialog"
                onClick={(e) => {
                  if (!plain(e)) return;
                  e.preventDefault();
                  // the drawer hands focus back to whatever had it when it opened: make that "More", not a link in a sheet that is closing
                  moreBtn.current?.focus();
                  setMore(false);
                  onGo(d.id);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={feltSrc(d.art).src} alt="" width={48} height={48} loading="lazy" decoding="async" />
                <span>{d.label}</span>
              </a>
            ))}
            <a className="fh-nl" href="/blog">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={feltSrc("nav-blog").src} alt="" width={48} height={48} loading="lazy" decoding="async" />
              <span>Blog</span>
            </a>
          </div>
        </div>
      </header>
      <aside className={`fh-notch${at ? " is-drawn" : ""}`} aria-label="Elsewhere">
        <Socials />
        <a className="fh-notch-cv" href={CV} download>
          CV
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M6 2v6M3.5 5.8 6 8.3l2.5-2.5M2.5 10h7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </aside>
    </>
  );
}

/** A hairline up-right arrow, 11px, in the link's own ink; it nudges up and right on hover. */
export function Arrow() {
  return (
    <svg className="fh-arrow" viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" focusable="false">
      <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
