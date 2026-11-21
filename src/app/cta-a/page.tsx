import type { Metadata } from "next";
import { BookCallA } from "@/components/cta/BookCallA";
import { fontVars } from "../fonts";

export const metadata: Metadata = { title: "cta a", robots: { index: false, follow: false } };

const STATES = ["rest", "hover", "press", "focus"] as const;
const GROUNDS = [
  { name: "ink", bg: "#15100d", fg: "#e6e5e1" },
  { name: "ivory", bg: "#e6e5e1", fg: "#15100d" },
] as const;

const CSS = `
body { margin: 0; }
.pv { font-family: var(--f-pub), Arial, sans-serif; }
.pv section { padding: 40px 24px 48px; }
.pv h2 { margin: 0 0 28px; font-size: 13px; font-weight: 600; letter-spacing: -0.01em; opacity: 0.6; }
.pv .row { display: flex; flex-wrap: wrap; gap: 36px 44px; align-items: end; margin-bottom: 44px; }
.pv figure { margin: 0; display: grid; justify-items: start; gap: 14px; }
.pv figcaption { font-size: 12px; font-weight: 600; opacity: 0.55; }
.pv .live { display: flex; flex-wrap: wrap; gap: 40px; align-items: center; min-height: 200px; }
`;

export default function CtaA() {
  return (
    <main className={"pv " + fontVars}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <section style={{ background: GROUNDS[0].bg, color: GROUNDS[0].fg }} id="live">
        <h2>live: hover, press, tab to it</h2>
        <div className="live">
          <BookCallA src="cta-a" size="hero" />
          <BookCallA src="cta-a" size="dock" />
        </div>
      </section>
      {GROUNDS.map((g) => (
        <section key={g.name} style={{ background: g.bg, color: g.fg }} id={g.name}>
          <h2>on {g.name}</h2>
          {(["hero", "dock"] as const).map((size) => (
            <div className="row" key={size}>
              {STATES.map((s) => (
                <figure key={s}>
                  <div data-state={s}>
                    <BookCallA src="cta-a" size={size} />
                  </div>
                  <figcaption>
                    {size}, {s}
                  </figcaption>
                </figure>
              ))}
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
