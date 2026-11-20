// The few words the site has. Everything else is the work.

export const SITE = {
  headline: "Design Mastermind",
  line: "Brands, ads, 3D and Roblox games. Designed by Jawad Jalal in London.",
  lanes: ["Brands", "ads", "3D", "Roblox"] as const,
  cta: "Book a call",
  detail: "15 min, video",
  bookingMonth: "Dec",
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
