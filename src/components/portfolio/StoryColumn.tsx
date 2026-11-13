"use client";

// The fixed left column, one composed stack: the headline with stickers of his work in the type, the squircle hire
// button and one quiet second action, the places he has worked (each with its own mark, the two current ones in ink),
// and one reply from X at a time pinned at the foot. On a phone it becomes the header block over the wall: the places
// fold behind one tap, and a small hire button stays at the bottom of the screen once the header's own has gone.

import { useEffect, useRef, useState } from "react";
import { SquircleButton } from "./SquircleButton";
import { Sticker, type StickerPic } from "./Sticker";

type Bit = { t: string } | StickerPic;
type Job = { when: string; name: string; role: string; logo: string; href: string; now?: boolean };
type Reply = { quote: string; name: string; handle: string };

function Lines({ lines }: { lines: readonly (readonly Bit[])[] }) {
  return (
    <>
      {lines.map((bits, l) => (
        <span key={l} className="col-line">
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

/** One reply at a time, crossfading every few seconds; the count steps to the next one by hand. */
function Replies({ replies }: { replies: Reply[] }) {
  const [n, setN] = useState(0);
  const paused = useRef(false);
  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current && document.visibilityState === "visible") setN((x) => (x + 1) % replies.length);
    }, 5200);
    return () => clearInterval(id);
  }, [replies.length]);
  return (
    <section
      className="col-replies"
      aria-label="Replies on X"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className="col-replies-head">
        <h2>Replies on X</h2>
        <button type="button" className="col-count" onClick={() => setN((x) => (x + 1) % replies.length)} aria-label="Next reply">
          {n + 1} / {replies.length}
        </button>
      </div>
      <div className="col-reply-stack" aria-live="polite">
        {replies.map((r, i) => (
          <figure key={r.handle} className="col-reply" data-on={i === n} aria-hidden={i !== n}>
            <blockquote>{r.quote}</blockquote>
            <figcaption>
              {r.name}{" "}
              <a href={`https://x.com/${r.handle}`} target="_blank" rel="noopener" tabIndex={i === n ? 0 : -1}>
                @{r.handle}
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function StoryColumn({
  headline,
  hire,
  second,
  timeline,
  replies,
}: {
  headline: { lead: readonly (readonly Bit[])[]; main: readonly (readonly Bit[])[] };
  hire: string;
  second: { label: string; href: string };
  timeline: Job[];
  replies: Reply[];
}) {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
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
    <aside className="col">
      <div className="col-top">
        <div className="col-h1">
          <p className="col-lead">
            <Lines lines={headline.lead} />
          </p>
          <h1 className="col-main">
            <Lines lines={headline.main} />
          </h1>
        </div>

        <div className="col-actions" ref={cta}>
          <SquircleButton href={hire} label="Hire me: book a call" />
          <a className="col-second" href={second.href}>
            {second.label}
          </a>
        </div>

        <section className="col-time" data-open={open}>
          <button type="button" className="col-time-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <span>Where I&apos;ve worked</span>
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2.5 4.5 6 8l3.5-3.5" />
            </svg>
          </button>
          <h2 className="col-time-h">Where I&apos;ve worked</h2>
          <ul className="col-places">
            {timeline.map((j) => (
              <li key={j.name} data-now={j.now ? "" : undefined}>
                <a href={j.href} target="_blank" rel="noopener">
                  <img src={j.logo} alt="" width={22} height={22} />
                  <span className="col-name">{j.name}</span>
                  <span className="col-role">{j.role}</span>
                  <span className="col-when">{j.when}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="col-foot">
        <Replies replies={replies} />
      </div>

      <div className="col-float" data-on={stuck} inert={!stuck}>
        <SquircleButton href={hire} size="sm" label="Hire me: book a call" />
      </div>
    </aside>
  );
}
