// The site, as data.
//
// Four things render from this file: the page itself, the summary at
// /llms.txt, the share card, and the JSON-LD in the document head. They have
// to agree, because a share card that contradicts the page is worse than not
// having one, so the words live here once and every surface reads them.
//
// Prose strings may carry the two tokens `prose.tsx` understands:
//
//   :pen:                  a bare icon on the baseline
//   :pen:{design at okara} that phrase highlighted, icon in front
//
// House style: no em dashes. A comma, a full stop or a colon does the job,
// and the dash is the one punctuation mark that makes written-by-a-machine
// obvious at a glance.

export const IDENTITY = {
  name: "jawad jalal",
  properName: "Jawad Jalal",
  wordmark: "JAWAD",
  role: "designer & founder",
  location: "london",
  locality: "London",
  region: "England",
  country: "GB",
  email: "hijawadjalal@gmail.com",
  cv: "/jawad-jalal-cv.pdf",
  site: "https://jawadjalal.com",
  avatar: "/design/jawad.webp",
  /** The second face, shown when the toggle under the portrait is flipped. */
  avatarAlt: "/design/jawad-photo.webp",
};

/** The titles that cycle under the name, one line at a time. */
export const ROLES = [
  "Designer & Founder",
  "Head of Product at Nooli",
  "Design at Okara",
];

/** The About list. Each string is one bullet, and may carry icon tokens. */
export const ABOUT = [
  "i'm jawad :sparkle:, a :pen:{designer} and founder in london :globe: :rocket:[(yc soon)|https://www.ycombinator.com/]. ~i started making things for money at thirteen and never really stopped. i'm fifteen now.~",
  "~i build my own products~ :cube:<end to end>~: the brand, the interface, and the thing that actually ships.~",
];

/**
 * The four roles, as a compact table rather than a sentence.
 *
 * They were a run-on line with six highlights in it, which is where the
 * chips stopped meaning anything: a phrase reads as emphasised only while
 * most of the phrases around it are not. As rows, the name carries the chip
 * and the role sits beside it in plain text, so the eye gets a column to
 * scan instead of a paragraph to parse.
 */
export const ABOUT_ROLES: {
  key: string;
  name: string;
  role: string;
  /** The product's own mark, so the row is identified by its logo rather
   *  than by a house glyph standing in for it. */
  logo?: string;
  emoji?: string;
  href?: string;
}[] = [
  { key: "wayari", name: "wayari", role: "founder", logo: "/logos/wayari.svg", href: "https://wayari.com" },
  { key: "bevel", name: "bevel", role: "founder", logo: "/logos/bevel.png", href: "https://bevel.team" },
  { key: "okara", name: "okara", role: "design", logo: "/logos/okara.png", href: "https://okara.ai" },
  { key: "nooli", name: "nooli", role: "head of product", emoji: "\u{1F92B}" },
];

export const ABOUT_TAIL = [
  "~the rest of the time it's~ :pen:<3d art and logo work>~, and whatever i can talk someone into letting me redesign~ :bolt:.",
  "~find me on~ :x:{twitter|https://x.com/jawadmakes}, :linkedin:{linkedin|https://www.linkedin.com/in/jawad-jalal-designs}, :instagram:{instagram|https://www.instagram.com/j.awadjalal/} ~and~ :youtube:{youtube|https://www.youtube.com/@jawadmake}.",
  "~got something in mind?~ :mail:{work with me|mailto:hijawadjalal@gmail.com}",
];

export type Item = {
  key: string;
  name: string;
  href?: string;
  /** The brand mark, 40px square, under /public/logos. Nooli has no file yet,
   *  so it carries an emoji instead and `logo` is left off. */
  logo?: string;
  emoji?: string;
  /** Screenshot for the hover card and the project grid, under /public. */
  shot?: string;
  /** Shown in the hover card's footer, so it says where the link goes. */
  domain?: string;
  role: string;
  /** The glyph beside the role, from the house set. */
  roleIcon: import("@/components/Icon").IconName;
  /** Sits in brackets after the role, deliberately outside the chip. It
   *  qualifies the role rather than naming it, so giving it the same tint
   *  would say the two are the same kind of fact. */
  roleNote?: string;
  period: string;
  blurb: string;
  status: "Live" | "Building" | "Waitlist";
  /** The stack, as tags under a project card. */
  tags?: { brand?: import("@/components/Brand").BrandKey; label: string }[];
  /** A film that says more than a screenshot can. */
  video?: { mp4: string; poster: string; note: string; full?: string };
};

