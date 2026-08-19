"use client";

/* One design on its own, scaled to fit whatever screen it lands on. Linked from
   the walkthrough so a reader can see a screen without the commentary. */
import { useEffect, useState } from "react";
import AgentsFeed from "./AgentsFeed";
import MorningReport from "./MorningReport";
import CreditsPanel from "./CreditsPanel";

const SIZES = {
  feed: { w: 600, h: 845 },
  morning: { w: 1520, h: 1066 },
  credits: { w: 1440, h: 900 },
} as const;

export default function Solo({ which }: { which: keyof typeof SIZES }) {
  const size = SIZES[which];
  const [k, setK] = useState(1);

  useEffect(() => {
    const on = () => {
      const pad = window.innerWidth < 900 ? 16 : 48;
      setK(Math.min(1, (window.innerWidth - pad * 2) / size.w, (window.innerHeight - pad * 2) / size.h));
    };
    on();
    window.addEventListener("resize", on, { passive: true });
    return () => window.removeEventListener("resize", on);
  }, [size.w, size.h]);

  return (
    <div
      className="ok"
      style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div style={{ width: Math.round(size.w * k), height: Math.round(size.h * k) }}>
        <div style={{ width: size.w, height: size.h, transform: `scale(${k})`, transformOrigin: "top left" }}>
          {which === "feed" && <AgentsFeed width={600} />}
          {which === "morning" && <MorningReport />}
          {which === "credits" && <CreditsPanel />}
        </div>
      </div>
    </div>
  );
}
