// Squircle corners — the iOS-style continuous curve, not a plain arc.
//
// A port of the figma-squircle solve for the case this page actually needs: one
// uniform radius on all four corners of a box. The general library handles four
// different radii and a rounding budget per corner; here the avatar is a square
// with a single radius, so the budget is just min(w, h) / 2 and the four corner
// segments are the same curve mirrored.
//
// The maths: each corner is three cubic sections — a long approach, a short
// arc, and a mirrored exit — sized so curvature ramps in rather than jumping
// from straight to circular the way border-radius does.

type Corner = {
  a: number;
  b: number;
  c: number;
  d: number;
  p: number;
  arc: number;
  radius: number;
};

const rad = (deg: number) => (deg * Math.PI) / 180;

// Builds a path string, rounding every interpolated number the same way the
// reference implementation does so the output is byte-stable across renders.
const seg = (strings: TemplateStringsArray, ...values: number[]) => {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += values[i].toFixed(4) + strings[i + 1];
  return out;
};

function solve(radius: number, smoothing: number, budget: number, preserve = true): Corner {
  if (radius <= 0) return { a: 0, b: 0, c: 0, d: 0, p: 0, arc: 0, radius: 0 };

  let s = smoothing;
  let p = (1 + s) * radius;

  // Without preserveSmoothing the corner has to fit the budget by giving up
  // smoothing; with it, the sections are squeezed instead and the shape keeps
  // its character.
  if (!preserve) {
    s = Math.min(s, budget / radius - 1);
    p = Math.min(p, budget);
  }

  const arcDeg = 90 * (1 - s);
  const arc = Math.sin(rad(arcDeg / 2)) * radius * Math.SQRT2;
  const angleBezier = (90 - arcDeg) / 2;
  const cLen = radius * Math.tan(rad(angleBezier / 2));
  const lineDeg = 45 * s;
  const c = cLen * Math.cos(rad(lineDeg));
  const d = c * Math.tan(rad(lineDeg));

  let b = (p - arc - c - d) / 3;
  let a = 2 * b;

  if (preserve && p > budget) {
    const max = budget - d - arc - c;
    const maxB = max - max / 6;
    b = Math.min(b, maxB);
    a = max - b;
    p = Math.min(p, budget);
  }

  return { a, b, c, d, p, arc, radius };
}

// The four corners, walking clockwise from the top-right.
const topRight = ({ radius, a, b, c, d, arc }: Corner) =>
  seg`c ${a} 0 ${a + b} 0 ${a + b + c} ${d} a ${radius} ${radius} 0 0 1 ${arc} ${arc} c ${d} ${c} ${d} ${b + c} ${d} ${a + b + c}`;

const bottomRight = ({ radius, a, b, c, d, arc }: Corner) =>
  seg`c 0 ${a} 0 ${a + b} ${-d} ${a + b + c} a ${radius} ${radius} 0 0 1 ${-arc} ${arc} c ${-c} ${d} ${-(b + c)} ${d} ${-(a + b + c)} ${d}`;

const bottomLeft = ({ radius, a, b, c, d, arc }: Corner) =>
  seg`c ${-a} 0 ${-(a + b)} 0 ${-(a + b + c)} ${-d} a ${radius} ${radius} 0 0 1 ${-arc} ${-arc} c ${-d} ${-c} ${-d} ${-(b + c)} ${-d} ${-(a + b + c)}`;

const topLeft = ({ radius, a, b, c, d, arc }: Corner) =>
  seg`c 0 ${-a} 0 ${-(a + b)} ${d} ${-(a + b + c)} a ${radius} ${radius} 0 0 1 ${arc} ${-arc} c ${c} ${-d} ${b + c} ${-d} ${a + b + c} ${-d}`;

/** An SVG path for a `width`×`height` box with continuous-curvature corners. */
export function squirclePath(
  width: number,
  height: number,
  radius: number,
  smoothing = 0.8,
): string {
  if (width <= 0 || height <= 0) return "M 0 0 H 0 V 0 H 0 Z";

  const budget = Math.min(width, height) / 2;
  const k = solve(Math.min(radius, budget), smoothing, budget);
  if (k.radius <= 0) return `M 0 0 H ${width} V ${height} H 0 Z`;

  const n = (v: number) => v.toFixed(4);

  return (
    `M ${n(k.p)} 0` +
    ` L ${n(width - k.p)} 0 ` +
    topRight(k) +
    ` L ${n(width)} ${n(height - k.p)} ` +
    bottomRight(k) +
    ` L ${n(k.p)} ${n(height)} ` +
    bottomLeft(k) +
    ` L 0 ${n(k.p)} ` +
    topLeft(k) +
    " Z"
  );
}

/** The same shape as a `clip-path` value. */
export const squircleClip = (w: number, h: number, r: number, smoothing = 0.8) =>
  `path("${squirclePath(w, h, r, smoothing)}")`;
