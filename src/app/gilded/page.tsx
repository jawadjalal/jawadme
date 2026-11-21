import type { Metadata } from "next";
import { Gilded } from "@/components/gilded/Gilded";
import { fontVars } from "../fonts";

export const metadata: Metadata = { title: "gilded", robots: { index: false, follow: false } };

const STATES = ["rest", "hover", "press", "focus", "selected"] as const;
const GROUNDS = [
  { id: "ink", bg: "#0e0b08", fg: "#f4e6c4" },
  { id: "ivory", bg: "#e6e5e1", fg: "#17120e" },
] as const;
const ROWS = [
  { id: "cta-hero", el: <Gilded variant="cta" src="gilded-hero" size="hero" /> },
  { id: "cta-dock", el: <Gilded variant="cta" src="gilded-dock" size="dock" /> },
  { id: "email", el: <Gilded variant="email" src="gilded" /> },
  { id: "pill", el: <Gilded variant="pill" href="/work">work</Gilded> },
  { id: "filter", el: <Gilded variant="filter" href="/work?c=ads">ads</Gilded> },
  { id: "arm", el: <Gilded variant="arm" src="gilded-arm" /> },
];

/** Every variant on ink and on ivory, in each state, forced by a data-state ancestor. The rest column is live. */
export default function Page() {
  return (
    <main className={fontVars} style={{ fontFamily: "var(--f-geist), Helvetica, Arial, sans-serif", textTransform: "lowercase" }}>
      <style>{"body{margin:0}"}</style>
      {GROUNDS.map((g) => (
        <section key={g.id} id={g.id} style={{ background: g.bg, color: g.fg, padding: "40px clamp(16px, 4vw, 56px) 48px" }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 15, fontWeight: 700, opacity: 0.7 }}>on {g.id}</h2>
          {ROWS.map((r) => (
            <div key={r.id} style={{ display: "grid", gap: "20px 24px", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))", marginBottom: 28 }}>
              {STATES.map((s) => (
                <div key={s} data-state={s} data-case={`${g.id}-${r.id}-${s}`} style={{ display: "grid", gap: 14, justifyItems: "start", alignContent: "start", padding: "4px 0", minHeight: 96 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.6 }}>
                    {r.id} / {s}
                  </span>
                  {s === "selected" && r.id !== "pill" && r.id !== "filter" ? <span style={{ fontSize: 12, opacity: 0.45 }}>no selected state</span> : r.el}
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
