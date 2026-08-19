"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHANGES, CLOSE, EVIDENCE_LINE, INTRO, UNTOUCHED, type Change } from "./data";
import AgentsFeed from "./AgentsFeed";
import MorningReport from "./MorningReport";
import CreditsPanel from "./CreditsPanel";

/* Reveal on entry. One observer for the whole page, so scrolling stays cheap. */
function useReveal(rootRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".ok-rise"));
    if (!els.length) return;

    // Anything already on screen is revealed at once, so the first paint is
    // never blank. The observer only handles what is still below the fold.
    root.classList.add("ok-js");
    const reveal = (el: Element) => el.classList.add("is-in");
    const onScreen = (el: HTMLElement) => el.getBoundingClientRect().top < window.innerHeight * 0.95;

    requestAnimationFrame(() => els.filter(onScreen).forEach(reveal));

    if (!("IntersectionObserver" in window)) {
      els.forEach(reveal);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));

    // Belt and braces: whatever the observer has not reached after 4s is shown.
    const failsafe = window.setTimeout(() => els.forEach(reveal), 4000);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [rootRef]);
}

/* Which change is under the reader, for the rail. */
function useActive(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (seen) setActive(seen.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

function useViewport() {
  const [vp, setVp] = useState({ w: 1440, h: 900, narrow: false });
  useEffect(() => {
    const on = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setVp({ w, h, narrow: w < 1150 });
    };
    on();
    window.addEventListener("resize", on, { passive: true });
    return () => window.removeEventListener("resize", on);
  }, []);
  return vp;
}

const DOT = 26;
const GAP = 28;
const LABEL_W = 200;

function BeforeStage({ c, narrow, vw }: { c: Change; narrow: boolean; vw: number }) {
  const fw = Math.round(c.crop.w * c.crop.s);
  const fh = Math.round(c.crop.h * c.crop.s);
  const mobScale = narrow ? Math.min(1.6, Math.max(280, vw - 32) / fw) : 1;

  const crop: React.CSSProperties = {
    backgroundImage: `url('${c.crop.src}')`,
    backgroundSize: `${Math.round(2880 * c.crop.s)}px auto`,
    backgroundPosition: `${Math.round(-c.crop.sx * c.crop.s)}px ${Math.round(-c.crop.sy * c.crop.s)}px`,
    width: fw,
    height: fh,
    ...(narrow
      ? { position: "absolute", inset: "auto", transform: `scale(${mobScale})`, transformOrigin: "top left" }
      : {}),
  };

  return (
    <div
      style={{
        position: "relative",
        width: narrow ? Math.round(fw * mobScale) : fw,
        height: narrow ? Math.round(fh * mobScale) : fh,
        maxWidth: "100%",
        flex: "0 0 auto",
        overflow: narrow ? "hidden" : undefined,
        borderRadius: narrow ? 16 : undefined,
        margin: narrow ? "0 auto" : undefined,
      }}
    >
      <div className="ok-crop" style={crop} />
      {!narrow &&
        c.beforeAnns.map((a) => {
          const x = Math.round((a.ix - c.crop.sx) * c.crop.s);
          const y = Math.round((a.iy - c.crop.sy) * c.crop.s);
          const right = a.side === "right";
          return (
            <span key={a.n}>
              <span
                style={{
                  position: "absolute",
                  top: y,
                  height: 1,
                  background: "var(--rule)",
                  left: right ? x + 14 : -GAP,
                  width: right ? fw - x - 14 + GAP : x - 14 + GAP,
                }}
              />
              <span className="ok-dot" style={{ left: x - DOT / 2, top: y - DOT / 2 }}>
                {a.n}
              </span>
              <span
                style={{
                  position: "absolute",
                  top: y - 11,
                  width: LABEL_W,
                  fontSize: 15,
                  lineHeight: "22px",
                  color: "var(--ink-2)",
                  textWrap: "pretty",
                  left: right ? fw + GAP + 12 : -GAP - 12 - LABEL_W,
                  textAlign: right ? "left" : "right",
                }}
              >
                {a.label}
              </span>
            </span>
          );
        })}
    </div>
  );
}

function AfterMock({ c, narrow, vw, vh }: { c: Change; narrow: boolean; vw: number; vh: number }) {
  const [hovered, setHovered] = useState(false);
  const avail = Math.max(280, vw - (narrow ? 32 : 64));
  const maxH = vh * (narrow ? 0.78 : 0.82);
  const k = Math.min(1, avail / c.mock.nw, maxH / c.mock.nh);

  return (
    <div
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{ position: "relative", width: Math.round(c.mock.nw * k), maxWidth: "100%", margin: "0 auto" }}
    >
      <div className="ok-frame" style={{ width: "100%", height: Math.round(c.mock.nh * k) }}>
        <div
          style={{
            width: c.mock.nw,
            height: c.mock.nh,
            flex: "0 0 auto",
            transform: `scale(${k})`,
            transformOrigin: "top left",
          }}
        >
          {c.kind === "feed" && <AgentsFeed width={600} />}
          {c.kind === "note" && <MorningReport />}
          {c.kind === "credits" && <CreditsPanel />}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: c.mock.nw,
          height: c.mock.nh,
          pointerEvents: "none",
          transform: `scale(${k})`,
          transformOrigin: "top left",
        }}
      >
        {c.afterAnns.map((a) => (
          <span
            key={a.n}
            className="ok-dot"
            style={{ left: a.x - DOT / 2, top: a.y - DOT / 2, opacity: hovered ? 0 : 1 }}
          >
            {a.n}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Walkthrough() {
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef);
  const { w: vw, h: vh, narrow } = useViewport();
  const idsRef = useRef(CHANGES.map((c) => `ch-${c.kind}`));
  const active = useActive(idsRef.current);

  const go = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  return (
    <div className="ok" ref={rootRef}>
      <nav className="ok-rail" aria-label="Sections">
        {CHANGES.map((c, i) => {
          const id = `ch-${c.kind}`;
          return (
            <button key={id} data-on={active === id} onClick={() => go(id)} aria-label={c.title}>
              <i />
              <em>{String(i + 1).padStart(2, "0")}</em>
            </button>
          );
        })}
      </nav>

      <header className="ok-intro">
        <div className="ok-intro-in">
          <div className="ok-kicker ok-rise">{INTRO.kicker}</div>
          <h1 className="ok-h1 ok-rise">{INTRO.title}</h1>
          <p className="ok-lede ok-rise">{INTRO.body}</p>
          <div className="ok-three">
            {INTRO.lines.map((l, i) => (
              <div key={l} className="ok-rise">
                <b>{String(i + 1).padStart(2, "0")}</b>
                <span>{l}</span>
              </div>
            ))}
          </div>
          <div className="ok-scrollcue ok-rise">
            Scroll. Their build stays behind, mine comes over the top.
          </div>
        </div>
      </header>

      {CHANGES.map((c) => (
        <section key={c.kind} id={`ch-${c.kind}`} style={{ position: "relative" }}>
          <div className="ok-sticky">
            <div className="ok-before-row">
              <div className="ok-title-col">
                <span className="ok-num">{c.num}</span>
                <h2 className="ok-h2">{c.title}</h2>
                <p className="ok-problem">{c.problem}</p>
                <span className="ok-shotnote">{c.shotNote}</span>
              </div>
              <div className="ok-stage-col">
                <BeforeStage c={c} narrow={narrow} vw={vw} />
                {narrow && (
                  <div className="ok-mobile-notes">
                    {c.beforeAnns.map((a) => (
                      <div key={a.n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span className="ok-chip">{a.n}</span>
                        <span style={{ flex: 1, fontSize: 15, lineHeight: "23px", color: "var(--ink-2)" }}>
                          {a.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="ok-after">
            <div className="ok-after-head">
              <h3 className="ok-h3">{c.afterTitle}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" }}>
                <span className="ok-hint">live, and it works. Hover to clear the notes.</span>
                <a className="ok-open" href={c.href}>
                  Open on its own <span style={{ fontSize: 15 }}>↗</span>
                </a>
              </div>
            </div>

            <AfterMock c={c} narrow={narrow} vw={vw} vh={vh} />

            <div className="ok-legend">
              {c.afterAnns.map((a) => (
                <div key={a.n}>
                  <span className="ok-chip">{a.n}</span>
                  <span style={{ flex: 1, fontSize: 15.5, lineHeight: "23px", color: "var(--ink-2)" }}>
                    {a.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="ok-measure">{c.measure}</div>
          </div>
        </section>
      ))}

      <footer className="ok-tail">
        <div className="ok-tail-in">
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <span className="ok-h4">How I got the evidence</span>
            <p className="ok-body">{EVIDENCE_LINE}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <span className="ok-h5">What I left alone</span>
            <div className="ok-cols">
              {UNTOUCHED.map((u) => (
                <div key={u.title}>
                  <b>{u.title}</b>
                  <span>{u.why}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <span className="ok-h5">{CLOSE.title}</span>
            <p className="ok-body">{CLOSE.body}</p>
            <div className="ok-sign">
              <span>Jawad Jalal</span>
              <a href="https://jawadjalal.com">jawadjalal.com</a>
              <a href="mailto:hi@jawadjalal.com">hi@jawadjalal.com</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
