"use client";

// The wall on a desktop screen: the whole manifest laid into columns that drift on their own, slowly, each at its own
// speed and in its own direction, and loop for ever (each column is drawn twice, end to end). The wheel, the trackpad,
// the arrow and page keys and a finger all scroll it, every column at its own rate. A column stops drifting while the
// pointer is on it; with reduced motion nothing drifts and the wheel still scrolls. The story lines ride in the
// columns as pieces of their own. On phones and narrow windows WorkFeed's plain scrolling wall is shown instead.

import { useEffect, useMemo, useRef, useState } from "react";
import type { Entry, Piece } from "@/content/feed";
import { ratio } from "./pack";
import { StoryLine } from "./StoryLine";
import { Tile } from "./WorkFeed";

/** px per second for each column (sign is the direction) and how hard the wheel moves it */
const DRIFT = [
  { speed: 16, wheel: 1 },
  { speed: -11, wheel: 1.18 },
  { speed: 13, wheel: 0.9 },
];

/** Lays the entries into `k` columns, each piece going to the shortest column so far (heights as width over ratio). */
function lay(entries: Entry[], k: number): Entry[][] {
  const cols: Entry[][] = Array.from({ length: k }, () => []);
  const h = new Array(k).fill(0);
  for (const e of entries) {
    const tall = "story" in e ? 0.75 : 1 / ratio(e as Piece);
    const i = h.indexOf(Math.min(...h));
    cols[i].push(e);
    h[i] += tall + 0.06;
  }
  return cols;
}

function Copy({ entries, href, hidden, offset }: { entries: Entry[]; href: string; hidden?: boolean; offset: number }) {
  return (
    <div className="dcopy" aria-hidden={hidden || undefined} inert={hidden || undefined}>
      {entries.map((e, i) =>
        "story" in e ? (
          <StoryLine key={i} text={e.story} cta={e.cta} pic={e.pic} at={e.at} href={href} look="sticker" index={offset + i} />
        ) : (
          <Tile key={"file" in e ? e.file : e.embed} p={e} eager={!hidden && i < 2} />
        ),
      )}
    </div>
  );
}

export function DriftWall({ entries, href }: { entries: Entry[]; href: string }) {
  const [k, setK] = useState(3);
  const cols = useMemo(() => lay(entries, k), [entries, k]);
  const wall = useRef<HTMLDivElement>(null);
  const tracks = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const mq = matchMedia("(max-width: 1180px)");
    const set = () => setK(mq.matches ? 2 : 3);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    const el = wall.current;
    if (!el) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const off = new Array(k).fill(0).map((_, i) => i * 220);
    const paused = new Array(k).fill(false);
    let pending = 0;
    // each column's loop length, kept by a ResizeObserver so the frame loop never reads layout
    const heights = new Array(k).fill(0);
    const ro = new ResizeObserver(() => {
      tracks.current.forEach((t, i) => {
        const c = t?.firstElementChild as HTMLElement | null;
        if (c) heights[i] = c.offsetHeight;
      });
    });
    tracks.current.forEach((t) => t?.firstElementChild && ro.observe(t.firstElementChild));
    // the loop runs only while the wall is on screen and the tab is visible
    let visible = true;
    const vis = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    vis.observe(el);
    let last = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const step = pending * 0.16;
      pending -= step;
      for (let i = 0; i < k; i++) {
        const t = tracks.current[i];
        if (!t) continue;
        const d = DRIFT[i % DRIFT.length];
        if (!paused[i] && !still.matches && !document.hidden) off[i] += d.speed * dt;
        off[i] += step * d.wheel;
        const H = heights[i];
        if (!H) continue;
        const y = ((off[i] % H) + H) % H;
        t.style.transform = `translate3d(0, ${-y}px, 0)`;
      }
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    raf = requestAnimationFrame(frame);

    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest?.(".col")) return;
      pending += e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
    };
    const onKey = (e: KeyboardEvent) => {
      const steps: Record<string, number> = { ArrowDown: 90, ArrowUp: -90, PageDown: innerHeight * 0.8, PageUp: -innerHeight * 0.8, " ": innerHeight * 0.8 };
      if (e.key in steps && !(e.target as HTMLElement).closest?.("input, textarea, button, a")) {
        pending += steps[e.key];
        e.preventDefault();
      }
    };
    let ty = 0;
    const onTouchStart = (e: TouchEvent) => (ty = e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      pending += (ty - y) * 1.4;
      ty = y;
    };
    const enter = (i: number) => () => (paused[i] = true);
    const leave = (i: number) => () => (paused[i] = false);
    const colEls = Array.from(el.querySelectorAll<HTMLElement>(".dcol"));
    const handlers = colEls.map((c, i) => {
      const a = enter(i), b = leave(i);
      c.addEventListener("pointerenter", a);
      c.addEventListener("pointerleave", b);
      return () => {
        c.removeEventListener("pointerenter", a);
        c.removeEventListener("pointerleave", b);
      };
    });
    addEventListener("wheel", onWheel, { passive: true });
    addEventListener("keydown", onKey);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      vis.disconnect();
      handlers.forEach((h) => h());
      removeEventListener("wheel", onWheel);
      removeEventListener("keydown", onKey);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [k]);

  let storyIndex = 0;
  return (
    <div className="drift" ref={wall} data-cols={k}>
      {cols.map((c, i) => {
        const from = storyIndex;
        storyIndex += c.filter((e) => "story" in e).length;
        return (
          <div className="dcol" key={`${k}-${i}`}>
            <div className="dtrack" ref={(n) => void (tracks.current[i] = n)}>
              <Copy entries={c} href={href} offset={from} />
              <Copy entries={c} href={href} offset={from} hidden />
            </div>
          </div>
        );
      })}
    </div>
  );
}
