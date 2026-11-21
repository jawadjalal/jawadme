"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";

// The statement, set the way america.gov sets its manifesto: one sentence, very large, centred, with pictures standing
// in the line beside the words they show. It sits on the dark orchestra of the world's theatre. The words light up in reading order as it scrolls through; with
// reduced motion it is lit from the start. Copy picked from two drafts (the other: "Ads, 3D and Roblox games, designed
// and built by one 15-year-old in London."), in his own words from the subheadline.

type Tok = string | { w: string; src: string; tail: string };
const SAY: Tok[] = [
  "I'm", "15", "and", "in", "London.", "I", "design", { w: "ads", src: "/ads/type/vercel-c-480.webp", tail: "," },
  { w: "3D", src: "/showcase/coresrent-720.webp", tail: "" }, "and", "Roblox", { w: "games", src: "/work/fracture/mole-king.webp", tail: "," },
  "and", "I", "build", "what", "I", "design.",
];

export function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return void el.style.setProperty("--p", "1.2");
    let raf = 0;
    const set = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = (innerHeight * 0.92 - r.top) / (r.height + innerHeight * 0.35);
      el.style.setProperty("--p", String(Math.min(1.2, Math.max(0, p * 1.2))));
    };
    const on = () => void (raf ||= requestAnimationFrame(set));
    set();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => {
      removeEventListener("scroll", on);
      removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <section className="stmt" data-world-stop="theatre" aria-label="About Jawad">
      <p ref={ref} className="stmt-p" style={{ "--n": SAY.length } as CSSProperties}>
        {SAY.map((t, i) =>
          typeof t === "string" ? (
            <span key={i} className="st-t" style={{ "--i": i } as CSSProperties}>
              {t}{" "}
            </span>
          ) : (
            <span key={i} className="st-t st-nb" style={{ "--i": i } as CSSProperties}>
              {t.w}{"\u00a0"}
              <span className="st-chip" aria-hidden="true">
                <Image src={t.src} alt="" width={240} height={150} sizes="(max-width: 767px) 96px, 200px" />
              </span>
              {t.tail}{" "}
            </span>
          ),
        )}
      </p>
    </section>
  );
}
