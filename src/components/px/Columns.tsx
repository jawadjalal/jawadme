"use client";

import { useEffect, useRef } from "react";
import type { DoodleName } from "./Doodle";
import meta from "./meta.json";

// Two columns of square tiles down the screen edges, each a doodle from the
// sketches at 2px cells. They ride the scroll in opposite directions, the
// left one up and the right one down, and creep on their own when the page
// is still. Desktop only; phones get one band under the nav instead.
// The same loop flips the doodles' boil frame as the page scrolls.

const LEFT: DoodleName[] = ["floppy", "rocket", "cursor", "bus", "pencil", "console", "cube", "pigeon", "bulb"];
const RIGHT: DoodleName[] = ["bigben", "laptop", "plane", "tea", "controller", "sketchbook", "phone", "plant", "postbox"];
// tile looks, by position: blue with a paper icon, paper with blue, ink with paper, orange with ink
const LOOK = ["t-blue", "t-paper", "t-ink", "t-paper", "t-pop", "t-blue", "t-paper", "t-ink", "t-paper"];
const ICON: Record<string, "i" | "b" | "k"> = { "t-blue": "i", "t-paper": "b", "t-ink": "i", "t-pop": "k" };

function Tiles({ names, flip }: { names: DoodleName[]; flip?: boolean }) {
  return (
    <>
      {[0, 1, 2].map((rep) =>
        names.map((n, i) => {
          const look = LOOK[(i + (flip ? 4 : 0)) % LOOK.length];
          const [w, h] = meta.icon[n];
          return (
            <span key={`${rep}-${n}`} className={`tile ${look}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/px/${ICON[look]}-${n}.png`} alt="" width={w * 2} height={h * 2} />
            </span>
          );
        }),
      )}
    </>
  );
}

export function Columns() {
  const l = useRef<HTMLDivElement>(null);
  const r = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, boil = -1;
    const t0 = performance.now();
    const set = 9 * 64; // one set of tiles: 9 tiles of 60px plus a 4px gap
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const drift = still ? 0 : (now - t0) / 1000 * 6;
      const y = scrollY * 0.4 + drift;
      // whole pixels only, so the tiles never land between device pixels
      const a = -Math.round(y % set) - set;
      const b = Math.round(y % set) - set * 2;
      if (l.current) l.current.style.transform = `translate3d(0, ${a}px, 0)`;
      if (r.current) r.current.style.transform = `translate3d(0, ${b}px, 0)`;
      // every doodle on the page flips to its other frame each 96px scrolled
      const f = Math.floor(scrollY / 96) % 2;
      if (f !== boil) document.documentElement.style.setProperty("--boil", String((boil = f)));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="cols" aria-hidden="true">
      <div className="col col-l">
        <div ref={l} className="col-run">
          <Tiles names={LEFT} />
        </div>
      </div>
      <div className="col col-r">
        <div ref={r} className="col-run">
          <Tiles names={RIGHT} flip />
        </div>
      </div>
      <div className="band">
        <div className="band-run">
          <Tiles names={[...LEFT, ...RIGHT]} />
        </div>
      </div>
    </div>
  );
}
