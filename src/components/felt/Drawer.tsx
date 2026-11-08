"use client";

/*
 * The drawers, after ignaru.com's (components/home/Drawers.tsx, Kit.tsx) and wonder.design's bento drawers: one native
 * modal <dialog>, square, a full-height panel on the right that springs in (a full sheet that slides up on a phone and
 * closes with a swipe down from its top). Its top bar is solid: back, next, where you are, close.
 *
 * Each drawer opens on a claim of two lines with one word given a hand (circled, underlined, set in the serif, or
 * printed misregistered like a Spider-Verse panel), one short line and a felt piece; then a bento of cells of
 * different sizes, each holding a real thing: the ads, the live sites, Ignaru's canvas. Five drawers: work (a line
 * about him, then his ads and sites), ads, sites, Ignaru and contact. The key is the paper ink block in a tray at the
 * drawer's foot, with email or a call beside it, so the next step is one tap from anywhere in a drawer. Past a drawer's
 * end (or with a wheel on the page beside it) the next door's drawer comes in. Pictures open full size. Styles:
 * felt.css (`fh-dr`, `kx-`, `bx-`, `ty-`).
 */
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { dayLink, type Booking } from "./booking";
import { ASIDE, BOOK, CV, DRAWERS, EMAIL, SETS, SITES, drawerAt, feltSrc, lift, type Ad, type AdSet, type DrawerId, type Site } from "./copy";
import { MeetMark } from "./Meet";
import { SOCIALS } from "./Socials";
import { sfx } from "./Sound";

type Zoom = { src: string; alt: string; tall?: boolean } | null;
/** How far past a drawer's end to scroll (or pull, on a phone) before the next one comes in. */
const PAST = 320;

