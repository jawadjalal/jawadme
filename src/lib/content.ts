// Site content, shared between the OS scene templates and anything else that
// needs it.
//
// This used to live inline in src/app/page.tsx. It was lifted out when the
// jawadOS scene took over the homepage, so the roles and links survive in one
// place instead of being duplicated into the desktop and mobile templates.

const ddg = (d: string) => `https://icons.duckduckgo.com/ip3/${d}.ico`;

export type Role = {
  year: string;
  org: string;
  role: string;
  url: string;
  icon: string;
  detail: string;
};

export const ROLES: Role[] = [
  {
    year: "Since 2026",
    org: "skribbl.dev",
    role: "Founder",
    url: "https://skribbl.dev",
    icon: ddg("skribbl.dev"),
    detail:
      "A Mac app for running coding agents in parallel — one task each, one repo, one bill. Built and shipped it.",
  },
  {
    year: "Since 2026",
    org: "bevel.team",
    role: "Founder",
    url: "https://bevel.team",
    icon: ddg("bevel.team"),
    detail:
      "A 3D art team for hire, making game-ready work. I run the team, the rates and the pipeline.",
  },
  {
    year: "Since 2026",
    org: "bidframe.org",
    role: "Founder",
    url: "https://bidframe.org",
    icon: ddg("bidframe.org"),
    detail:
      "Software that reads public-sector tenders and flags the requirements that would disqualify a bid.",
  },
  {
    year: "Since 2026",
    org: "jawadj.design",
    role: "Founder, web & design studio",
    url: "https://jawad-portfolio-kohl.vercel.app",
    icon: ddg("jawad-portfolio-kohl.vercel.app"),
    detail:
      "My freelance studio. Brand identity, UI/UX and full site builds for founders who want it to actually look good.",
  },
  {
    year: "Since 2026",
    org: "weld.",
    role: "Founder & Project Manager",
    url: "https://weldroblox.com",
    icon: ddg("weldroblox.com"),
    detail:
      "A structured marketplace fixing how Roblox studios hire developers. Sole founder, live waitlist at weldroblox.com.",
  },
  {
    year: "Since 2026",
    org: "World Ent",
    role: "3D Artist",
    url: "https://games.worldent.online",
    icon: "/assets/worldent.svg",
    detail:
      "Stylised and realistic 3D assets for live Roblox titles, modelled and textured end to end.",
  },
  {
    year: "Since 2026",
    org: "Basket Ent",
    role: "Acquisitions team",
    url: "https://basketent.com",
    icon: ddg("basketent.com"),
    detail:
      "Sourcing, evaluating and closing game acquisition deals, then planning post acquisition LiveOps.",
  },
  {
    year: "Since 2026",
    org: "Acquiblox",
    role: "Chief Marketing Officer",
    url: "https://acquiblox.com",
    icon: ddg("acquiblox.com"),
    detail:
      "Own marketing strategy, brand positioning and community growth across Discord and X.",
  },
  {
    year: "Since 2024",
    org: "Cosmos Models",
    role: "Self-employed 3D Artist",
    url: "https://cosmosmodels.lovable.app",
    icon: "https://www.google.com/s2/favicons?domain=cosmosmodels.lovable.app&sz=64",
    detail:
      "My own commissions studio in ZBrush, Blender and Substance. 200+ member server and paid clients.",
  },
  {
    year: "Since 2026",
    org: "SOF Agency",
    role: "PR Agent & Copywriter",
    url: "https://sof.agency",
    icon: "https://www.google.com/s2/favicons?domain=sof.agency&sz=64",
    detail:
      "PR, influencer partnerships and crowdfunding campaigns for game studios and digital brands.",
  },
];

// The ventures, which lead the homepage. These rank above the client web work:
// the sites are a service, these are the things being built.
//
// The taglines here are written from what each product's own site says it does,
// read off the screenshots in public/design/. They replaced a set of jokes
// ("It converts, allegedly.") that told a reader nothing — a summary should
// survive being read by someone deciding whether to hire him.
export type Venture = {
  name: string;
  href: string;
  shot: string;
  tagline: string;
  role: string;
  status: string;
};

export const VENTURES: Venture[] = [
  {
    name: "skribbl.dev",
    href: "https://skribbl.dev",
    shot: "/design/skribbl-dev.webp",
    tagline:
      "A Mac app that runs several coding agents at once — Claude, Codex, Gemini — " +
      "each on its own task in the same repo, with a live meter on what they spend.",
    role: "Founder",
    status: "Shipping",
  },
  {
    name: "bevel.team",
    href: "https://bevel.team",
    shot: "/design/bevel-team.webp",
    tagline:
      "A 3D art team you can hire by the job: game-ready models and environments, " +
      "published rates, and a roster of artists behind it.",
    role: "Founder",
    status: "Live",
  },
  {
    name: "bidframe.org",
    href: "https://bidframe.org",
    shot: "/design/bidframe-org.webp",
    tagline:
      "Reads a public-sector tender, finds every requirement, and flags the ones " +
      "that would disqualify you — each linked back to the exact clause.",
    role: "Founder",
    status: "Live",
  },
  {
    name: "weld.",
    href: "https://weldroblox.com",
    shot: "/design/weld.webp",
    tagline:
      "A structured marketplace fixing how Roblox studios hire developers. " +
      "Built and shipped solo; waitlist is live.",
    role: "Founder & PM",
    status: "Waitlist",
  },
];

// Client site work. Deliberately last on the homepage — it is the least
// interesting thing he does, even though it is the most visible.
export type WebWork = { name: string; href: string; shot: string; note: string };

export const WEB_WORK: WebWork[] = [
  { name: "VizzBees", href: "https://vizzbees.com", shot: "/design/vizzbees.webp", note: "SaaS site. Bees were optional." },
  { name: "KleoKlaw", href: "https://kleoklaw.com", shot: "/design/kleoklaw.webp", note: "Mobile product. Claws included." },
  { name: "Splitting Point", href: "https://splittingpoint.com", shot: "/design/splittingpoint.webp", note: "Landing page, built to convert." },
];

// The real brand marks, not text pills. `path` is the single-path SVG glyph on a
// 24x24 viewBox and `brand` is the platform's own colour, both carried over from
// the retired panel so nothing had to be redrawn or approximated.
export type Social = { label: string; href: string; brand: string; path: string };

export const SOCIALS: Social[] = [
  {
    label: "X",
    href: "https://x.com/jawadmakes",
    brand: "#0a0a0a",
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@jawadmakes",
    brand: "#e02750",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jawad-jalal-designs",
    brand: "#0a66c2",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/j.awadjalal/",
    brand: "#d6336c",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@jawadmake",
    brand: "#e60000",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

export const PROFILE = {
  name: "Jawad Jalal",
  email: "hijawadjalal@gmail.com",
  cv: "/jawad-jalal-cv.pdf",
  cvFilename: "Jawad-Jalal-CV.pdf",
  location: "London, England",
  bio:
    "Fifteen, London, operating at industry level since thirteen. " +
    "3D artist, marketer, and founder making things that look good and actually work.",
};
