"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const LOGOS = [
  { name: "ignaru", src: "/logos/clean/ignaru.png" },
  { name: "menufit", src: "/logos/clean/menufit.png" },
  { name: "okara", src: "/logos/clean/okara.png" },
  { name: "ignura", src: "/logos/clean/ignura.png" },
  { name: "bevel", src: "/logos/clean/bevel.png" },
  { name: "kleoklaw", src: "/logos/clean/kleoklaw.png" },
  { name: "splitting point", src: "/logos/clean/splittingpoint.png" },
  { name: "vizzbees", src: "/logos/clean/vizzbees.png" },
  { name: "acquiblox", src: "/logos/clean/acquiblox.png" },
  { name: "basketent", src: "/logos/clean/basketent.png" },
];
const SLOTS = 6;
const ORDER = [2, 5, 0, 3, 1, 4];

/** Six still logo slots. Every few seconds one slot, never two at once, swaps in place to a logo that is off the row. */
export function LogoRow() {
  const [shown, setShown] = useState(() => LOGOS.slice(0, SLOTS).map((_, i) => i));

  useEffect(() => {
    if (LOGOS.length <= SLOTS || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spare = LOGOS.map((_, i) => i).slice(SLOTS);
    let tick = 0;
    const id = window.setInterval(() => {
      const slot = ORDER[tick++ % SLOTS];
      setShown((cur) => {
        const next = cur.slice();
        spare.push(next[slot]);
        next[slot] = spare.shift()!;
        return next;
      });
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <ul className="lr" aria-label="companies and projects">
      {shown.map((i, slot) => (
        <li key={slot} className="lr-slot">
          <span key={i} className="lr-logo">
            <Image src={LOGOS[i].src} alt="" width={22} height={22} unoptimized className="lr-mark" />
            <span>{LOGOS[i].name}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
