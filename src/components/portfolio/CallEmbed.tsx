"use client";

// The booking calendar, inline: Cal.com's own booking page in embed mode, on the page's white with no card round it.
// While it loads, a quiet line says so; if it has not loaded after a while (blocked, offline), the plain link to the
// booking page and the email address take its place. Both links also sit under it the whole time.

import { useEffect, useState } from "react";

type State = "loading" | "ready" | "failed";

export function CallEmbed({ booking, email }: { booking: string; email: string }) {
  const [state, setState] = useState<State>("loading");
  useEffect(() => {
    const t = window.setTimeout(() => setState((s) => (s === "loading" ? "failed" : s)), 12000);
    return () => window.clearTimeout(t);
  }, []);
  const src = `${booking}?embed=true&theme=light&layout=month_view&hideEventTypeDetails=true`;
  return (
    <div className="cal" data-state={state}>
      <div className="cal-frame">
        {state !== "failed" ? (
          <iframe src={src} title="Book a call with Jawad" onLoad={() => setState("ready")} allow="payment" />
        ) : null}
        {state === "loading" ? <p className="cal-wait">Loading the calendar…</p> : null}
        {state === "failed" ? (
          <p className="cal-fail">
            The calendar did not load here. <a href={booking}>Open the booking page</a> or email{" "}
            <a href={`mailto:${email}`}>{email}</a>.
          </p>
        ) : null}
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
