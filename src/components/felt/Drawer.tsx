"use client";

/*
 * The drawers: a native modal <dialog> on the right (full screen on a phone), one small illustrated page per slot,
 * each with one crafted thing to touch: the agents Ignaru works with, a curve to bend, the recent sites, the way a
 * project ships. Escape and the backdrop close it, the arrow keys step through. Styles: felt.css (`fh-dr`).
 */
import { useEffect, useRef, useState, type PointerEvent as RPE } from "react";
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
  const s = SLOTS[shown];
  const icon = feltSrc(s.shapes[0].src);
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
            {shown + 1} of {SLOTS.length}
          </span>
        </div>
        <button type="button" onClick={() => ref.current?.close()} aria-label="Close">
          <Chev d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
        </button>
      </div>
      <article className="fh-dr-page" key={s.id}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="fh-dr-icon" src={icon.src} alt="" width={104} height={104} />
        <h2 id="fh-dr-t">{s.title}</h2>
        {s.id === "agents" && <Agents />}
        {s.id === "design" && <Design />}
        {s.id === "sites" && <Sites />}
        {s.id === "ship" && <Ship b={booking} />}
      </article>
    </dialog>
  );
}

const Chev = ({ d }: { d: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const AGENTS = [
  { name: "Claude Code", shape: "claude", mark: "this hero", ask: "feels cramped, give it room" },
  { name: "Codex", shape: "openai", mark: "this button", ask: "should match the one on pricing" },
  { name: "Gemini", shape: "gemini", mark: "this type", ask: "is too small on a phone" },
  { name: "Grok", shape: "grok", mark: "these links", ask: "should line up with the logo" },
];

function Agents() {
  const [a, setA] = useState(0);
  const ag = AGENTS[a];
  return (
    <>
      <p>
        Ignaru is a design canvas that opens the repo you already have. You circle what looks wrong on a page, and your
        coding agent fixes it in your files.
      </p>
      <div className="fh-card fh-agents">
        <div className="fh-shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sites/ignaru.webp" alt="ignaru.com, the first screen" width={960} height={600} />
          <span className="fh-shot-ring" aria-hidden="true" />
        </div>
        <div className="fh-seg" role="tablist" aria-label="Agents">
          {AGENTS.map((g, i) => (
            <button key={g.name} type="button" role="tab" aria-selected={i === a} onClick={() => setA(i)}>
              {g.name}
            </button>
          ))}
        </div>
        <div className="fh-compose" key={ag.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={feltSrc(ag.shape).src} alt="" width={36} height={36} />
          <span>
            <span className="fh-circle">{ag.mark}</span> {ag.ask}
          </span>
          <span className="fh-send" aria-hidden="true">
            <Chev d="M7 11V3M3.5 6.5 7 3l3.5 3.5" />
          </span>
        </div>
      </div>
      <div className="fh-dr-cta">
        <a className="fh-btn" href="https://ignaru.com" target="_blank" rel="noreferrer">
          Open ignaru.com
        </a>
      </div>
    </>
  );
}

function Design() {
  const [p, setP] = useState({ a: { x: 80, y: 18 }, b: { x: 220, y: 18 } });
  const drag = useRef<"a" | "b" | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const move = (e: RPE<SVGSVGElement>) => {
    const k = drag.current, el = svg.current;
    if (!k || !el) return;
    const r = el.getBoundingClientRect();
    const x = Math.max(8, Math.min(292, ((e.clientX - r.left) / r.width) * 300));
    const y = Math.max(8, Math.min(152, ((e.clientY - r.top) / r.height) * 160));
    setP((q) => ({ ...q, [k]: { x, y } }));
  };
  const h = (k: "a" | "b") => ({
    onPointerDown: (e: RPE<SVGCircleElement>) => {
      drag.current = k;
      svg.current?.setPointerCapture(e.pointerId);
    },
  });
  return (
    <>
      <p>
        I design from the brand to the last screen: the type, the colour, the motion, and every state a page can be in.
        Then I build it, so nothing gets lost between a mock and the site.
      </p>
      <div className="fh-card">
        <svg ref={svg} className="fh-bez" viewBox="0 0 300 160" onPointerMove={move} onPointerUp={() => (drag.current = null)} aria-label="A curve with two handles you can drag">
          <path d={`M20 140 L${p.a.x} ${p.a.y} M280 140 L${p.b.x} ${p.b.y}`} className="fh-bez-arm" />
          <path d={`M20 140 C${p.a.x} ${p.a.y} ${p.b.x} ${p.b.y} 280 140`} className="fh-bez-line" />
          <circle cx="20" cy="140" r="5" className="fh-bez-end" />
          <circle cx="280" cy="140" r="5" className="fh-bez-end" />
          <circle cx={p.a.x} cy={p.a.y} r="9" className="fh-bez-h" {...h("a")} />
          <circle cx={p.b.x} cy={p.b.y} r="9" className="fh-bez-h" {...h("b")} />
        </svg>
        <p className="fh-cap">Drag a handle. Every curve on my sites starts like this.</p>
      </div>
      <Swatches />
    </>
  );
}

const SW = [
  ["Petal", "#9a4dea"],
  ["Coral", "#f0454f"],
  ["Yolk", "#f5b400"],
  ["Sky", "#1f7ae0"],
  ["Ink", "#050505"],
];

function Swatches() {
  const [got, setGot] = useState<string | null>(null);
  return (
    <div className="fh-card fh-sw">
      <p className="fh-sw-h">This site&apos;s palette. Click to copy.</p>
      <ul>
        {SW.map(([n, hex]) => (
          <li key={n}>
            <button
              type="button"
              style={{ ["--sw" as string]: hex }}
              onClick={() => {
                void navigator.clipboard?.writeText(hex);
                setGot(n);
                setTimeout(() => setGot((g) => (g === n ? null : g)), 1200);
              }}
            >
              <i />
              <b>{got === n ? "Copied" : n}</b>
              <span>{hex}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const GROUPS = ["All", "Products", "Pitch sites", "Concepts", "Templates"] as const;

function Sites() {
  const [g, setG] = useState<(typeof GROUPS)[number]>("All");
  const list = g === "All" ? SITES : SITES.filter((w) => w.group === g);
  return (
    <>
      <p>
        {SITES.length} live sites: my products, pitch sites for founders, redesign concepts and templates. Each one
        designed and built from scratch.
      </p>
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
          <em>{w.group === "Products" ? "Product" : w.group.replace(/s$/, "").replace("Pitch site", "Pitch")}</em>
          <Chev d="M4.5 9.5l5-5M5.5 4.5h4v4" />
        </span>
        <span className="fh-site-line">{w.line}</span>
      </a>
    </li>
  );
}

const STEPS = [
  ["Call", "Fifteen minutes on what the site has to do and who it is for."],
  ["Design", "The brand, the type and every screen, shown to you as it grows."],
  ["Build", "Real code in your repo, not a template you rent."],
  ["Ship", "A launch page live in about a week, then we keep going."],
];

function Ship({ b }: { b: Booking }) {
  return (
    <>
      <p>Most projects start with a short call through Ignura, my studio. From there it goes like this.</p>
      <ol className="fh-steps">
        {STEPS.map(([k, v], i) => (
          <li key={k} style={{ ["--i" as string]: i }}>
            <span className="fh-step-n">{i + 1}</span>
            <b>{k}</b>
            <span>{v}</span>
          </li>
        ))}
      </ol>
      <div className="fh-card fh-cal">
        <Book b={b} big />
        {b.slots.length > 0 && (
          <>
            <p className="fh-cal-h">Next free days</p>
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
          </>
        )}
      </div>
    </>
  );
}
