"use client";

/*
 * The page's moving parts, after ignaru.com's Stage.tsx: the bar at the top, the page itself (children: the opening,
 * Wayari, Okara, MenuFit, the work list), the one drawer every "more" link opens, and the open drawer's felt piece set
 * large on the screen beside it. A drawer opens from a bar link, the "more" sheet, an `fh-open` event (copy.ts,
 * openDrawer) or a link to /#<drawer>; any other /#<id> is a plain anchor on the page.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Booking } from "./booking";
import { DRAWERS, type DrawerId } from "./copy";
import { Drawer } from "./Drawer";
import { Nav } from "./Nav";

/** The open drawer's felt piece, large on the screen beside it (desktop only). */
function StageArt({ at }: { at: DrawerId | null }) {
  const d = DRAWERS.find((x) => x.id === at);
  const [last, setLast] = useState(d);
  if (d && d !== last) setLast(d);
  const show = d ?? last;
  if (!show) return null;
  return (
    <div className={`fh-stage-art${d ? " is-on" : ""}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={show.id} src={show.id === "about" ? "/felt/jawad-face-800.webp" : `/felt/${show.art}.webp`} alt="" width={640} height={640} decoding="async" className={show.id === "about" ? "is-me" : undefined} />
    </div>
  );
}

const isDrawer = (h: string): h is DrawerId => DRAWERS.some((d) => d.id === h);

export function Stage({ booking, children }: { booking: Booking; children: ReactNode }) {
  const [at, setAt] = useState<DrawerId | null>(null);
  const atRef = useRef(at);
  atRef.current = at;

  // Opening a drawer adds one history entry, so Back closes it; stepping between drawers replaces that entry. Closing
  // from the drawer itself goes back past the entry it added, so the next Back leaves the page as usual.
  const go = useCallback(
    (id: DrawerId) => {
      if (atRef.current) history.replaceState({ fh: id }, "", `#${id}`);
      else history.pushState({ fh: id }, "", `#${id}`);
      setAt(id);
    },
    [],
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
    const h = location.hash.slice(1);
    if (isDrawer(h)) {
      history.replaceState(null, "", location.pathname + location.search);
      window.setTimeout(() => go(h), 300);
    }
    const pop = () => {
      const x = location.hash.slice(1);
      if (isDrawer(x)) {
        if (x !== atRef.current) setAt(x);
      } else if (atRef.current) setAt(null);
    };
    addEventListener("popstate", pop);
    return () => {
      removeEventListener("fh-open", open);
      removeEventListener("popstate", pop);
    };
  }, [go]);

  return (
    <>
      <Nav at={at} onGo={go} />
      <main className="fh-main">{children}</main>
      <StageArt at={at} />
      <Drawer booking={booking} at={at} onClose={close} onGo={go} />
    </>
  );
}
