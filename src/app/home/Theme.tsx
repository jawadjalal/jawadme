"use client";

// The light/dark toggle in the top-right corner.
//
// The document element carries the whole scheme: `data-theme="light"` or
// `"dark"`, which every palette rule in home.css keys off. This button only
// flips that attribute and remembers the choice.
//
// It renders no theme-dependent markup — both icons ship every time and CSS
// shows one — so there is nothing here for the server to guess wrong and nothing
// to correct on hydration. THEME_SCRIPT below runs in the head and replays the
// stored choice before the first paint, which is what stops a visitor who chose
// dark from getting a frame of white.

import { useEffect, useState } from "react";

const KEY = "jj-theme";

// Inline, synchronous, and deliberately terse — it blocks the first paint, so
// every byte is one the page waits on. Wrapped in try/catch because reading
// localStorage throws outright in a partitioned or cookie-blocked context, and
// an exception here would take the rest of the head with it.
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${KEY}");if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;

type Theme = "light" | "dark";

export function ThemeToggle() {
  // Null until mounted: the server has no idea which theme this visitor uses,
  // and the button must render identically on both sides.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: Theme =
      (document.documentElement.dataset.theme ?? "light") === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage refused. The theme still flips for this page view; it just will
      // not be remembered on the next one.
    }
  };

  return (
    <button
      type="button"
      className="hm-theme"
      onClick={toggle}
      aria-label={
        theme === null
          ? "Switch between light and dark"
          : theme === "dark"
            ? "Switch to the light theme"
            : "Switch to the dark theme"
      }
    >
      <Moon />
      <Sun />
    </button>
  );
}

function Moon() {
  return (
    <svg
      className="hm-moon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" />
    </svg>
  );
}

function Sun() {
  return (
    <svg
      className="hm-sun"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.1M12 19.3v2.1M21.4 12h-2.1M4.7 12H2.6M18.6 5.4l-1.5 1.5M6.9 17.1l-1.5 1.5M18.6 18.6l-1.5-1.5M6.9 6.9L5.4 5.4" />
    </svg>
  );
}
