"use client";

import { useEffect, useState } from "react";
import "./loaderB.css";

const SESSION_KEY = "jj-intro-v2";

/** Crisp, 550ms Neo-Industrial curtain reveal. Runs once per session on desktop/mobile,
 *  never blocks wheel/scroll, zero canvas readbacks, respects prefers-reduced-motion. */
export function LoaderB() {
  const [phase, setPhase] = useState<"idle" | "boot" | "exit" | "done">("idle");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    try {
      if (/[?&]loader=0(&|$)/.test(location.search)) {
        setPhase("done");
        return;
      }
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setPhase("done");
        return;
      }
      if (sessionStorage.getItem(SESSION_KEY)) {
        setPhase("done");
        return;
      }
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      setPhase("done");
      return;
    }

    setPhase("boot");
    const t0 = performance.now();
    const dur = 420;
    let raf = 0;

    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - u, 3);
      setPct(Math.round(eased * 100));
      if (u < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase("exit");
      }
    };
    raf = requestAnimationFrame(tick);

    const doneTimer = window.setTimeout(() => setPhase("done"), 920);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "idle" || phase === "done") return null;

  return (
    <div
      className={"intro-curtain" + (phase === "exit" ? " is-exit" : "")}
      aria-hidden="true"
    >
      <div className="intro-inner">
        <div className="intro-top">
          <span>JAWAD JALAL</span>
          <span>LONDON, UK // 51.5074° N</span>
        </div>
        <div className="intro-mid">
          <div className="intro-bar-track">
            <div className="intro-bar-fill" style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
          <span className="intro-pct">{String(pct).padStart(3, "0")}%</span>
        </div>
        <div className="intro-bot">
          <span>BRANDS / ADS / 3D / ROBLOX</span>
          <span>PORTFOLIO v2.6</span>
        </div>
      </div>
    </div>
  );
}
