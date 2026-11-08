"use client";

/*
 * The drawers, built the way ignaru.com's are (components/home/Drawers.tsx and Kit.tsx, #795, #837, #846): one native
 * modal <dialog>, square, a full-height panel on the right that springs in (a full sheet that slides up on a phone and
 * closes with a swipe down from its top). Its top bar is solid with a hairline under it: back, next, where you are, close.
 * Each drawer opens on a claim of two lines and one short line, with its felt piece large and loose beside them; then one
 * idea a block, parted by hairlines and never boxed: the real thing working on a band of the drawer's colour, a capture
 * on the same band, a figure set large, three felt pieces with a phrase each. Five drawers, each short: Ignaru, site design,
 * the ad machine, before (Okara and MenuFit) and contact. The key is ignaru.com's square ink block (#881) at the drawer's
 * bottom right, with a quiet second way beside it. Past a drawer's end (or with a wheel on the page beside it) the next
 * door's drawer comes in. Pictures open full size. Styles: felt.css (`fh-dr`, `kx-`).
 */
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { dayLink, type Booking } from "./booking";
import { ADS, BOOK, CV, DRAWERS, EMAIL, SITES, drawerAt, feltSrc, lift, type DrawerId, type Site } from "./copy";
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
  const [shown, setShown] = useState<DrawerId>(at ?? "ignaru");
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
          {page.mark ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="kx-top-art kx-top-mark" src={page.mark} alt="" width={120} height={120} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="kx-top-art" src={`/felt/${s.art}.webp`} alt="" width={300} height={300} />
          )}
        </header>
        <div className="kx-body">
          {page.body({ booking, z }).filter(Boolean).map((b, i) => (
            <div key={i} className="kx-blk">
              {b}
            </div>
          ))}
        </div>
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

/* ---------- the kit: one idea a block ---------- */

type BarProps = { href: string; label: string; glyph?: ReactNode; download?: boolean; also?: { href: string; label: string; download?: boolean } };

/** The key: an ink pill floating at the drawer's bottom right, the quiet second way beside it. The pill comes first in the
 *  DOM so the keyboard reaches it first; row-reverse puts it in the corner. */
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

/** A block's head: a claim of two lines at most, one line, its felt piece loose on the right. */
function Sh({ title, line, art }: { title: string; line?: ReactNode; art?: string }) {
  return (
    <div className={art ? "kx-sh has-art" : "kx-sh"}>
      <div>
        <h3>{title}</h3>
        {line ? <p className="kx-sp">{line}</p> : null}
      </div>
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="kx-sh-art" src={feltSrc(art).src} alt="" width={160} height={160} loading="lazy" decoding="async" />
      ) : null}
    </div>
  );
}

/** The thing itself, working, on a band of the drawer's colour that runs edge to edge. */
const Band = ({ children, paper }: { children: ReactNode; paper?: boolean }) => <div className={paper ? "kx-stage is-paper" : "kx-stage"}>{children}</div>;

