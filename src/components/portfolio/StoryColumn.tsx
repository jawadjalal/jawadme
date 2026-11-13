"use client";

// The fixed left column: a two-tone headline with tiny pictures set in the line, the squircle hire button and one quiet
// second action, a timeline of where he has worked (newest first), one reply from X at a time, and the marks of the
// places he has worked at the foot. On a phone it becomes the header block over the wall: the timeline folds behind one
// tap, and a small hire button stays at the bottom of the screen once the header's own has scrolled away.

import { useEffect, useRef, useState } from "react";
import { SquircleButton } from "./SquircleButton";

type Bit = { t: string } | { pic: string; alt: string };
type Job = { when: string; name: string; line: string; href: string; now?: boolean };
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
              <span key={i} className="col-pic" data-n={(l + i) % 3}>
                {" "}
                <img src={b.pic} alt={b.alt} width={64} height={64} />
              </span>
            ),
          )}
        </span>
      ))}
    </>
  );
}

function Replies({ replies }: { replies: Reply[] }) {
  const [n, setN] = useState(0);
  const paused = useRef(false);
  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current && document.visibilityState === "visible") setN((x) => (x + 1) % replies.length);
    }, 5200);
    return () => clearInterval(id);
  }, [replies.length]);
  const r = replies[n];
  return (
    <section
      className="col-replies"
      aria-label="Replies on X"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <h2>Replies on X</h2>
      <figure key={n} className="col-reply" aria-live="polite">
        <blockquote>{r.quote}</blockquote>
        <figcaption>
          {r.name}{" "}
          <a href={`https://x.com/${r.handle}`} target="_blank" rel="noopener">
            @{r.handle}
          </a>
        </figcaption>
      </figure>
    </section>
  );
}

export function StoryColumn({
  headline,
  hire,
  second,
  timeline,
  replies,
  marks,
}: {
  headline: { lead: readonly (readonly Bit[])[]; main: readonly (readonly Bit[])[] };
  hire: string;
  second: { label: string; href: string };
  timeline: Job[];
  replies: Reply[];
  marks: { name: string; logo: string }[];
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
          <ol className="col-tl">
            {timeline.map((j) => (
              <li key={j.name} data-now={j.now ? "" : undefined}>
                <span className="col-when">{j.when}</span>
                <span className="col-job">
                  <a href={j.href} target="_blank" rel="noopener">
                    {j.name}
                  </a>
                  <span>{j.line}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="col-foot">
        <Replies replies={replies} />
        <ul className="col-marks" aria-label="Places I have worked">
          {marks.map((m) => (
            <li key={m.name}>
              <img src={m.logo} alt="" width={20} height={20} />
              {m.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="col-float" data-on={stuck} inert={!stuck}>
        <SquircleButton href={hire} size="sm" label="Hire me: book a call" />
      </div>
    </aside>
  );
}
