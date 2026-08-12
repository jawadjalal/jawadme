"use client";

// The hover card: a link's own share image, floating above it.
//
// Nothing is fetched until the pointer first lands on the link, so a page that
// nobody hovers costs nothing. Once fetched the image stays mounted, so going
// back to a link you have already visited is instant rather than a second wait.
//
// If the image never arrives — the site has no og:image and no local
// screenshot — the card is never shown at all, rather than opening onto an
// empty rectangle.

import { useState, type ReactNode } from "react";

export function Preview({
  previewKey,
  children,
  inline,
}: {
  previewKey: string;
  children: ReactNode;
  // Set for links sitting inside a sentence. An inline-block cannot be broken
  // across lines, which shunts whatever follows it — in one case leaving a full
  // stop stranded on a line of its own.
  inline?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Touch devices fire a synthetic mouseenter on tap; arming on it is harmless
  // because the card only ever paints under a real :hover.
  const arm = () => setArmed(true);

  return (
    <span className={`hm-hover ${inline ? "is-inline" : ""}`} onMouseEnter={arm} onFocus={arm}>
      {children}
      {armed && !failed && (
        <span className={`hm-preview ${ready ? "is-ready" : ""}`} aria-hidden="true">
          <img
            src={`/api/og?k=${encodeURIComponent(previewKey)}`}
            alt=""
            onLoad={() => setReady(true)}
            onError={() => setFailed(true)}
          />
        </span>
      )}
    </span>
  );
}
