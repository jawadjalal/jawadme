// The pipe, drawn by hand: ignura.com's tube kept as a course, inked as two
// wobbly fineliner lines with outlined collars, so it sits with the rest of
// the page's drawings instead of being a 3D render. The wobble is one SVG
// displacement filter over the whole drawing, which is what makes a ruler
// line look drawn.
//
//   pipeSVG(id)                                        the markup, ids prefixed
//   drawPipe(svg, { d, w, joints, width, height })     once the course is known
//
// The course is an SVG path in the svg's own pixels. Anything put in
// [data-gp-in] (the orange ball) runs inside the tube.
// Styles: `.gp` in globals.css.

export type Joint = { x: number; y: number; a: number };

export const pipeSVG = (id: string) =>
  `<svg class="gp" aria-hidden="true" focusable="false"><defs>` +
  `<filter id="${id}-hand" filterUnits="userSpaceOnUse" x="-50" y="-50" width="100%" height="100%">` +
  `<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" />` +
  `<feDisplacementMap in="SourceGraphic" scale="3.2" /></filter></defs>` +
  `<g filter="url(#${id}-hand)"><path class="gp-p gp-edge" d="" data-gp-d /><path class="gp-p gp-bore" d="" data-gp-d />` +
  `<path class="gp-p gp-hatch" d="" data-gp-d /><g class="gp-in" data-gp-in></g>` +
  `<g class="gp-joints" data-gp-joints></g></g></svg>`;

const r1 = (v: number) => Math.round(v * 10) / 10;

export function drawPipe(
  svg: SVGSVGElement,
  o: { d: string; w: number; joints: Joint[]; width: number; height: number },
) {
  const { d, w } = o;
  svg.style.setProperty("--gp-w", `${r1(w)}px`);
  svg.querySelectorAll("[data-gp-d]").forEach((p) => p.setAttribute("d", d));
  const f = svg.querySelector("filter")!;
  Object.entries({ x: -2 * w, y: -2 * w, width: o.width + 4 * w, height: o.height + 4 * w }).forEach(([k, v]) =>
    f.setAttribute(k, `${r1(v)}`),
  );
  // Collars: a little wider than the tube, square to the course.
  const L = w * 1.05,
    T = w * 1.42;
  svg.querySelector("[data-gp-joints]")!.innerHTML = o.joints
    .map((j) => {
      let a = ((j.a % 360) + 360) % 360;
      if (a >= 90 && a < 270) a -= 180;
      return `<rect x="${r1(-L / 2)}" y="${r1(-T / 2)}" width="${r1(L)}" height="${r1(T)}" rx="${r1(w * 0.12)}" transform="translate(${r1(j.x)} ${r1(j.y)}) rotate(${r1(a)})" />`;
    })
    .join("");
}

/** An orange ball to run inside a pipe, sized a little under the bore: a
 *  flat orange disc with an inked rim, drawn rather than rendered. */
export function pipeBall(svg: SVGSVGElement, w: number) {
  const ball = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  ball.setAttribute("r", `${r1(w * 0.36)}`);
  ball.setAttribute("class", "gp-ball");
  svg.querySelector("[data-gp-in]")?.append(ball);
  return ball;
}
