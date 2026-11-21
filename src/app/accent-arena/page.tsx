import type { Metadata } from "next";
import { BookCallB } from "@/components/cta/BookCallB";
import { fontVars } from "../fonts";

// Accent arena harness (throwaway): the ticket at dock and hero size, at rest, hover and focus, on the world's ink.

export const metadata: Metadata = { title: "accent arena", robots: { index: false } };

const STATES = ["rest", "hover", "focus"] as const;

export default function Page() {
  return (
    <main className={"ds " + fontVars} style={{ minHeight: "100vh", padding: "48px 56px", background: "#100b09", color: "#f4ece1" }}>
      {(["dock", "hero"] as const).map((size) => (
        <div key={size} id={size} style={{ display: "grid", gap: 40, gridTemplateColumns: "repeat(3, max-content)", marginBottom: 48 }}>
          {STATES.map((s) => (
            <div key={s} data-state={s} data-case={size + "-" + s} style={{ display: "grid", gap: 16, justifyItems: "start", padding: 12 }}>
              <span style={{ font: "600 13px/1 var(--f-bar)", opacity: 0.6 }}>
                {size} / {s}
              </span>
              <BookCallB src={"arena-" + size} size={size} />
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}