/** A capture that opens full size. */
function Shot({ src, alt, z, w = 1200, h = 750, tall, className = "" }: { src: string; alt: string; z: Ctx["z"]; w?: number; h?: number; tall?: boolean; className?: string }) {
  return (
    <button type="button" className={`kx-media ${className}`} onClick={() => z(src, alt, tall)} aria-label={`Open full size: ${alt}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
      <span className="kx-expand" aria-hidden="true">
        <i />
        expand
      </span>
    </button>
  );
}

/** A real number set very large, and what it counts. */
function Big({ n, what, line }: { n: string; what: string; line?: string }) {
  return (
    <div className="kx-big">
      <b>{n}</b>
      <div>
        <h3>{what}</h3>
        {line ? <p className="kx-sp">{line}</p> : null}
      </div>
    </div>
  );
}

/** Three felt pieces in a row, a bold phrase and a few words under each. */
function Trio({ items }: { items: { art: string; b: string; p: string }[] }) {
  return (
    <ul className="kx-trio">
      {items.map((t, i) => (
        <li key={t.b} style={{ "--k": i } as CSSProperties}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={feltSrc(t.art).src} alt="" width={160} height={160} loading="lazy" decoding="async" />
          <b>{t.b}</b>
          <p>{t.p}</p>
        </li>
      ))}
    </ul>
  );
}

/** Copies the address and opens mail, saying so for a moment. */
function EmailLink() {
  const [got, setGot] = useState(false);
  return (
    <a
      className="kx-fin-more"
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
      {got ? "Copied, opening mail" : EMAIL}
      <Out />
    </a>
  );
}

type Ctx = { booking: Booking; z: (src: string, alt: string, tall?: boolean) => void };
type Page = { title: string; line: string; mark?: string; bar: (b: Booking) => BarProps; body: (c: Ctx) => ReactNode[] };

const call = { href: BOOK, label: "Book a call" };

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

/** A company I worked with before Ignaru: its own mark, what I did there, and only the numbers its own pages state. */
function Past({ mark, name, what, role, facts, src }: { mark: ReactNode; name: string; what: string; role: string; facts: { n: string; k: string }[]; src: { href: string; label: string } }) {
  return (
    <div className="fh-past">
      <div className="fh-past-head">
        {mark}
        <div>
          <h3>
            {name}
            <span>, {what}</span>
          </h3>
          <p className="kx-sp">{role}</p>
        </div>
      </div>
      <dl className="fh-past-facts">
        {facts.map((f) => (
          <div key={f.k}>
            <dt>{f.n}</dt>
            <dd>{f.k}</dd>
          </div>
        ))}
      </dl>
      <p className="fh-past-src">
        Numbers from{" "}
        <a href={src.href} target="_blank" rel="noreferrer">
          {src.label}
        </a>
      </p>
    </div>
  );
}

/** How an ad gets made, in order. Each step has its own felt piece. */
const MACHINE = [
  { art: "circle", b: "Find why buyers pay.", p: "Reviews, threads and sales calls first, until one reason to buy keeps coming back." },
  { art: "canvas-button", b: "Only the brand's own things.", p: "Its real product, screens, logo and type. Nothing mocked up." },
  { art: "bezier", b: "Cut it down to four.", p: "Lots of concepts go in. Four come out, as different from each other as they can be." },
  { art: "circle-cursor", b: "Two seconds with a stranger.", p: "Someone who has never heard of the brand sees each ad for two seconds. If they can't say what it sells, it goes." },
  { art: "onb-check", b: "Blind judges.", p: "Judges who don't know which ad is whose score whether it would sell. Only the ones that pass are ready." },
];

const PAGES: Record<DrawerId, Page> = {
  ignaru: {
    title: "Ignaru gives your agent taste.",
    line: "An agent-native design canvas that opens the repo you already have. Circle what looks wrong, and Claude Code, Codex or Cursor fixes it in your files.",
    mark: "/logos/ignaru.svg",
    bar: () => ({ href: "https://ignaru.com", label: "Open ignaru.com", also: call }),
    body: ({ z }) => [
      <>
        <Band>
          <Shot src="/ignaru/studio-canvas.webp" alt="Ignaru Studio's canvas: a hero frame with two circled notes, a mood board and a start button, with a teammate's cursor" z={z} w={1100} h={587} />
        </Band>
        <p className="kx-cap">Ignaru Studio&apos;s canvas: frames from your own pages, with what you circled numbered on them.</p>
      </>,
      // ignaru components/home/copy.ts on origin/main: "Free; Pro is $20 a month."
      <Trio
        items={[
          { art: "claude", b: "Bring your own agent", p: "Claude Code, Codex or Cursor, on your plan." },
          { art: "more-mac", b: "Free on Mac and web", p: "Pro is $20 a month." },
          { art: "canvas-phone", b: "Every width at once", p: "Desktop and phone, side by side." },
        ]}
      />,
    ],
  },
  sites: {
    title: "Sites, built by hand.",
    line: "Concepts and pitch sites for startups, designed and coded by me. Every one is live, so open any of them.",
    bar: () => ({ href: BOOK, label: "Want one? Book a call", also: { href: `mailto:${EMAIL}`, label: "Email me" } }),
    body: () => [
      <ul className="fh-gal" key="gal">
        {SITES.map((w, i) => (
          <SiteCard key={w.key} w={w} wide={i === 0} />
        ))}
      </ul>,
    ],
  },
  ads: {
    title: "The ad machine.",
    line: "I make ads that sell, not ads that only look good. Four very different ads for a brand, each one tested before anyone pays to run it.",
    bar: () => ({ href: "https://ignaru-spec-ads.vercel.app", label: "See 140 of them", also: { href: BOOK, label: "Ads for your launch" } }),
    body: ({ z }) => [
      <>
        <Band>
          <ul className="kx-ads">
            {ADS.map((a) => (
              <li key={a.key}>
                <Shot src={a.src} alt={a.alt} z={z} w={a.w} h={a.h} tall />
              </li>
            ))}
          </ul>
        </Band>
        <p className="kx-cap">Spec ads for Aside and Shotbase. Neither asked; I made them to show what the machine does.</p>
      </>,
      <>
        <Sh title="How one gets made." />
        <ol className="fh-steps">
          {MACHINE.map((m, i) => (
            <li key={m.b} style={{ "--k": i } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={feltSrc(m.art).src} alt="" width={72} height={72} loading="lazy" decoding="async" />
              <div>
                <b>{m.b}</b>
                <p>{m.p}</p>
              </div>
            </li>
          ))}
        </ol>
      </>,
      <Big n="140" what="spec ads for seven companies, made in a day with Ignaru." line="None of the seven asked. They are on ignaru-spec-ads.vercel.app." />,
    ],
  },
  before: {
    title: "Before Ignaru.",
    line: "I was a product development intern at Okara, and designed new screens for MenuFit as a client.",
    bar: () => ({ href: "https://menufit-screens.vercel.app", label: "See the MenuFit screens", also: { href: "https://okara.ai", label: "okara.ai" } }),
    body: ({ z }) => [
      // okara.ai/about, read on 8 Nov 2026
      <Past
        key="okara"
        mark={
          <span className="fh-past-mk fh-past-ok">
            <OkaraMark size={26} />
          </span>
        }
        name="Okara"
        what="an AI CMO"
        role="Product development intern. I got in by taking its dashboard apart, unasked, and proposing what to change."
        facts={[
          { n: "150k", k: "websites use it" },
          { n: "14m", k: "views on its launch" },
          { n: "10+", k: "agents at work" },
        ]}
        src={{ href: "https://okara.ai/about", label: "okara.ai/about" }}
      />,
      // menufit.com and the App Store listing, read on 8 Nov 2026
      <Past
        key="menufit"
        mark={
          // eslint-disable-next-line @next/next/no-img-element
          <img className="fh-past-mk fh-past-mf" src="/logos/menufit-bag-128.webp" alt="" width={48} height={54} />
        }
        name="MenuFit"
        what="for eating out healthy"
        role="Client. I designed new screens for the app, in light and dark."
        facts={[
          { n: "1.5m+", k: "people use it" },
          { n: "22.3m+", k: "places on its map" },
          { n: "4.8", k: "from 54,556 App Store ratings" },
        ]}
        src={{ href: "https://menufit.com", label: "menufit.com and the App Store" }}
      />,
      <>
        <Band>
          <ul className="fh-past-pics">
            <li>
              <Shot src="/okara/feed.webp" alt="My Okara proposal: a feed that opens on one real draft to approve" z={z} w={800} h={1127} tall className="kx-tall" />
            </li>
            <li>
              <Shot src="/menufit/the-hack-dark.webp" alt="My MenuFit screen: the same order with three proteins on top, 9g becomes 35g" z={z} w={540} h={1169} tall className="kx-tall" />
            </li>
          </ul>
        </Band>
        <p className="kx-cap">Left, my Okara proposal: a feed that opens on one draft to approve. Right, a MenuFit screen I designed: the same order, nearly four times the protein.</p>
      </>,
    ],
  },
  contact: {
    title: "Say hello.",
    line: "Email is quickest. For a site or ads, book a short call and we'll see if it's a fit.",
    bar: (b) => ({ href: BOOK, label: `Book a call, ${b.minutes} min`, glyph: <MeetMark size={18} />, also: { href: CV, label: "My CV", download: true } }),
    body: ({ booking: b }) => [
      <div className="kx-fin" key="mail">
        <EmailLink />
      </div>,
      <>
        <Sh title="Elsewhere." />
        <ul className="fh-elsewhere">
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer" style={{ "--b": s.color } as CSSProperties}>
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={s.d} fill="currentColor" />
                </svg>
                <b>{s.label}</b>
                <span>{s.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </>,
      b.slots.length > 0 ? (
        <>
          <Sh title="Next free days." line={`${b.minutes} minutes on ${b.where === "meet" ? "Google Meet" : "a video call"}. Pick a day and Cal shows the times.`} art="circle-comment" />
          <ul className="kx-days">
            {b.slots.map((x) => (
              <li key={x.iso}>
                <a href={dayLink(x.iso)} target="_blank" rel="noreferrer">
                  <b>{x.day}</b>
                  <span>from {x.time}</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null,
    ],
  },
};

/* ---------- sites ---------- */

function SiteCard({ w, wide }: { w: Site; wide?: boolean }) {
  return (
    <li className={wide ? "is-wide" : undefined}>
      <a href={`https://${w.host}`} target="_blank" rel="noreferrer" className="fh-site">
        <span className="fh-site-win">
          <span className="fh-site-bar" aria-hidden="true">
            <span>{w.host}</span>
          </span>
          <span className="fh-site-view">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={w.img} alt={`${w.name}, the first screen`} width={w.w} height={w.h} loading="lazy" decoding="async" />
          </span>
        </span>
        <span className="fh-site-meta">
          <b>{w.name}</b>
          <Chev d="M4.5 9.5l5-5M5.5 4.5h4v4" />
        </span>
        {w.line ? <span className="fh-site-line">{w.line}</span> : null}
      </a>
    </li>
  );
}
