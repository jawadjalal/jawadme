"use client";

// The intro — eight dots orbiting in the middle of the screen, gathering into a
// tight cluster, then flying up to where the avatar is about to appear.
//
// The whole thing is one rAF loop writing SVG attributes. It is deliberately
// not React state: eight circles × three attributes at 60fps is 1440 writes a
// second, and none of it should touch the reconciler.
//
// Three things run on their own clocks and overlap:
//   0.0s  the ring fades up and starts turning
//   1.55s a short vertical bounce ripples through the dots, in three groups
//   0.70s the flight begins — a cubic bezier from centre screen to the header
//   2.28s "Thinking..." fades in under the flight path
//   3.33s the label slides out and the profile takes over

import { useEffect, useRef } from "react";

const INK = "#0A0A0A";
const SHIMMER = "#b1b1ad";

const COUNT = 8;

// Orbit geometry. The radius wobbles by ±150/200 through the wave table below,
// which is what gives the ring its lopsided, breathing outline.
const WOBBLE = 150;
const ORBIT_RADIUS = 11250 / 200;
const DOT_RADIUS = 3750 / 200;
const SPIN_DEG_PER_SEC = 36;
const WAVE_SPEED = 1.6;

// One period of the wobble, sampled at 21 points: `RISE` shifts the orbit
// radius, `SWELL` scales the dot. Both are read with linear interpolation.
const RISE = [
  -16, -14.4, -10.3, -5, -0.2, 3.2, 5.1, 5.8, 6, 6, 6, 6, 6, 5.8, 5.1, 3.3, -0.2, -5, -10.3, -14.4,
  -16,
];
const SWELL = [
  1.3, 1.27, 1.191, 1.09, 0.998, 0.932, 0.897, 0.884, 0.88, 0.88, 0.88, 0.88, 0.88, 0.884, 0.897,
  0.932, 0.998, 1.09, 1.191, 1.27, 1.3,
];

// Where the dots land: the left edge of the 640px column, plus its 24px gutter.
const LANDED_RADIUS = 4;
const LANDED_GAP = 14;
const LANDED_TOP = 100;
const landedLeft = (viewportWidth: number) =>
  (viewportWidth - Math.min(viewportWidth, 640)) / 2 + 24 + LANDED_RADIUS;

// Timings, in seconds.
const FADE_IN = 0.4;
const FLIGHT_START = 0.7;
const FLIGHT_LENGTH = 0.85;
const FLIGHT_STAGGER = 0.25;
const BOUNCE_AT = 1.55;
const BOUNCE_LENGTH = 0.35;
const BOUNCE_STAGGER = 0.09;
const SHRINK_LENGTH = 0.2;
const SHRINK_STAGGER = 0.05;
const SHRINK_AT = 2.18;
const LABEL_AT = 2.28;
const LABEL_FADE = 0.25;
const SHIMMER_PERIOD = 0.7;
const DONE_AT = 3.33;

const TAU = Math.PI * 2;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

