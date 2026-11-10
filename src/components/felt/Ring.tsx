"use client";

/*
 * The first screen, after ignaru.com's dial (components/home/Arc.tsx): five felt doors on a ring round the line, from the
 * bottom left, over the top, to the bottom right. All five are always there; as the page scrolls the turn passes along
 * the ring: the door whose turn it is grows to full size and strength, the rest wait at two thirds, and the line in the
 * middle changes with it, word by word. Pointing at a door does the same and shows its name under it; a press opens its
 * drawer. The places come from CSS (sin and cos of each door's angle, felt.css `fh-ring`), so the first paint is already
 * the ring; one rAF only writes each door's scale and opacity.
 *
 * Every few seconds one or two doors (never the one whose turn it is) change to another felt piece from their own set
 * (copy.ts, `set`), decoded before it shows. A timer and CSS animations only: it stops off screen, in a hidden tab, while
 * a drawer is open and under reduced motion. Under reduced motion the ring stands still and the lines are listed under
 * it (CSS only, so nothing moves when the page hydrates). The h1 is the same for everyone; the door lines drawn over it
 * are hidden from screen readers, which read the doors' own labels instead.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CRED, DRAWERS, LINE, SHELF, feltSrc, type DrawerId } from "./copy";
import { sfx } from "./Sound";

const N = DRAWERS.length;
/** A waiting door, against the one whose turn it is: its size and its strength. */
const REST = 0.64;
/** ignaru.com waits its doors at 0.35 (measured live, 7 Nov); ours wait brighter so every door reads as a door. */
const DIM = 0.74;
const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const SIZES = "(max-width: 760px) 26vw, 17vw";
/** The rhythm of the changes, from ignaru.com: a rest of 2 to 3.5 s, now and then a longer breath, sometimes a pair. */
const REST_MIN = 2000;
const REST_SPAN = 1500;
const BREATH = 0.22;
const PAIR = 0.35;
const COOL = 6500;

function ready(art: string) {
  const f = feltSrc(art);
  const img = new Image();
  img.sizes = SIZES;
  img.srcset = f.srcSet;
  img.src = f.src;
  return img.decode().catch(() => undefined);
}

/** The opening line: who, then what. His face sits small before his name, cut out with no disc behind it, and a felt
 *  petal sits before "Ignaru" in its own purple. */
function Opening() {
  const [a, b] = LINE;
  const at = a.indexOf("Ignaru");
  const me = a.indexOf("Jawad");
  return (
    <span className="rg-w rg-w-one">
      {a.slice(0, me)}
      <span className="rg-me">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/felt/jawad-head-96.webp" srcSet="/felt/jawad-head-96.webp 1x, /felt/jawad-head-192.webp 2x" alt="" width={48} height={54} decoding="async" />
        Jawad
      </span>
      {a.slice(me + 5, at)}
      <span className="rg-hi">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/felt/petal-1x.webp" alt="" width={48} height={48} decoding="async" />
        Ignaru
      </span>
      {a.slice(at + 6)}
      <br className="rg-br" /> {b}
    </span>
  );
}

const LONDON = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hour12: false });

/** Under the line: where he is and his time there, in mono. The time fills in after mount (the server's clock would not
 *  match the reader's), on the minute after that. */
