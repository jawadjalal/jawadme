"use client";

/*
 * The opening: Jawad's face, large on its navy disc, and beside it a drawer that is already open, in the same cut as the
 * site's drawers (square, #0c0c0c, docked to the right; a sheet from the foot on a phone), holding who he is and what
 * the page shows below. The face settles in on a soft spring, the drawer slides in after it, its lines rise one by one.
 *
 * The one live thing: the face looks towards the pointer (a few pixels and degrees, eased each frame by a direct
 * transform write on the head, never React state), and a press gives it a felt squish. Under reduced motion it stands
 * still. Scroll does the rest in CSS (intro.css, `op-run`): the stage is sticky for one screen while the Wayari section
 * rises over it, and the face and drawer step back on a scroll timeline, on the compositor.
 *
 * The head is public/felt/jawad-head-640.webp, cut from design/jawad-cut.webp (640 by 723, the largest source there is),
 * placed inside the disc by the numbers in intro.css (`--hl` and friends) so the whole head sits in with room round it.
 */
import { useEffect, useRef, type MouseEvent } from "react";
import { sfx } from "./Sound";

const ROWS = [
  { href: "#s-wayari", name: "wayari", line: "what i'm building: agents on your branches, one pull request.", mark: "wayari" },
  { href: "#s-okara", name: "okara", line: "product intern, at an ai cmo used by 150k websites.", mark: "okara" },
  { href: "#s-menufit", name: "menufit", line: "a client: i designed new screens for an app 1.5m people use.", mark: "menufit" },
  { href: "#s-work", name: "sites and ads", line: "client work, concepts and spec, each labelled.", mark: "work" },
] as const;

export function OkaraMark({ size = 18 }: { size?: number }) {
  // okara.ai's own mark (its `landing-mark` symbol), in the ink of whatever it sits in
  return (
    <svg viewBox="0 0 250 310" width={size} height={(size * 310) / 250} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M221.74 259.537H194.023V309.933H166.306V259.537H194.022V209.142H166.305V259.537H138.588V209.142H110.87V259.537H83.1533V309.933H55.4355V259.537H83.1523V209.142H55.4346V259.537H27.7178V181.424H221.74V259.537ZM138.588 309.933H110.87V259.537H138.588V309.933ZM27.7178 181.424H0V55.4355H27.7178V181.424ZM249.458 181.424H221.74V55.4355H249.458V181.424ZM86.9326 136.067H59.2148V80.6328H86.9326V136.067ZM190.243 136.067H162.525V80.6328H190.243V136.067ZM55.4346 55.4355H27.7178V27.7178H55.4346V55.4355ZM194.023 27.7178H221.74V55.4355H194.022V27.7178H55.4355V0H194.023V27.7178Z"
      />
    </svg>
  );
}

function Mark({ kind }: { kind: (typeof ROWS)[number]["mark"] }) {
  if (kind === "wayari")
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="op-mk op-mk-wy" src="/wayari/icon.svg" alt="" width={34} height={34} />;
  if (kind === "okara")
    return (
      <span className="op-mk op-mk-ok">
        <OkaraMark size={16} />
      </span>
    );
  if (kind === "menufit")
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="op-mk op-mk-mf" src="/logos/menufit-bag-128.webp" alt="" width={34} height={38} />;
  return (
    <span className="op-mk op-mk-wk" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/showcase/audora-720.webp" alt="" width={28} height={18} loading="lazy" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/showcase/mercy-720.webp" alt="" width={28} height={18} loading="lazy" />
    </span>
  );
}

export function Intro() {
  const face = useRef<HTMLButtonElement>(null);
  const head = useRef<HTMLImageElement>(null);

  // the face looks towards the pointer: a target set on move, eased each frame, written straight to the head's transform
  useEffect(() => {
    const f = face.current;
    const h = head.current;
    if (!f || !h) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const step = () => {
      x += (tx - x) * 0.09;
      y += (ty - y) * 0.09;
      h.style.transform = `translate3d(${(x * 12).toFixed(2)}px, ${(y * 8).toFixed(2)}px, 0) rotate(${(x * 3.2).toFixed(2)}deg)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(step) : 0;
    };
    const move = (e: PointerEvent) => {
      const r = f.getBoundingClientRect();
      if (r.bottom < 0) return;
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2)));
      if (!raf) raf = requestAnimationFrame(step);
    };
    const leave = () => {
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(step);
    };
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const squish = () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    sfx("swap");
    face.current?.querySelector(".op-disc")?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.06, 0.95)", offset: 0.3 }, { transform: "scale(0.98, 1.02)", offset: 0.65 }, { transform: "scale(1)" }],
      { duration: 520, easing: "cubic-bezier(0.3, 0.7, 0.4, 1)" },
    );
  };

  const jump = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const to = document.querySelector(href);
    if (!to) return;
    e.preventDefault();
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    to.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    history.replaceState(null, "", href);
  };

  return (
    <div className="op-run" id="top">
      <section className="op" aria-labelledby="op-h">
        <div className="op-face-wrap">
          <button ref={face} type="button" className="op-face" onClick={squish} aria-label="Jawad's face. Press it.">
            <span className="op-disc" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={head}
              className="op-head"
              src="/felt/jawad-head-640.webp"
              srcSet="/felt/jawad-head-320.webp 320w, /felt/jawad-head-640.webp 640w"
              sizes="(max-width: 860px) 46vw, min(31vw, 46svh, 400px)"
              alt="Jawad, drawn as a cartoon: curly black hair, brown eyes"
              width={640}
              height={723}
              fetchPriority="high"
              draggable={false}
            />
          </button>
        </div>

        <aside className="op-dr" aria-label="Who this is">
          <div className="op-dr-in">
            <h1 id="op-h" className="op-h">
              hi, i&apos;m jawad.
            </h1>
            <p className="op-p">
              i design and build things for the web, from london. right now that&apos;s wayari, plus sites and ads for startups.
            </p>
            <ul className="op-list">
              {ROWS.map((r, i) => (
                <li key={r.href} style={{ ["--d" as string]: i }}>
                  <a href={r.href} onClick={(e) => jump(e, r.href)}>
                    <Mark kind={r.mark} />
                    <span className="op-row">
                      <b>{r.name}</b>
                      <span>{r.line}</span>
                    </span>
                    <svg className="op-down" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
                      <path d="M6 2v8M2.5 6.5 6 10l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
            <p className="op-cue" aria-hidden="true">
              <span className="op-cue-dot" />
              scroll, and the page turns into wayari
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
