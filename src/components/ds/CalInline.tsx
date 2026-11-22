"use client";

// The 15 minute event inline, through Cal's own embed so its ui settings apply. The ?src= tag rides into the config.
// Its box keeps the calendar's height from the first paint and a quiet skeleton of the month holds the space until
// Cal reports ready. If it has not loaded after 15 s (blocked, offline) the booking link and the email take its place.

import { useEffect, useRef, useState } from "react";
import { CAL_LINK, calApi, calConfig, cleanSrc } from "@/components/cal";

const DAYS = Array.from({ length: 35 }, (_, i) => i);

export function CalInline({ email, theme }: { email: string; theme?: "light" | "dark" }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [src, setSrc] = useState("direct");
  useEffect(() => {
    const el = host.current;
    if (!el || el.childElementCount) return;
    const tag = cleanSrc(new URLSearchParams(location.search).get("src"));
    setSrc(tag);
    const api = calApi(tag);
    api("inline", { elementOrSelector: el, calLink: CAL_LINK, config: theme ? { ...calConfig(tag), theme } : calConfig(tag) });
    api("on", { action: "linkReady", callback: () => setState("ready") });
    api("on", { action: "linkFailed", callback: () => setState("failed") });
    const t = window.setTimeout(() => setState((s) => (s === "loading" ? "failed" : s)), 15000);
    return () => window.clearTimeout(t);
  }, [theme]);
  return (
    <div className="cal-box" data-state={state}>
      <div ref={host} className="cal-host" />
      {state === "loading" ? (
        <div className="cal-skel" aria-label="loading the calendar" role="status">
          <i className="cal-skel-head" />
          <span className="cal-skel-days">
            {DAYS.map((d) => (
              <i key={d} />
            ))}
          </span>
          <span className="cal-skel-slots">
            {DAYS.slice(0, 8).map((d) => (
              <i key={d} />
            ))}
          </span>
        </div>
      ) : null}
      {state === "failed" ? (
        <p className="cal-note">
          the calendar did not load. <a href={"https://cal.com/" + CAL_LINK + "?src=" + src}>open it on cal.com</a> or email <a href={"mailto:" + email}>{email}</a>.
        </p>
      ) : null}
    </div>
  );
}
