"use client";

// The fixed left column, kept slim (15 Nov, his ask: "much cleaner and narrower, maybe just a call me") so the wall
// beside it shows four columns of work: the headline with his stickers in it, one call button, and a quiet foot that
// links his two companies and his email. On a phone it becomes the header block over the wall, and a small hire
// button stays at the bottom of the screen once the header's own has gone.

import { useEffect, useRef, useState } from "react";
import { SquircleButton } from "./SquircleButton";
import { Sticker, type StickerPic } from "./Sticker";

type Bit = { t: string } | StickerPic;
type Job = { name: string; role: string; logo: string; href: string };
type Reply = { quote: string; name: string; handle: string; avatar?: string };
/** `fit`: the widest line's width in em, which sizes the type to the column */
type Headline = { lead: readonly (readonly Bit[])[]; main: readonly (readonly Bit[])[]; fit: number };

function Lines({ lines }: { lines: readonly (readonly Bit[])[] }) {
  return (
    <>
      {lines.map((bits, l) => (
        <span key={l} className="col-line" data-first={"t" in bits[0] ? bits[0].t[0] : undefined}>
          {bits.map((b, i) =>
            "t" in b ? (
              <span key={i}>{i ? " " : ""}{b.t}</span>
            ) : (
              <span key={i}>
                {" "}
                <Sticker s={b} eager />
              </span>
            ),
          )}
        </span>
      ))}
    </>
  );
}

export function StoryColumn({
  headline,
  headlineAlt,
  hire,
  second,
  timeline,
  past,
  replies,
  xHandle,
  does,
}: {
  headline: Headline;
  /** the earlier headline, shown with ?h=alt so the two can be compared on the real page */
  headlineAlt?: Headline;
  hire: string;
  second: { label: string; href: string; address: string };
  timeline: Job[];
  past: Job[];
  replies: Reply[];
  /** his X handle, which every reply was posted under */
  xHandle: string;
  /** what he does, in a few words each */
  does: readonly string[];
}) {
  const [stuck, setStuck] = useState(false);
  const [alt, setAlt] = useState(false);
  useEffect(() => setAlt(new URLSearchParams(location.search).get("h") === "alt"), []);
  const h = alt && headlineAlt ? headlineAlt : headline;
  const cta = useRef<HTMLDivElement>(null);

  // the phone's floating hire button shows once the header's own has left the screen
  useEffect(() => {
    const el = cta.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <aside className="col col-slim">
      <h1 className="col-title">
        <span className="col-h1" style={{ "--fit": h.fit } as React.CSSProperties}>
          <span className="col-lead">
            <Lines lines={h.lead} />
          </span>
          <span className="col-main">
            <Lines lines={h.main} />
          </span>
        </span>
      </h1>

      <div className="col-base">
        <p className="col-who">
          <b>Jawad Jalal</b> {does.map((d, i) => (i ? d.toLowerCase() : d)).join(", ")}
        </p>
        <div className="col-act" ref={cta}>
          <SquircleButton href={hire} icon="phone" label="Call me: book a call">
            call me
          </SquircleButton>
          <p className="col-foot">
            {timeline.map((j) => (
              <a key={j.name} href={j.href} target="_blank" rel="noopener">
                {j.name}
              </a>
            ))}
            <a href={second.href}>Email</a>
          </p>
        </div>
      </div>

      <div className="col-float" data-on={stuck} inert={!stuck}>
        <SquircleButton href={hire} size="sm" icon="phone" label="Call me: book a call">
          call me
        </SquircleButton>
      </div>
    </aside>
  );
}
