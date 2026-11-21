"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { attach, track } from "@/lib/track";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
const SOCIAL: Record<string, string> = {
  "x.com": "x",
  "github.com": "github",
  "instagram.com": "instagram",
  "tiktok.com": "tiktok",
  "youtube.com": "youtube",
  "linkedin.com": "linkedin",
};
const CHAMBERS = ["court", "hall", "theatre", "river"];

/** PostHog, cookieless (memory persistence, so no banner), loaded after the page is idle so it never touches LCP, plus
 *  the site-wide events read from the DOM: social_click, cta_hover, ad_open and world_depth. Without a key it only
 *  feeds Vercel Analytics. The world can name the chamber in view with a `world:chamber` event; otherwise depth is
 *  the scroll quarter. */
export function PostHog() {
  const path = usePathname();

  useEffect(() => {
    if (!KEY) return;
    const start = () =>
      import("posthog-js").then(({ default: ph }) => {
        ph.init(KEY, {
          api_host: HOST,
          persistence: "memory",
          person_profiles: "identified_only",
          capture_pageview: "history_change",
          capture_pageleave: true,
          capture_performance: { web_vitals: true },
          session_recording: { maskAllInputs: true },
        });
        attach((e, p) => ph.capture(e, p, e === "world_depth" ? { transport: "sendBeacon" } : undefined));
      });
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(start, { timeout: 5000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(start, 3000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const hovered = new WeakSet<Element>();
    const click = (e: MouseEvent) => {
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!(a instanceof HTMLAnchorElement)) return;
      const network = SOCIAL[a.hostname.replace(/^www\./, "")];
      if (network) track("social_click", { network, from: location.pathname });
    };
    const over = (e: PointerEvent) => {
      const a = e.target instanceof Element ? e.target.closest('a[href^="/cal"]') : null;
      if (!(a instanceof HTMLAnchorElement) || hovered.has(a)) return;
      hovered.add(a);
      track("cta_hover", { src: new URL(a.href).searchParams.get("src") ?? "direct", from: location.pathname });
    };
    addEventListener("click", click, true);
    addEventListener("pointerover", over, { passive: true });
    return () => {
      removeEventListener("click", click, true);
      removeEventListener("pointerover", over);
    };
  }, []);

  useEffect(() => {
    if (path.startsWith("/w/")) track("ad_open", { id: path.slice(3) });
    if (path !== "/") return;
    let deepest = -1;
    let sent = false;
    const reach = (i: number) => (deepest = Math.max(deepest, i));
    const scroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (max > 0) reach(Math.min(3, Math.floor((scrollY / max) * 4)));
    };
    const named = (e: Event) => reach(CHAMBERS.indexOf(String((e as CustomEvent).detail)));
    const send = () => {
      if (sent || deepest < 0) return;
      sent = true;
      track("world_depth", { chamber: CHAMBERS[deepest], depth: deepest + 1 });
    };
    const hide = () => document.visibilityState === "hidden" && send();
    scroll();
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("world:chamber", named);
    document.addEventListener("visibilitychange", hide);
    addEventListener("pagehide", send);
    return () => {
      send();
      removeEventListener("scroll", scroll);
      removeEventListener("world:chamber", named);
      document.removeEventListener("visibilitychange", hide);
      removeEventListener("pagehide", send);
    };
  }, [path]);

  return null;
}