export function Drawer({ booking, at, onClose, onGo }: { booking: Booking; at: DrawerId | null; onClose: () => void; onGo: (id: DrawerId) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const lb = useRef<HTMLDialogElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<DrawerId>(at ?? "work");
  const [zoom, setZoom] = useState<Zoom>(null);
  const k = drawerAt(shown);
  const next = DRAWERS[k + 1] ?? null;
  const prev = DRAWERS[k - 1] ?? null;
  const nextRef = useRef(next);
  nextRef.current = next;
  const prevRef = useRef(prev);
  prevRef.current = prev;
  const gate = useRef({ busy: false, since: 0, quiet: 0 });

  useEffect(() => {
    if (at !== null) setShown(at);
    const d = ref.current;
    if (!d) return;
    if (at !== null && !d.open) {
      d.showModal();
      d.focus({ preventScroll: true });
      sfx("open");
    } else if (at === null && d.open) d.close();
    if (at !== null) d.scrollTop = 0;
  }, [at]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const done = () => {
      d.style.removeProperty("--drag");
      onClose();
    };
    d.addEventListener("close", done);
    return () => d.removeEventListener("close", done);
  }, [onClose]);
  useEffect(() => {
    const d = lb.current;
    if (!d) return;
    if (zoom && !d.open) d.showModal();
    if (!zoom && d.open) d.close();
  }, [zoom]);

  // While a drawer is open the page holds still. A wheel on the page beside it turns to the next door (up: the one
  // before); inside, a deliberate scroll past its end does the same. One step per gesture (ignaru.com's Drawers.tsx).
  useEffect(() => {
    const d = ref.current;
    if (at === null || !d) return;
    const html = document.documentElement;
    html.classList.add("fh-locked");
    let past = 0;
    let edgeAt = 0;
    let edge = 0;
    let idle = 0;
    let beside = 0;
    const g = gate.current;
    const show = () => cue.current?.style.setProperty("--past", String(Math.min(1, Math.max(0, past) / PAST)));
    const reset = () => {
      past = 0;
      edgeAt = 0;
      show();
    };
    const hold = () => {
      if (!g.busy) return false;
      window.clearTimeout(g.quiet);
      g.quiet = window.setTimeout(() => {
        const left = 800 - (performance.now() - g.since);
        if (left <= 0) g.busy = false;
        else g.quiet = window.setTimeout(() => void (g.busy = false), left);
      }, 400);
      return true;
    };
    const hand = (by: 1 | -1) => {
      const to = by > 0 ? nextRef.current : prevRef.current;
      if (!to) return;
      reset();
      g.busy = true;
      g.since = performance.now();
      hold();
      onGo(to.id);
    };
    const push = (by: number) => {
      const dir = by > 0 ? 1 : -1;
      const max = d.scrollHeight - d.clientHeight;
      const there = dir > 0 ? d.scrollTop >= max - 2 : d.scrollTop <= 0;
      if (!there || !(dir > 0 ? nextRef.current : prevRef.current)) return reset();
      const now = performance.now();
      if (!edgeAt || edge !== dir) {
        edgeAt = now;
        edge = dir;
        past = 0;
      }
      if (now - edgeAt < 350) return;
      past += Math.abs(by);
      if (dir > 0) show();
      window.clearTimeout(idle);
      idle = window.setTimeout(reset, 700);
      if (past >= PAST) hand(dir);
    };
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey || lb.current?.open) return;
      const inside = e.target instanceof Node && d.contains(e.target) && e.target !== d;
      if (!inside) e.preventDefault();
      if (hold()) {
        if (inside) e.preventDefault();
        return;
      }
      if (inside) return push(e.deltaY);
      beside = Math.sign(e.deltaY) === Math.sign(beside) ? beside + e.deltaY : e.deltaY;
      if (Math.abs(beside) >= 60) {
        const by = beside > 0 ? 1 : -1;
        beside = 0;
        hand(by);
      }
    };
    let ty: number | null = null;
    const tstart = (e: TouchEvent) => void (ty = e.touches[0]?.clientY ?? null);
    const tmove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (ty === null || y === undefined || g.busy) return;
      push(ty - y);
      ty = y;
    };
    const tend = () => {
      ty = null;
      if (g.busy) hold();
      reset();
    };
    const keys = (e: KeyboardEvent) => {
      // a tab row inside a drawer (agents, modes, light and dark, the sites' groups) keeps its own arrow keys
      if (lb.current?.open || (e.target as HTMLElement).closest?.('input, [role="tablist"]')) return;
      if (e.key === "ArrowRight" && nextRef.current) onGo(nextRef.current.id);
      if (e.key === "ArrowLeft" && prevRef.current) onGo(prevRef.current.id);
    };
    window.addEventListener("wheel", wheel, { passive: false });
    d.addEventListener("touchstart", tstart, { passive: true });
    d.addEventListener("touchmove", tmove, { passive: true });
    d.addEventListener("touchend", tend);
    d.addEventListener("keydown", keys);
    return () => {
      html.classList.remove("fh-locked");
      window.clearTimeout(idle);
      window.removeEventListener("wheel", wheel);
      d.removeEventListener("touchstart", tstart);
      d.removeEventListener("touchmove", tmove);
      d.removeEventListener("touchend", tend);
      d.removeEventListener("keydown", keys);
    };
  }, [at, onGo]);

  // a phone sheet closes with a swipe down from its top, once it is scrolled to the top
  const drag = useRef<{ y: number; id: number } | null>(null);
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    const d = ref.current;
    if (!d || window.innerWidth > 760 || d.scrollTop > 0 || (e.target as HTMLElement).closest("button, a")) return;
    drag.current = { y: e.clientY, id: e.pointerId };
    d.classList.add("is-drag");
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    ref.current?.style.setProperty("--drag", `${Math.max(0, e.clientY - g.y)}px`);
  };
  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    const d = ref.current;
    if (!g || !d) return;
    drag.current = null;
    d.classList.remove("is-drag");
    if (e.clientY - g.y > 110) d.close();
    else d.style.removeProperty("--drag");
  };

  const s = DRAWERS[k] ?? DRAWERS[0];
  const page = PAGES[s.id];
  const z = (src: string, alt: string, tall?: boolean) => setZoom({ src, alt, tall });
  return (
    <dialog
      ref={ref}
      className="fh-dr"
      tabIndex={-1}
      aria-labelledby="fh-dr-t"
      style={{ "--c": s.color, "--cl": lift(s.color), "--bm": s.color === "#f5b400" ? "10%" : "15%" } as CSSProperties}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.currentTarget.close();
      }}
    >
      <div className="fh-dr-grab" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <span className="fh-dr-handle" aria-hidden="true" />
        <div className="fh-dr-bar">
          <div className="fh-dr-nav">
            <button type="button" onClick={() => prev && onGo(prev.id)} disabled={!prev} aria-label={prev ? `Back to ${prev.label}` : "Back"}>
              <Chev d="M9 3.5 5.5 7 9 10.5" />
            </button>
            <button type="button" onClick={() => next && onGo(next.id)} disabled={!next} aria-label={next ? `Next, ${next.label}` : "Next"}>
              <Chev d="M5 3.5 8.5 7 5 10.5" />
            </button>
            <span className="fh-dr-count" aria-live="polite">
              {s.label} · {k + 1} of {DRAWERS.length}
            </span>
          </div>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Close">
            <Chev d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
          </button>
        </div>
      </div>
      <article className="fh-pg" key={s.id}>
        <header className="kx-top">
          <div>
            <h2 id="fh-dr-t">{page.title}</h2>
            <p className="kx-lede">{page.line}</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={page.mark ? "kx-top-art kx-top-mark" : "kx-top-art"} src={page.mark ?? `/felt/${s.art}.webp`} alt="" width={300} height={300} />
        </header>
        <ul className="bx">{page.body({ booking, z, go: onGo })}</ul>
        <div className="kx-tray">
          <Bar {...page.bar(booking)} />
        </div>
        {next ? (
          <div className="fh-dr-next" ref={cue}>
            <span>
              Keep scrolling for <b>{next.label}</b>
            </span>
            <span className="fh-dr-next-bar" aria-hidden="true" />
          </div>
        ) : (
          <div className="fh-dr-end" />
        )}
      </article>
      <dialog ref={lb} className="fh-lb" aria-label={zoom?.alt ?? "Picture"} onClose={() => setZoom(null)} onClick={() => lb.current?.close()}>
        {zoom && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={zoom.src} alt={zoom.alt} className={zoom.tall ? "is-tall" : undefined} />
        )}
        <button type="button" className="fh-lb-x" aria-label="Close the picture">
          <Chev d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
          Close
        </button>
      </dialog>
    </dialog>
  );
}

