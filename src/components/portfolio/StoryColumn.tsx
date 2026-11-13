"use client";

// The fixed left column, one composed stack: the two-line headline with his memoji stuck into it, the squircle hire
// button and one quiet second action, a slim timeline of where he has worked, what the wall holds, and one reply from
// X at a time, set as an X post, pinned at the foot. On a phone it becomes the header block over the wall: the
// timeline folds behind one tap, and a small hire button stays at the bottom of the screen once the header's own has
// gone.

import { useEffect, useRef, useState } from "react";
import { SquircleButton } from "./SquircleButton";
import { Sticker, type StickerPic } from "./Sticker";

type Bit = { t: string } | StickerPic;
type Job = { name: string; role: string; when?: string; logo?: string; tile?: string; href: string; now?: boolean };
type Reply = { quote: string; name: string; handle: string };

/** How long one reply stays up, in ms. The progress bar under the post is this long, and its end moves to the next. */
const DWELL = 5600;

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

/** The X mark, to say where the reply was posted. */
function XMark() {
  return (
    <svg className="xpost-x" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
    </svg>
  );
}

/** One reply at a time, set as an X post: an initial for the avatar (there are no avatar files), name, handle, the X
 *  mark and the reply. A bar under it fills while it is up; it pauses while the pointer is on it, and a click moves on. */
function Replies({ replies }: { replies: Reply[] }) {
  const [n, setN] = useState(0);
  const [paused, setPaused] = useState(false);
  const next = () => setN((x) => (x + 1) % replies.length);
  return (
    <section className="col-replies" aria-label="Replies on X">
      <div className="col-replies-head">
        <h2>Replies on X</h2>
        <span className="col-count" aria-hidden="true">
          {n + 1} / {replies.length}
        </span>
      </div>
      <div
        className="xpost"
        data-paused={paused}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest("a, button")) next();
        }}
      >
        <div className="xpost-stack" aria-live="polite">
          {replies.map((r, i) => (
            <figure key={r.handle} className="xpost-item" data-on={i === n} aria-hidden={i !== n}>
              <figcaption className="xpost-head">
                <span className="xpost-av" aria-hidden="true">
                  {r.name.replace(/[^A-Za-z]/g, "")[0]?.toUpperCase() ?? "?"}
                </span>
                <span className="xpost-who">
                  <b>{r.name}</b>
                  <a href={`https://x.com/${r.handle}`} target="_blank" rel="noopener" tabIndex={i === n ? 0 : -1}>
                    @{r.handle}
                  </a>
                </span>
                <XMark />
              </figcaption>
              <blockquote>{r.quote}</blockquote>
            </figure>
          ))}
        </div>
        <button type="button" className="xpost-next" onClick={next} aria-label="Next reply">
          <span key={n} className="xpost-bar" style={{ animationDuration: `${DWELL}ms` }} onAnimationEnd={next} />
        </button>
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
  made,
}: {
  headline: { lead: readonly (readonly Bit[])[]; main: readonly (readonly Bit[])[] };
  hire: string;
  second: { label: string; href: string };
  timeline: Job[];
  replies: Reply[];
  /** what is on the wall, counted from the manifest: [label, count] */
  made: [string, number][];
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
                <a href={j.href} target="_blank" rel="noopener">
                  {j.logo ? (
                    <img src={j.logo} alt="" width={18} height={18} />
                  ) : (
                    <span className="col-tile" style={{ background: j.tile }} aria-hidden="true">
                      {j.name[0]}
                    </span>
                  )}
                  <span className="col-name">{j.name}</span>
                  <span className="col-role">{j.role}</span>
                  <span className="col-when">{j.when ?? ""}</span>
                </a>
              </li>
            ))}
          </ol>
        </section>

        <section className="col-made" aria-label="On the wall">
          <h2 className="col-time-h">On the wall</h2>
          <ul>
            {made.map(([label, c]) => (
              <li key={label}>
                <span className="col-made-n">{c}</span>
                {label}
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
