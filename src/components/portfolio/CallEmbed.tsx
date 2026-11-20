"use client";

// The booking calendar, inline, through Cal.com's own embed script so its "ui" settings apply: the event details
// (his name, the title, the length) are hidden because the headline already says them, the month view is used, and
// its brand colour is the page's ink. The
// channel tag from ?src= (cleaned, "direct" when missing) goes into the embed config, so the booking records it. It sits on the page's white with no card round it. While it loads, a quiet
// line says so; if it has not loaded after a while (blocked, offline), the plain link to the booking page and the
// email address take its place. Both links also sit under it the whole time, and without JavaScript the <noscript>
// line gives them straight away.

import { useEffect, useRef, useState } from "react";
import { CAL_LINK, calApi, calConfig, cleanSrc } from "../cal";

type State = "idle" | "loading" | "ready" | "failed";

export function CallEmbed({ booking, email }: { booking: string; email: string }) {
  const [state, setState] = useState<State>("idle");
  const [src, setSrc] = useState("direct");
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.childElementCount) return;
    const tag = cleanSrc(new URLSearchParams(location.search).get("src"));
    setSrc(tag);
    setState("loading");
    const api = calApi(tag);
    api("inline", { elementOrSelector: el, calLink: CAL_LINK, config: calConfig(tag) });
    api("on", { action: "linkReady", callback: () => setState("ready") });
    api("on", { action: "linkFailed", callback: () => setState("failed") });
    const t = window.setTimeout(() => setState((s) => (s === "loading" ? "failed" : s)), 15000);
    return () => window.clearTimeout(t);
  }, []);
  const link = `${booking}?src=${src}`;
  return (
    <div className="cal" data-state={state}>
      <div className="cal-frame">
        <div ref={host} className="cal-host" />
        {state === "loading" ? <p className="cal-wait">Loading the calendar…</p> : null}
        {state === "failed" ? (
          <p className="cal-fail">
            The calendar did not load here. <a href={link}>Open the booking page</a> or email{" "}
            <a href={`mailto:${email}`}>{email}</a>.
          </p>
        ) : null}
        <noscript>
          <p className="cal-fail">
            <a href={booking}>Open the booking page</a> or email <a href={`mailto:${email}`}>{email}</a>.
          </p>
        </noscript>
      </div>
      <p className="cal-alt">
        <a href={link} target="_blank" rel="noopener">
          open it on Cal.com
        </a>
        <span aria-hidden="true">·</span>
        <a href={`mailto:${email}?subject=A%20call`}>{email}</a>
        <a href="/" className="cal-home">
          see the work
        </a>
      </p>
    </div>
  );
}
