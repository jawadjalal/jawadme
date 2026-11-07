"use client";

// The felt row under the line: every drawer by name, each with its own felt piece, the way ignaru.com's bar names its
// drawers. No boxes: the piece and the word, and the piece tips up on hover. Styles: felt.css (`fh-ix`).
import { DRAWERS, feltSrc, openDrawer } from "./copy";
import { sfx } from "./Sound";

export function Index() {
  return (
    <nav className="fh-ix" aria-label="My work">
      <ul>
        {DRAWERS.map((d, i) => (
          <li key={d.id} style={{ ["--c" as string]: d.color, ["--i" as string]: i }}>
            <button type="button" aria-haspopup="dialog" onClick={() => openDrawer(d.id)} onPointerEnter={(e) => e.pointerType === "mouse" && sfx("hover")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={feltSrc(d.art).src} alt="" width={40} height={40} loading="lazy" decoding="async" />
              <span>{d.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
