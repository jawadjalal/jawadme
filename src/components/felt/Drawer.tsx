"use client";

/*
 * The drawers, built the way ignaru.com's are (components/home/Drawers.tsx and Kit.tsx, #795, #837, #846): one native
 * modal <dialog>, square, a full-height panel on the right that springs in (a full sheet that slides up on a phone and
 * closes with a swipe down from its top). Its top bar is solid with a hairline under it: back, next, where you are, close.
 * Each drawer opens on a claim of two lines and one short line, with its felt piece large and loose beside them; then one
 * idea a block, parted by hairlines and never boxed: the real thing working on a band of the drawer's colour, a capture
 * on the same band, a figure set large, three felt pieces with a phrase each. The one rounded thing is the key: a pill
 * that floats at the drawer's bottom right with a quiet second way beside it. Past a drawer's end (or with a wheel on the
 * page beside it) the next door's drawer comes in. Pictures open full size. Styles: felt.css (`fh-dr`, `kx-`).
 */
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { dayLink, type Booking } from "./booking";
import { ADS, BOOK, CV, DRAWERS, EMAIL, MENUFIT, SITES, drawerAt, feltSrc, lift, type DrawerId, type Site } from "./copy";
import { MeetMark } from "./Meet";
import { sfx } from "./Sound";
import dynamic from "next/dynamic";

// the quote's printer is big and only the About drawer uses it: it loads with that drawer, never with the first screen
const VerseText = dynamic(() => import("../verse-text").then((m) => m.VerseText), { ssr: false, loading: () => <span className="kx-quote-p">I'm a design engineer. I've shipped Ignaru and Wayari, and I build sites for startups.</span> });

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={s.id === "about" ? "kx-top-art kx-top-me" : "kx-top-art"} src={s.id === "about" ? "/felt/jawad-face-384.webp" : `/felt/${s.art}.webp`} alt="" width={300} height={300} />
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

