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
  headline: {
    lead: readonly (readonly Bit[])[];
    main: readonly (readonly Bit[])[];
    /** the desktop stack: the same words a word or two to a line */
    stack?: { lead: readonly (readonly Bit[])[]; main: readonly (readonly Bit[])[] };
  };
  /** the earlier headline, shown with ?h=alt so the two can be compared on the real page */
  headlineAlt?: { lead: readonly (readonly Bit[])[]; main: readonly (readonly Bit[])[] };
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
  const stack = alt ? undefined : headline.stack;
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
      {/* one h1 holding two settings of the same words: on desktop a stack, a word or two to a line, that runs the
          column's height; on phones the four-line header. Only one is ever displayed, so only one is read out. */}
      <h1 className="col-title">
        {stack && (
          <span className="col-h1 col-stack">
            <span className="col-lead">
              <Lines lines={stack.lead} />
            </span>
            <span className="col-main">
              <Lines lines={stack.main} />
            </span>
          </span>
        )}
        <span className="col-h1 col-flow" data-phone={stack ? "" : undefined}>
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
          <b>Jawad Jalal</b> {does.join(", ")}
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
