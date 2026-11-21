"use client";

import { useEffect, useRef, useState } from "react";

// The stage behind the home page: a painted poster of the underworld on first paint, then, on a capable desktop GPU,
// the live scene (./scene, three.js) loaded once the page is idle. Phones, reduced motion, weak or software GPUs and
// no WebGL2 keep the poster. ?world=live or ?world=poster overrides the choice. The scene reads its camera stop from
// the page's [data-world-stop] blocks: each stop is reached as its block's top meets the top of the screen, the last
// as its bottom meets the bottom.

function capable() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || innerWidth < 768) return false;
  const n = navigator as Navigator & { deviceMemory?: number };
  if ((n.hardwareConcurrency || 8) < 4 || (n.deviceMemory ?? 8) < 4) return false;
  const gl = document.createElement("canvas").getContext("webgl2");
  if (!gl) return false;
  const x = gl.getExtension("WEBGL_debug_renderer_info");
  const name = x ? String(gl.getParameter(x.UNMASKED_RENDERER_WEBGL)) : "";
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return !/swiftshader|llvmpipe|softpipe|software|mali-[34]|adreno \(tm\) [34]\d\d/i.test(name);
}

export function World() {
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = host.current;
    const section = el?.closest<HTMLElement>("[data-world]");
    if (!el || !section) return;
    const q = new URLSearchParams(location.search).get("world");
    if (q === "poster" || (q !== "live" && !capable())) return;

    let stops = [0, 1, 2, 3];
    const measure = () => {
      const els = [...section.querySelectorAll<HTMLElement>("[data-world-stop]")];
      stops = els.map((s, i) => {
        const r = s.getBoundingClientRect();
        return r.top + scrollY + (i === els.length - 1 ? r.height - innerHeight : 0);
      });
    };
    const progress = () => {
      const y = scrollY;
      for (let i = 0; i < stops.length - 1; i++) if (y < stops[i + 1]) return i + Math.max(0, y - stops[i]) / Math.max(1, stops[i + 1] - stops[i]);
      return stops.length - 1;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);

    let off: (() => void) | undefined;
    let dead = false;
    const go = () =>
      import("./scene").then((m) => {
        if (!dead) off = m.mount(el, { progress, ready: () => setLive(true), small: innerWidth < 1100 });
      });
    const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 2500 }) : setTimeout(go, 300));
    if (document.readyState === "complete") idle();
    else addEventListener("load", idle, { once: true });
    return () => {
      dead = true;
      ro.disconnect();
      removeEventListener("load", idle);
      off?.();
    };
  }, []);

  return (
    <div className={"world-stage" + (live ? " live" : "")} aria-hidden="true">
      <picture>
        <source media="(max-width: 767px)" srcSet="/world/poster-780.webp" />
        <img src="/world/poster-1440.webp" alt="" className="world-poster" decoding="async" fetchPriority="high" />
      </picture>
      <div ref={host} className="world-gl" />
    </div>
  );
}
