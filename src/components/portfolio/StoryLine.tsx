"use client";

// One line of his story, set big across the wall of work. Three looks, one markup:
//   print   Spider-Verse print done properly: Archivo extra condensed black italic, set huge and tight, printed as
//           plates. A magenta plate of Ben-Day dots sits off register as the shadow, a cyan plate slips the other
//           way, and the black key overprints both (multiply), so where they cross the inks mix as they do on paper.
//   sticker The column's voice at wall size: ink grotesque, tight, with one sticker of his work stuck into the line.
//   typed   The line types itself in once as it enters the screen, with a block caret.
// The line sits still and complete without script; motion only adds the entrance, once.

import { useEffect, useRef, useState } from "react";
import { SquircleButton } from "./SquircleButton";
import { Sticker, type StickerPic } from "./Sticker";

export type Look = "print" | "sticker" | "typed";

export function StoryLine({
  text,
  cta,
  href,
  pic,
  at,
  look,
  index = 0,
}: {
  text: string;
  cta?: boolean;
  href: string;
  pic?: StickerPic;
  at?: number;
  look: Look;
  index?: number;
}) {
  const words = text.split(" ");
  const ref = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState<number | null>(null);

  // typed: count the characters in once the line is well on screen
  useEffect(() => {
    if (look !== "typed") return setTyped(null);
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.8) return; // already in view on arrival: show it whole
    setTyped(0);
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let n = 0;
        timer = window.setInterval(() => {
          n += 1;
          setTyped(n);
          if (n >= text.length) window.clearInterval(timer);
        }, 42);
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [look, text]);

  let seen = 0;
  const shown = typed ?? text.length;
  return (
    <div ref={ref} className="story" data-look={look} data-side={index % 2 ? "right" : "left"}>
      <p className="sl">
        <span className="sl-words" data-text={text}>
          {words.map((w, i) => {
            const start = seen;
            seen += w.length + 1;
            const vis = Math.max(0, Math.min(w.length, shown - start));
            const caretHere = typed !== null && shown >= start && shown <= start + w.length && shown < text.length;
            return (
              <span key={i}>
                {i ? " " : ""}
                <span className={pic && at === i ? "sl-bind" : undefined}>
                <span className="sl-w">
                  {w.slice(0, vis)}
                  {caretHere ? <span className="sl-caret" aria-hidden="true" /> : null}
                  {vis < w.length ? <span className="sl-ghost">{w.slice(vis)}</span> : null}
                </span>
                {pic && at === i ? (
                  <span className="sl-stk">
                    {" "}
                    <Sticker s={pic} />
                  </span>
                ) : null}
                </span>
              </span>
            );
          })}
          {typed !== null && shown >= text.length ? <span className="sl-caret sl-caret-end" aria-hidden="true" /> : null}
        </span>
      </p>
      {cta ? <SquircleButton href={href} className="story-cta" /> : null}
    </div>
  );
}