/** What he is actually spending the week on. */
export const NOW: Item[] = [
  {
    key: "wayari",
    roleIcon: "code",
    name: "wayari",
    href: "https://wayari.com",
    logo: "/logos/wayari.svg",
    shot: "/design/wayari.png",
    domain: "wayari.com",
    role: "Founder",
    period: "Since 2026",
    status: "Building",
    blurb: "A self improving way to code. Ship PRs while you sleep, merge them with your eyes open.",
    tags: [
      { brand: "electron", label: "Electron" },
      { brand: "typescript", label: "TypeScript" },
      { brand: "react", label: "React" },
      { brand: "nextdotjs", label: "Next.js" },
    ],
  },
  {
    key: "nooli",
    roleIcon: "block",
    name: "nooli",
    // No site yet, so the name is not a link. A link that 404s is worse than
    // a name that waits.
    emoji: "\u{1F92B}",
    shot: "/design/nooli.webp",
    role: "Head of Product",
    roleNote: "first hire",
    period: "Since 2026",
    status: "Building",
    blurb: "Lessons for three to five year olds that adapt to the child, on iOS.",
    tags: [{ label: "Product" }, { label: "iOS" }, { brand: "figmacolour", label: "Design system" }],
  },
  {
    key: "okara",
    roleIcon: "pen",
    name: "okara",
    href: "https://okara.ai",
    logo: "/logos/okara.png",
    shot: "/design/okara.png",
    domain: "okara.ai",
    role: "Design",
    period: "Since 2026",
    status: "Live",
    blurb: "An AI CMO that drafts and ships marketing work. I design the product.",
    tags: [
      { brand: "figmacolour", label: "Product design" },
      { brand: "nextdotjs", label: "Next.js" },
      { brand: "tailwindcss", label: "Tailwind" },
    ],
    // The launch film, which did 14 million views on X in a day.
    video: {
      // A 14-second cut, not the full 74. The whole film was 61MB across two
      // formats and would have been 97% of the site's weight; at ~25MB a play
      // it was the one asset that could actually run up a bandwidth bill.
      // H.264 only: every browser plays it, and the VP9 encode came out
      // larger, so a second format would have cost more and bought nothing.
      mp4: "/video/okara-clip.mp4",
      poster: "/design/okara-poster.webp",
      note: "14M views",
      full: "https://okara.ai",
    },
  },
  {
    key: "bevel",
    roleIcon: "cube",
    name: "bevel",
    href: "https://bevel.team",
    logo: "/logos/bevel.png",
    shot: "/design/bevel-team.webp",
    domain: "bevel.team",
    role: "Founder",
    period: "Since 2026",
    status: "Live",
    blurb: "A 3D art team you can hire by the job, at published rates.",
    tags: [
      { brand: "blender", label: "Blender" },
      { brand: "zbrush", label: "ZBrush" },
      { brand: "adobe", label: "Substance" },
    ],
  },
];

/** Still live, still his, just not what the week is going into. Putting these
 *  in the same list as the four above would say otherwise. */
export const ARCHIVE: Item[] = [
  {
    key: "bidframe",
    roleIcon: "target",
    name: "bidframe",
    href: "https://bidframe.org",
    logo: "/logos/bidframe.png",
    shot: "/design/bidframe.webp",
    domain: "bidframe.org",
    role: "Founder",
    period: "Since 2026",
    status: "Live",
    blurb: "Reads a tender and flags what would disqualify your bid, each linked to its clause.",
    tags: [{ brand: "nextdotjs", label: "Next.js" }, { label: "Postgres" }],
  },
  {
    key: "weld",
    roleIcon: "team",
    name: "weld",
    href: "https://weldroblox.com",
    logo: "/logos/weldroblox.png",
    shot: "/design/weld.webp",
    domain: "weldroblox.com",
    role: "Founder & PM",
    period: "Since 2026",
    status: "Waitlist",
    blurb: "A marketplace fixing how Roblox studios hire developers. Waitlist is live.",
    tags: [{ brand: "nextdotjs", label: "Next.js" }, { brand: "supabase", label: "Supabase" }],
  },
];

