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

export type Social = { label: string; href: string };

export const SOCIALS: Social[] = [
  { label: "X", href: "https://x.com/jawadmakes" },
  { label: "TikTok", href: "https://www.tiktok.com/@jawadmakes" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jawad-jalal-designs" },
  { label: "Instagram", href: "https://www.instagram.com/j.awadjalal/" },
  { label: "YouTube", href: "https://www.youtube.com/@jawadmake" },
];

export const PROFILE = {
  name: "Jawad Jalal",
  email: "hijawadjalal@gmail.com",
  cv: "/jawad-jalal-cv.pdf",
  cvFilename: "Jawad-Jalal-CV.pdf",
  bio:
    "Fifteen, just outside London, operating at industry level since thirteen. " +
    "3D artist, marketer, and founder making things that look good and actually work.",
};