const Chev = ({ d }: { d: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const Out = () => (
  <svg className="kx-out" viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
    <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------- type with a hand: the one word in a claim that gets marked ---------- */

/** A word circled in the drawer's colour by a loose pen; it draws itself once the drawer is open. */
function Circ({ children }: { children: ReactNode }) {
  return (
    <span className="ty-circ">
      {children}
      <svg viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path pathLength={1} d="M118 9C70 3 18 10 9 36c-7 22 34 38 92 37 56-1 93-15 90-38C188 13 147 4 92 6 63 7 40 12 27 20" />
      </svg>
    </span>
  );
}

/** A word underlined by the same pen, a little uneven. */
function Under({ children }: { children: ReactNode }) {
  return (
    <span className="ty-under">
      {children}
      <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path pathLength={1} d="M3 9C42 4 88 3 128 6s58 3 69-1" />
      </svg>
    </span>
  );
}

/** A word in the serif, italic: the one font switch in a line. */
const Serif = ({ children }: { children: ReactNode }) => <em className="ty-serif">{children}</em>;

/** A word printed like a Spider-Verse panel: the cyan and magenta plates slip off the key, jump a few frames when the
 *  drawer opens, and jump again under the pointer. The plates are hidden from screen readers. */
function Sv({ children }: { children: string }) {
  return (
    <span className="ty-sv">
      <span className="ty-sv-p ty-sv-c" aria-hidden="true">
        {children}
      </span>
      <span className="ty-sv-p ty-sv-m" aria-hidden="true">
        {children}
      </span>
      <span className="ty-sv-k">{children}</span>
    </span>
  );
}

/* ---------- the bento: cells of different sizes, a real thing in each ---------- */

type Ctx = { booking: Booking; z: (src: string, alt: string, tall?: boolean) => void; go: (id: DrawerId) => void };
type BarProps = { href: string; label: string; glyph?: ReactNode; download?: boolean; also?: { href: string; label: string; download?: boolean } };
type Page = { title: ReactNode; line: ReactNode; mark?: string; bar: (b: Booking) => BarProps; body: (c: Ctx) => ReactNode };

/** The key: the paper ink block in the tray at the drawer's foot, the quiet second way beside it. The block comes first
 *  in the DOM so the keyboard reaches it first; row-reverse puts it in the corner. */
function Bar({ href, label, glyph, download, also }: BarProps) {
  const ext = !href.startsWith("/") && !href.startsWith("mailto:");
  return (
    <div className="kx-bar">
      <a className="kx-ink" href={href} {...(ext ? { target: "_blank", rel: "noreferrer" } : {})} {...(download ? { download: true } : {})}>
        {glyph}
        {label}
        {ext ? <Out /> : null}
      </a>
      {also ? (
        <a className="kx-bar-2" href={also.href} {...(also.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})} {...(also.download ? { download: true } : {})}>
          {also.label}
          <Out />
        </a>
      ) : null}
    </div>
  );
}

type CellProps = { w: 2 | 3 | 4 | 6; tone?: "band" | "light"; title?: ReactNode; line?: ReactNode; more?: ReactNode; side?: boolean; pair?: boolean; className?: string; children: ReactNode };

/** One cell: a short head (what it is, one line, sometimes a way further) and the real thing under it, or beside it
 *  when `side`. `w` is its width in sixths; `band` grounds it in the drawer's colour. On a phone a third-wide cell
 *  runs full width, unless `pair` says the one beside it is a third too, so the two share the row. */
function Cell({ w, tone, title, line, more, side, pair, className = "", children }: CellProps) {
  return (
    <li className={`bx-c w${w}${tone ? ` is-${tone}` : ""}${side ? " is-side" : ""}${pair ? " is-pair" : ""} ${className}`}>
      {title || line || more ? (
        <div className="bx-h">
          {title ? <h3>{title}</h3> : null}
          {line ? typeof line === "string" ? <p>{line}</p> : <div className="bx-l">{line}</div> : null}
          {more}
        </div>
      ) : null}
      <div className="bx-v">{children}</div>
    </li>
  );
}

/** A way further, inside a cell: to another drawer, or out to a live page. */
function More({ label, to, href }: { label: string; to?: () => void; href?: string }) {
  const inner = (
    <>
      {label}
      <Chev d="M5 3.5 8.5 7 5 10.5" />
    </>
  );
  return href ? (
    <a className="bx-more" href={href} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : (
    <button type="button" className="bx-more" onClick={to}>
      {inner}
    </button>
  );
}

/** A picture that opens full size. */
function Shot({ src, small, alt, z, w = 960, h = 1200, tall, sizes, className = "" }: { src: string; small?: string; alt: string; z: Ctx["z"]; w?: number; h?: number; tall?: boolean; sizes?: string; className?: string }) {
  return (
    <button type="button" className={`kx-media ${className}`} onClick={() => z(src, alt, tall)} aria-label={`Open full size: ${alt}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={small ?? src} srcSet={small ? `${small} 480w, ${src} 960w` : undefined} sizes={small ? sizes ?? "(max-width: 760px) 50vw, 300px" : undefined} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
      <span className="kx-expand" aria-hidden="true">
        <i />
        expand
      </span>
    </button>
  );
}

/** An ad at full strength, opening full size. */
const AdShot = ({ a, z, sizes, className }: { a: Ad; z: Ctx["z"]; sizes?: string; className?: string }) => <Shot src={a.src} small={a.small} alt={a.alt} z={z} tall sizes={sizes} className={`bx-ad ${className ?? ""}`} />;

/** A hand of ads from different brands, fanned; they spread under the pointer. The cell's "every set" is the way in. */
function Fan({ ads }: { ads: Ad[] }) {
  return (
    <div className="bx-fan" style={{ "--n": ads.length } as CSSProperties}>
      {ads.map((a, i) => (
        <div key={a.src} className="bx-fan-i" style={{ "--i": i } as CSSProperties}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.small} srcSet={`${a.small} 480w, ${a.src} 960w`} sizes="(max-width: 760px) 40vw, 220px" alt={a.alt} width={480} height={600} loading="lazy" decoding="async" />
        </div>
      ))}
    </div>
  );
}

/** A brand's whole set: one ad large, and beside it the four, each by what it says, to pick from (pointing at one shows it). */
function SetCell({ s, z, w = 6, also }: { s: AdSet; z: Ctx["z"]; w?: 4 | 6; also?: ReactNode }) {
  const [i, setI] = useState(0);
  const a = s.ads[i] ?? s.ads[0];
  return (
    <li className={`bx-c w${w} is-band bx-set`}>
      <div className="bx-set-big">
        <AdShot key={a.src} a={a} z={z} sizes="(max-width: 760px) 90vw, 420px" className="bx-set-in" />
      </div>
      <div className="bx-set-side">
        <div className="bx-h">
          <h3>{s.brand}</h3>
          <p>{s.says}</p>
          {also}
        </div>
        <ul className="bx-set-pick" aria-label={`${s.brand}: the four ads`}>
          {s.ads.map((x, k) => (
            <li key={x.src}>
              <button type="button" aria-pressed={k === i} onClick={() => setI(k)} onPointerEnter={(e) => e.pointerType === "mouse" && setI(k)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={x.small} alt="" width={480} height={600} loading="lazy" decoding="async" />
                <span>{x.says}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

/** A live site in a plain window: its address, the first screen, and (where there is one) the whole page scrolling
 *  past under the pointer. Opens the site. */
function Win({ w, narrow, sizes = "(max-width: 760px) 100vw, 560px" }: { w: Site; narrow?: boolean; sizes?: string }) {
  // a narrow window shows the whole-page capture from its top, where there is one
  const img = narrow && w.tall ? { src: w.tall, w: 720, h: 1350 } : { src: w.img, w: w.w, h: w.h };
  return (
    <a className={`bx-win${w.tall ? " has-tall" : ""}`} href={`https://${w.host}`} target="_blank" rel="noreferrer" style={w.tall ? ({ "--tall": `url(${w.tall})` } as CSSProperties) : undefined}>
      <span className="bx-win-bar">
        <span>{w.host}</span>
        <Out />
      </span>
      <span className="bx-win-view">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.src} alt={`${w.name}, the first screen`} width={img.w} height={img.h} sizes={sizes} loading="lazy" decoding="async" />
      </span>
    </a>
  );
}

/** A site's cell: its window, its name, what it is. */
function SiteCell({ k, w, line, pair }: { k: string; w: 2 | 3 | 4 | 6; line?: boolean; pair?: boolean }) {
  const site = SITES.find((x) => x.key === k);
  if (!site) return null;
  return (
    <Cell w={w} pair={pair} title={site.name} line={line === false ? undefined : site.line} className={`bx-site${w === 2 ? " is-narrow" : ""}`}>
      <Win w={site} narrow={w === 2} sizes={w === 6 ? "(max-width: 760px) 100vw, 840px" : w === 2 ? "(max-width: 760px) 50vw, 280px" : "(max-width: 760px) 100vw, 560px"} />
    </Cell>
  );
}

/** A short list, a small square of the drawer's colour to each line. */
const Dots = ({ items }: { items: ReactNode[] }) => (
  <ul className="bx-dots">
    {items.map((t, i) => (
      <li key={i}>{t}</li>
    ))}
  </ul>
);

/** Copies the address and opens mail, saying so for a moment. */
function EmailLink() {
  const [got, setGot] = useState(false);
  return (
    <a
      className="bx-mail"
      href={`mailto:${EMAIL}`}
      onClick={() => {
        // copying can be refused (no permission, an insecure context): mail still opens, the label just says less
        navigator.clipboard
          ?.writeText(EMAIL)
          .then(() => {
            setGot(true);
            window.setTimeout(() => setGot(false), 1600);
          })
          .catch(() => undefined);
      }}
    >
      <span>{got ? "copied, opening mail" : EMAIL}</span>
      <Out />
    </a>
  );
}

/** okara.ai's own mark (its `landing-mark` symbol), in the ink of whatever it sits in. */
function OkaraMark({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 250 310" width={size} height={(size * 310) / 250} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M221.74 259.537H194.023V309.933H166.306V259.537H194.022V209.142H166.305V259.537H138.588V209.142H110.87V259.537H83.1533V309.933H55.4355V259.537H83.1523V209.142H55.4346V259.537H27.7178V181.424H221.74V259.537ZM138.588 309.933H110.87V259.537H138.588V309.933ZM27.7178 181.424H0V55.4355H27.7178V181.424ZM249.458 181.424H221.74V55.4355H249.458V181.424ZM86.9326 136.067H59.2148V80.6328H86.9326V136.067ZM190.243 136.067H162.525V80.6328H190.243V136.067ZM55.4346 55.4355H27.7178V27.7178H55.4346V55.4355ZM194.023 27.7178H221.74V55.4355H194.022V27.7178H55.4355V0H194.023V27.7178Z"
      />
    </svg>
  );
}

const call = { href: BOOK, label: "book a call" };
const mail = { href: `mailto:${EMAIL}`, label: "email me" };

/** Before Ignaru: the two companies, each with its own mark in the line, and the work beside them. */
function Before({ z }: { z: Ctx["z"] }) {
  return (
    <Cell
      w={6}
      side
      title="Before Ignaru."
      className="bx-before"
      line={
        <Dots
          items={[
            <>
              <span className="bx-mk bx-mk-ok">
                <OkaraMark size={11} />
              </span>
              <b>Okara</b>, an AI CMO: product development intern. I got in by taking its dashboard apart, unasked.
            </>,
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="bx-mk" src="/logos/menufit-bag-128.webp" alt="" width={20} height={22} />
              <b>MenuFit</b>, for eating out healthy: new screens for the app as a client, in light and dark.
            </>,
          ]}
        />
      }
    >
      <div className="bx-pair">
        <Shot src="/okara/feed.webp" alt="My Okara proposal: a feed that opens on one real draft to approve" z={z} w={800} h={1127} tall className="kx-tall" />
        <Shot src="/menufit/the-hack-dark.webp" alt="My MenuFit screen: the same order with three proteins on top, 9g becomes 35g" z={z} w={540} h={1169} tall className="kx-tall" />
      </div>
    </Cell>
  );
}

const PAGES: Record<DrawerId, Page> = {
  work: {
    title: (
      <>
        Hi, I&apos;m Jawad. Here&apos;s my <Circ>work.</Circ>
      </>
    ),
    line: "15, in London, building Ignaru. I design ads and sites for startups, and everything below is real.",
    mark: "/felt/jawad-head-320.webp",
    bar: () => ({ ...call, also: mail }),
    body: ({ z, go }) => (
      <>
        <Cell w={4} tone="band" title="Ads" line="Four to a brand, each a different idea." more={<More label="every set" to={() => go("ads")} />} className="bx-fan-c bx-lead">
          <Fan ads={[SETS.hoplite.ads[0], SETS.shotbase.ads[3], SETS.capy.ads[2], SETS.instabox.ads[1]]} />
        </Cell>
        <Cell w={2} title="Browser Use" line={SETS.browserUse.says}>
          <AdShot a={SETS.browserUse.ads[1]} z={z} sizes="(max-width: 760px) 45vw, 260px" />
        </Cell>
        <Cell w={6} title="Sites" line="Designed and coded by me. Every one is live, so open it." more={<More label="every site" to={() => go("sites")} />} className="bx-site bx-lead">
          <Win w={SITES[0]} sizes="(max-width: 760px) 100vw, 840px" />
        </Cell>
        <SiteCell k="ropilot" w={2} line={false} />
        <SiteCell k="audora" w={4} />
        <Before z={z} />
      </>
    ),
  },
  ads: {
    title: (
      <>
        Ads that <Sv>sell,</Sv> tested first.
      </>
    ),
    line: "Four ads to a brand, each a different idea. Spec work: none of these brands asked.",
    bar: () => ({ href: "https://ignaru.com/ads", label: "book ads", also: mail }),
    body: ({ z }) => (
      <>
        <SetCell s={SETS.hoplite} z={z} />
        <Cell w={4} title="Shotbase" line={SETS.shotbase.says}>
          <div className="bx-pair">
            <AdShot a={SETS.shotbase.ads[3]} z={z} />
            <AdShot a={SETS.shotbase.ads[1]} z={z} />
          </div>
        </Cell>
        <Cell w={2} pair title="Capy" line="An issue in, a pull request out.">
          <AdShot a={SETS.capy.ads[0]} z={z} sizes="(max-width: 760px) 45vw, 260px" />
        </Cell>
        <Cell w={2} pair title="InstaBox" line={SETS.instabox.says}>
          <AdShot a={SETS.instabox.ads[1]} z={z} sizes="(max-width: 760px) 45vw, 260px" />
        </Cell>
        <Cell w={4} title="Browser Use" line={SETS.browserUse.says}>
          <div className="bx-pair">
            <AdShot a={SETS.browserUse.ads[0]} z={z} />
            <AdShot a={SETS.browserUse.ads[3]} z={z} />
          </div>
        </Cell>
        <Cell
          w={6}
          side
          tone="light"
          title={
            <>
              How one gets <Serif>made.</Serif>
            </>
          }
          line={
            <Dots
              items={[
                "Find the one reason people buy, in reviews, threads and sales calls.",
                "Only the brand's real product, screens, logo and type.",
                <>
                  A stranger sees each ad for <Under>two seconds.</Under> If they can&apos;t say what it sells, it goes.
                </>,
                "Blind judges score the rest. Only the ones that pass are ready.",
              ]}
            />
          }
          className="bx-how"
        >
          <Shot src={ASIDE.src} small={ASIDE.small} alt={ASIDE.alt} z={z} w={1080} h={1350} tall sizes="(max-width: 760px) 60vw, 300px" className="bx-ad" />
        </Cell>
        <Cell w={6} side title={<span className="bx-n">140</span>} line="spec ads for seven companies, made in a day with Ignaru." more={<More label="see all 140" href="https://ignaru-spec-ads.vercel.app" />} className="bx-count">
          <Win w={{ key: "spec", name: "Ignaru spec ads", host: "ignaru-spec-ads.vercel.app", img: "/showcase/ignaru-spec-ads-720.webp", w: 720, h: 450, line: "" }} sizes="(max-width: 760px) 100vw, 480px" />
        </Cell>
      </>
    ),
  },
  sites: {
    title: (
      <>
        Sites, designed and coded <Under>by hand.</Under>
      </>
    ),
    line: "Concepts and pitch sites for startups. Every one is live, so open any of them.",
    bar: () => ({ ...call, also: mail }),
    body: () => (
      <>
        <SiteCell k="roport" w={6} />
        <SiteCell k="audora" w={4} />
        <SiteCell k="ropilot" w={2} pair />
        <SiteCell k="monid" w={2} pair />
        <SiteCell k="pumpgtm" w={4} />
      </>
    ),
  },
  ignaru: {
    title: (
      <>
        Ignaru gives your agent <Serif>taste.</Serif>
      </>
    ),
    line: "A design canvas that opens the repo you already have. Circle what looks wrong, and your agent fixes it in your files.",
    mark: "/logos/ignaru.svg",
    bar: () => ({ href: "https://ignaru.com", label: "open ignaru.com", also: call }),
    body: ({ z }) => (
      <>
        {/* ignaru components/home/copy.ts on origin/main: "Free; Pro is $20 a month." */}
        <Cell w={6} tone="band" title="The canvas" line="Frames from your own pages, with what you circled numbered on them.">
          <Shot src="/ignaru/studio-canvas.webp" alt="Ignaru Studio's canvas: a hero frame with two circled notes, a mood board and a start button, with a teammate's cursor" z={z} w={1100} h={587} sizes="(max-width: 760px) 100vw, 840px" />
        </Cell>
        <Cell w={2} title="Bring your own agent" line="Claude Code, Codex or Cursor, on your plan." className="bx-felt">
          <div className="bx-felts" aria-hidden="true">
            {["claude", "openai", "gemini"].map((f, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={f} src={feltSrc(f).src} alt="" width={160} height={160} loading="lazy" decoding="async" style={{ "--k": i } as CSSProperties} />
            ))}
          </div>
        </Cell>
        <Cell w={4} title="Free on Mac and web" line="Pro is $20 a month." className="bx-site">
          <Win w={{ key: "ignaru", name: "Ignaru", host: "ignaru.com", img: "/sites/ignaru.webp", tall: "/sites/ignaru-tall.webp", w: 960, h: 600, line: "" }} />
        </Cell>
      </>
    ),
  },
  contact: {
    title: (
      <>
        Say <Circ>hello.</Circ>
      </>
    ),
    line: "Email is quickest. For ads or a site, book a short call and we'll see if it's a fit.",
    bar: (b) => ({ href: BOOK, label: `book a call, ${b.minutes} min`, glyph: <MeetMark size={18} />, also: { href: CV, label: "my cv", download: true } }),
    body: ({ booking: b }) => (
      <>
        <Cell w={4} tone="band" side title="Email me." className="bx-mail-c">
          <EmailLink />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="bx-face" src="/felt/jawad-head-320.webp" alt="" width={320} height={360} loading="lazy" decoding="async" />
        </Cell>
        <Cell w={2} title="Next free days" line={`${b.minutes} minutes on ${b.where === "meet" ? "Google Meet" : "a video call"}.`} className="bx-days-c">
          {b.slots.length > 0 ? (
            <ul className="bx-days">
              {b.slots.map((x) => (
                <li key={x.iso}>
                  <a href={dayLink(x.iso)} target="_blank" rel="noreferrer">
                    <b>{x.day}</b>
                    <span>from {x.time}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="bx-call" src={feltSrc("call").src} alt="" width={160} height={160} loading="lazy" decoding="async" />
          )}
        </Cell>
        <Cell w={6} title="Elsewhere" className="bx-else">
          <ul className="bx-soc">
            {SOCIALS.map((m) => (
              <li key={m.label}>
                <a href={m.href} target="_blank" rel="noreferrer" style={{ "--b": m.color } as CSSProperties}>
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={m.d} fill="currentColor" />
                  </svg>
                  <b>{m.label}</b>
                  <span>{m.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </Cell>
      </>
    ),
  },
};
