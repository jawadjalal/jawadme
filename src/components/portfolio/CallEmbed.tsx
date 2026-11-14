"use client";

// The booking calendar, inline, through Cal.com's own embed script so its "ui" settings apply: the event details
// (his name, the title, the length) are hidden because the headline already says them, the month view is used, and
// its brand colour is the page's ink. It sits on the page's white with no card round it. While it loads, a quiet
// line says so; if it has not loaded after a while (blocked, offline), the plain link to the booking page and the
// email address take its place. Both links also sit under it the whole time, and without JavaScript the <noscript>
// line gives them straight away.

import { useEffect, useRef, useState } from "react";

type State = "idle" | "loading" | "ready" | "failed";
type Fn = (...args: unknown[]) => void;
type Queue = Fn & { q: unknown[] };
type Cal = Queue & { ns: Record<string, Queue>; loaded?: boolean };

const NS = "call";

/** Cal.com's documented loader, typed: calls queue until embed.js arrives and replays them. */
function loadCal(): Cal {
  const w = window as unknown as { Cal?: Cal };
  if (w.Cal) return w.Cal;
  const queue = (): Queue => {
    const f = ((...a: unknown[]) => {
      f.q.push(a);
    }) as Queue;
    f.q = [];
    return f;
  };
  const cal = ((...ar: unknown[]): void => {
    if (!cal.loaded) {
      const s = document.createElement("script");
      s.src = "https://app.cal.com/embed/embed.js";
      s.async = true;
      document.head.appendChild(s);
      cal.loaded = true;
    }
    if (ar[0] === "init" && typeof ar[1] === "string") {
      const name = ar[1];
      cal.ns[name] = cal.ns[name] || queue();
      cal.ns[name].q.push(ar);
      cal.q.push(["initNamespace", name]);
      return;
    }
    cal.q.push(ar);
  }) as unknown as Cal;
  cal.q = [];
  cal.ns = {};
  w.Cal = cal;
  return cal;
}

export function CallEmbed({ booking, email }: { booking: string; email: string }) {
  const [state, setState] = useState<State>("idle");
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.childElementCount) return;
    const calLink = new URL(booking).pathname.replace(/^\//, "");
    setState("loading");
    const Cal = loadCal();
    Cal("init", NS, { origin: "https://cal.com" });
    const api = Cal.ns[NS];
    api("inline", { elementOrSelector: el, calLink, config: { layout: "month_view", theme: "light" } });
    api("ui", {
      hideEventTypeDetails: true,
      layout: "month_view",
      theme: "light",
      cssVarsPerTheme: { light: { "cal-brand": "#0a0a0a", "cal-brand-emphasis": "#262626", "cal-brand-text": "#ffffff" } },
    });
    api("on", { action: "linkReady", callback: () => setState("ready") });
    api("on", { action: "linkFailed", callback: () => setState("failed") });
    const t = window.setTimeout(() => setState((s) => (s === "loading" ? "failed" : s)), 15000);
    return () => window.clearTimeout(t);
  }, [booking]);
  return (
    <div className="cal" data-state={state}>
      <div className="cal-frame">
        <div ref={host} className="cal-host" />
        {state === "loading" ? <p className="cal-wait">Loading the calendar…</p> : null}
        {state === "failed" ? (
          <p className="cal-fail">
            The calendar did not load here. <a href={booking}>Open the booking page</a> or email{" "}
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
        <a href={booking} target="_blank" rel="noopener">
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
