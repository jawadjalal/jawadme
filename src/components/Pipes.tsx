"use client";

// Two glossy pipes, one down each side of the reading column, as on ignura.com.
//
// They come out from under the bar at the top and run into the footer card at
// the bottom. The left one branches into each section's glossy object, so the
// headings read as stations on one line; the right one runs clean, since a
// collar there would join onto nothing. An orange ball rides
// inside each, level with the middle of the screen, so it travels down the
// page with the reader.
//
// Desktop only (there is no margin for them on a phone), measured from the
// page so they follow any section height, and again on resize. No script, no
// pipes. Reduced motion: the pipes, the balls parked at the top.

import { useEffect, useRef } from "react";
import { drawPipe, pipeBall, pipeSVG, type Joint } from "./pipe";

const W = 12; // the tube's width
const GAP = 44; // from the column's edge to the pipe's centre

export function Pipes() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const wide = matchMedia("(min-width: 1100px)");
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.innerHTML = pipeSVG("pl") + pipeSVG("pr");
    const [left, right] = Array.from(el.querySelectorAll<SVGSVGElement>("svg"));
    const balls = [pipeBall(left, W), pipeBall(right, W)];
    let span = { top: 0, bottom: 0 };
    let raf = 0;
    let cur = -1;

    const place = () => {
      if (!wide.matches) {
        el.style.display = "none";
        return;
      }
      el.style.display = "";
      const main = document.getElementById("main");
      const card = document.querySelector<HTMLElement>(".foot-card");
      if (!main || !card) return;
      const box = el.getBoundingClientRect();
      const m = main.getBoundingClientRect();
      const width = box.width;
      const height = box.height;
      const xl = m.left - box.left - GAP;
      const xr = m.right - box.left + GAP;
      const top = 0;
      // into the card, so the pipe ends under its curved top edge
      const bottom = card.getBoundingClientRect().top - box.top + 40;
      span = { top: top + 70, bottom: bottom - 50 };

      const objs = Array.from(main.querySelectorAll<HTMLElement>(".sec-obj, .else-sum .obj")).filter(
        (o) => o.getClientRects().length,
      );
      let dl = `M${xl} ${top}V${bottom}`;
      const jl: Joint[] = [];
      for (const o of objs) {
        const r = o.getBoundingClientRect();
        const y = Math.round((r.top + r.height / 2 - box.top) * 10) / 10;
        const x = r.left + r.width / 2 - box.left;
        // a branch from the pipe into the object, tucked under it
        dl += `M${xl} ${y}H${x}`;
        jl.push({ x: xl, y, a: 0 }, { x: r.left - box.left - W * 0.3, y, a: 0 });
      }
      drawPipe(left, { d: dl, w: W, joints: jl, width, height });
      drawPipe(right, { d: `M${xr} ${top}V${bottom}`, w: W, joints: [], width, height });
      balls[0].dataset.x = `${xl}`;
      balls[1].dataset.x = `${xr}`;
      cur = -1;
      tick();
    };

    // The ball sits level with the middle of the screen, inside the pipe's run.
    const tick = () => {
      cancelAnimationFrame(raf);
      const box = el.getBoundingClientRect();
      const want = calm
        ? span.top
        : Math.min(span.bottom, Math.max(span.top, window.innerHeight / 2 - box.top));
      cur = cur < 0 ? want : cur + (want - cur) * 0.14;
      balls.forEach((b, i) => {
        // the right ball runs the other way, so the two cross mid page
        const y = i === 0 ? cur : span.bottom - (cur - span.top);
        b.style.transform = `translate(${b.dataset.x}px, ${y}px)`;
      });
      if (Math.abs(want - cur) > 0.5) raf = requestAnimationFrame(tick);
    };

    place();
    const ro = new ResizeObserver(place);
    ro.observe(document.body);
    document.fonts?.ready.then(place);
    // sections that rise in on scroll settle within a second: measure again
    const t = window.setTimeout(place, 1500);
    window.addEventListener("scroll", tick, { passive: true });
    wide.addEventListener("change", place);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", tick);
      wide.removeEventListener("change", place);
    };
  }, []);

  return <div ref={host} className="pipes" aria-hidden="true" />;
}

/** One pipe linking a column of icons ([data-ipipe-ico]) inside its parent,
 *  as ignura links its stacked icons: a straight run from each icon to the
 *  next, a collar at each end, behind the icons. */
export function IconPipe() {
  const host = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const layer = host.current;
    const list = layer?.parentElement;
    if (!layer || !list) return;
    layer.innerHTML = pipeSVG(`ip${Math.random().toString(36).slice(2, 7)}`);
    const svg = layer.querySelector("svg")!;
    const w = 8;

    const place = () => {
      const box = list.getBoundingClientRect();
      const icons = Array.from(list.querySelectorAll<HTMLElement>("[data-ipipe-ico]")).filter(
        (i) => i.getClientRects().length,
      );
      let d = "";
      const joints: Joint[] = [];
      for (let k = 0; k + 1 < icons.length; k++) {
        const a = icons[k].getBoundingClientRect();
        const b = icons[k + 1].getBoundingClientRect();
        const x = Math.round((a.left + a.width / 2 - box.left) * 10) / 10;
        const y0 = a.bottom - box.top - w * 0.4;
        const y1 = b.top - box.top + w * 0.4;
        if (y1 - y0 < w) continue;
        d += `M${x} ${Math.round(y0)}V${Math.round(y1)}`;
        joints.push({ x, y: a.bottom - box.top + w * 0.35, a: 90 }, { x, y: b.top - box.top - w * 0.35, a: 90 });
      }
      drawPipe(svg, { d, w, joints, width: box.width, height: box.height });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(list);
    const t = window.setTimeout(place, 1500);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return <span ref={host} className="ip-layer" aria-hidden="true" />;
}
