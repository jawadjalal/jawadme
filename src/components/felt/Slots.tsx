"use client";

/*
 * The four felt slots, after ignaru.com. Each slot keeps its colour and cycles its shapes: one slot swaps every 600 ms
 * in turn, so each changes every 2.4 s and no two change together. A swap is a squash and pop, and the new shape lands
 * a degree or two off the slot's resting tilt. Hover straightens and lifts a slot and shows its name; a click opens
 * its drawer. The first shapes are server-rendered and are the page's LCP; the rest load once the page is idle, and a
 * slot only swaps to a shape that has decoded. Nothing swaps while hovered, while a drawer is open, while the tab is
 * hidden, or under reduced motion, and the cycling starts 2.5 s after load. Words and art: copy.ts. Styles: felt.css (`fh-`).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { SLOTS, feltSrc } from "./copy";
import { Drawer } from "./Drawer";
import { sfx } from "./Sound";

const SIZES = "(max-width: 760px) 42vw, min(22vw, 320px)";
// a swapped shape lands up to 2.5 degrees nearer upright and a touch smaller than the first, so its box is never
// larger than the first paint's and the first shapes stay the page's LCP
const jitter = (rest: number) => -Math.sign(rest) * Math.round(Math.random() * 25) / 10;

export function Slots() {
  const [shape, setShape] = useState<number[]>(() => SLOTS.map(() => 0));
  const [tilt, setTilt] = useState<number[]>(() => SLOTS.map(() => 0));
  const [open, setOpen] = useState<number | null>(null);
  const hovered = useRef<number | null>(null);
  const figs = useRef<(HTMLSpanElement | null)[]>([]);
  const ready = useRef<Set<string>>(new Set(SLOTS.map((s) => s.shapes[0].src)));
  const openRef = useRef(open);
  openRef.current = open;
  const shapeRef = useRef(shape);
  shapeRef.current = shape;

  useEffect(() => {
    const warm = () =>
      SLOTS.forEach((s) =>
        s.shapes.slice(1).forEach(({ src }) => {
          const img = new Image();
          img.sizes = SIZES;
          img.srcset = feltSrc(src).srcSet;
          img.src = feltSrc(src).src;
          img.decode().then(() => ready.current.add(src), () => undefined);
        }),
      );
    const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(warm, { timeout: 2500 }) : setTimeout(warm, 1200));
    if (document.readyState === "complete") idle();
    else addEventListener("load", idle, { once: true });
  }, []);

  const swap = useCallback(async (i: number) => {
    const s = SLOTS[i], fig = figs.current[i];
    if (!s || !fig) return;
    const next = ((shapeRef.current[i] ?? 0) + 1) % s.shapes.length;
    if (!ready.current.has(s.shapes[next].src)) return;
    // the squash holds until the pop, so the new shape first paints small and never counts as a larger paint
    const squash = fig.animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(0.85)", opacity: 0.2 }], { duration: 140, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" });
    await squash.finished;
    setShape((sh) => sh.map((v, k) => (k === i ? next : v)));
    setTilt((t) => t.map((v, k) => (k === i ? jitter(s.tilt) : v)));
    sfx("swap");
    requestAnimationFrame(() =>
      fig.animate(
        [
          { transform: "scale(0.85)", opacity: 0.2 },
          { transform: "scale(1.04)", opacity: 1, offset: 0.6 },
          { transform: "scale(1)", opacity: 1 },
        ],
        { duration: 240, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
      ).finished.then(() => squash.cancel()),
    );
  }, []);

  // the cycling waits a beat after load, so the first four shapes stay the page's largest paint
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tick = 0, id = 0;
    const begin = () => (id = window.setTimeout(() => (id = window.setInterval(step, 600)), 2500));
    if (document.readyState === "complete") begin();
    else addEventListener("load", begin, { once: true });
    const step = () => {
      const i = tick++ % SLOTS.length;
      if (document.hidden || openRef.current !== null || hovered.current === i) return;
      void swap(i);
    };
    return () => {
      removeEventListener("load", begin);
      clearTimeout(id);
      clearInterval(id);
    };
  }, [swap]);

  return (
    <>
      <ul className="fh-row" aria-label="What I do">
        {SLOTS.map((s, i) => {
          const sh = s.shapes[shape[i] ?? 0] ?? s.shapes[0];
          const img = feltSrc(sh.src);
          return (
            <li key={s.id} className="fh-slot" style={{ ["--c" as string]: s.color, ["--t" as string]: `${s.tilt + (tilt[i] ?? 0)}deg`, ["--i" as string]: i }}>
              <button
                type="button"
                className="fh-obj"
                aria-haspopup="dialog"
                aria-label={`${s.label}: ${s.title}`}
                onClick={() => setOpen(i)}
                onPointerEnter={(e) => {
                  hovered.current = i;
                  if (e.pointerType === "mouse") sfx("hover");
                }}
                onPointerLeave={() => (hovered.current = null)}
              >
                <span className="fh-pill" aria-hidden="true">
                  {s.label}
                </span>
                <span className="fh-tilt">
                  <span className={shape[i] ? "fh-fig is-swapped" : "fh-fig"} ref={(el) => void (figs.current[i] = el)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.src} srcSet={img.srcSet} sizes={SIZES} alt={sh.alt} width={320} height={320} fetchPriority={shape[i] ? "auto" : "high"} draggable={false} />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <Drawer at={open} onClose={() => setOpen(null)} onStep={(by) => setOpen((o) => (o === null ? o : (o + by + SLOTS.length) % SLOTS.length))} />
    </>
  );
}
