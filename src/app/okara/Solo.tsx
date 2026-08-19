"use client";

/* One design on its own, scaled to fit whatever screen it lands on. Linked from
   the walkthrough so a reader can see a screen without the commentary. */
import { useEffect, useState } from "react";
import Link from "next/link";
import AgentsFeed from "./AgentsFeed";
import MorningReport from "./MorningReport";
import CreditsPanel from "./CreditsPanel";
import { CHANGES } from "./data";

const SIZES = {
  feed: { w: 600, h: 845 },
  morning: { w: 1520, h: 1066 },
  credits: { w: 1440, h: 900 },
} as const;

export type SoloKey = keyof typeof SIZES;

/* The walkthrough owns the wording of each change, so the header reads its
   number and title from there rather than keeping a second copy in sync. */
const KIND: Record<SoloKey, string> = { feed: "feed", morning: "note", credits: "credits" };

/* Header strip height, in px. The fit maths subtracts it so the mock still
   lands inside the viewport and the page never gains a scrollbar. */
const BAR = 48;

export default function Solo({ which }: { which: SoloKey }) {
  const size = SIZES[which];
  const change = CHANGES.find((c) => c.kind === KIND[which]);
  const [k, setK] = useState(1);
  const [hot, setHot] = useState(false);

  useEffect(() => {
    const on = () => {
      const pad = window.innerWidth < 900 ? 16 : 48;
      setK(
        Math.max(
          0.05,
          Math.min(1, (window.innerWidth - pad * 2) / size.w, (window.innerHeight - BAR - pad * 2) / size.h),
        ),
      );
    };
    on();
    window.addEventListener("resize", on, { passive: true });
    return () => window.removeEventListener("resize", on);
  }, [size.w, size.h]);

  return (
    <div
      className="ok"
      style={{ height: "100svh", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      <header
        style={{
          flex: "0 0 auto",
          height: BAR,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "0 16px",
          borderBottom: "1px solid #302d28",
        }}
      >
        <Link
          href="/okara"
          onMouseEnter={() => setHot(true)}
          onMouseLeave={() => setHot(false)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            letterSpacing: ".6px",
            whiteSpace: "nowrap",
            color: hot ? "#d9b26a" : "#8d857a",
            transition: "color 160ms ease",
          }}
        >
          <span aria-hidden="true">&#8592;</span>
          <span>Back to the walkthrough</span>
        </Link>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11,
              letterSpacing: ".6px",
              color: "#8d857a",
              whiteSpace: "nowrap",
            }}
          >
            {change?.num}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#f6f2e9",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {change?.title}
          </span>
        </div>
      </header>

      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div style={{ width: Math.round(size.w * k), height: Math.round(size.h * k) }}>
          <div style={{ width: size.w, height: size.h, transform: `scale(${k})`, transformOrigin: "top left" }}>
            {which === "feed" && <AgentsFeed width={600} />}
            {which === "morning" && <MorningReport />}
            {which === "credits" && <CreditsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}
