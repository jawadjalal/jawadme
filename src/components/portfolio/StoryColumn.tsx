"use client";

// The fixed left column: the headline with his stickers in it, as large as two lines allow; his name and what he does;
// the call button with "email me" beside it; and at the foot three slow marquees (15 Nov, his ask): the startups he
// has worked at, where he is right now, and what people said about his work. On a phone it becomes the header block
// over the wall, and a small hire button stays at the bottom of the screen once the header's own has gone.

import { useEffect, useRef, useState } from "react";
import { openBooking } from "../cal";
import { Marquee } from "./Marquee";
import { SquircleButton } from "./SquircleButton";
import { Sticker, type StickerPic } from "./Sticker";

type Bit = { t: string } | StickerPic;
type Job = { name: string; role: string; logo?: string; href?: string };
type Now = { place: string; zone: string; city: string; doing: string };
type Reply = { quote: string; name: string; handle: string; avatar?: string };
/** `fit`: the widest line's width in em, which sizes the type to the column */
type Headline = { lead: readonly (readonly Bit[])[]; main: readonly (readonly Bit[])[]; fit: number };

/** the time where he is, as "9:41 pm", kept to the minute; empty until the page is in the browser, so the server's
 *  clock never shows */
function useClock(zone: string) {
  const [t, setT] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: zone });
    let id = 0;
    const tick = () => {
      setT(fmt.format(new Date()).replace(/\s/g, " "));
      id = window.setTimeout(tick, 60_000 - (Date.now() % 60_000));
    };
    tick();
    return () => window.clearTimeout(id);
  }, [zone]);
  return t;
}

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
  worked,
  now,
  replies,
  xHandle,
  does,
}: {
  headline: Headline;
  /** the earlier headline, shown with ?h=alt so the two can be compared on the real page */
  headlineAlt?: Headline;
  hire: string;
  second: { label: string; href: string; address: string };
  /** the startups he has worked at, newest first */
  worked: Job[];
  /** where he is right now */
  now: Now;
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
  const time = useClock(now.zone);

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
          </span>{" "}
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
          <SquircleButton href={`${hire}?src=home`} onClick={openBooking("home")} icon="phone" label="Call me: book a call">
            call me
          </SquircleButton>
          <a className="col-mail" href={second.href} aria-label={`Email me at ${second.address}`}>
            {second.label}
            <svg className="col-mail-ar" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M3 9 9 3M4.2 3H9v4.8" />
            </svg>
          </a>
        </div>
      </div>

      <div className="col-mqs">
        <Marquee
          label="Startups I founded or worked at"
          speed={20}
          items={worked.map((j) => {
            const inner = (
              <>
                {j.logo ? <img src={j.logo} alt="" width={18} height={18} decoding="async" /> : null}
                <b>{j.name}</b> {j.role}
              </>
            );
            return j.href ? (
              <a className="mq-it mq-job" href={j.href} target="_blank" rel="noopener">
                {inner}
              </a>
            ) : (
              <span className="mq-it mq-job">{inner}</span>
            );
          })}
        />
        <Marquee
          label="Where I am right now"
          speed={16}
          reverse
          items={[
            <span className="mq-it" key="p">
              <b>{now.place}</b>
            </span>,
            <span className="mq-it" key="t">
              <span className="mq-clock">{time}</span>&nbsp;in {now.city}
            </span>,
            <span className="mq-it" key="d">
              {now.doing}
            </span>,
          ]}
        />
        <Marquee
          label={`What people said on X about my posts (@${xHandle})`}
          speed={24}
          items={replies.map((r) => (
            <span className="mq-it mq-rep">
              {r.avatar ? (
                <img src={r.avatar} alt="" width={18} height={18} decoding="async" />
              ) : (
                <span className="mq-av" aria-hidden="true">
                  {r.name[0]}
                </span>
              )}
              <q>{r.quote}</q> <span>{r.name}</span>
            </span>
          ))}
        />
      </div>

      <div className="col-float" data-on={stuck} inert={!stuck}>
        <SquircleButton href={`${hire}?src=home`} onClick={openBooking("home")} size="sm" icon="phone" label="Call me: book a call">
          call me
        </SquircleButton>
      </div>
    </aside>
  );
}
