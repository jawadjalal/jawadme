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

import { useId, useState } from "react";
import { Icon } from "./Icon";

export function Section({
  title,
  id,
  aside,
  /** Sections that carry the argument open by default; the long tail does not. */
  defaultOpen = true,
  children,
}: {
  title: string;
  id?: string;
  aside?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <section id={id} className="screen-line-top">
      <div className="screen-line-bottom flex w-full items-center justify-between gap-4 px-4 py-1">
        <h2 className="scroll-mt-20 font-display text-xl font-medium tracking-tight sm:text-2xl">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {aside && <span className="font-mono text-xs text-muted-foreground">{aside}</span>}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={bodyId}
            aria-label={`${open ? "Hide" : "Show"} ${title}`}
            data-cur={open ? "hide" : "show"}
            className="tap -mr-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <Icon
              name="chev"
              size={14}
              className={`sec-chev ${open ? "" : "is-closed"}`}
            />
          </button>
        </div>
      </div>
      <div id={bodyId} className={`sec-body ${open ? "is-open" : ""}`}>
        <div className="sec-body-inner">{children}</div>
      </div>
    </section>
  );
}
