import type { Metadata } from "next";
import { BookCallB } from "@/components/cta/BookCallB";
import { fontVars } from "../fonts";

export const metadata: Metadata = { title: "cta b", robots: { index: false } };

const STATES = ["rest", "hover", "press", "focus"] as const;
const GROUNDS = [
  { id: "ink", bg: "#15100d", fg: "#f4eddf" },
  { id: "ivory", bg: "#e6e5e1", fg: "#17120e" },
] as const;

export default function Page() {
  return (
    <main className={fontVars} style={{ fontFamily: "var(--f-pub), Helvetica, Arial, sans-serif", textTransform: "lowercase" }}>
      {GROUNDS.map((g) => (
        <section key={g.id} id={g.id} style={{ background: g.bg, color: g.fg, padding: "48px clamp(16px, 4vw, 56px) 56px" }}>
          <h2 style={{ margin: "0 0 28px", fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", opacity: 0.7 }}>on {g.id}</h2>
          {(["dock", "hero"] as const).map((size) => (
            <div key={size} style={{ display: "grid", gap: 28, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 330px), 1fr))", marginBottom: 36 }}>
              {STATES.map((s) => (
                <div key={s} data-state={s} data-case={`${g.id}-${size}-${s}`} style={{ display: "grid", gap: 14, justifyItems: "start", padding: "6px 0" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.6 }}>
                    {size} / {s}
                  </span>
                  <BookCallB src={`cta-b-${size}`} size={size} />
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
