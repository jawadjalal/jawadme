"use client";

// The email button, promoted into the header once the hero's copy of it has
// scrolled away.
//
// It watches the hero button rather than a scroll offset. A pixel threshold
// would need re-tuning every time the hero gains a line, and would be wrong
// on a phone the moment the buttons wrap; the element itself always knows
// where it is.

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { IDENTITY } from "@/lib/profile";

export function ScrollCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero-cta");
    if (!hero) return;

    const io = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      // Fires once the hero button is properly gone rather than the instant
      // its last pixel crosses, so the two are never both on screen.
      { rootMargin: "-8px 0px 0px 0px", threshold: 0 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <a
      href={`mailto:${IDENTITY.email}`}
      data-cur="say hi"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`cta-slot inline-flex items-center gap-1.5 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90 ${
        show ? "is-in" : ""
      }`}
    >
      <Icon name="mail" size={13} />
      <span className="hidden sm:inline">Send an email</span>
      <span className="sm:hidden">Email</span>
    </a>
  );
}
