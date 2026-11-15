"use client";

// A slow, quiet strip of items that drifts sideways for ever, for the foot of the home column. The set is drawn twice,
// end to end, and the track slides by one set's width, so the loop never shows a seam; a set too short to fill the strip
// is repeated until it does. Speed is in px per second, so a long strip and a short one move at the same pace. Pointed
// at or pressed, it stops; tabbed into, it stands still at its start and scrolls to each focused link; with reduced
// motion it is one still, wrapped set. Only the first copy is read out and reachable by keyboard.

import { useEffect, useRef, useState } from "react";

export function Marquee({ label, items, speed = 22, reverse }: { label: string; items: React.ReactNode[]; speed?: number; reverse?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const set = useRef<HTMLUListElement>(null);
  const [fit, setFit] = useState({ reps: 2, dur: 60 });

  useEffect(() => {
    const b = box.current, s = set.current;
    if (!b || !s) return;
    const measure = () => {
      const w = s.getBoundingClientRect().width;
      if (!w) return;
      const reps = Math.min(8, Math.max(1, Math.ceil(b.clientWidth / w)));
      const dur = Math.round((w * reps) / speed);
      setFit((f) => (f.reps === reps && f.dur === dur ? f : { reps, dur }));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(b);
    ro.observe(s);
    return () => ro.disconnect();
  }, [speed]);

  const copies = fit.reps * 2;
  return (
    <div className="mq" ref={box} data-dir={reverse ? "r" : undefined} role="group" aria-label={label}>
      <div className="mq-track" style={{ "--dur": `${fit.dur}s` } as React.CSSProperties}>
        {Array.from({ length: copies }, (_, i) => (
          <ul key={i} role="list" className="mq-set" ref={i ? undefined : set} aria-hidden={i ? true : undefined} inert={i > 0}>
            {items.map((it, j) => (
              <li key={j}>{it}</li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