/** The long tail, as rows rather than cards: a list you scan, not a set of
 *  things being pitched. */
export const ELSEWHERE: {
  name: string;
  href: string;
  note: string;
  logo?: string;
  shot?: string;
  domain?: string;
}[] = [
  {
    name: "jawadj.design",
    href: "https://jawad-portfolio-kohl.vercel.app",
    note: "brand identity, ui/ux and full site builds",
  },
  {
    name: "acquiblox",
    href: "https://acquiblox.com",
    logo: "/logos/acquiblox.png",
    note: "cmo, marketing and community growth",
  },
  {
    name: "world ent",
    href: "https://games.worldent.online",
    note: "3d artist on live roblox titles",
  },
  {
    name: "basket ent",
    href: "https://basketent.com",
    logo: "/logos/basketent.png",
    note: "acquisitions, then post acquisition liveops",
  },
  {
    name: "cosmos models",
    href: "https://cosmosmodels.lovable.app",
    note: "3d commissions in zbrush, blender and substance",
  },
  {
    name: "sof agency",
    href: "https://sof.agency",
    note: "pr, partnerships and crowdfunding for game studios",
  },
  {
    name: "vizzbees",
    href: "https://vizzbees.com",
    logo: "/logos/vizzbees.png",
    note: "saas site build",
    shot: "/design/vizzbees.webp",
    domain: "vizzbees.com",
  },
  {
    name: "kleoklaw",
    href: "https://kleoklaw.com",
    logo: "/logos/kleoklaw.png",
    note: "mobile product site build",
    shot: "/design/kleoklaw.webp",
    domain: "kleoklaw.com",
  },
  {
    name: "splitting point",
    href: "https://splittingpoint.com",
    logo: "/logos/splittingpoint.png",
    note: "landing page build",
    shot: "/design/splittingpoint.webp",
    domain: "splittingpoint.com",
  },
];

/** The skills table. Grouped, because a flat cloud of twenty tags says
 *  "here are some words" rather than "here is what I do". Each row's tools
 *  carry their own mark where one exists. */
export const SKILLS_TABLE: {
  area: string;
  icon: "pen" | "code" | "cube" | "sparkle";
  what: string;
  tools: {
    brand?: import("@/components/Brand").BrandKey;
    /** For tools with no published mark to borrow. */
    icon?: import("@/components/Icon").IconName;
    label: string;
  }[];
}[] = [
  {
    area: "Design",
    icon: "pen",
    what: "Brand identity, UI/UX, design systems",
    tools: [
      { brand: "figmacolour", label: "Figma" },
      { brand: "framer", label: "Framer" },
      { icon: "shapes", label: "Logo design" },
    ],
  },
  {
    area: "Build",
    icon: "code",
    what: "Full site and product builds",
    tools: [
      { brand: "nextdotjs", label: "Next.js" },
      { brand: "react", label: "React" },
      { brand: "typescript", label: "TypeScript" },
      { brand: "tailwindcss", label: "Tailwind" },
      { brand: "supabase", label: "Supabase" },
      { brand: "vercel", label: "Vercel" },
    ],
  },
  {
    area: "AI",
    icon: "sparkle",
    what: "Agentic coding, and the products built on it",
    tools: [
      { brand: "claude", label: "Claude Code" },
      { brand: "claude", label: "Claude Design" },
      { brand: "cursor", label: "Cursor" },
      { brand: "openai", label: "Codex" },
      { brand: "openrouter", label: "OpenRouter" },
      { brand: "grok", label: "Grok" },
      { brand: "grokbot", label: "Grok Bot" },
      { brand: "hermes", label: "Hermes Agent" },
      { brand: "wayari", label: "Wayari" },
    ],
  },
  {
    area: "3D",
    icon: "cube",
    what: "Game ready models, textures, commissions",
    tools: [
      { brand: "blender", label: "Blender" },
      { brand: "zbrush", label: "ZBrush" },
      { brand: "adobe", label: "Substance" },
    ],
  },
];

