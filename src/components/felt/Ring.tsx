"use client";

/*
 * The first screen, after ignaru.com's dial (components/home/Arc.tsx): five felt doors on an arc over the line, from
 * the left of it, over the top, to the right of it. Each door is its felt piece drawn in glyphs (FeltGlyph); pointing at
 * one opens a window onto the felt itself and spells its name under it; a press opens its drawer. As the page scrolls
 * the turn passes along the arc: the door whose turn it is comes up to full strength and the line changes with it,
 * word by word. The places come from CSS (sin and cos of each door's angle, felt.css `fh-ring`), so the first paint is
 * already the arc; one rAF only writes each door's strength.
 *
 * Every few seconds one door (never the one whose turn it is) changes to another felt piece from its own set (copy.ts,
 * `set`): the glyphs flip over to the new picture. A timer only: it stops off screen, in a hidden tab, while a drawer is
 * open and under reduced motion. Under reduced motion the arc stands still and the lines are listed under it (CSS only).
 * The h1 is the same for everyone; the door lines drawn over it are hidden from screen readers, which read the doors'
 * own labels instead.
 *
 * Under the line: the places he has worked, in a dark capsule that runs like a marquee. At the foot: his best ads, by
 * his own scores (copy.ts, SHELF), shown clean.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { DRAWERS, LINE, SHELF, WORKED, type DrawerId } from "./copy";
import { FeltGlyph } from "./FeltGlyph";
import { sfx } from "./Sound";

const N = DRAWERS.length;
/** A waiting door's strength, against the one whose turn it is. Every door is the same size. */
const DIM = 0.8;
const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
/** The rhythm of the changes, from ignaru.com: a rest of 2.5 to 4 s, now and then a longer breath. */
const REST_MIN = 2500;
const REST_SPAN = 1500;
const BREATH = 0.22;
const COOL = 7000;

/** The opening line, in two: who, then what. His face sits before his name; the Ignaru petal, in glyphs, before Ignaru. */
function Opening() {
  const [a, b] = LINE;
  return (
    <span className="rg-w rg-w-one">
      <span className="rg-row">
        {a.split("Jawad")[0]}
        <span className="rg-me">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/felt/jawad-head-192.webp" srcSet="/felt/jawad-head-192.webp 1x, /felt/jawad-head-320.webp 2x" alt="" width={96} height={108} decoding="async" />
          Jawad
        </span>
        {a.split("Jawad")[1]}
      </span>{" "}
      <span className="rg-row">
        {b.split("Ignaru")[0]}
        <span className="rg-hi">
          <FeltGlyph art="petal" alt="" cell={4} className="rg-mark" />
          Ignaru
        </span>
        {b.split("Ignaru")[1]}
      </span>
    </span>
  );
}

/** One line, its words rising out of a blur one after another. */
function Words({ text, rich }: { text: string; rich?: ReactNode }) {
  if (rich) return <>{rich}</>;
  return (
    <>
      {text.split(" ").map((w, j) => (
        <span key={j} className="rg-w" style={{ "--j": j } as CSSProperties}>
          {w}{" "}
        </span>
      ))}
    </>
  );
}