/** Rows of plain text with a hairline under each: a name, what it is, where it lives. */
function Rows({ rows }: { rows: { name: string; what: string; href: string }[] }) {
  return (
    <ul className="kx-rows">
      {rows.map((r) => (
        <li key={r.name}>
          <a href={r.href} target="_blank" rel="noreferrer">
            <b>{r.name}</b>
            <span>{r.what}</span>
            <em>
              {r.href.replace(/^https:\/\//, "").replace(/\/$/, "")}
              <Out />
            </em>
          </a>
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
type Page = { title: string; line: string; bar: (b: Booking) => BarProps; body: (c: Ctx) => ReactNode[] };

const meet = (b: Booking): BarProps => ({ href: BOOK, label: `Book a call, ${b.minutes} min`, glyph: <MeetMark size={18} />, also: { href: `mailto:${EMAIL}`, label: "Email instead" } });
const call = { href: BOOK, label: "Book a call" };

const RUN = [
  { name: "Ignaru", what: "Founder. A design canvas that opens your repo; your coding agent does the fixing.", href: "https://ignaru.com" },
  { name: "Ignura", what: "Founder. A design studio: websites for startups, built from scratch.", href: "https://ignura.com" },
  { name: "Bevel", what: "Founder. A 3D art team for game studios.", href: "https://bevel.team" },
  { name: "Wayari", what: "Designed and built. Coding agents that go from a prompt to a reviewed pull request.", href: "https://wayari.com" },
  // profile.ts: menufit "1.5m users"
  { name: "MenuFit", what: "Design. An app for eating out healthy, with 1.5 million users.", href: "https://menufit.com" },
  { name: "Okara", what: "Product development intern. I got in with a teardown of its dashboard.", href: "https://okara.ai" },
  { name: "Bidframe", what: "One of four builders, at a hackathon. It flags what would disqualify a tender bid.", href: "https://bidframe.org" },
];

const PAGES: Record<DrawerId, Page> = {
  ignaru: {
    title: "Ignaru, a canvas for your agent.",
    line: "It opens the repo you already have. Circle what looks wrong on a page, and Claude Code, Codex or Cursor fixes it in your files.",
    bar: () => ({ href: "https://ignaru.com", label: "Open ignaru.com", also: call }),
    body: ({ z }) => [
      <>
        <Sh title="Circle it. Your agent fixes it." line="Pick the agent you already pay for, and watch one fix land." art="circle" />
        <Band>
          <CanvasLoop />
        </Band>
      </>,
      // ignaru components/home/copy.ts on origin/main: "Free; Pro is $20 a month."
      <Trio
        items={[
          { art: "claude", b: "Bring your own agent", p: "Claude Code, Codex or Cursor, on your plan." },
          { art: "more-mac", b: "Free on Mac and web", p: "Pro is $20 a month." },
          { art: "canvas-phone", b: "Every width at once", p: "Desktop and phone, side by side." },
        ]}
      />,
      // gh search: repo:jawadjalal/ignaru is:pr is:merged, 683 on 7 Nov 2026; the repo was created on 15 Oct
      <Big n="680+" what="pull requests merged since 15 October." line="The Mac app, the web app and ignaru.com, all designed and built by me." />,
      <>
        <Sh title="Your real site, not a mock." line="The canvas loads your pages from your own code, so what you circle is what ships." art="canvas" />
        <Band>
          <Shot src="/sites/ignaru.webp" alt="ignaru.com, the first screen" z={z} w={960} h={600} className="kx-wide" />
        </Band>
      </>,
    ],
  },
  wayari: {
    title: "From a prompt to a pull request.",
    line: "Wayari runs the job on its own branch, checks it and hands you a reviewed pull request. Tell your coding agent to use it.",
    bar: () => ({ href: "https://wayari.com", label: "Open wayari.com", also: call }),
    body: ({ z }) => [
      <>
        <Sh title="Two modes, one merge button." line="Burst while you watch, Sunrise while you sleep. You decide what ships." art="ship-branch" />
        <Band>
          <Pipeline />
        </Band>
      </>,
      <>
        <Sh title="The site tells one job, stop by stop." line="wayari.com, with the app's real dock drawn in code." />
        <Band>
          <Shot src="/sites/wayari.webp" alt="wayari.com, the first screen" z={z} w={960} h={600} />
        </Band>
      </>,
      // gh search: repo:jawadjalal/wayariapp is:pr is:merged, 480 on 7 Nov 2026; the repo was created on 22 Jul
      <Big n="480" what="pull requests merged since July." line="Nothing merges on an agent's say-so. A person presses merge, every time." />,
    ],
  },
  okara: {
    title: "How I got into Okara.",
    line: "Product development intern, Okara, an AI CMO. I got the internship by taking its dashboard apart, unasked, and proposing what to change.",
    bar: () => ({ href: "https://okara.ai", label: "Open okara.ai", also: call }),
    body: ({ z }) => [
      <Big n="14 → 7" what="credits, and a screen that says where they went." line="My proposal: when a balance moves, show what each action cost, so nobody has to guess." />,
      <>
        <Sh title="Lead with the work." line="A feed that opens on one real draft to approve, with the rest of the queue behind it." art="canvas-button" />
        <Band>
          <Shot src="/okara/feed.webp" alt="The agents feed mockup: one X draft to approve, more in the queue" z={z} w={800} h={1127} tall className="kx-tall" />
        </Band>
      </>,
      <>
        <Sh title="A morning note, not a wall of numbers." line="What happened overnight, the fix that's ready, and an Approve button." />
        <Band>
          <Shot src="/okara/morning.webp" alt="The morning note mockup: what happened overnight and the fix that is ready" z={z} w={1200} h={749} />
        </Band>
      </>,
      <>
        <Sh title="Put a price on the work." line="What each action costs, and where every credit went. All three are working React mockups." />
        <Band>
          <Shot src="/okara/credits.webp" alt="The credits drawer mockup: what each action costs and what was spent" z={z} w={1200} h={750} />
        </Band>
      </>,
    ],
  },
  menufit: {
    title: "MenuFit, for eating out healthy.",
    line: "Over 1.5 million people use it to find a high-protein order wherever they're eating. I design the screens, in light and dark.",
    bar: () => ({ href: "https://menufit-screens.vercel.app", label: "See every screen", also: { href: "https://menufit.com", label: "menufit.com" } }),
    body: ({ z }) => [<Phones key="phones" z={z} />],
  },
  bidframe: {
    title: "The clause that loses the bid.",
    line: "Public-sector tenders run past a hundred pages. Bidframe, built at a hackathon, reads the whole pack, flags what would disqualify you, and links every flag to its clause.",
    bar: () => ({ href: "https://bidframe.org", label: "Open bidframe.org", also: { href: "https://github.com/Welddevelopment/Tender_Breakdown_AI-Agent", label: "The code" } }),
    body: ({ z }) => [
      <>
        <Sh title="Tick off the deal-breakers." line="Four from bidframe.org's own worked example. Each one links to its page and clause." art="circle" />
        <Band>
          <Tender />
        </Band>
      </>,
      <>
        <Sh title="Every claim back to its source." line="Requirements come out of PDFs, Word, Excel and zip files, each with its page and clause." />
        <Band>
          <Shot src="/sites/bidframe.webp" alt="bidframe.org, the first screen" z={z} w={960} h={600} />
        </Band>
      </>,
      // GitHub contributors API for Welddevelopment/Tender_Breakdown_AI-Agent, 7 Nov 2026: jawadjalal 258
      <Big n="258" what="commits of mine, in a team of four." line="Built for Conduct's Make Legacy Move hackathon: Python and FastAPI to read the pack, Next.js for the matrix. It's still live." />,
    ],
  },
  ads: {
    title: "Ads for Devin, made on spec.",
    line: "Devin isn't a client. I made these to show what I'd do, and every line in them comes from devin.ai.",
    bar: () => ({ href: BOOK, label: "Ads for your launch", glyph: <MeetMark size={18} />, also: { href: "/#sites", label: "See the sites" } }),
    body: ({ z }) => [
      <Band>
        <ul className="kx-ads">
          {ADS.map((a) => (
            <li key={a.key}>
              <Shot src={`/ads/${a.key}.webp`} alt={a.alt} z={z} w={864} h={1080} tall />
            </li>
          ))}
        </ul>
      </Band>,
      <Sh title="One line, one picture." line="A boarding pass, an out-of-office reply, a night of commits. Each turns a line Devin already uses into something you'd stop on." art="bezier" />,
    ],
  },
  bevel: {
    title: "Bevel, a 3D art team for games.",
    line: "I founded it. Concept to in-game: modelled, rigged and animated, with VFX, for Roblox, Unity and Unreal studios.",
    bar: () => ({ href: "https://bevel.team", label: "Open bevel.team", also: call }),
    body: ({ z }) => [
      // bevel.team's own first line, 7 Nov 2026: "our clients have 11,000,000,000+ visits"
      <Big n="11B+" what="visits, per bevel.team, across the games its art shipped into." line="Blade Ball, Fish It!, Build a Base and Steal, Spin a Brainrot and Pizza Delivery, as bevel.team lists them." />,
      <Band>
        <Shot src="/sites/bevel.webp" alt="bevel.team, the first screen" z={z} w={1440} h={900} />
      </Band>,
      <Sh title="Concept to in‑game, one team." line="Sketches first, then modelled, rigged and animated, with the effects on top. Roblox, Unity and Unreal." art="yarn" />,
    ],
  },
  sites: {
    title: `${SITES.length} live sites, all hand-built.`,
    line: "My products, pitch sites for founders, redesign concepts and templates. I designed and built each one.",
    bar: () => ({ href: BOOK, label: "Want the next one?", glyph: <MeetMark size={18} />, also: { href: `mailto:${EMAIL}`, label: "Email me" } }),
    body: () => [<Gallery key="gal" />],
  },
  about: {
    title: "A design engineer in London.",
    line: "I design and build my own companies, and sites for founders. These are the things I have run and made.",
    bar: () => ({ href: CV, label: "Download my CV", download: true, also: { href: `mailto:${EMAIL}`, label: "Email me" } }),
    body: () => [
      <blockquote className="kx-quote">
        <VerseText text="I'm a design engineer. I've shipped Ignaru and Wayari, and I build sites for startups." tone="dark" seed={1507} className="kx-quote-p" />
      </blockquote>,
      <>
        <Sh title="What I run and what I've built." />
        <Rows rows={RUN} />
      </>,
      <>
        <Sh title="Sites for founders." line="Pitch sites made to win a call, each live." art="browser" />
        <Rows rows={["rocquire", "paradev", "hyperspell", "treg", "mercy", "dobig"].map((k) => SITES.find((s) => s.key === k)!).map((s) => ({ name: s.name, what: s.line, href: `https://${s.host}` }))} />
      </>,
      <div className="kx-fin">
        <h3>Say hello.</h3>
        <p>The quickest way is email.</p>
        <EmailLink />
      </div>,
    ],
  },
  book: {
    title: "A live page in about a week.",
    line: "Most projects start with a short call through Ignura, my studio. Then it goes like this.",
    bar: (b) => meet(b),
    body: ({ booking: b }) => [
      <Band>
        <Week />
      </Band>,
      <Trio
        items={[
          { art: "code", b: "Real code, in your repo", p: "Next.js and plain CSS, no page builder." },
          { art: "browser", b: "A live link from day one", p: "You watch it grow." },
          { art: "onb-check", b: "Yours on day one", p: "You own all of it." },
        ]}
      />,
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
      ) : (
        <div className="kx-fin">
          <h3>Pick a time on Cal.</h3>
          <p>{b.minutes} minutes is enough to see if the page is a fit.</p>
        </div>
      ),
    ],
  },
};

/* ---------- Ignaru: the canvas loop ---------- */

const AGENTS = [
  { name: "Claude Code", shape: "claude", note: "make this pop" },
  { name: "Codex", shape: "openai", note: "match the brand" },
  { name: "Gemini", shape: "gemini", note: "give it more room" },
  { name: "Grok", shape: "grok", note: "too quiet, lift it" },
];

function CanvasLoop() {
  const [a, setA] = useState(0);
  const ag = AGENTS[a];
  return (
    <div className="fh-cv">
      <div className="fh-seg" role="tablist" aria-label="Agent">
        {AGENTS.map((g, i) => (
          <button key={g.name} type="button" role="tab" aria-selected={i === a} onClick={() => setA(i)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={feltSrc(g.shape).src} alt="" width={18} height={18} />
            {g.name}
          </button>
        ))}
      </div>
      <div className="fh-cv-stage" key={a} aria-label={`${ag.name} fixing a circled button on a page`} role="img">
        <div className="fh-cv-page">
          <div className="fh-cv-nav">
            <i className="fh-cv-logo" />
            <span />
            <span />
            <span />
            <b />
          </div>
          <div className="fh-cv-hero">
            <span className="fh-cv-h1" />
            <span className="fh-cv-h1 fh-cv-h1b" />
            <span className="fh-cv-p" />
            <span className="fh-cv-p fh-cv-pb" />
            <span className="fh-cv-btn">
              <span>Get started</span>
            </span>
          </div>
          <div className="fh-cv-cards">
            <span />
            <span />
            <span />
          </div>
        </div>
        <svg className="fh-cv-ring" viewBox="0 0 200 80" aria-hidden="true">
          <path d="M18 44 C 16 14, 182 8, 186 38 C 190 66, 30 76, 14 50 C 8 38, 40 22, 70 20" />
        </svg>
        <span className="fh-cv-note">{ag.note}</span>
        <span className="fh-cv-cur">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M3 2l11 6.5-4.6 1.2L7.2 14z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          <span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={feltSrc(ag.shape).src} alt="" width={16} height={16} />
            {ag.name}
          </span>
        </span>
        <span className="fh-cv-pr">
          <i>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M2 5.2l2 2L8 3" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </i>
          <span>
            <b>hero.tsx</b> <em>+4</em> <u>−2</u>
          </span>
          <span className="fh-cv-pr-s">checks passed</span>
        </span>
      </div>
    </div>
  );
}

/* ---------- Wayari: the job's path, in its two modes (PRODUCT.md, 0.8.0) ---------- */

const MODES = {
  burst: { label: "Burst", when: "at your desk", say: "use wayari, fix the flaky checkout test", builders: 2, line: "A focused job on the small pipeline, two builders by default." },
  sunrise: { label: "Sunrise", when: "while you're away", say: "use wayari, I'm off for the night: ship the pricing page", builders: 4, line: "The full pipeline while you're gone, with the same review and the same merge boundary." },
} as const;

function Pipeline() {
  const [m, setM] = useState<keyof typeof MODES>("burst");
  const mode = MODES[m];
  const steps = [
    { art: "pen", t: "Your words", s: "in the app you already use" },
    { art: "code", t: "Its own branch", s: "one goal, one repo" },
    { art: "terminal", t: `${mode.builders} builders`, s: "on a shift" },
    { art: "ship-merge", t: "Pull request", s: "checked, reviewed, yours to merge" },
  ];
  return (
    <div className="fh-pl">
      <div className="fh-seg" role="tablist" aria-label="Mode">
        {(Object.keys(MODES) as (keyof typeof MODES)[]).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={k === m} onClick={() => setM(k)}>
            {MODES[k].label}
            <span className="fh-seg-sub">{MODES[k].when}</span>
          </button>
        ))}
      </div>
      <div className="fh-pl-stage" key={m}>
        <p className="fh-pl-say">
          <span aria-hidden="true">›</span> {mode.say}
        </p>
        <ol className="fh-pl-steps" style={{ ["--n" as string]: steps.length } as CSSProperties}>
          {steps.map((x, k) => (
            <li key={x.t} style={{ ["--k" as string]: k } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={feltSrc(x.art).src} alt="" width={56} height={56} />
              <b>{x.t}</b>
              <span>{x.s}</span>
            </li>
          ))}
        </ol>
        <p className="fh-pl-line">{mode.line}</p>
      </div>
    </div>
  );
}

/* ---------- Bidframe: the deal-breakers from its own worked example (bidframe.org, 7 Nov 2026) ---------- */

const RULES = [
  { ref: "p. 14 · Section 4.2.1", t: "The supplier must hold current ISO 9001 certification valid for the full contract term." },
  { ref: "p. 22 · Section 6.1.3", t: "Bidder must be Cyber Essentials Plus certified at the date of submission." },
  { ref: "p. 8 · Section 3.4", t: "Minimum annual turnover of £2,000,000 in each of the last two financial years." },
  { ref: "p. 19 · Section 5.3", t: "Professional indemnity insurance of at least £10,000,000 for the contract duration." },
];

function Tender() {
  const [ok, setOk] = useState<boolean[]>(() => RULES.map(() => false));
  const left = ok.filter((x) => !x).length;
  return (
    <div className={left === 0 ? "fh-td is-done" : "fh-td"} data-ui>
      <div className="fh-td-head">
        <b>{left === 0 ? "Every deal-breaker cleared" : `${left} requirement${left === 1 ? "" : "s"} would disqualify the bid`}</b>
        <span>{left === 0 ? "Ready to write the bid" : "Tick each one you can meet"}</span>
      </div>
      <ul>
        {RULES.map((r, i) => (
          <li key={r.ref}>
            <label className={ok[i] ? "is-ok" : undefined}>
              <input type="checkbox" checked={ok[i]} onChange={() => setOk((o) => o.map((v, k) => (k === i ? !v : v)))} />
              <span className="fh-td-box" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path d="M2.5 6.2l2.3 2.3L9.5 3.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="fh-td-t">{r.t}</span>
              <em>{r.ref}</em>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- MenuFit: the screens ---------- */

function Phones({ z }: { z: Ctx["z"] }) {
  const [t, setT] = useState<"light" | "dark">("light");
  const src = (k: string) => `/menufit/${k}-${t}.webp`;
  return (
    <div className="fh-mf" data-theme={t}>
      <Band>
        <div className="fh-mf-hack">
          <div>
            <h3>Nearly 4× the protein.</h3>
            <p className="kx-sp">The hack screen: the same Pintos N Cheese with three proteins on top. The macros fill like liquid, drawn to scale.</p>
            <p className="fh-mf-num" aria-label="9 grams becomes 35 grams">
              <b>9g</b>
              <span aria-hidden="true">→</span>
              <b>35g</b>
            </p>
          </div>
          <Shot src={src("the-hack")} alt="The hack: the same Pintos N Cheese with three proteins on top, 9g becomes 35g" z={z} w={540} h={1169} tall className="fh-phone fh-phone-lg" />
        </div>
      </Band>
      <div className="kx-blk-in">
        <div className="fh-mf-head">
          <Sh title="Every screen, in light and dark." line="Rendered one by one from the live screens." />
          <div className="kx-seg" role="tablist" aria-label="Theme">
            {(["light", "dark"] as const).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={k === t} onClick={() => setT(k)}>
                {k === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </div>
        <ul className="fh-mf-grid">
          {MENUFIT.core.map((m) => (
            <li key={m.key}>
              <Shot src={src(m.key)} alt={`MenuFit, ${m.name}`} z={z} w={540} h={1169} tall className="fh-phone" />
              <span>{m.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="kx-blk-in">
        <Sh title="The quiet screens too." line="Loading, nothing nearby, and location turned off each get a design, not a spinner." />
        <ul className="fh-mf-grid fh-mf-states">
          {MENUFIT.states.map((m) => (
            <li key={m.key}>
              <Shot src={src(m.key)} alt={`MenuFit, ${m.name}`} z={z} w={540} h={1169} tall className="fh-phone" />
              <span>{m.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- sites: every live site ---------- */

const GROUPS = ["All", "Products", "Pitch sites", "Concepts", "Templates"] as const;

function Gallery() {
  const [g, setG] = useState<(typeof GROUPS)[number]>("All");
  const list = g === "All" ? SITES : SITES.filter((w) => w.group === g);
  return (
    <>
      <div className="kx-tabs" role="tablist" aria-label="Filter sites">
        {GROUPS.map((x) => (
          <button key={x} type="button" role="tab" aria-selected={x === g} onClick={() => setG(x)}>
            {x}
            <span>{x === "All" ? SITES.length : SITES.filter((w) => w.group === x).length}</span>
          </button>
        ))}
      </div>
      <ul className="fh-gal">
        {list.map((w) => (
          <SiteCard key={w.key} w={w} />
        ))}
      </ul>
    </>
  );
}

function SiteCard({ w }: { w: Site }) {
  return (
    <li>
      <a href={`https://${w.host}`} target="_blank" rel="noreferrer" className="fh-site">
        <span className="fh-site-win">
          <span className="fh-site-bar" aria-hidden="true">
            <span>{w.host}</span>
          </span>
          <span className="fh-site-view" style={{ ["--tall" as string]: `url(/sites/${w.key}-tall.webp)` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/sites/${w.key}.webp`} alt={`${w.name}, the first screen`} width={960} height={600} loading="lazy" decoding="async" />
          </span>
        </span>
        <span className="fh-site-meta">
          <b>{w.name}</b>
          <em>{w.group === "Products" ? "Mine" : w.group === "Pitch sites" ? "Pitch" : w.group.replace(/s$/, "")}</em>
          <Chev d="M4.5 9.5l5-5M5.5 4.5h4v4" />
        </span>
        <span className="fh-site-line">{w.line}</span>
      </a>
    </li>
  );
}

/* ---------- book: a week laid out ---------- */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const TRACK = [
  { k: "Call", from: 0, to: 0.6, art: "call" },
  { k: "Design", from: 0.3, to: 2.6, art: "pen" },
  { k: "Build", from: 1.4, to: 4.3, art: "code" },
  { k: "Ship", from: 4.2, to: 5, art: "terminal" },
];

function Week() {
  return (
    <div className="fh-wk" role="img" aria-label="A week: a call on Monday, design from Monday to Wednesday, build from Tuesday to Friday, live on Friday">
      <div className="fh-wk-days">
        {DAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="fh-wk-rows">
        {TRACK.map((t, i) => (
          <div key={t.k} className="fh-wk-row">
            <span className="fh-wk-bar" style={{ ["--a" as string]: t.from / 5, ["--b" as string]: t.to / 5, ["--i" as string]: i }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={feltSrc(t.art).src} alt="" width={22} height={22} />
              {t.k}
            </span>
          </div>
        ))}
        <span className="fh-wk-head" aria-hidden="true" />
      </div>
      <span className="fh-wk-live">
        Live on Friday
      </span>
    </div>
  );
}

