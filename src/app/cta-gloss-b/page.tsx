import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GildedB } from "@/components/cta/GildedB";
import { fontVars } from "../fonts";

export const metadata: Metadata = { title: "gilded b", robots: { index: false } };

const STATES = ["rest", "hover", "press", "focus", "selected"] as const;
type State = (typeof STATES)[number];

const ROWS: { name: string; cell: (s: State) => ReactNode }[] = [
  { name: "cta · dock", cell: (s) => (s === "selected" ? null : <GildedB variant="cta" src="preview" size="dock" />) },
  { name: "cta · hero", cell: (s) => (s === "selected" ? null : <GildedB variant="cta" src="preview" size="hero" />) },
  { name: "email · dock", cell: (s) => (s === "selected" ? null : <GildedB variant="email" src="preview" />) },
  { name: "email · hero", cell: (s) => (s === "selected" ? null : <GildedB variant="email" src="preview" size="hero" />) },
  { name: "pill", cell: (s) => <GildedB variant="pill" href="/work" selected={s === "selected"}>work</GildedB> },
  { name: "filter", cell: (s) => <GildedB variant="filter" selected={s === "selected"}>brand</GildedB> },
  { name: "arm", cell: (s) => (s === "selected" ? null : <GildedB variant="arm" src="preview" />) },
];

const forced = (s: State) => (s === "hover" || s === "press" || s === "focus" ? s : undefined);

function Panel({ name, bg, fg }: { name: string; bg: string; fg: string }) {
  return (
    <section style={{ background: bg, color: fg, padding: "32px 24px 40px" }}>
      <h2 style={{ font: "600 13px/1 var(--f-geist), sans-serif", letterSpacing: "0.04em", margin: "0 0 20px", opacity: 0.7 }}>{name}</h2>
      {ROWS.map((r) => (
        <div key={r.name} style={{ margin: "0 0 26px" }}>
          <div style={{ font: "500 12px/1 var(--f-geist), sans-serif", opacity: 0.6, margin: "0 0 12px" }}>{r.name}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "18px 34px", alignItems: "flex-start" }}>
            {STATES.map((s) => {
              const node = r.cell(s);
              if (!node) return null;
              return (
                <div key={s} data-state={forced(s)} style={{ minWidth: r.name.endsWith("hero") ? 330 : 230, paddingBottom: 10 }}>
                  <div style={{ font: "500 11px/1 var(--f-geist), sans-serif", opacity: 0.5, margin: "0 0 12px" }}>{s}</div>
                  {node}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

export default function Page() {
  return (
    <main className={fontVars} style={{ minHeight: "100dvh", background: "#0d0d0d" }}>
      <Panel name="on ink" bg="#0d0d0d" fg="#f2f2f2" />
      <Panel name="on ivory" bg="#f4eddf" fg="#17120e" />
    </main>
  );
}