/** Where he has worked, in a dark capsule: the label stays, the names run. Two copies so the loop has no seam. */
function Worked() {
  const row = (copy: number) => (
    <ul className="wk-row" aria-hidden={copy > 0 ? true : undefined}>
      {WORKED.map((w) => (
        <li key={w.name}>
          {w.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={w.logo} alt="" width={22} height={22} decoding="async" style={w.tile ? ({ background: w.tile } as CSSProperties) : undefined} />
          ) : null}
          <b>{w.name}</b>
          <span>{w.role}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="wk" role="group" aria-label="Where I've worked">
      <span className="wk-label">Where I&apos;ve worked</span>
      <div className="wk-track">
        <div className="wk-run">
          {row(0)}
          {row(1)}
        </div>
      </div>
    </div>
  );
}

export function Ring({ open, onOpen }: { open: DrawerId | null; onOpen: (id: DrawerId) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const objs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [still, setStill] = useState(false);
  const shown = hover ?? active;
  const [lines, setLines] = useState<{ k: number; out?: number }>({ k: 0 });
  if (lines.k !== shown) setLines({ k: shown, out: lines.k });

  const [arts, setArts] = useState<string[]>(() => DRAWERS.map((d) => d.art));
  const [seen, setSeen] = useState(false);
  const [tab, setTab] = useState(true);
  const live = useRef({ shown, arts });
  live.current = { shown, arts };

  useEffect(() => {
    const w = wrap.current;
    if (!w || typeof IntersectionObserver !== "function") return;
    const io = new IntersectionObserver(([e]) => setSeen(!!e?.isIntersecting));
    io.observe(w);
    const vis = () => setTab(document.visibilityState === "visible");
    vis();
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  const swapping = seen && tab && !open && !still;
  useEffect(() => {
    if (!swapping) return;
    const ts: number[] = [];
    const later = (fn: () => void, ms: number) => void ts.push(window.setTimeout(fn, ms));
    const lastAt = DRAWERS.map(() => -COOL);
    const tick = () => {
      const now = performance.now();
      const free = DRAWERS.map((_, i) => i).filter((i) => i !== live.current.shown && now - (lastAt[i] ?? 0) > COOL);
      const i = free[Math.floor(Math.random() * free.length)];
      if (i !== undefined) {
        const set = DRAWERS[i].set as readonly string[];
        const cur = live.current.arts[i] ?? set[0];
        const next = set[(set.indexOf(cur) + 1) % set.length];
        if (next && next !== cur) {
          lastAt[i] = now;
          setArts((a) => a.map((v, k) => (k === i ? next : v)));
        }
      }
      later(tick, REST_MIN + Math.random() * REST_SPAN + (Math.random() < BREATH ? 1800 + Math.random() * 1000 : 0));
    };
    later(tick, 2400);
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, [swapping]);

  // the turn passes along the arc as the page scrolls
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return;
    }
    let raf = 0;
    const place = () => {
      raf = 0;
      const w = wrap.current;
      if (!w) return;
      const span = w.offsetHeight - window.innerHeight;
      const s = span > 0 ? Math.min(1, Math.max(0, -w.getBoundingClientRect().top / span)) * (N - 1) : 0;
      DRAWERS.forEach((_, i) => {
        const el = objs.current[i];
        if (!el) return;
        const near = smooth(1 - Math.min(1, Math.abs(s - i)));
        el.style.opacity = (DIM + (1 - DIM) * near).toFixed(3);
      });
      setActive(Math.min(N - 1, Math.max(0, Math.round(s))));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(place);
    };
    place();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const textOf = (k: number) => (k <= 0 ? "" : DRAWERS[k]?.line ?? "");

  return (
    // reduced motion is laid out by CSS (felt.css), so the first paint and the hydrated page are the same height
    <div ref={wrap} className="fh-ring" style={{ "--n": N } as CSSProperties}>
      <div className={`rg-stage${open ? " is-dim" : ""}`}>
        <div className="rg-frame">
          {DRAWERS.map((d, i) => (
            <a
              key={d.id}
              ref={(el) => void (objs.current[i] = el)}
              href={`#${d.id}`}
              className={`rg-obj${i === 0 ? " is-first" : ""}${i === active ? " is-turn" : ""}`}
              style={{ "--c": d.color, "--i": i } as CSSProperties}
              aria-haspopup="dialog"
              aria-label={`${d.label}${d.line ? `: ${d.line}` : ""}`}
              onClick={(e) => {
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
                e.preventDefault();
                sfx("swap");
                onOpen(d.id);
              }}
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                sfx("hover");
                setHover(i);
              }}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            >
              <FeltGlyph art={arts[i] ?? d.art} alt={d.alt} reveal={hover === i} priority={i === 0} className="rg-fig" />
              <span className="rg-tag" aria-hidden="true">
                {[...d.label].map((ch, k) => (
                  <i key={k} style={{ "--k": k } as CSSProperties}>
                    {ch === " " ? " " : ch}
                  </i>
                ))}
              </span>
            </a>
          ))}
          <div className="rg-line">
            <div className="rg-say">
              {/* the page's title stays the same for screen readers; the door lines are a picture of the same doors */}
              <h1 className={shown === 0 ? "rg-l rg-h" : "rg-l rg-h is-off"}>
                <Opening />
              </h1>
              {lines.out !== undefined && lines.out > 0 && lines.out !== lines.k ? (
                <p key={`o${lines.out}`} className="rg-l is-out" aria-hidden="true" onAnimationEnd={(e) => e.target === e.currentTarget && setLines((l) => ({ k: l.k }))}>
                  <Words text={textOf(lines.out)} />
                </p>
              ) : null}
              {lines.k > 0 ? (
                <p key={`i${lines.k}`} className="rg-l is-in" aria-hidden="true">
                  <Words text={textOf(lines.k)} />
                </p>
              ) : null}
            </div>
            <p className="rg-sub">And designing sites and ads for startups.</p>
            <Worked />
          </div>
          {/* his best ads, by his own scores, standing along the bottom edge: each opens the ads drawer */}
          <ul className="rg-shelf" style={{ "--n": SHELF.length } as CSSProperties} aria-label="My best ads">
            {SHELF.map((w, i) => (
              <li key={w.src} style={{ "--i": i } as CSSProperties}>
                <button type="button" tabIndex={open ? -1 : 0} aria-label={`${w.alt} Spec ad. Opens the ads.`} onClick={() => { sfx("swap"); onOpen("ads"); }} onPointerEnter={(e) => e.pointerType === "mouse" && sfx("hover")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.src} srcSet={`${w.src} 480w, ${w.big} 960w`} sizes="(max-width: 760px) 30vw, 190px" alt="" width={480} height={600} decoding="async" draggable={false} />
                </button>
              </li>
            ))}
          </ul>
          <p className="rg-spec">Spec ads, made unasked. None of these companies is a client.</p>
        </div>
      </div>
      <ol className="rg-list">
        {DRAWERS.slice(1).map((d) => (
          <li key={d.id}>
            <b>{d.label}</b> {d.line}
          </li>
        ))}
      </ol>
    </div>
  );
}
