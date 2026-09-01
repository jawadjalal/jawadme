"use client";

// The section rail, in the left margin.
//
// Past about 1280px the column leaves two hundred-odd pixels of empty ground
// on either side, and the page's own structure is the one thing that space
// can carry without competing with the reading column: a tick per section,
// the one you are in lengthened and inked up. It is the header's Page menu
// laid out vertically, so it adds a way to move around rather than a new
// thing to read.
//
// It is anchored to the column, not to the viewport edge, so the gap between
// rail and text is the same at 1280 as at 2560. Anchoring it to the edge
// would pull it further away the wider the screen got, which is the point at
// which a margin element stops belonging to the page.

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "now", label: "Now" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "elsewhere", label: "Elsewhere" },
  { id: "contact", label: "Contact" },
  { id: "overlaps", label: "Where it overlaps" },
];

export function Rail() {
  const [here, setHere] = useState<string | null>(null);

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (n): n is HTMLElement => Boolean(n),
    );
    if (!nodes.length) return;

    // Whichever tracked section has crossed the top of the viewport most
    // recently, rather than whichever is most visible. On a page where one
    // section is four screens tall and the next is half a screen, "most
    // visible" leaves the rail sitting on the tall one long after you have
    // read past it.
    const pick = () => {
      const line = window.innerHeight * 0.3;
      let found: string | null = null;
      for (const n of nodes) {
        if (n.getBoundingClientRect().top <= line) found = n.id;
      }
      setHere(found);
    };

    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, []);

  return (
    <nav
      aria-label="Sections"
      className="fixed top-1/2 z-40 hidden -translate-y-1/2 xl:block"
      style={{ insetInlineStart: "calc(50% - 357.5px - 12.5rem)", width: "10.5rem" }}
    >
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="rail-item"
          aria-current={here === s.id ? "true" : undefined}
        >
          <span className="rail-tick" aria-hidden="true" />
          <span>{s.label}</span>
        </a>
      ))}
    </nav>
  );
}
