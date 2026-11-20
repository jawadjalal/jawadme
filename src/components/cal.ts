"use client";

// One Cal.com booking for the whole site: the 15 minute call (BOOK in felt/copy). Every CTA is a plain link to
// /call?src=<tag>, so it works without JavaScript; once the page has loaded, openBooking() opens the same event in
// Cal's popup instead. The tag rides into the embed config as `src` (prefills the hidden booking question with that
// identifier) and `metadata[src]` (lands on the booking's metadata), so each booking records where it came from.

import { track } from "@vercel/analytics";
import { BOOK } from "./felt/copy";

type Fn = (...args: unknown[]) => void;
type Queue = Fn & { q: unknown[] };
type Cal = Queue & { ns: Record<string, Queue>; loaded?: boolean };

export const CAL_LINK = new URL(BOOK).pathname.replace(/^\//, "");
export const NS = "call";
export const THEME = {
  theme: "light",
  layout: "month_view",
  cssVarsPerTheme: { light: { "cal-brand": "#0a0a0a", "cal-brand-emphasis": "#262626", "cal-brand-text": "#ffffff" } },
} as const;

/** A channel tag from a query string or a caller: lower-case letters, digits and dashes, else "direct". */
export function cleanSrc(v: string | null | undefined) {
  return v && /^[a-z0-9-]{1,40}$/.test(v) ? v : "direct";
}

/** The embed config for one channel. */
export const calConfig = (src: string) => ({ layout: THEME.layout, theme: THEME.theme, src, "metadata[src]": src });

let current = "direct";
let wired = false;

// TODO: book_open and booked go to Vercel Analytics custom events, which need the Vercel Pro plan. If the project is
// on Hobby, send these two events to PostHog or Plausible instead (redesign plan, section 13).
export const trackBooking = (event: "book_open" | "booked", src: string) => track(event, { src });

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

/** The "call" namespace, set up once per page with the site's theme and the booked event. */
export function calApi(src: string) {
  current = src;
  const Cal = loadCal();
  if (!wired) {
    wired = true;
    Cal("init", NS, { origin: "https://cal.com" });
    const api = Cal.ns[NS];
    api("ui", { hideEventTypeDetails: true, ...THEME });
    api("on", { action: "bookingSuccessfulV2", callback: () => trackBooking("booked", current) });
  }
  return Cal.ns[NS];
}

/** A click handler for a booking link: opens the popup in place, unless the visitor asked for a new tab or window. */
export const openBooking = (src: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  trackBooking("book_open", src);
  calApi(src)("modal", { calLink: CAL_LINK, config: calConfig(src) });
};

/** The link every CTA uses: /call with its channel. */
export const callHref = (src: string) => `/call?src=${src}`;
