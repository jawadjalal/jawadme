"use client";

/* Two stages, one scroll. First the agents feed on its own, elevated off the
   ground on the left of the screen. Scroll on and the same panel is back where
   it lives, inside the dashboard.

   Both artboards are fixed-size designs, so each one is scaled to fit rather
   than reflowed. No annotations: this is meant to be talked over. */
import { useEffect, useState } from "react";
import Link from "next/link";
import Feed from "./Feed";
import { PANEL, DASHBOARD } from "./markup";

/* The artboards' own dimensions, from the design file. */
const PANEL_W = 540;
/* The dashboard artboard is declared 1440x940 but lays out wider than that, so
   its box is measured rather than trusted. */
const BOARD_W = 1560;
const BOARD_H = 940;

export default function Stage() {
  /* Scale each artboard to the viewport. The panel is bounded by height since
     it is tall and narrow, the dashboard by width. */
  const [panelK, setPanelK] = useState(1);
  const [boardK, setBoardK] = useState(1);
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
  const [boardEl, setBoardEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const fit = () => {
      const w = document.documentElement.clientWidth;
      const h = window.innerHeight;
      const panelH = panelEl?.firstElementChild?.scrollHeight ?? 1500;
      const room = w < 900 ? w - 32 : Math.min(w * 0.5, 620);
      setPanelK(Math.min(1, room / PANEL_W, (h - 160) / panelH));
      const boardW = boardEl?.firstElementChild?.scrollWidth || BOARD_W;
      const boardH = boardEl?.firstElementChild?.scrollHeight || BOARD_H;
      setBoardK(Math.min(1, (w - (w < 900 ? 24 : 96)) / boardW, (h - 170) / boardH));
    };
    fit();
    window.addEventListener("resize", fit);
    /* Fonts and images change the panel's height after first paint, and so does
       the prototype itself: opening the paywall makes the panel taller. Watch
       it rather than measuring once, so the feed always fits the screen and
       nothing has to be scrolled to reach it. */
    const ro = new ResizeObserver(fit);
    const inner = panelEl?.firstElementChild;
    if (inner) ro.observe(inner);
    /* The prototype says so directly as well, since a max-height transition can
       finish without the observer reporting the settled size. */
    const onFeedResize = () => window.setTimeout(fit, 420);
    document.addEventListener("okara:resize", onFeedResize);
    const t = window.setTimeout(fit, 700);
    return () => {
      window.removeEventListener("resize", fit);
      ro.disconnect();
      document.removeEventListener("okara:resize", onFeedResize);
      window.clearTimeout(t);
    };
  }, [panelEl, boardEl]);

  return (
    <div className="af">
      <section className="af-stage af-stage-panel">
        <div
          ref={setPanelEl}
          className="af-panel"
          style={{ transform: `scale(${panelK})` }}
        >
          <Feed html={PANEL} />
        </div>
      </section>

      <section className="af-stage af-stage-board">
        <div
          ref={setBoardEl}
          className="af-board"
          style={{ width: BOARD_W, height: BOARD_H, transform: `scale(${boardK})` }}
        >
          <Feed html={DASHBOARD} />
        </div>
      </section>

      <p className="af-back">
        <Link href="/okara">Back to the dashboard changes</Link>
      </p>
    </div>
  );
}