function Where() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    let t = 0;
    const tick = () => {
      setNow(LONDON.format(new Date()));
      t = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    };
    tick();
    return () => window.clearTimeout(t);
  }, []);
  return (
    <span className="rg-where" aria-hidden="true">
      London <span className="rg-time">{now ?? "--:--"}</span>
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

/** A small puff of felt sparks where a door was pressed. */
function puff(at: HTMLElement) {
  const p = document.createElement("img");
  p.src = feltSrc("onb-spark").src;
  p.alt = "";
  p.className = "rg-puff";
  at.appendChild(p);
  void p
    .animate(
      [
        { opacity: 0, transform: "translate(-50%, -50%) scale(0.4)" },
        { opacity: 1, transform: "translate(-50%, -50%) scale(1)", offset: 0.35 },
        { opacity: 0, transform: "translate(-50%, -62%) scale(1.25)" },
      ],
      { duration: 520, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
    )
    .finished.then(() => p.remove());
}

export function Ring({ open, onOpen }: { open: DrawerId | null; onOpen: (id: DrawerId) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const objs = useRef<(HTMLAnchorElement | null)[]>([]);
  const figs = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [still, setStill] = useState(false);
  const shown = hover ?? active;
  const [lines, setLines] = useState<{ k: number; out?: number }>({ k: 0 });
  if (lines.k !== shown) setLines({ k: shown, out: lines.k });

  const [arts, setArts] = useState<string[]>(() => DRAWERS.map((d) => d.art));
  const [gone, setGone] = useState<(string | null)[]>(() => DRAWERS.map(() => null));
  const [tilt, setTilt] = useState<number[]>(() => DRAWERS.map(() => 0));
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
    let off = false;
    const ts: number[] = [];
    const later = (fn: () => void, ms: number) => void ts.push(window.setTimeout(fn, ms));
    const lastAt = DRAWERS.map(() => -COOL);
    const swap = async (i: number) => {
      const set = DRAWERS[i].set as readonly string[];
      const now = live.current.arts[i] ?? set[0];
      const next = set[(set.indexOf(now) + 1) % set.length];
      if (!next || next === now) return;
      await ready(next);
      if (off || live.current.shown === i) return;
      lastAt[i] = performance.now();
      const r = Math.round((Math.random() * 2 - 1) * 9);
      setTilt((t) => t.map((v, k) => (k === i ? r : v)));
      setGone((g) => g.map((v, k) => (k === i ? now : v)));
      setArts((a) => a.map((v, k) => (k === i ? next : v)));
      later(() => setGone((g) => g.map((v, k) => (k === i && v === now ? null : v))), 520);
    };
    const tick = () => {
      const now = performance.now();
      const free = DRAWERS.map((_, i) => i).filter((i) => i !== live.current.shown && now - (lastAt[i] ?? 0) > COOL);
      const a = free[Math.floor(Math.random() * free.length)];
      if (a !== undefined) {
        void swap(a);
        const far = free.filter((i) => Math.abs(i - a) > 1);
        const b = Math.random() < PAIR ? far[Math.floor(Math.random() * far.length)] : undefined;
        if (b !== undefined) later(() => void swap(b), 240 + Math.random() * 420);
      }
      later(tick, REST_MIN + Math.random() * REST_SPAN + (Math.random() < BREATH ? 1800 + Math.random() * 1000 : 0));
    };
    later(tick, 1600);
    return () => {
      off = true;
      ts.forEach((t) => window.clearTimeout(t));
    };
  }, [swapping]);

  // the turn passes along the ring as the page scrolls
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
        el.style.scale = (REST + (1 - REST) * near).toFixed(4);
        el.style.opacity = (DIM + (1 - DIM) * near).toFixed(3);
        el.style.zIndex = near > 0.5 ? "3" : "2";
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

  // the felt squish, once, as a door's turn comes
  useEffect(() => {
    if (still) return;
    figs.current[active]?.animate([{ transform: "scale(1)" }, { transform: "scale(1.09, 1.05)", offset: 0.35 }, { transform: "scale(0.97, 1.01)", offset: 0.7 }, { transform: "scale(1)" }], { duration: 560, easing: "cubic-bezier(0.3, 0.7, 0.4, 1)" });
  }, [active, still]);

  const textOf = (k: number) => (k <= 0 ? "" : DRAWERS[k]?.line ?? "");

  return (
    // reduced motion is laid out by CSS (felt.css), so the first paint and the hydrated page are the same height
    <div ref={wrap} className="fh-ring" style={{ "--n": N } as CSSProperties}>
      <div className={`rg-stage${open ? " is-dim" : ""}`}>
        {DRAWERS.map((d, i) => {
          const art = arts[i] ?? d.art;
          const img = feltSrc(art);
          const was = gone[i];
          return (
            <a
              key={d.id}
              ref={(el) => void (objs.current[i] = el)}
              href={`#${d.id}`}
              className={`rg-obj${i === 0 ? " is-first" : i === N - 1 ? " is-last" : ""}`}
              style={{ "--c": d.color, "--i": i } as CSSProperties}
              aria-haspopup="dialog"
              aria-label={`${d.label}${d.line ? `: ${d.line}` : ""}`}
              onClick={(e) => {
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
                e.preventDefault();
                const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                if (!reduce) {
                  figs.current[i]?.animate([{ transform: "scale(1)" }, { transform: "scale(0.88, 0.92)", offset: 0.3 }, { transform: "scale(1.05)", offset: 0.68 }, { transform: "scale(1)" }], { duration: 420, easing: "cubic-bezier(0.3, 0.7, 0.4, 1)" });
                  puff(e.currentTarget);
                }
                sfx("swap");
                window.setTimeout(() => onOpen(d.id), reduce ? 0 : 160);
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
              <span className="rg-fig" ref={(el) => void (figs.current[i] = el)}>
                {was ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`o-${was}`} className="rg-img is-out" style={{ "--r": `${tilt[i] ?? 0}deg` } as CSSProperties} src={feltSrc(was).src} srcSet={feltSrc(was).srcSet} sizes={SIZES} alt="" width={320} height={320} draggable={false} />
                ) : null}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={art}
                  className={`rg-img${art !== d.art || was ? " is-in" : ""}`}
                  style={{ "--r": `${tilt[i] ?? 0}deg` } as CSSProperties}
                  src={img.src}
                  srcSet={img.srcSet}
                  sizes={SIZES}
                  alt={art === d.art ? d.alt : ""}
                  width={320}
                  height={320}
                  fetchPriority={i === 0 && art === d.art ? "high" : "auto"}
                  decoding="async"
                  draggable={false}
                />
              </span>
              <span className="rg-tag" aria-hidden="true">
                {[...d.label].map((ch, k) => (
                  <i key={k} style={{ "--k": k } as CSSProperties}>
                    {ch === " " ? " " : ch}
                  </i>
                ))}
              </span>
            </a>
          );
        })}
        <div className="rg-line">
          {/* the page's title stays the same for screen readers; the door lines are a picture of the same doors */}
          <h1 className={shown === 0 ? "rg-l rg-h" : "rg-l rg-h is-off"}>
            <Opening />
            <span className="rg-cred">{CRED}</span>
            <Where />
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
        {/* his best work, standing along the bottom edge: each card opens the drawer it belongs to */}
        <ul className="rg-shelf" style={{ "--n": SHELF.length } as CSSProperties} aria-label="Some of my work">
          {SHELF.map((w, i) => (
            <li key={w.src} className={w.kind === "ad" ? "is-ad" : "is-site"} style={{ "--i": i } as CSSProperties}>
              <button type="button" tabIndex={open ? -1 : 0} aria-label={`${w.alt}. ${w.kind === "ad" ? "Spec ad. " : ""}Opens ${w.to === "ads" ? "the ads" : "my work"}.`} onClick={() => { sfx("swap"); onOpen(w.to); }} onPointerEnter={(e) => e.pointerType === "mouse" && sfx("hover")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.src} alt="" width={w.w} height={w.h} decoding="async" draggable={false} />
              </button>
            </li>
          ))}
        </ul>
        <p className="rg-cred rg-spec">Spec work by Ignura, not commissioned by these companies.</p>
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
