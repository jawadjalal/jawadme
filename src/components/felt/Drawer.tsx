"use client";

/*
 * The drawers: a native modal <dialog> on the right (full screen on a phone), dark like the site, the slot's colour as
 * the accent. Each is one composed page: big felt art bleeding off the top corner, a headline and a line, one large
 * thing to play with (Ignaru's canvas loop, a small design inspector, every live site, a week laid out), two or three
 * short sections, and a footer key styled like the docked Book a call. A spring slides it in and the page staggers
 * up; Escape and the backdrop close it, the arrow keys step through. Styles: felt.css (`fh-dr`).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Book } from "./Book";
import { dayLink, type Booking } from "./booking";
import { SITES, SLOTS, feltSrc, type Site } from "./copy";
import { sfx } from "./Sound";

export function Drawer({ booking, at, onClose, onStep }: { booking: Booking; at: number | null; onClose: () => void; onStep: (by: number) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (at !== null) setShown(at);
    const d = ref.current;
    if (!d) return;
    if (at !== null && !d.open) {
      d.showModal();
      sfx("open");
    } else if (at === null && d.open) d.close();
  }, [at]);
  useEffect(() => {
    const d = ref.current;
    d?.addEventListener("close", onClose);
    return () => d?.removeEventListener("close", onClose);
  }, [onClose]);
  useEffect(() => {
    ref.current?.scrollTo(0, 0);
  }, [shown]);
  const s = SLOTS[shown];
  const art = feltSrc(s.shapes[0].src);
  const page = PAGES[s.id];
  return (
    <dialog
      ref={ref}
      className={s.id === "sites" ? "fh-dr fh-dr-wide" : "fh-dr"}
      aria-labelledby="fh-dr-t"
      style={{ ["--c" as string]: s.color }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.currentTarget.close();
      }}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).closest("input")) return;
        if (e.key === "ArrowRight") onStep(1);
        if (e.key === "ArrowLeft") onStep(-1);
      }}
    >
      <div className="fh-dr-bar">
        <div className="fh-dr-nav">
          <button type="button" onClick={() => onStep(-1)} aria-label="Previous">
            <Chev d="M9 3.5 5.5 7 9 10.5" />
          </button>
          <button type="button" onClick={() => onStep(1)} aria-label="Next">
            <Chev d="M5 3.5 8.5 7 5 10.5" />
          </button>
          <span className="fh-dr-count" aria-live="polite">
            {s.label} · {shown + 1} of {SLOTS.length}
          </span>
        </div>
        <button type="button" onClick={() => ref.current?.close()} aria-label="Close">
          <Chev d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
        </button>
      </div>
      <article className="fh-dr-page" key={s.id}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="fh-dr-art" src={art.src.replace("-1x", "")} alt="" width={640} height={640} />
        <header className="fh-dr-head fh-in" style={{ ["--d" as string]: 0 }}>
          <h2 id="fh-dr-t">{page.title}</h2>
          <p>{page.line}</p>
        </header>
        <div className="fh-in" style={{ ["--d" as string]: 1 }}>
          {s.id === "agents" && <CanvasLoop />}
          {s.id === "design" && <Inspector />}
          {s.id === "sites" && <Gallery />}
          {s.id === "ship" && <Week />}
        </div>
        {page.secs && <div className="fh-secs fh-in" style={{ ["--d" as string]: 2 }}>{page.secs(booking)}</div>}
        <footer className="fh-dr-foot fh-in" style={{ ["--d" as string]: 3 }}>
          <p>{page.foot}</p>
          {s.id === "agents" ? <Key href="https://ignaru.com" title="Open ignaru.com" sub="Free to start · Mac and web" glyph="petal" /> : <Book b={booking} />}
        </footer>
      </article>
    </dialog>
  );
}

const Chev = ({ d }: { d: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

/** The footer key, the same build as the docked Book a call. */
function Key({ href, title, sub, glyph }: { href: string; title: string; sub: string; glyph: string }) {
  return (
    <a className="fh-book" href={href} target="_blank" rel="noreferrer">
      <span className="fh-book-glyph" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={feltSrc(glyph).src} alt="" width={30} height={30} style={{ width: 30 }} />
      </span>
      <span className="fh-book-text">
        <b>{title}</b>
        <span>{sub}</span>
      </span>
      <svg className="fh-book-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 11l6-6M6 5h5v5" />
      </svg>
    </a>
  );
}