// Samples the wobble table at a fractional index, wrapping.
function wave(at: number) {
  const t = (((at % 1) + 1) % 1) * (RISE.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  return {
    rise: RISE[i] + (RISE[i + 1] - RISE[i]) * f,
    swell: SWELL[i] + (SWELL[i + 1] - SWELL[i]) * f,
  };
}

export default function Intro({ onDone }: { onDone: () => void }) {
  const svg = useRef<SVGSVGElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const root = svg.current;
    if (!root) return;

    const circles = dots.current.filter(Boolean) as SVGCircleElement[];

    const frame = (t: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // The flight path: a cubic bezier from centre screen, out to the left and
      // up, landing at the header. A straight line reads as a slide; the curve
      // reads as something being thrown.
      const from = { x: vw / 2, y: vh / 2 };
      const c1 = { x: vw * 0.32, y: vh * 0.8 };
      const c2 = { x: vw * 0.06, y: vh * 0.38 };
      const to = { x: landedLeft(vw), y: LANDED_TOP };

      const flight = clamp01((t - FLIGHT_START) / FLIGHT_LENGTH);
      const e = easeInOutCubic(flight);
      const m = 1 - e;
      const px = m ** 3 * from.x + 3 * m ** 2 * e * c1.x + 3 * m * e ** 2 * c2.x + e ** 3 * to.x;
      const py = m ** 3 * from.y + 3 * m ** 2 * e * c1.y + 3 * m * e ** 2 * c2.y + e ** 3 * to.y;

      const spin = (SPIN_DEG_PER_SEC * t * Math.PI) / 180;

      // A half-sine kick, offset per group so the bounce ripples rather than
      // firing all at once.
      const bounce = (group: number) => {
        const p = (t - BOUNCE_AT - group * BOUNCE_STAGGER) / BOUNCE_LENGTH;
        return p > 0 && p < 1 ? -5 * Math.sin(Math.PI * p) : 0;
      };

      circles.forEach((dot, i) => {
        const { rise, swell } = wave(t / WAVE_SPEED - i / COUNT);
        const angle = spin + (i / COUNT) * TAU - Math.PI / 2;
        const r = ORBIT_RADIUS + (-rise * WOBBLE) / 200;
        const ox = r * Math.cos(angle);
        const oy = r * Math.sin(angle);

        const group = i % 3;
        const restX = group * LANDED_GAP;
        const restY = bounce(group);

        // Each dot leaves the ring slightly late, so the cluster stretches out
        // and snaps back rather than moving as a rigid body.
        const settle = easeInOutCubic(clamp01(flight * 1.25 - (i / 7) * FLIGHT_STAGGER));
        const shrink = easeInOutCubic(
          clamp01((t - SHRINK_AT - group * SHRINK_STAGGER) / SHRINK_LENGTH),
        );
        const size = DOT_RADIUS * swell;

        dot.setAttribute("cx", String(px + ox + (restX - ox) * settle));
        dot.setAttribute("cy", String(py + oy + (restY - oy) * settle));
        dot.setAttribute("r", String((size + (LANDED_RADIUS - size) * settle) * (1 - shrink)));
      });

      root.style.opacity = String(easeOutCubic(clamp01(t / FADE_IN)));

      if (t < DONE_AT && label.current) {
        label.current.style.opacity = String(easeOutCubic(clamp01((t - LABEL_AT) / LABEL_FADE)));
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      frame((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // The label's exit is a CSS transition, so the handoff has to wait for it
    // rather than cutting the moment the timeline ends.
    const exitMs =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--text-swap-dur")) ||
      200;

    const exit = window.setTimeout(() => {
      const el = label.current;
      if (!el) return;
      el.style.opacity = "";
      el.classList.add("is-exit");
    }, DONE_AT * 1000);

    const finish = window.setTimeout(
      () => {
        cancelAnimationFrame(raf);
        done.current?.();
      },
      DONE_AT * 1000 + exitMs + 60,
    );

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exit);
      clearTimeout(finish);
    };
  }, []);

  return (
    <>
      <svg
        ref={svg}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: COUNT }, (_, i) => (
          <circle
            key={i}
            ref={(el) => {
              dots.current[i] = el;
            }}
            r={0}
            fill={INK}
          />
        ))}
      </svg>

      <div
        ref={label}
        className="orb-thinking"
        style={{
          position: "fixed",
          left: "calc((100% - min(100%, 640px)) / 2 + 24px)",
          top: LANDED_TOP - 4,
          opacity: 0,
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        Thinking...
        <span className="orb-thinking-shine" aria-hidden="true">
          Thinking...
        </span>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* the base text is solid ink so it can never be clipped away;
           the shimmer is a separate text-clipped highlight swept on top */
        .orb-thinking {
          font: 500 15px/1 "InterVariable", "Inter", system-ui, sans-serif;
          letter-spacing: 0.01em;
          color: ${INK};
        }
        .orb-thinking-shine {
          position: absolute;
          inset: 0;
          color: transparent;
          background: linear-gradient(100deg, transparent 40%, ${SHIMMER} 50%, transparent 60%);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: orb-shimmer ${SHIMMER_PERIOD}s linear infinite;
        }
        /* text states swap — exit: blurred slide up */
        .orb-thinking.is-exit {
          opacity: 0;
          transform: translateY(calc(-1 * var(--text-swap-translate-y)));
          filter: blur(var(--text-swap-blur));
          transition:
            opacity var(--text-swap-dur) var(--text-swap-ease),
            transform var(--text-swap-dur) var(--text-swap-ease),
            filter var(--text-swap-dur) var(--text-swap-ease);
        }
        @keyframes orb-shimmer {
          from { background-position: 100% 0; }
          to { background-position: 0% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .orb-thinking-shine { display: none; }
        }
      `,
        }}
      />
    </>
  );
}
