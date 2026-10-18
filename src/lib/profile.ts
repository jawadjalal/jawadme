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
//   :pen:{design at menufit} that phrase highlighted, icon in front
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
  "Founder of Ignura",
  "Designer & Founder",
  "Design at MenuFit",
  "Design at Okara",
];

/** The About list. Each string is one bullet, and may carry icon tokens. */
export const ABOUT = [
  "i'm jawad :sparkle:, a :pen:{designer} and founder in london :globe: :rocket:[(yc soon)|https://www.ycombinator.com/]. ~i started making things for money at thirteen and never really stopped. i'm fifteen now.~",
  "~i run~ :rocket:{ignura|https://ignura.com}~, the launch studio that makes launch films, app store screenshots and landing pages for apps.~",
  "~i build~ :rocket:{ignaru|https://ignaru.com}~, a growth engine in a box.~",
  "~i build my own products~ :cube:<end to end>~: the brand, the interface, and the thing that actually ships.~",
];

/**
 * The five roles, as a compact table rather than a sentence.
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
  /** What the row is worth, in a few words, after the role. */
  stat?: string;
  /** The product's own mark, so the row is identified by its logo rather
   *  than by a house glyph standing in for it. */
  logo?: string;
  /** For a mark that only reads on its own colour, like Weld. */
  logoTile?: string;
  emoji?: string;
  href?: string;
}[] = [
  { key: "ignura", name: "ignura", role: "founder", stat: "6 figure arr", logo: "/logos/ignura.png", href: "https://ignura.com" },
  { key: "menufit", name: "menufit", role: "design", stat: "7 figure arr, 2m users", logo: "/logos/menufit.png", href: "https://menufit.com" },
  { key: "bevel", name: "bevel", role: "founder", stat: "6 figure arr", logo: "/logos/bevel.png", href: "https://bevel.team" },
  { key: "okara", name: "okara", role: "design", logo: "/logos/okara.png", href: "https://okara.ai" },
  { key: "ignaru", name: "ignaru", role: "founder", stat: "side project", logo: "/logos/ignaru.png", href: "https://ignaru.com" },
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
  /** The brand mark, 40px square, under /public/logos. */
  logo?: string;
  /** For a mark that only reads on its own colour, like Weld: forcing it
   *  onto the white tile would lose the figure entirely. */
  logoTile?: string;
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
  status: "Live" | "Building" | "Waitlist" | "Discontinued";
  /** The stack, as tags under a project card. */
  tags?: { brand?: import("@/components/Brand").BrandKey; label: string }[];
};

/** What he is actually spending the week on, in the order the grid shows it:
 *  the first is drawn wide, the rest in pairs. */
export const NOW: Item[] = [
  {
    key: "ignura",
    roleIcon: "rocket",
    name: "ignura",
    href: "https://ignura.com",
    logo: "/logos/ignura.png",
    shot: "/design/ignura.webp",
    domain: "ignura.com",
    role: "Founder",
    period: "Since 2026",
    status: "Live",
    blurb:
      "The launch studio for apps. Launch films, App Store screenshots, landing pages and UGC from a team of four. 6 figure ARR.",
    tags: [
      { label: "Launch films" },
      { label: "App Store screenshots" },
      { label: "Landing pages" },
      { label: "UGC" },
    ],
  },
  {
    key: "menufit",
    roleIcon: "pen",
    name: "menufit",
    href: "https://menufit.com",
    logo: "/logos/menufit.png",
    shot: "/design/menufit.webp",
    domain: "menufit.com",
    role: "Design",
    period: "Since 2026",
    status: "Live",
    blurb: "The app for eating out healthy. 7 figure ARR and 2 million users. I design the product.",
    tags: [
      { brand: "figmacolour", label: "Product design" },
      { label: "iOS" },
      { label: "Android" },
      { label: "Design system" },
    ],
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
    blurb: "A 3D art team you can hire by the job, at published rates. 6 figure ARR.",
    tags: [
      { brand: "blender", label: "Blender" },
      { brand: "zbrush", label: "ZBrush" },
      { brand: "adobe", label: "Substance" },
      { label: "Game ready" },
    ],
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
    blurb: "An AI CMO that drafts and ships marketing work. I design the product. Its launch film did 14M views on X in a day.",
    tags: [
      { brand: "figmacolour", label: "Product design" },
      { brand: "nextdotjs", label: "Next.js" },
      { brand: "tailwindcss", label: "Tailwind" },
      { label: "Design system" },
    ],
  },
  {
    key: "ignaru",
    roleIcon: "trend",
    name: "ignaru",
    href: "https://ignaru.com",
    logo: "/logos/ignaru.png",
    shot: "/design/ignaru.webp",
    domain: "ignaru.com",
    role: "Founder",
    roleNote: "side project",
    period: "Since 2026",
    status: "Building",
    blurb: "A growth engine in a box. Leads in, calls out, you approve everything in between.",
    tags: [
      { label: "B2B" },
      { label: "Growth" },
      { label: "GTM" },
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
    period: "2026",
    status: "Discontinued",
    blurb: "Reads a tender and flags what would disqualify your bid, each linked to its clause.",
    tags: [{ brand: "nextdotjs", label: "Next.js" }, { label: "Postgres" }],
  },
  {
    key: "weld",
    roleIcon: "team",
    name: "weld",
    href: "https://weldroblox.com",
    logo: "/logos/weldroblox.png",
    logoTile: "#eb3c17",
    shot: "/design/weld.webp",
    domain: "weldroblox.com",
    role: "Founder & PM",
    period: "2026",
    status: "Discontinued",
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
  "Jawad Jalal is a designer and founder based in London, England. He runs Ignura (ignura.com), " +
  "the launch studio that makes launch films, App Store screenshots and landing pages for apps, and bevel, " +
  "a 3D art team available for hire. Both are at 6 figure ARR. He does design at Okara and at MenuFit (menufit.com), " +
  "an app for eating out healthy with 2 million users and 7 figure ARR. " +
  "As a side project he builds ignaru, a growth engine in a box.";

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
 * the moment a project's screenshot was replaced: the card kept serving the old
 * file while the project grid served the new one. Reading the item means
 * there is one screenshot per product and no way for the two to disagree.
 */
const PHRASE_TO_KEY: Record<string, string> = {
  ignura: "ignura",
  menufit: "menufit",
  ignaru: "ignaru",
  bevel: "bevel",
  "design at menufit": "menufit",
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
      { label: "Blog", href: "/blog" },
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