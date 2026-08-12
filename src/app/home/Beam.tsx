"use client";

// The beam — the coloured light that runs around a tile while its artwork is
// still loading, then fades out once the image is in.
//
// It is three stacked layers on one element: a masked border stroke, an inner
// wash bleeding in from the edges, and a blurred bloom sitting outside them
// both. A conic gradient rotating around the box is used as the mask for all
// three, so what you see is a single travelling arc of colour rather than the
// whole palette at once.
//
// Everything is generated as a stylesheet keyed to a unique id instead of being
// written as inline styles, because the effect needs ::before, ::after and
// @keyframes — none of which the style attribute can reach.

import { useId, type ReactNode } from "react";

// The palette. Nine lights, each pinned to a point on the border box, in the
// order they were sampled; the ellipse sizes are what keeps them from reading
// as nine separate dots.
const LIGHTS = [
  { color: "rgb(255, 50, 100)", pos: "33% -7.4%", size: "70px 40px" },
  { color: "rgb(40, 140, 255)", pos: "12% -5%", size: "60px 35px" },
  { color: "rgb(50, 200, 80)", pos: "2.1% 68.3%", size: "40px 70px" },
  { color: "rgb(30, 185, 170)", pos: "2.1% 68.3%", size: "20px 35px" },
  { color: "rgb(100, 70, 255)", pos: "74.4% 100%", size: "180px 32px" },
  { color: "rgb(40, 140, 255)", pos: "55% 100%", size: "85px 26px" },
  { color: "rgb(255, 120, 40)", pos: "93.9% 0%", size: "74px 32px" },
  { color: "rgb(240, 50, 180)", pos: "100% 27.1%", size: "26px 42px" },
  { color: "rgb(180, 40, 240)", pos: "100% 27.1%", size: "52px 48px" },
];

// Light theme, medium tile. Deliberately low: the stroke is a hint of colour on
// near-white, not a neon outline.
const STROKE_OPACITY = 0.12;
const INNER_OPACITY = 0.26;
const BLOOM_OPACITY = 0.34;
const INNER_SHADOW = "rgba(0, 0, 0, 0.14)";
const SATURATION = 1.5;
const BRIGHTNESS = 1.3;
const HUE_RANGE = 30;
const DURATION = 1.96;
const BORDER_WIDTH = 1;

const lights = () =>
  LIGHTS.map((l) => `radial-gradient(ellipse ${l.size} at ${l.pos}, ${l.color}, transparent)`).join(
    ",\n    ",
  );

// The inner wash reuses the same nine lights at 90% scale and 45% alpha, so it
// reads as the stroke bleeding inward rather than as a second effect.
const innerLights = () =>
  LIGHTS.map((l) => {
    const size = l.size
      .split(" ")
      .map((v) => `${Math.round(parseInt(v, 10) * 0.9)}px`)
      .join(" ");
    const color = l.color.replace("rgb(", "rgba(").replace(")", ", 0.45)");
    return `radial-gradient(ellipse ${size} at ${l.pos}, ${color}, transparent)`;
  }).join(",\n    ");

// The travelling window. Everything is masked through this, which is what turns
// a static ring of colour into an arc that sweeps.
const sweep = (id: string) => `conic-gradient(
      from var(--beam-angle-${id}),
      transparent 0%, transparent 30%,
      rgba(255, 255, 255, 0.1) 36%, rgba(255, 255, 255, 0.35) 44%,
      white 52%, white 80%,
      rgba(255, 255, 255, 0.35) 86%, rgba(255, 255, 255, 0.1) 92%,
      transparent 95%, transparent 100%
    )`;

// A white-to-black arc riding just ahead of the colour, so the leading edge of
// the sweep reads as a bright head rather than a soft ramp.
const head = (id: string) => `conic-gradient(
        from var(--beam-angle-${id}),
        transparent 0%, transparent 54%,
        rgba(0, 0, 0, 0.08) 57%,
        rgba(0, 0, 0, 0.2) 60%,
        rgba(0, 0, 0, 0.4) 63%,
        rgba(0, 0, 0, 0.55) 66%,
        rgba(0, 0, 0, 0.4) 69%,
        rgba(0, 0, 0, 0.2) 72%,
        rgba(0, 0, 0, 0.08) 75%,
        transparent 78%, transparent 100%
      )`;

const bloom = (id: string) => `conic-gradient(
        from var(--beam-angle-${id}),
        transparent 0%, transparent 58%,
        rgba(0, 0, 0, 0.02) 62%,
        rgba(0, 0, 0, 0.08) 65%,
        rgba(0, 0, 0, 0.2) 67%,
        rgba(0, 0, 0, 0.4) 69%,
        rgba(0, 0, 0, 0.6) 70%,
        rgba(0, 0, 0, 0.6) 70.5%,
        rgba(0, 0, 0, 0.4) 71.5%,
        rgba(0, 0, 0, 0.2) 73%,
        rgba(0, 0, 0, 0.08) 75%,
        rgba(0, 0, 0, 0.02) 78%,
        transparent 82%
      )`;

