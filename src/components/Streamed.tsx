"use client";

// A block of prose that types itself when you reach it. From ripwebsite.
//
// Each block carries its own cursor and starts when it comes into view, so
// the writing arrives as you get to it the whole way down the page rather
// than being spent on the first screen while everything below it just exists.
//
// The words are server-rendered in full. This is a replay over text that is
// already in the HTML, never the thing that puts it there, so a crawler, a
// reader with scripting off, and anyone on reduced motion all get the
// finished paragraph.
//
// **The un-typed text is hidden, not absent.** Every character is in the DOM
// from the start and the ones the cursor has not reached are `visibility:
// hidden`, so they still take up their space. Slicing the string instead —
// which is what this did first — collapses the paragraph to nothing on
// rewind, and an IntersectionObserver watching a zero-height element never
// reports it as intersecting, so the block waits forever for a callback that
// cannot arrive. Reserving the space also means the page never reflows as the
// words land.

import { useEffect, useRef, useState } from "react";
import { BrandLink, InlineIcon, Mark, type Parsed } from "./prose";

const CHARS_PER_SECOND = 420;

export function Streamed({
  parsed,
  animate,
  /** Held back this long after coming into view, so a run of blocks that are
   *  all on screen at once types in sequence rather than in unison. */
  delay = 0,
  className = "",
  as: Tag = "p",
}: {
  parsed: Parsed;
  animate: boolean;
  delay?: number;
  className?: string;
  as?: "p" | "h1" | "h2" | "span" | "div";
}) {
  const host = useRef<HTMLElement>(null);
  // Starts complete. That is what the server renders and what hydration
  // matches; the effect below rewinds it only when it is going to animate.
  const [shown, setShown] = useState(parsed.length);

  useEffect(() => {
    // Reduced motion is checked here rather than passed in, so a caller
    // cannot forget it. The paragraph is already complete in the DOM, so
    // bailing out leaves the finished text exactly as the server sent it.
    if (!animate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = host.current;
    if (!el) return;

    let raf = 0;
    let timer = 0;
    setShown(0);

    const run = () => {
      const start = performance.now();
      const loop = (now: number) => {
        const n = Math.min(
          parsed.length,
          Math.floor(((now - start) / 1000) * CHARS_PER_SECOND),
        );
        setShown(n);
        if (n < parsed.length) raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };

    // Once. A paragraph that retyped every time it re-entered the viewport
    // would be unreadable on the way back up the page.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timer = window.setTimeout(run, delay * 1000);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [animate, delay, parsed]);

  return (
    <Tag ref={host as never} className={className}>
      <Segments parsed={parsed} shown={shown} />
    </Tag>
  );
}

/**
 * The block, with the cursor at `shown`.
 *
 * While typing, each character is its own span: the ones behind the cursor
 * run the blur-in keyframe as they arrive, the ones ahead of it are hidden
 * but still occupy their space. Once the block is complete the spans are
 * dropped for plain strings — a finished paragraph has no reason to stay four
 * hundred elements, and the swap is invisible because every one of them has
 * already finished animating.
 */
export function Segments({ parsed, shown }: { parsed: Parsed; shown: number }) {
  const complete = shown >= parsed.length;

  return (
    <>
      {parsed.segments.map((segment, i) => {
        if (segment.kind === "mark") {
          // The highlight lands only once the whole phrase is on screen, so
          // it sweeps in behind finished words rather than growing with them.
          const lit = shown >= segment.at + segment.value.length;
          return (
            <Mark key={i} name={segment.name} hue={segment.hue} lit={lit} tight={segment.tight}>
              {complete ? (
                segment.value
              ) : (
                <Chars value={segment.value} at={segment.at} shown={shown} />
              )}
            </Mark>
          );
        }

        if (segment.kind === "icon") {
          return (
            <InlineIcon
              key={i}
              name={segment.name}
              tight={segment.tight}
              pending={shown < segment.at}
            />
          );
        }

        if (segment.kind === "ink") {
          // Icon plus ordinary ink, no chip and no hue. The sentences these
          // sit in are almost entirely dimmed, so plain foreground text is
          // already the loudest thing in the line: a tint on top would be
          // emphasis piled on emphasis.
          return (
            <span key={i} className="font-medium text-foreground">
              <InlineIcon name={segment.name} />
              {complete ? (
                segment.value
              ) : (
                <Chars value={segment.value} at={segment.at} shown={shown} />
              )}
            </span>
          );
        }

        if (segment.kind === "tint") {
          const body = complete ? (
            segment.value
          ) : (
            <Chars value={segment.value} at={segment.at} shown={shown} />
          );
          const cls = `rp-tint is-${segment.hue}`;
          return segment.href ? (
            <a
              key={i}
              href={segment.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${cls} rp-tint-link`}
              data-cur="open"
            >
              {body}
            </a>
          ) : (
            <span key={i} className={cls}>
              {body}
            </span>
          );
        }

        if (segment.kind === "link") {
          return (
            <BrandLink key={i} brand={segment.brand} icon={segment.icon} href={segment.href}>
              {complete ? (
                segment.value
              ) : (
                <Chars value={segment.value} at={segment.at} shown={shown} />
              )}
            </BrandLink>
          );
        }

        // Supporting text carries the dim class; it still types at the same
        // rate as everything else, it is just quieter once it lands.
        const cls = segment.dim ? "rp-dim" : undefined;
        if (complete) {
          return (
            <span key={i} className={cls}>
              {segment.value}
            </span>
          );
        }
        return (
          <span key={i} className={cls}>
            <Chars value={segment.value} at={segment.at} shown={shown} />
          </span>
        );
      })}
    </>
  );
}

/** One run of text, character by character, with the cursor at `shown`. */
function Chars({ value, at, shown }: { value: string; at: number; shown: number }) {
  return (
    <>
      {value.split("").map((char, j) => (
        <span
          key={j}
          // `is-pending` hides the character without taking it out of the
          // line, which is what keeps the paragraph its finished height the
          // whole way through.
          className={`t-char${at + j < shown ? "" : " is-pending"}`}
        >
          {char}
        </span>
      ))}
    </>
  );
}
