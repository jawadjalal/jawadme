"use client";

// Decides whether this visit gets live 3D, and loads the shared canvas only if so, after the page is idle.
// Live needs a viewport of 1024 px or more, no reduced motion and a GPU that detect-gpu rates tier 2 or higher.
// Everyone else keeps the posters already in the page. ?gl=1 forces live (for capture), ?gl=0 forces posters.

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

export function Stage() {
  const [live, setLive] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("gl");
    if (q === "0") return;
    if (q !== "1" && (innerWidth < 1024 || matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    let gone = false;
    const go = async () => {
      if (q !== "1") {
        const { getGPUTier } = await import("detect-gpu");
        const t = await getGPUTier().catch(() => ({ tier: 0 }));
        if (t.tier < 2) return;
      }
      if (!gone) setLive(true);
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 1500 });
    else setTimeout(go, 400);
    return () => {
      gone = true;
    };
  }, []);
  return live ? <Scene onFail={() => setLive(false)} /> : null;
}