function css(id: string, radius: number) {
  const inner = Math.max(0, radius - BORDER_WIDTH);

  // The hue drifts either side of the base over 12s. It is what stops the beam
  // from looking like a fixed decal once you have watched it for a few turns.
  const hueShift = (name: string, blur: string) => `
@keyframes ${name}-${id} {
  0%   { filter: ${blur}hue-rotate(calc(var(--beam-hue-base, 0deg) - ${HUE_RANGE}deg)) brightness(${BRIGHTNESS.toFixed(2)}) saturate(${SATURATION.toFixed(2)}); }
  50%  { filter: ${blur}hue-rotate(calc(var(--beam-hue-base, 0deg) + ${HUE_RANGE}deg)) brightness(${BRIGHTNESS.toFixed(2)}) saturate(${SATURATION.toFixed(2)}); }
  100% { filter: ${blur}hue-rotate(calc(var(--beam-hue-base, 0deg) - ${HUE_RANGE}deg)) brightness(${BRIGHTNESS.toFixed(2)}) saturate(${SATURATION.toFixed(2)}); }
}`;

  return `
@property --beam-angle-${id} {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: true;
}

@property --beam-opacity-${id} {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}

[data-beam="${id}"] {
  position: relative;
  border-radius: ${radius}px;
  overflow: hidden;
}

[data-beam="${id}"][data-active] {
  animation:
    beam-spin-${id} ${DURATION}s linear infinite,
    beam-in-${id} 0.6s ease forwards;
}

[data-beam="${id}"][data-fading] {
  animation:
    beam-spin-${id} ${DURATION}s linear infinite,
    beam-out-${id} 0.5s ease forwards;
}

/* the stroke: colour confined to a 1px ring, then swept */
[data-beam="${id}"][data-active]::after,
[data-beam="${id}"][data-fading]::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: ${inner}px;
  padding: ${BORDER_WIDTH}px;
  clip-path: inset(0 round ${radius}px);
  background: ${head(id)},${lights()};
  -webkit-mask: ${sweep(id)}, linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: source-in, xor;
  mask: ${sweep(id)}, linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: intersect, exclude;
  pointer-events: none;
  z-index: 2;
  opacity: calc(var(--beam-opacity-${id}) * ${STROKE_OPACITY.toFixed(2)} * var(--beam-strength, 1));
  animation: beam-hue-${id} 12s ease-in-out infinite;
}

/* the wash: same colours bleeding 28px in from every edge */
[data-beam="${id}"][data-active]::before,
[data-beam="${id}"][data-fading]::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: ${radius}px;
  background: ${innerLights()};
  box-shadow: inset 0 0 9px 1px ${INNER_SHADOW};
  -webkit-mask-image: ${sweep(id)},
    linear-gradient(white, transparent 28px, transparent calc(100% - 28px), white),
    linear-gradient(to right, white, transparent 28px, transparent calc(100% - 28px), white);
  -webkit-mask-composite: source-in, source-over;
  mask-image: ${sweep(id)},
    linear-gradient(white, transparent 28px, transparent calc(100% - 28px), white),
    linear-gradient(to right, white, transparent 28px, transparent calc(100% - 28px), white);
  mask-composite: intersect, add;
  pointer-events: none;
  z-index: 1;
  opacity: calc(var(--beam-opacity-${id}) * ${INNER_OPACITY.toFixed(2)} * var(--beam-strength, 1));
  clip-path: inset(0 round ${radius}px);
  animation: beam-hue-${id} 12s ease-in-out infinite;
}

/* the bloom: the stroke again, blurred, sitting on top of both */
[data-beam="${id}"] [data-beam-bloom] {
  display: none;
  position: absolute;
  inset: 0;
  border-radius: ${inner}px;
  clip-path: inset(0 round ${radius}px);
  background: ${bloom(id)};
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: ${BORDER_WIDTH}px;
  pointer-events: none;
  z-index: 3;
  opacity: 0;
}

[data-beam="${id}"][data-active] [data-beam-bloom],
[data-beam="${id}"][data-fading] [data-beam-bloom] {
  display: block;
  opacity: calc(var(--beam-opacity-${id}) * ${BLOOM_OPACITY.toFixed(2)} * var(--beam-strength, 1));
  animation: beam-hue-bloom-${id} 8s ease-in-out infinite;
}

@keyframes beam-spin-${id} { to { --beam-angle-${id}: 360deg; } }
@keyframes beam-in-${id} { to { --beam-opacity-${id}: 1; } }
@keyframes beam-out-${id} { from { --beam-opacity-${id}: 1; } to { --beam-opacity-${id}: 0; } }
${hueShift("beam-hue", "")}
${hueShift("beam-hue-bloom", "blur(8px) ")}

@media (prefers-reduced-motion: reduce) {
  [data-beam="${id}"][data-active],
  [data-beam="${id}"][data-fading],
  [data-beam="${id}"][data-active]::after,
  [data-beam="${id}"][data-fading]::after,
  [data-beam="${id}"][data-active]::before,
  [data-beam="${id}"][data-fading]::before,
  [data-beam="${id}"][data-active] [data-beam-bloom],
  [data-beam="${id}"][data-fading] [data-beam-bloom] {
    animation: none !important;
  }
}
`;
}

/**
 * Wraps `children` in the beam. `active` drives it: true spins and fades in,
 * false fades out and stops. `radius` should match the child's own corner
 * radius or the ring will sit off the edge.
 */
export function Beam({
  children,
  active,
  radius,
  className,
}: {
  children: ReactNode;
  active: boolean;
  radius: number;
  className?: string;
}) {
  // useId gives a stable id across server and client render; the colons it
  // contains are not valid in a CSS attribute selector, so they go.
  const id = useId().replace(/:/g, "-");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css(id, radius) }} />
      <div data-beam={id} data-active={active ? "" : undefined} className={className}>
        {children}
        <div data-beam-bloom />
      </div>
    </>
  );
}
