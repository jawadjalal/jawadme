"use client";

// A titled block in the ruled column, which the reader can fold away.
//
// The control sits at the right end of the heading rule, where it reads as
// belonging to that section rather than to the page. Folding is a real
// convenience on a long single-column site: someone who has read the work
// and wants the contact details should not have to scroll past it again.
//
// The animation uses grid-template-rows 0fr to 1fr rather than max-height.
// max-height needs a guessed ceiling, and the guess is either too small (the
// section clips) or too large (the close runs at the wrong speed for the
// first half of its travel because most of the distance is empty). A grid
// row animates to the content's real height, whatever it is.
//
// Everything stays in the DOM when folded, hidden with `visibility` rather
// than unmounted, so the anchors in the header menus still resolve and the
// browser's own in-page search still finds the words.

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";
import { Obj, type ObjName } from "./Obj";

export function Section({
  title,
  id,
  aside,
  /** The glossy object that leads the heading. */
  obj,
  /** Sections that carry the argument open by default; the long tail does not. */
  defaultOpen = true,
  children,
}: {
  title: string;
  id?: string;
  aside?: React.ReactNode;
  obj?: ObjName;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  // `overflow: hidden` is what makes the fold animate, and it is also what was
  // clipping the hover cards: a card that reaches above its own row is outside
  // the section box, so the section was cutting it off at the heading rule.
  // The clip is only needed while the height is actually moving, so it comes
  // off once the section has finished opening and goes back on the instant a
  // close begins.
  const [settled, setSettled] = useState(defaultOpen);
  const timer = useRef(0);
  const bodyId = useId();

  useEffect(() => {
    window.clearTimeout(timer.current);
    if (!open) {
      setSettled(false);
      return;
    }
    // Matches the grid-template-rows duration in globals.css.
    timer.current = window.setTimeout(() => setSettled(true), 460);
    return () => window.clearTimeout(timer.current);
  }, [open]);

  return (
    <section id={id} className="sec scroll-mt-20">
      <div className="sec-head">
        <h2 className="sec-title">
          {obj && <Obj name={obj} size={34} className="sec-obj" />}
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {aside && <span className="text-[14px] text-muted-foreground">{aside}</span>}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={bodyId}
            aria-label={`${open ? "Hide" : "Show"} ${title}`}
            data-cur={open ? "hide" : "show"}
            className="tap inline-flex size-8 items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <Icon
              name="chev"
              size={14}
              className={`sec-chev ${open ? "" : "is-closed"}`}
            />
          </button>
        </div>
      </div>
      <div id={bodyId} className={`sec-body ${open ? "is-open" : ""} ${settled ? "is-settled" : ""}`}>
        <div className="sec-body-inner">{children}</div>
      </div>
    </section>
  );
}
