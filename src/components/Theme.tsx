"use client";

// The light/dark switch.
//
// The stored choice is applied by a blocking script in `layout.tsx`, before
// first paint. A toggle that runs in an effect gives every dark-mode reader a
// white flash on load; this component only owns the button.
//
// The change itself is a circular wipe out of the button, done with the View
// Transition API. That is a progressive enhancement in the strict sense: where
// it is unsupported the class below still cross-fades the themed properties,
// and where BOTH are unavailable the theme simply changes instantly, which is
// what it did before any of this.

import { useEffect, useState } from "react";

export function Theme() {
  const [dark, setDark] = useState(false);

  // Reads what the pre-paint script already decided rather than deciding
  // again: two sources for one answer is how they drift apart.
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  const apply = (next: string) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode, or storage disabled. The toggle still works for this
      // page view; it just will not be remembered.
    }
    setDark(next === "dark");
  };

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = dark ? "light" : "dark";
    const root = document.documentElement;
    const soft = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    type WithVT = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    const doc = document as WithVT;

    if (!soft || !doc.startViewTransition) {
      // No wipe, but still cross-fade the colours rather than snapping.
      if (soft) {
        root.classList.add("theme-shift");
        window.setTimeout(() => root.classList.remove("theme-shift"), 320);
      }
      apply(next);
      return;
    }

    // The wipe starts at the button, so the new theme reads as coming out of
    // the control you just pressed.
    const box = e.currentTarget.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const reach = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const vt = doc.startViewTransition(() => apply(next));
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${reach}px at ${x}px ${y}px)`] },
        {
          duration: 480,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-cur={dark ? "lights on" : "lights off"}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="tap inline-flex size-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:size-7"
    >
      <svg
        width="14" height="14" viewBox="0 0 16 16" fill="none"
        stroke="currentColor" strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      >
        {dark ? (
          // Shown when dark is on, so the button reads as the state it is in
          // rather than the state it would move to.
          <path d="M13.2 9.6A5.7 5.7 0 0 1 6.4 2.8a5.7 5.7 0 1 0 6.8 6.8z" />
        ) : (
          <>
            <circle cx="8" cy="8" r="3.1" />
            <path d="M8 1.6v1.4M8 13v1.4M3.5 3.5l1 1M11.5 11.5l1 1M1.6 8H3M13 8h1.4M3.5 12.5l1-1M11.5 4.5l1-1" />
          </>
        )}
      </svg>
    </button>
  );
}
