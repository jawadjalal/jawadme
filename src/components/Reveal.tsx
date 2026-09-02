"use client";

// The arrival animation for everything that is not prose.
//
// The About block types itself out character by character, which suits a
// paragraph and suits nothing else: a table typed one cell at a time reads as
// a page struggling to load, and a logo cannot be typed at all. So the rest of
// the page uses the same vocabulary at a different grain. Instead of
// characters it reveals whole rows, cards and cells, each lifting a few pixels
// out of a blur, staggered along the reading order.
//
// It is a replay over content that is already in the HTML, exactly as the
// typing is: the markup is complete on the server and this only animates its
// first appearance. A crawler, a reader with scripting off and anyone on
// reduced motion get the finished page.
//
// Once revealed a block stays revealed. Something that re-animated every time
// it re-entered the viewport would make the page impossible to scroll back up.

import { useEffect, useRef, useState } from "react";

export function Reveal({
  children,
  /** Position in its own group, which sets the stagger. */
  index = 0,
  /** Seconds between one item and the next. */
  step = 0.06,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  index?: number;
  step?: number;
  className?: string;
  as?: "div" | "li" | "span" | "tr" | "section";
}) {
  const host = useRef<HTMLElement>(null);
  // Starts revealed, which is what the server renders and what hydration
  // matches. The effect below hides it again only when it is going to animate.
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = host.current;
    if (!el) return;

    setArmed(true);
    setShown(false);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setShown(true);
      },
      // Fires a little before the element reaches the fold, so a row is
      // already arriving as it comes into view rather than starting once it
      // is fully on screen and visibly late.
      { rootMargin: "0px 0px -6% 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={host as never}
      className={`${armed ? "reveal" : ""} ${shown ? "is-in" : ""} ${className}`}
      style={armed ? ({ "--reveal-delay": `${index * step}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
