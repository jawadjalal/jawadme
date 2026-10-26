// ignura.com's glossy black pipe (ignura site-v3/src/components/next/pipe.ts),
// drawn in SVG so it can run any course: a near-black body, a soft sheen along
// its upper edge and a fine light line inside it, all held inside the tube's
// outline, with a collar wherever it meets an object, branches or ends.
//
//   pipeSVG(id)                                        the markup, ids prefixed
//   drawPipe(svg, { d, w, joints, width, height })     once the course is known
//
// The course is an SVG path in the svg's own pixels. Anything put in
// [data-gp-in] (the orange ball) runs inside the tube, under its light line.
// The blurs measure their region in the svg's own space: a perfectly straight
// run has a bounding box zero pixels wide, and a box-relative region would
// erase its sheen.
// Styles: `.gp` in globals.css.

export type Joint = { x: number; y: number; a: number };

export const pipeSVG = (id: string) =>
  `<svg class="gp" aria-hidden="true" focusable="false"><defs>` +
  `<filter class="gp-soft" id="${id}-soft" filterUnits="userSpaceOnUse" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.4" /></filter>` +
  `<filter class="gp-fine" id="${id}-fine" filterUnits="userSpaceOnUse" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="0.4" /></filter>` +
  `<linearGradient id="${id}-col" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26272b" /><stop offset="0.16" stop-color="#9c9da3" />` +
  `<stop offset="0.24" stop-color="#3a3b40" /><stop offset="0.55" stop-color="#0c0c0e" /><stop offset="0.86" stop-color="#050506" /><stop offset="1" stop-color="#1d1e21" /></linearGradient>` +
  `<mask class="gp-mask" id="${id}-m" maskUnits="userSpaceOnUse"><path class="gp-p" d="" data-gp-d /></mask></defs>` +
  `<g mask="url(#${id}-m)"><path class="gp-p gp-body" d="" data-gp-d /><path class="gp-p gp-rim" d="" filter="url(#${id}-soft)" data-gp-d />` +
  `<path class="gp-p gp-sheen" d="" filter="url(#${id}-soft)" data-gp-d /><g class="gp-in" data-gp-in></g>` +
  `<path class="gp-p gp-line" d="" filter="url(#${id}-fine)" data-gp-d /></g>` +
  `<g class="gp-joints" fill="url(#${id}-col)" data-gp-joints></g></svg>`;

const r1 = (v: number) => Math.round(v * 10) / 10;

export function drawPipe(
  svg: SVGSVGElement,
  o: { d: string; w: number; joints: Joint[]; width: number; height: number },
) {
  const { d, w } = o;
  svg.style.setProperty("--gp-w", `${r1(w)}px`);
  svg.querySelectorAll("[data-gp-d]").forEach((p) => p.setAttribute("d", d));
  const m = svg.querySelector(".gp-mask")!;
  Object.entries({ x: -2 * w, y: -2 * w, width: o.width + 4 * w, height: o.height + 4 * w }).forEach(([k, v]) =>
    m.setAttribute(k, `${r1(v)}`),
  );
  svg.querySelector(".gp-soft feGaussianBlur")!.setAttribute("stdDeviation", `${r1(w * 0.14)}`);
  svg.querySelector(".gp-fine feGaussianBlur")!.setAttribute("stdDeviation", `${r1(Math.max(0.35, w * 0.05))}`);
  // Collars: a little wider than the tube, square to the course, turned so the
  // lit edge always faces up.
  const L = w * 1.05,
    T = w * 1.42;
  svg.querySelector("[data-gp-joints]")!.innerHTML = o.joints
    .map((j) => {
      let a = ((j.a % 360) + 360) % 360;
      if (a >= 90 && a < 270) a -= 180;
      return `<rect x="${r1(-L / 2)}" y="${r1(-T / 2)}" width="${r1(L)}" height="${r1(T)}" rx="${r1(w * 0.22)}" stroke-width="${r1(Math.max(0.6, w * 0.05))}" transform="translate(${r1(j.x)} ${r1(j.y)}) rotate(${r1(a)})" />`;
    })
    .join("");
}

/** An orange ball to run inside a pipe, sized a little under the bore. */
export function pipeBall(svg: SVGSVGElement, w: number) {
  const ball = document.createElementNS("http://www.w3.org/2000/svg", "image");
  ball.setAttribute("href", "/obj/ball.webp");
  const bw = r1(w * 0.86);
  ball.setAttribute("width", `${bw}`);
  ball.setAttribute("height", `${bw}`);
  ball.setAttribute("x", `${-bw / 2}`);
  ball.setAttribute("y", `${-bw / 2}`);
  svg.querySelector("[data-gp-in]")?.append(ball);
  return ball;
}
