/** Springs as CSS. Each is simulated once and sampled into a linear() easing with its settle time, so every hover and
 *  press on the site runs on the compositor with the same physics and no per-frame script. The root layout writes them
 *  as --sp-<name> and --sp-<name>-t; script animations (the page change) use the same objects. */
export function spring({ stiffness, damping, mass = 1 }: { stiffness: number; damping: number; mass?: number }) {
  const dt = 1 / 600;
  const xs: number[] = [];
  let x = 0;
  let v = 0;
  let t = 0;
  while (t < 2) {
    v += ((stiffness * (1 - x) - damping * v) / mass) * dt;
    x += v * dt;
    t += dt;
    xs.push(x);
    if (t > 0.03 && Math.abs(1 - x) < 0.006 && Math.abs(v) < 0.06) break;
  }
  const n = 24;
  const pts = Array.from({ length: n + 1 }, (_, i) => (i === 0 ? 0 : i === n ? 1 : +xs[Math.round((i / n) * (xs.length - 1))].toFixed(3)));
  return { easing: `linear(${pts.join(", ")})`, ms: Math.round(t * 1000) };
}

export const SPRINGS = {
  press: spring({ stiffness: 2200, damping: 84 }),
  pop: spring({ stiffness: 520, damping: 24 }),
  soft: spring({ stiffness: 220, damping: 22 }),
};

export const MOTION_CSS = ":root{" + Object.entries(SPRINGS).map(([k, s]) => `--sp-${k}:${s.easing};--sp-${k}-t:${s.ms}ms`).join(";") + "}";
