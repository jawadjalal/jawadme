"use client";

// The viewer: press any picture on the wall and it opens full screen on a dark ground, with its caption, a way to share
// it on X and a way to hire him. A breakdown opens as its carousel (cover, then its slides). The arrows, the arrow
// keys and a swipe step through slides first, then on to the next piece; Escape or the ground closes it.
//
// Every piece has its own address, /w/<file>, which the share button posts. That page is the home page with this
// viewer already open on the piece, and its link card on X is the piece itself, so a shared ad unfurls as the ad.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { captionOf, type Picture } from "@/content/feed";

const BASE = "/work/2026-11";
const SITE = "https://jawadjalal.com";

/** the frames a piece shows: its own picture (or loop), then any breakdown slides */
const framesOf = (p: Picture) => [p.file, ...(p.slides ?? [])];


export function Viewer({ pieces, initial, hire }: { pieces: Picture[]; initial?: string; hire: string }) {
  const [at, setAt] = useState<{ i: number; f: number } | null>(() => {
    const i = initial ? pieces.findIndex((p) => p.file === initial) : -1;
    return i >= 0 ? { i, f: 0 } : null;
  });
  const [copied, setCopied] = useState(false);
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const open = at !== null;
  const p = at ? pieces[at.i] : null;
  const frames = useMemo(() => (p ? framesOf(p) : []), [p]);

  const show = useCallback(
    (file: string) => {
      const i = pieces.findIndex((x) => x.file === file);
      if (i < 0) return;
      lastFocus.current = document.activeElement as HTMLElement;
      setAt({ i, f: 0 });
    },
    [pieces],
  );

  const close = useCallback(() => {
    setAt(null);
    lastFocus.current?.focus?.();
  }, []);

  const step = useCallback(
    (d: 1 | -1) =>
      setAt((cur) => {
        if (!cur) return cur;
        const n = framesOf(pieces[cur.i]).length;
        const f = cur.f + d;
        if (f >= 0 && f < n) return { i: cur.i, f };
        const i = (cur.i + d + pieces.length) % pieces.length;
        return { i, f: d === 1 ? 0 : framesOf(pieces[i]).length - 1 };
      }),
    [pieces],
  );

  // any tile on the wall opens the viewer (one listener, so the drifting copies and later passes need no wiring)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const t = (e.target as HTMLElement).closest?.<HTMLElement>(".tile[data-file]");
      if (!t) return;
      e.preventDefault();
      show(t.dataset.file!);
    };
    const onKey = (e: KeyboardEvent) => {
      if ("viewer" in document.documentElement.dataset) return;
      const t = (e.target as HTMLElement).closest?.<HTMLElement>(".tile[data-file]");
      if (t && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        show(t.dataset.file!);
      }
    };
    addEventListener("click", onClick);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("click", onClick);
      removeEventListener("keydown", onKey);
    };
  }, [show]);

  // ?w=<file> opens a piece straight away (the old-style link; /w/<file> is the shared one)
  useEffect(() => {
    if (initial) return;
    const q = new URLSearchParams(location.search).get("w");
    if (q) show(q);
  }, [initial, show]);

  // while open: the address is the piece's own, the page under it does not scroll or drift, keys work
  useEffect(() => {
    const root = document.documentElement;
    // the page behind the viewer takes no focus while it is open
    const behind = document.querySelectorAll<HTMLElement>(".pf > :not(.vw)");
    behind.forEach((el) => (el.inert = !!p));
    if (!p) {
      delete root.dataset.viewer;
      if (location.pathname.startsWith("/w/")) history.replaceState(null, "", "/");
      return;
    }
    root.dataset.viewer = "";
    history.replaceState(null, "", `/w/${p.file}`);
    closeBtn.current?.focus({ preventScroll: true });
    setCopied(false);
  }, [p]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    addEventListener("keydown", onKey, true);
    return () => removeEventListener("keydown", onKey, true);
  }, [open, close, step]);

  // the next frame is fetched while this one is looked at, so stepping never waits
  useEffect(() => {
    if (!at) return;
    const n = frames[at.f + 1] ?? framesOf(pieces[(at.i + 1) % pieces.length])[0];
    const img = new Image();
    img.src = `${BASE}/${n}.webp`;
  }, [at, frames, pieces]);

  const touch = useRef<{ x: number; y: number } | null>(null);

  if (!p || !at) return null;

  const file = frames[at.f];
  const url = `${SITE}/w/${p.file}`;
  const caption = captionOf(p);
  const tweet = `${caption.replace(/, unsolicited$/, "")}. Made by @jawadmakes`;
  const intent = `https://x.com/intent/post?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(url)}`;
  const isVideo = at.f === 0 && p.video;

  return (
    <div
      className="vw"
      role="dialog"
      aria-modal="true"
      aria-label={caption}
      onClick={(e) => e.target === e.currentTarget && close()}
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        const s = touch.current;
        touch.current = null;
        if (!s) return;
        const dx = e.changedTouches[0].clientX - s.x;
        const dy = e.changedTouches[0].clientY - s.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
        else if (dy > 90) close();
      }}
    >
      <div className="vw-top">
        <span className="vw-count">
          {String(at.i + 1).padStart(2, "0")} <i>/ {pieces.length}</i>
        </span>
        <button ref={closeBtn} className="vw-x" onClick={close} aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div className="vw-stage" onClick={(e) => e.target === e.currentTarget && close()}>
        {isVideo ? (
          <video key={file} className="vw-media" src={`${BASE}/${p.video}`} poster={`${BASE}/${file}.webp`} autoPlay muted loop playsInline />
        ) : (
          <img key={file} className="vw-media" src={`${BASE}/${file}.webp`} alt={at.f === 0 ? p.alt : `${p.alt} Slide ${at.f + 1} of ${frames.length}.`} />
        )}
        <button className="vw-nav vw-prev" onClick={() => step(-1)} aria-label="Previous">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button className="vw-nav vw-next" onClick={() => step(1)} aria-label="Next">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="vw-bar">
        <div className="vw-cap">
          <p>
            <b>{p.brand}</b> {p.what}
            {p.unsolicited ? <em>unsolicited</em> : null}
          </p>
          {frames.length > 1 ? (
            <div className="vw-dots" role="tablist" aria-label="Slides">
              {frames.map((f, k) => (
                <button key={f} role="tab" aria-selected={k === at.f} aria-label={`Slide ${k + 1}`} onClick={() => setAt({ i: at.i, f: k })} />
              ))}
            </div>
          ) : null}
        </div>
        <div className="vw-acts">
          <a className="vw-btn" href={intent} target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="vw-xlogo">
              <path d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.3l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.9Zm-1.1 16.2h1.7L7.4 4.7H5.6Z" />
            </svg>
            Share
          </a>
          <button
            className="vw-btn"
            onClick={() => {
              navigator.clipboard?.writeText(url).then(() => setCopied(true), () => {});
            }}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <a className="vw-btn vw-hire" href={hire}>
            Want one? Call me
          </a>
        </div>
      </div>
    </div>
  );
}