/** `brand` draws the platform's own mark in its own colour; `icon` falls back
 *  to the house set for the two that are not platforms. */
export const SOCIALS: {
  label: string;
  href: string;
  brand?: import("@/components/Brand").BrandKey;
  icon?: "mail" | "doc";
}[] = [
  { label: "Email", href: "mailto:hijawadjalal@gmail.com", icon: "mail" },
  { label: "CV", href: "/jawad-jalal-cv.pdf", icon: "doc" },
  { label: "X", href: "https://x.com/jawadmakes", brand: "x" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jawad-jalal-designs", brand: "linkedin" },
  { label: "Instagram", href: "https://www.instagram.com/j.awadjalal/", brand: "instagram" },
  { label: "YouTube", href: "https://www.youtube.com/@jawadmake", brand: "youtube" },
];

/** The four things the work sits inside, drawn as overlapping circles at the
 *  foot of the page. Four, because that is what fits a square without the
 *  labels colliding. */
export const VENN = [
  "Product Design",
  "Brand Identity",
  "Frontend & Build",
  "3D & Art Direction",
];

/** A third person summary, for the machine facing surfaces. The page speaks in
 *  the first person, which reads badly when an answer engine quotes it back as
 *  a description of someone, so the sentence they should lift is written once,
 *  here, rather than stitched together from the page's copy. */
export const SUMMARY =
  "Jawad Jalal is a designer and founder based in London, England. He builds wayari, a Mac app " +
  "for running several coding agents at once, and runs bevel, a 3D art team available for hire. " +
  "He is also on design at Okara and head of product at Nooli.";

/** What he does, in the plain terms an answer engine can quote back. */
export const SKILLS = [
  "product design",
  "brand identity",
  "ui/ux design",
  "web development",
  "3d art",
  "logo design",
];

/**
 * What a marked phrase in the About copy shows when you hover it.
 *
 * Derived from the entries above rather than written out again. The first
 * version of this was a second hardcoded map in prose.tsx, and it went stale
 * the moment Wayari's screenshot was replaced: the card kept serving the old
 * file while the project grid served the new one. Reading the item means
 * there is one screenshot per product and no way for the two to disagree.
 */
const PHRASE_TO_KEY: Record<string, string> = {
  wayari: "wayari",
  bevel: "bevel",
  "design at okara": "okara",
  "head of product at nooli": "nooli",
};

export function heroFor(phrase: string) {
  const key = PHRASE_TO_KEY[phrase.toLowerCase()];
  if (!key) return null;
  const item = [...NOW, ...ARCHIVE].find((i) => i.key === key);
  if (!item) return null;
  return {
    shot: item.shot,
    emoji: item.emoji,
    label: item.domain ?? "no site yet",
  };
}

/** The header menus. Each one lists what is actually inside its section, so
 *  the header answers "what is on this page" without being scrolled. */
export const NAV: {
  label: string;
  icon: "block" | "cube" | "sparkle" | "mail";
  items: { label: string; href: string; note?: string; external?: boolean }[];
}[] = [
  {
    label: "Work",
    icon: "block",
    items: [
      ...NOW.map((i) => ({
        label: i.name,
        href: i.href ?? "#now",
        note: i.role,
        external: Boolean(i.href),
      })),
      { label: "Everything else", href: "#elsewhere", note: `${ELSEWHERE.length} more` },
    ],
  },
  {
    label: "Page",
    icon: "sparkle",
    items: [
      { label: "About", href: "#about" },
      { label: "Now", href: "#now", note: `${NOW.length} things` },
      { label: "Projects", href: "#projects" },
      { label: "Skills", href: "#skills" },
      { label: "Where it overlaps", href: "#overlaps" },
    ],
  },
  {
    label: "Contact",
    icon: "mail",
    items: [
      { label: "Email", href: `mailto:${IDENTITY.email}`, note: "hijawadjalal@" },
      { label: "X", href: "https://x.com/jawadmakes", note: "@jawadmakes", external: true },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/jawad-jalal-designs",
        external: true,
      },
      { label: "CV", href: IDENTITY.cv, note: "pdf" },
    ],
  },
];