function Sec({ art, shot, title, children }: { art?: string; shot?: string; title: string; children: ReactNode }) {
  return (
    <section className="fh-sec">
      {shot ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="fh-sec-shot" src={shot} alt="" width={960} height={600} loading="lazy" />
      ) : (
        art && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="fh-sec-art" src={feltSrc(art).src} alt="" width={64} height={64} loading="lazy" />
        )
      )}
      <div>
        <h3>{title}</h3>
        <div className="fh-sec-body">{children}</div>
      </div>
    </section>
  );
}

type Page = { title: string; line: string; foot: string; secs?: (b: Booking) => ReactNode };

const PAGES: Record<(typeof SLOTS)[number]["id"], Page> = {
  agents: {
    title: "Ignaru, a canvas for your agent.",
    line: "It opens the repo you already have. Circle what looks wrong on a page, and Claude Code, Codex or Cursor fixes it in your files.",
    foot: "Try it on your own repo.",
    secs: () => (
      <>
        <Sec shot="/sites/ignaru.webp" title="Your real site, not a mock">
          The canvas loads your pages from your code, so what you circle is what ships.
        </Sec>
        <Sec art="openai" title="Bring your own agent">
          It drives the coding agent you already pay for. Ignaru adds the eye for design.
        </Sec>
        <Sec art="gemini" title="Free to start">
          Free on Mac and the web. Pro is $20 a month.
        </Sec>
      </>
    ),
  },
  design: {
    title: "Design from the brand to the last screen.",
    line: "The type, the colour, the motion and every state a page can be in. Then I build it, so nothing gets lost between a mock and the site.",
    foot: "Want a site that looks like yours and nobody else's?",
    secs: () => (
      <>
        <Sec art="pen" title="One idea per site">
          Every site starts from what the company is, not a template. The felt on this page is that idea for me.
        </Sec>
        <Sec art="bezier" title="Every state, drawn">
          <States />
        </Sec>
        <Sec shot="/sites/tavola.webp" title="Range">
          A trattoria, a bookkeeper, a Roblox studio, an agent tool: each one its own look.
        </Sec>
      </>
    ),
  },
  sites: {
    title: `${SITES.length} live sites, all built from scratch.`,
    line: "My products, pitch sites for founders, redesign concepts and templates. Every one designed and coded by me.",
    foot: "Want the next one to be yours?",
  },
  ship: {
    title: "From a call to a live page in about a week.",
    line: "Most projects start with a short call through Ignura, my studio. Then it goes like this.",
    foot: "Fifteen minutes, no prep needed.",
    secs: (b) => (
      <>
        {b.slots.length > 0 && (
          <Sec art="call" title="Next free days">
            <ul className="fh-days">
              {b.slots.map((x) => (
                <li key={x.iso}>
                  <a href={dayLink(x.iso)} target="_blank" rel="noreferrer">
                    <b>{x.day}</b>
                    <span>from {x.time}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Sec>
        )}
        <Sec art="code" title="Real code, in your repo">
          Next.js and plain CSS, no page builder. You own all of it from the first day.
        </Sec>
        <Sec art="terminal" title="You see it as it grows">
          A live link from day one, so you review real pages, not pictures of them.
        </Sec>
      </>
    ),
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

/* ---------- design: a small inspector over a live artboard ---------- */

const FILLS = [
  ["Petal", "#9a4dea"],
  ["Coral", "#f0454f"],
  ["Yolk", "#f5b400"],
  ["Sky", "#1f7ae0"],
  ["Paper", "#f4f1ec"],
];
const FACES = [
  ["Geist", "var(--font-geist-sans), system-ui, sans-serif"],
  ["Serif", "Georgia, 'Times New Roman', serif"],
  ["Mono", "ui-monospace, SFMono-Regular, Menlo, monospace"],
];

function Inspector() {
  const [fill, setFill] = useState(0);
  const [r, setR] = useState(18);
  const [face, setFace] = useState(0);
  const [hex, label] = [FILLS[fill][1], FILLS[fill][0]];
  const dark = hex === "#f4f1ec" || hex === "#f5b400";
  return (
    <div className="fh-ins">
      <div className="fh-ins-board">
        <div className="fh-ins-card" style={{ borderRadius: r, fontFamily: FACES[face][1] }}>
          <span className="fh-ins-tag" style={{ color: hex === "#f4f1ec" ? "#a9a49c" : hex }}>
            New
          </span>
          <b>Launch week</b>
          <span className="fh-ins-sub">Your site, live in about a week.</span>
          <span className="fh-ins-btn" style={{ background: hex, color: dark ? "#141414" : "#fff", borderRadius: Math.max(4, r * 0.6) }}>
            Book a call
          </span>
        </div>
        <span className="fh-ins-size" aria-hidden="true">
          320 × 196
        </span>
      </div>
      <div className="fh-ins-panel">
        <div className="fh-ins-row">
          <span>Fill</span>
          <div className="fh-ins-sw">
            {FILLS.map(([n, h], i) => (
              <button key={n} type="button" aria-label={n} aria-pressed={i === fill} style={{ background: h }} onClick={() => setFill(i)} />
            ))}
          </div>
          <code>{label}</code>
        </div>
        <label className="fh-ins-row">
          <span>Radius</span>
          <input type="range" min={0} max={32} value={r} onChange={(e) => setR(+e.target.value)} />
          <code>{r}</code>
        </label>
        <div className="fh-ins-row">
          <span>Type</span>
          <div className="fh-ins-seg">
            {FACES.map(([n], i) => (
              <button key={n} type="button" aria-pressed={i === face} onClick={() => setFace(i)}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function States() {
  return (
    <span className="fh-states" aria-hidden="true">
      {["Rest", "Hover", "Press", "Off"].map((s) => (
        <span key={s} className={`fh-st fh-st-${s.toLowerCase()}`}>
          <i>Button</i>
          <small>{s}</small>
        </span>
      ))}
    </span>
  );
}

/* ---------- sites: every live site ---------- */

const GROUPS = ["All", "Products", "Pitch sites", "Concepts", "Templates"] as const;

function Gallery() {
  const [g, setG] = useState<(typeof GROUPS)[number]>("All");
  const list = g === "All" ? SITES : SITES.filter((w) => w.group === g);
  return (
    <>
      <div className="fh-chips" role="tablist" aria-label="Filter sites">
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
            <i />
            <i />
            <i />
            <span>{w.host}</span>
          </span>
          <span className="fh-site-view" style={{ ["--tall" as string]: `url(/sites/${w.key}-tall.webp)` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/sites/${w.key}.webp`} alt={`${w.name}, the first screen`} width={960} height={600} loading="lazy" decoding="async" />
          </span>
        </span>
        <span className="fh-site-meta">
          <b>{w.name}</b>
          <em>{w.group === "Products" ? "Product" : w.group === "Pitch sites" ? "Pitch" : w.group.replace(/s$/, "")}</em>
          <Chev d="M4.5 9.5l5-5M5.5 4.5h4v4" />
        </span>
        <span className="fh-site-line">{w.line}</span>
      </a>
    </li>
  );
}

/* ---------- ship: a week laid out ---------- */

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
        <i className="fh-live" /> Live on Friday
      </span>
    </div>
  );
}
