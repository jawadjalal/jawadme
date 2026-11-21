import type { Metadata } from "next";
import { GildedA } from "@/components/cta/GildedA";
import { fontVars } from "../fonts";

export const metadata: Metadata = { title: "cta gilded a", robots: { index: false } };

const STATES = ["rest", "hover", "press", "focus", "selected"] as const;
const GROUNDS = [
  { id: "ink", bg: "#0e0b08", fg: "#f4e6c4" },
  { id: "ivory", bg: "#e6e5e1", fg: "#17120e" },
] as const;
const ROWS = [
  { id: "cta-hero", el: <GildedA variant="cta" src="gilded-hero" size="hero" /> },
  { id: "cta-dock", el: <GildedA variant="cta" src="gilded-dock" size="dock" /> },
  { id: "email", el: <GildedA variant="email" href="mailto:hello@jawadjalal.com">email me</GildedA> },
  { id: "pill", el: <GildedA variant="pill" href="/work">work</GildedA> },
  { id: "filter", el: <GildedA variant="filter" href="/work?c=ads">ads</GildedA> },
  { id: "arm", el: <GildedA variant="arm" src="gilded-arm" /> },
];

export default function Page() {
  return (
    <main className={fontVars} style={{ fontFamily: "var(--f-geist), Helvetica, Arial, sans-serif", textTransform: "lowercase" }}>
      <style>{"body{margin:0}"}</style>
      {GROUNDS.map((g) => (
        <section key={g.id} id={g.id} style={{ background: g.bg, color: g.fg, padding: "40px clamp(16px, 4vw, 56px) 48px" }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 15, fontWeight: 700, opacity: 0.7 }}>on {g.id}</h2>
          {ROWS.map((r) => (
            <div key={r.id} style={{ display: "grid", gap: "20px 24px", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 330px), 1fr))", marginBottom: 28 }}>
              {STATES.map((s) => (
                <div key={s} data-state={s} data-case={`${g.id}-${r.id}-${s}`} style={{ display: "grid", gap: 12, justifyItems: "start", alignContent: "start", padding: "4px 0", minHeight: 96 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.6 }}>
                    {r.id} / {s}
                  </span>
                  {s === "selected" && r.id !== "pill" && r.id !== "filter" ? <span style={{ fontSize: 12, opacity: 0.4 }}>no selected state</span> : r.el}
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
