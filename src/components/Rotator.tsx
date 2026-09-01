"use client";

// The line under the name, which changes every few seconds.
//
// One title slides up and out while the next slides up and in. The height is
// held by an invisible copy of the longest string, so the block never resizes
// as the words change and nothing below it moves.
//
// The full list is in the DOM for screen readers and crawlers, read once as a
// single sentence; the moving part is `aria-hidden`, because a line that
// re-announces itself every four seconds is hostile to anyone listening to it.

import { useEffect, useState } from "react";

const HOLD = 3200;

export function Rotator({ items }: { items: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), HOLD);
    return () => clearInterval(t);
  }, [items.length]);

  const longest = items.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span>
      <span className="sr-only">{items.join(" · ")}</span>
      <span aria-hidden="true" className="rot">
        {/* Sets the width and height, and is never seen. */}
        <span className="rot-ghost">{longest}</span>
        {items.map((text, n) => (
          <span
            key={text}
            className="rot-line"
            style={{
              // Above the window, in it, or below it. Everything that is not
              // current sits below, so the sequence always travels upward.
              transform: `translateY(${n === i ? "0%" : n === (i - 1 + items.length) % items.length ? "-100%" : "100%"})`,
              opacity: n === i ? 1 : 0,
            }}
          >
            {text}
          </span>
        ))}
      </span>
    </span>
  );
}
