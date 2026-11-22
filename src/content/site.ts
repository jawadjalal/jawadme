// The few words the site has. Everything else is the work.

export const SITE = {
  headline: "design mastermind",
  available: "available now",
  line: "brands, ads, 3d and roblox games. designed by jawad jalal in london.",
  lanes: ["brands", "ads", "3d", "roblox"] as const,
  cta: "book a call",
  detail: "15 min, video",
  email: "hijawadjalal@gmail.com",
  cv: "/jawad-jalal-cv.pdf",
  about: "i'm jawad. i design it, and i build it.",
  portrait: { src: "/design/jawad-ink.webp", w: 900, h: 900, alt: "jawad jalal, drawn in ink" },
};

export const NAV = [
  { label: "work", href: "/work" },
  { label: "about", href: "/about" },
  { label: "contact", href: "/contact" },
] as const;

/** From Jawad's CV (public/jawad-jalal-cv.pdf), years only. He has left MenuFit and Okara; "8-figure" and Okara's
 *  launch views are company context he gave, not his own results. */
export const TIMELINE = [
  { co: "ignura studio", role: "founder", what: "a design studio: websites for startups, built from scratch", years: "2026 to now", href: "https://ignura.com", now: true },
  { co: "menufit", role: "product designer", what: "an 8-figure startup at 7-figure mrr: the app for eating out healthy, used by 1.5 million people", years: "2026", href: "https://menufit.com", now: false },
  { co: "okara", role: "product development intern", what: "an 8-figure ai startup, the ai cmo. 14m views at its launch", years: "2026", href: "https://okara.ai", now: false },
];
