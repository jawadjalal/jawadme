"use client";

// The fixed left column, set as one manga page (15 Nov): ink panels with soft Capy corners and hard cel shadows. The
// first panel is the headline over speed lines, with his name and what he does in narration boxes; then the two
// buttons as ink blocks, his two companies side by side, the places he worked before in one strip, and the last
// panel, which takes whatever height is left, holds one reply from X at a time as a speech balloon over screentone. On a phone it becomes the header block over the wall, and a small hire button stays at
// the bottom of the screen once the header's own has gone.

import { useEffect, useRef, useState } from "react";
import { SquircleButton } from "./SquircleButton";
import { Sticker, type StickerPic } from "./Sticker";

type Bit = { t: string; hot?: boolean } | StickerPic;
type Job = { name: string; role: string; logo: string; href: string };
type Reply = { quote: string; name: string; handle: string; avatar?: string };

/** How long one reply stays up, in ms. The progress bar under the post is this long, and its end moves to the next. */
const DWELL = 5600;

function Lines({ lines }: { lines: readonly (readonly Bit[])[] }) {
  return (
    <>
      {lines.map((bits, l) => (
        <span key={l} className="col-line">
          {bits.map((b, i) =>
            "t" in b ? (
              <span key={i} className={b.hot ? "col-hot" : undefined}>{i ? " " : ""}{b.t}</span>
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

/** One reply at a time, set the way X shows a post: profile picture, name, handle, the X mark, who it replied to, and
 *  the reply. A bar along the card's foot fills while it is up; it pauses while the pointer is on it, a click moves on. */
function Replies({ replies, to }: { replies: Reply[]; to: string }) {
  const [n, setN] = useState(0);
  const [paused, setPaused] = useState(false);
  const next = () => setN((x) => (x + 1) % replies.length);
  return (
    <section className="col-replies" aria-label="Replies on X">
      <div className="col-replies-head">
        <h2 className="mg-tag">Replies on X</h2>
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
                <a className="xpost-av" href={`https://x.com/${r.handle}`} target="_blank" rel="noopener" tabIndex={-1} aria-hidden="true">
                  {r.avatar ? (
                    <img src={r.avatar} alt="" width={40} height={40} loading="lazy" decoding="async" />
                  ) : (
                    (r.name.replace(/[^A-Za-z]/g, "")[0]?.toUpperCase() ?? "?")
                  )}
                </a>
                <a className="xpost-who" href={`https://x.com/${r.handle}`} target="_blank" rel="noopener" tabIndex={i === n ? 0 : -1}>
                  <b>{r.name}</b>
                  <span>@{r.handle}</span>
                </a>
                <XMark />
              </figcaption>
              <p className="xpost-to">
                Replying to <a href={`https://x.com/${to}`} target="_blank" rel="noopener" tabIndex={i === n ? 0 : -1}>@{to}</a>
              </p>
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

/** The places he worked before, in one big squircle pill split three ways. A soft highlight slides under whichever
 *  name is pointed at (pure CSS, :has), its logo tips, and its role rises out of the pill as a small dark tag, so
 *  nothing beside it ever moves. Nothing drifts. */
function Past({ past }: { past: Job[] }) {
  return (
    <section className="col-past" aria-label="Where I worked before">
      <h2 className="past-h mg-tag">Before</h2>
      <ul className="past" style={{ "--n": past.length } as React.CSSProperties}>
        <li className="past-glow" aria-hidden="true" />
        {past.map((j) => (
          <li key={j.name} className="past-it">
            <a href={j.href} target="_blank" rel="noopener" aria-label={`${j.name}, ${j.role}`}>
              <img src={j.logo} alt="" width={22} height={22} />
              <span className="past-name">{j.name}</span>
              <span className="past-role" aria-hidden="true">{j.role}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
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
  name = "Jawad Jalal",
}: {
  headline: { lead: readonly (readonly Bit[])[]; main: readonly (readonly Bit[])[] };
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
  /** his name, in the first panel's narration box */
  name?: string;
}) {
  const [stuck, setStuck] = useState(false);
  const [addr, setAddr] = useState(false);
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
    <aside className="col mg">
      <div className="col-top">
        <section className="mg-p mg-hero">
          <span className="mg-speed" aria-hidden="true" />
          <span className="mg-tone" aria-hidden="true" />
          <p className="mg-tag mg-name">{name}</p>
          <div className="col-h1">
            <p className="col-lead">
              <Lines lines={h.lead} />
            </p>
            <h1 className="col-main">
              <Lines lines={h.main} />
            </h1>
          </div>
          <p className="col-does mg-box">
            {does.map((d, i) => (
              <span key={d}>
                {i ? (
                  <>
                    <span className="pf-sr">, </span>
                    <span className="col-does-dot" aria-hidden="true">·</span>
                  </>
                ) : null}
                {d}
              </span>
            ))}
          </p>
        </section>

        <div className="col-act">
          <div className="col-actions" ref={cta}>
            <SquircleButton href={hire} icon="phone" label="Call me: book a call">
              call me
            </SquircleButton>
            <SquircleButton href={second.href} icon="mail" className="sq-soft" label={`Email me at ${second.address}`} onClick={() => setAddr(true)}>
              {second.label}
            </SquircleButton>
          </div>
          {/* the address, to copy by hand, once the email button has been pressed */}
          <p className="col-addr" data-on={addr} aria-hidden={!addr}>
            {second.address}
          </p>
        </div>

        <section className="mg-p mg-now">
          <h2 className="past-h mg-tag">Now</h2>
          <ul className="col-own" aria-label="My companies">
            {timeline.map((j) => (
              <li key={j.name}>
                <a href={j.href} target="_blank" rel="noopener">
                  <img src={j.logo} alt="" width={30} height={30} />
                  <span className="col-own-t">
                    <b>{j.name}</b>
                    <span>{j.role}</span>
                  </span>
                  <span className="col-own-go" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="mg-p mg-before">
          <Past past={past} />
        </div>
      </div>

      <section className="col-reps mg-p mg-x">
        <span className="mg-tone" aria-hidden="true" />
        <Replies replies={replies} to={xHandle} />
      </section>

      <div className="col-float" data-on={stuck} inert={!stuck}>
        <SquircleButton href={hire} size="sm" icon="phone" label="Call me: book a call">
          call me
        </SquircleButton>
      </div>
    </aside>
  );
}
