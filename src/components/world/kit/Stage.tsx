"use client";

import { type HTMLAttributes, type ReactNode, useEffect, useRef, useState } from "react";
import { want3d } from "./gate";
import "./stage.css";

/** What a stage's scene module provides: draw into `host` (with ./view), call `ready` after the first frame, return a cleanup. */
export type Mount = (host: HTMLElement, ctx: { still: boolean; bare: boolean; small: boolean; ready: () => void }) => () => void;

/**
 * A 3D moment on a page. First paint is the poster (a render of the same scene, see ./posters.mjs), and it stays the
 * design on phones, reduced motion, weak GPUs and without WebGL2. On a capable device the scene module loads once the
 * stage comes within `margin` of the screen, mounts, and fades in over the poster; three.js never loads otherwise.
 * Children are the HTML over the scene (links, headings); data-mode is "poster" or "live" for styling them.
 */
export function Stage({ load, poster, margin = "900px 0px", className, children, ...rest }: { load: () => Promise<Mount>; poster?: { d: string; m?: string }; margin?: string; className?: string; children?: ReactNode } & Omit<HTMLAttributes<HTMLDivElement>, "children">) {
  const box = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"poster" | "live">("poster");
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!want3d() || !box.current || !host.current) return;
    setMode("live");
    const el = host.current;
    const q = new URLSearchParams(location.search);
    const still = q.has("snap");
    let off: (() => void) | undefined;
    let dead = false;
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        load().then((mount) => {
          if (!dead) off = mount(el, { still, bare: q.has("bare"), small: innerWidth < 1100, ready: () => setLive(true) });
        });
      },
      { rootMargin: margin },
    );
    io.observe(box.current);
    return () => {
      dead = true;
      io.disconnect();
      off?.();
    };
  }, [load, margin]);

  return (
    <div ref={box} className={"stage" + (className ? " " + className : "")} data-mode={mode} data-live={live ? "" : undefined} {...rest}>
      {poster ? (
        <picture className="stage-poster" aria-hidden="true">
          {poster.m ? <source media="(max-width: 767px)" srcSet={poster.m} /> : null}
          <img src={poster.d} alt="" loading="lazy" decoding="async" />
        </picture>
      ) : null}
      <div ref={host} className="stage-gl" aria-hidden="true" />
      {children}
    </div>
  );
}
