"use client";



import { track } from "@vercel/analytics";
import { BOOK } from "./felt/copy";

type Fn = (...args: unknown[]) => void;
type Queue = Fn & { q: unknown[] };
type Cal = Queue & { ns: Record<string, Queue>; loaded?: boolean };

export const CAL_LINK = new URL(BOOK).pathname.replace(/^\//, "");
export const NS = "call";
export const THEME = {
  theme: "dark",
  layout: "month_view",
  cssVarsPerTheme: {
    light: { "cal-brand": "#0a0a0a", "cal-brand-emphasis": "#262626", "cal-brand-text": "#ffffff" },
    dark: { "cal-brand": "#ff8a2a", "cal-brand-emphasis": "#ffb43a", "cal-brand-text": "#07060b", "cal-bg": "#07060b", "cal-bg-muted": "#141220", "cal-bg-emphasis": "#2a2840", "cal-border": "#2a2840", "cal-border-subtle": "#1c1a2b", "cal-text": "#ede4d3", "cal-text-muted": "#b9b0c9" },
  },
} as const;

/** A channel tag from a query string or a caller: lower-case letters, digits and dashes, else "direct". */
export function cleanSrc(v: string | null | undefined) {
  return v && /^[a-z0-9-]{1,40}$/.test(v) ? v : "direct";
}

/** The embed config for one channel. */
export const calConfig = (src: string) => ({ layout: THEME.layout, theme: THEME.theme, src, "metadata[src]": src });

let current = "direct";
let wired = false;

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

export const openBooking = (src: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  trackBooking("book_open", src);
};

/** The link every CTA uses: /cal with its channel. */
export const callHref = (src: string) => `/cal?src=${src}`;
