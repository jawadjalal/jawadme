"use client";

// Small synthesised sounds, no files: a tick on hover, a pop when a slot swaps, a thump when a drawer opens. Nothing
// plays until the first click or key (browsers require it); the corner toggle mutes and remembers.
import { useEffect, useState } from "react";

const KEY = "jj-sound";
let ctx: AudioContext | null = null;
let on = true;

export function sfx(kind: "hover" | "swap" | "open") {
  if (!on || !ctx) return;
  const c = ctx, t = c.currentTime;
  const o = c.createOscillator(), g = c.createGain();
  o.connect(g).connect(c.destination);
  const [f0, f1, dur, vol] = kind === "hover" ? [1800, 1400, 0.04, 0.02] : kind === "swap" ? [420, 640, 0.09, 0.025] : [150, 90, 0.16, 0.06];
  o.type = "sine";
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function SoundToggle() {
  const [st, setSt] = useState(true);
  useEffect(() => {
    try {
      on = localStorage.getItem(KEY) !== "off" && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {}
    setSt(on);
    const start = () => {
      if (ctx) return;
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) ctx = new AC();
    };
    addEventListener("pointerdown", start, { once: true });
    addEventListener("keydown", start, { once: true });
    return () => {
      removeEventListener("pointerdown", start);
      removeEventListener("keydown", start);
    };
  }, []);
  return (
    <button
      type="button"
      className="fh-sound"
      aria-pressed={st}
      aria-label={st ? "Mute sounds" : "Play sounds"}
      onClick={() => {
        on = !on;
        setSt(on);
        try {
          localStorage.setItem(KEY, on ? "on" : "off");
        } catch {}
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 7h2.5L9 4v10l-3.5-3H3z" />
        {st ? <path d="M12 6.5a3.5 3.5 0 0 1 0 5M14 4.5a6.5 6.5 0 0 1 0 9" /> : <path d="M12 7l4 4M16 7l-4 4" />}
      </svg>
    </button>
  );
}
