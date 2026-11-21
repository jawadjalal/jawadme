// The few words the site has. Everything else is the work.

export const SITE = {
  headline: "Design Mastermind",
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

/** From Jawad's CV (public/jawad-jalal-cv.pdf). Nothing here is written from memory. */
export const EXPERIENCE = [
  { co: "Ignaru", role: "Founder", years: "2026 to now", href: "/work/ignaru" },
  { co: "Ignura", role: "Founder, design studio", years: "2026 to now", href: "/work/ignura" },
  { co: "MenuFit", role: "Product designer", years: "2026", href: "/work/menufit" },
  { co: "Okara", role: "Product development intern", years: "2026", href: "/work/okara" },
];

export const FIGURES = [
  { n: "1.5M", l: "people use the app I design" },
  { n: "14M", l: "views on Okara's launch, day one" },
  { n: "7 fig", l: "ARR at MenuFit" },
];
