"use client";

// The pointer, replaced.
//
// Two nodes follow the mouse: the arrow itself, and a pill that trails behind
// it carrying a word. The native cursor is hidden while this is on.
//
// It is off unless the device actually has a fine pointer. On a touch screen
// there is no cursor to replace, and hiding the native one there would leave
// a page that cannot be pointed at. Reduced motion keeps the arrow but drops
// the trailing lag, so the pill sits exactly on the pointer instead of
// easing toward it.

import { useEffect, useRef, useState } from "react";

/** How far the pill lags the arrow, per frame. 1 would be no lag at all. */
const EASE = 0.18;

export function Cursor({ label = "hi" }: { label?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const arrow = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [word, setWord] = useState(label);

  useEffect(() => {
    // A coarse pointer has nothing to replace.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setOn(true);

    const soft = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Parked off screen until the first move, so neither node flashes in the
    // top-left corner on load.
    let x = -9999, y = -9999;
    let px = x, py = y;
    let raf = 0;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;

      // The label says what the thing under the pointer would do. `data-cur`
      // is the opt-in: an element that wants to name its own action sets it,
      // and everything else falls back to the greeting.
      const el = e.target as HTMLElement | null;
      const named = el?.closest?.("[data-cur]") as HTMLElement | null;
      if (named) setWord(named.dataset.cur || label);
      else if (el?.closest?.("a, button, summary")) setWord("open");
      else setWord(label);

      if (arrow.current) {
        arrow.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        arrow.current.style.opacity = "1";
      }
      if (pill.current) pill.current.style.opacity = "1";
    };

    const hide = () => {
      if (arrow.current) arrow.current.style.opacity = "0";
      if (pill.current) pill.current.style.opacity = "0";
    };

    const loop = () => {
      // The pill chases the arrow rather than being pinned to it. That lag is
      // the whole effect: pinned, it reads as a tooltip; trailing, it reads
      // as something following you around the page.
      px += (x - px) * (soft ? EASE : 1);
      py += (y - py) * (soft ? EASE : 1);
      if (pill.current) {
        pill.current.style.transform = `translate3d(${px + 13}px, ${py + 11}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    document.documentElement.classList.add("has-cursor");

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [label]);

  // The custom cursor and the top layer.
  //
  // A <dialog> opened with showModal() is promoted to the browser's top
  // layer, which paints above the whole normal stacking context whatever
  // z-index anything in it carries. Inside the modal the overlay was
  // underneath while `cursor: none` was still in force, so the pointer
  // vanished entirely.
  //
  // The overlay is a manual popover, which puts it in the top layer too.
  // Top-layer elements stack in promotion order, so it is re-shown whenever a
  // dialog opens, which lifts it back above.
  //
  // This is its own effect rather than part of the one above because the
  // overlay is not rendered until `on` flips: the pointer handlers get away
  // with it by reading their refs lazily inside the callback, but showing a
  // popover happens now, and now is too early.
  useEffect(() => {
    if (!on) return;

    const promote = () => {
      const el = root.current;
      if (!el?.showPopover) return false;
      try {
        if (!el.matches(":popover-open")) el.showPopover();
        else {
          el.hidePopover();
          el.showPopover();
        }
        return true;
      } catch {
        return false;
      }
    };

    const supported = promote();

    // Any dialog, not just this site's one modal: the attribute is what marks
    // a dialog as showing.
    const watch = new MutationObserver(() => {
      const openDialog = document.querySelector("dialog[open]");
      if (supported) {
        if (openDialog) promote();
      } else {
        // Without popover support the overlay cannot reach the top layer, and
        // a hidden custom cursor over a modal is worse than the real one.
        document.documentElement.classList.toggle("has-cursor", !openDialog);
      }
    });
    watch.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["open"],
    });

    return () => watch.disconnect();
  }, [on]);

  if (!on) return null;

  return (
    <div ref={root} aria-hidden="true" className="cur-root" popover="manual">
      <div ref={arrow} className="cur-arrow">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M5 3 L23 14 L14 16 L11 24 Z"
            fill="var(--foreground)"
            stroke="var(--background)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div ref={pill} className="cur-pill">
        {word}
      </div>
    </div>
  );
}
