"use client";

/*
 * The first screen's moving parts, after ignaru.com's Stage.tsx: the bar at the top, the ring of doors, the one drawer
 * they all open, and the open drawer's felt piece set large on the screen beside it. A drawer opens from a door, a bar
 * link, the "more" sheet, an `fh-open` event (copy.ts, openDrawer) or a link to /#<drawer>. While one is open the ring
 * turns to its door, so closing it leaves you where you were.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { Booking } from "./booking";
import { DRAWERS, drawerAt, type DrawerId } from "./copy";
import { Drawer } from "./Drawer";
import { FeltGlyph } from "./FeltGlyph";
import { Nav } from "./Nav";
import { Ring } from "./Ring";

/** The open drawer's felt piece, large on the screen beside it (desktop only), drawn in glyphs that lean away from the
 *  cursor. (The drawer is modal, so the page beside it takes no hover: the felt stays in glyphs here.) */
function StageArt({ at }: { at: DrawerId | null }) {
  const d = DRAWERS.find((x) => x.id === at);
  const [last, setLast] = useState(d);
  if (d && d !== last) setLast(d);
  const show = d ?? last;
  if (!show) return null;
  return (
    <div className={`fh-stage-art${d ? " is-on" : ""}`} aria-hidden="true">
      <div key={show.id} className="fh-stage-fg">
        <FeltGlyph art={show.art} alt="" cell={8} />
      </div>
    </div>
  );
}

const isDrawer = (h: string): h is DrawerId => DRAWERS.some((d) => d.id === h);

export function Stage({ booking }: { booking: Booking }) {
  const [at, setAt] = useState<DrawerId | null>(null);
  const atRef = useRef(at);
  atRef.current = at;

  // turn the ring to a door, so the page behind an open drawer sits on its door
  const turn = useCallback((id: DrawerId) => {
    const w = document.querySelector<HTMLElement>(".fh-ring");
    const to = drawerAt(id);
    if (!w || to < 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const span = w.offsetHeight - window.innerHeight;
    window.scrollTo({ top: w.getBoundingClientRect().top + window.scrollY + (span * to) / (DRAWERS.length - 1), behavior: "instant" });
  }, []);
  // Opening a drawer adds one history entry, so Back closes it; stepping between drawers replaces that entry. Closing
  // from the drawer itself goes back past the entry it added, so the next Back leaves the page as usual.
  const go = useCallback(
    (id: DrawerId) => {
      if (atRef.current) {
        turn(id);
        history.replaceState({ fh: id }, "", `#${id}`);
      } else history.pushState({ fh: id }, "", `#${id}`);
      setAt(id);
    },
    [turn],
  );
  const close = useCallback(() => {
    setAt(null);
    if ((history.state as { fh?: string } | null)?.fh) history.back();
    else if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  }, []);

  useEffect(() => {
    const open = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (isDrawer(id)) go(id);
    };
    addEventListener("fh-open", open);
    // arriving on /#<drawer>: the plain page goes under it in history, so closing the drawer stays on the site
    // /#before was a drawer until the work drawer took Okara and MenuFit in
    const h = location.hash.slice(1) === "before" ? "work" : location.hash.slice(1);
    if (isDrawer(h)) {
      history.replaceState(null, "", location.pathname + location.search);
      window.setTimeout(() => go(h), 300);
    }
    const pop = () => {
      const x = location.hash.slice(1);
      if (isDrawer(x)) {
        if (x !== atRef.current) {
          if (atRef.current) turn(x);
          setAt(x);
        }
      } else if (atRef.current) setAt(null);
    };
    addEventListener("popstate", pop);
    return () => {
      removeEventListener("fh-open", open);
      removeEventListener("popstate", pop);
    };
  }, [go, turn]);

  return (
    <>
      <Nav at={at} onGo={go} />
      <main className="fh-main">
        <Ring open={at} onOpen={go} />
      </main>
      <StageArt at={at} />
      <Drawer booking={booking} at={at} onClose={close} onGo={go} />
    </>
  );
}
