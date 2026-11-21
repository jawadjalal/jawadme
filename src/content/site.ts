// The few words the site has. Everything else is the work.

export const SITE = {
  headline: "Design Mastermind",
  available: "Available now",
  line: "Brands, ads, 3D and Roblox games. Designed by Jawad Jalal in London.",
  lanes: ["Brands", "ads", "3D", "Roblox"] as const,
  cta: "Book a call",
  detail: "15 min, video",
  email: "hijawadjalal@gmail.com",
  cv: "/jawad-jalal-cv.pdf",
  about: "I'm Jawad. I design it, and I build it.",
  portrait: { src: "/design/jawad-ink.webp", w: 900, h: 900, alt: "Jawad Jalal, drawn in ink" },
};

export const NAV = [
  { label: "Work", href: "/work" },
  { label: "Ads", href: "/ads" },
  { label: "3D", href: "/work?f=3d" },
  { label: "Roblox", href: "/work?f=roblox" },
] as const;

export const SOCIAL = [
  { label: "X", href: "https://x.com/jawadmakes" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jawad-jalal-designs" },
  { label: "Instagram", href: "https://www.instagram.com/j.awadjalal/" },
  { label: "YouTube", href: "https://www.youtube.com/@jawadmake" },
];

/** From Jawad's CV (public/jawad-jalal-cv.pdf), years only. He has left MenuFit and Okara; "8-figure" and Okara's
 *  launch views are company context he gave, not his own results. */
export const TIMELINE = [
  { co: "Ignura Studio", role: "Founder", what: "A design studio: websites for startups, built from scratch", years: "2026 to now", href: "https://ignura.com", now: true },
  { co: "MenuFit", role: "Product designer", what: "An 8-figure startup at 7-figure MRR: the app for eating out healthy, used by 1.5 million people", years: "2026", href: "https://menufit.com", now: false },
  { co: "Okara", role: "Product development intern", what: "An 8-figure AI startup, the AI CMO. 14M views at its launch", years: "2026", href: "https://okara.ai", now: false },
];
