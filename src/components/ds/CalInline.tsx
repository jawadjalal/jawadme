"use client";

// The 15 minute event inline, through Cal's own embed so its ui settings apply. The ?src= tag rides into the config.
// If it has not loaded after 15 s (blocked, offline) the plain booking link and the email take its place.

import { useEffect, useRef, useState } from "react";
import { CAL_LINK, calApi, calConfig, cleanSrc } from "@/components/cal";

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
      {state === "loading" ? <p className="lbl dim cal-note">Loading the calendar</p> : null}
      {state === "failed" ? (
        <p className="cal-note">
          The calendar did not load. <a href={`https://cal.com/${CAL_LINK}?src=${src}`}>Open it on Cal.com</a> or email <a href={`mailto:${email}`}>{email}</a>.
        </p>
      ) : null}
    </div>
  );
}
