"use client";

import React, { useEffect, useState } from "react";

export type OctopusState = "asleep" | "working" | "holding" | "idle";
export type OctopusMotion = "full" | "calm";

export type OctopusProps = {
  state?: OctopusState;
  arms?: number;
  motion?: OctopusMotion;
};

/**
 * Unique keyframe prefix. Every animation this component emits is namespaced
 * with it so the rules can never collide with anything else on the page.
 */
const K = "okOctpx";

type Vars = React.CSSProperties & Record<string, string | number>;

type Arm = { k: number; delay: number; x: number; y: number; w: number; h: number };

const ARMS: Arm[] = [
  { k: 1, delay: 0, x: 27.718, y: 195, w: 27.717, h: 64.537 },
  { k: 1.35, delay: 190, x: 55.435, y: 251.537, w: 27.718, h: 58.396 },
  { k: 1, delay: 380, x: 83.152, y: 195, w: 27.718, h: 64.537 },
  { k: 1.35, delay: 570, x: 110.87, y: 251.537, w: 27.718, h: 58.396 },
  { k: 1, delay: 760, x: 138.588, y: 195, w: 27.717, h: 64.537 },
  { k: 1.35, delay: 950, x: 166.305, y: 251.537, w: 27.718, h: 58.396 },
  { k: 1, delay: 1140, x: 194.022, y: 195, w: 27.718, h: 64.537 },
];

/** The order arms reach out in when holding. */
const HOLD_ORDER = [1, 7, 3, 5, 2, 6, 4];

const CSS = `
@keyframes ${K}Arm {
  from { transform: translateY(0); }
  to { transform: translateY(calc(var(--amp, 1) * var(--k, 1) * 8px)); }
}
@keyframes ${K}Bob {
  from { transform: translateY(0); }
  to { transform: translateY(calc(var(--amp, 1) * -5px)); }
}
@keyframes ${K}Sway {
  from { transform: translateX(calc(var(--tilt, 0) * -3px)); }
  to { transform: translateX(calc(var(--tilt, 0) * 3px)); }
}
@keyframes ${K}Blink {
  0%, 93%, 100% { transform: scaleY(1); }
  96% { transform: scaleY(0.08); }
}
`;

/**
 * Reads prefers-reduced-motion after mount only, so the server render and the
 * first client render always agree.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function buildRig(state: OctopusState, n: number, calm: boolean): Vars {
  const a = [0, 0, 0, 0, 0, 0, 0];
  const y = [0, 0, 0, 0, 0, 0, 0];
  let amp: number;
  let spd: number;
  let lid: number;
  let tilt: number;

  // The mark is a pixel grid, so the rest states move ON the grid: no rotation.
  // Rotation stays reserved for holding, where reaching out is the point.
  switch (state) {
    case "asleep": {
      y[0] = 4; y[1] = 8; y[2] = 4; y[3] = 8; y[4] = 4; y[5] = 8; y[6] = 4;
      amp = 0.18; spd = 2.8; lid = 1; tilt = 0.2;
      break;
    }
    case "working": {
      amp = 1.3; spd = 0.42; lid = 0; tilt = 1.1;
      break;
    }
    case "holding": {
      for (let i = 0; i < n; i++) y[HOLD_ORDER[i] - 1] = 26;
      amp = 0.32; spd = 1.4; lid = 0; tilt = 0.4;
      break;
    }
    default: {
      amp = 0.5; spd = 1.7; lid = 0; tilt = 0.6;
    }
  }

  if (calm) {
    amp = 0;
    spd = 4;
    tilt = 0;
  }

  const vars: Vars = {};
  for (let i = 0; i < 7; i++) {
    vars[`--a${i + 1}`] = a[i];
    vars[`--y${i + 1}`] = y[i];
  }
  vars["--amp"] = amp;
  vars["--spd"] = spd;
  vars["--lid"] = lid;
  vars["--tilt"] = tilt;
  return vars;
}

export default function Octopus({
  state = "idle",
  arms = 3,
  motion = "full",
}: OctopusProps) {
  const reduced = usePrefersReducedMotion();
  const calm = motion === "calm" || reduced;
  const n = Math.max(0, Math.min(7, Math.round(arms)));
  const rig = buildRig(state, n, calm);

  return (
    <div style={rig}>
      <style>{CSS}</style>
      <div
        style={{
          animation: `${K}Sway calc(var(--spd, 1) * 4.4s) ease-in-out infinite alternate`,
        }}
      >
        <div
          style={{
            animation: `${K}Bob calc(var(--spd, 1) * 2.6s) ease-in-out infinite alternate`,
          }}
        >
          <svg
            viewBox="0 0 249.458 309.933"
            fill="currentColor"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              overflow: "visible",
            }}
          >
            <g id="head">
              <rect x={-0.08} y={55.355} width={27.878} height={126.189} />
              <rect x={27.638} y={27.638} width={27.877} height={27.878} />
              <rect x={55.355} y={-0.08} width={138.787} height={27.878} />
              <rect x={193.942} y={27.638} width={27.878} height={27.878} />
              <rect x={221.66} y={55.355} width={27.878} height={126.189} />
            </g>

            <g
              id="eyes-open"
              style={{
                opacity: "calc(1 - var(--lid, 0))",
                transformBox: "fill-box",
                transformOrigin: "center",
                animation: `${K}Blink calc(var(--spd, 1) * 5.6s) ease-in-out infinite`,
              }}
            >
              <rect x={59.215} y={80.633} width={27.718} height={55.434} />
              <rect x={162.525} y={80.633} width={27.718} height={55.434} />
            </g>

            <g id="eyes-shut" style={{ opacity: "var(--lid, 0)" }}>
              <rect x={59.215} y={108.35} width={27.718} height={27.717} />
              <rect x={162.525} y={108.35} width={27.718} height={27.717} />
            </g>

            <g id="body">
              <rect x={27.638} y={181.344} width={194.182} height={27.878} />
            </g>

            <g id="arms">
              {ARMS.map((arm, i) => {
                const idx = i + 1;
                const inner: Vars = {
                  "--k": arm.k,
                  animation: `${K}Arm calc(var(--spd, 1) * 1.5s) ease-in-out infinite alternate`,
                  animationDelay: `calc(var(--spd, 1) * ${arm.delay}ms)`,
                };
                return (
                  <g
                    key={idx}
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center top",
                      transition: "transform 820ms cubic-bezier(.34,1.06,.4,1)",
                      transform: `rotate(calc(var(--a${idx}, 0) * 1deg)) translateY(calc(var(--y${idx}, 0) * 1px))`,
                    }}
                  >
                    <g style={inner}>
                      <rect x={arm.x} y={arm.y} width={arm.w} height={arm.h} />
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
