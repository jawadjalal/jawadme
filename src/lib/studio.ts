// /design — the studio, as data.
//
// The page used to be jawadOS: a scroll-driven CRT on a desk, with five windows
// and about four thousand lines of generated scene markup behind it. The copy
// below is that page's copy, lifted intact and lowercased. What changed is the
// presentation, not the offer.

export const STUDIO = {
  title: "design studio",
  lede: "i design things, build them, and ship them.",
  availability: "two seats free from august",
  call: "https://cal.com/jawad-jalal-hesqbk/15min",
  callNote: "fifteen minutes, no deck",

  pitch:
    "most designers hand you a figma file and wish you luck. i design it, " +
    "build it and ship it, so nothing gets lost in a handoff that never happens.",
  pitchNote: "one person, start to live.",
  terms:
    "free sample first — one real section, no charge. then 50% up front, " +
    "50% on ship. you own all of it.",
  noRetainers: "no retainers. no surprises.",
};

export const QUOTE = {
  text: "i asked for one page and got a whole product.",
  name: "janzen madsen",
  role: "founder, splitting point",
  href: "https://splittingpoint.com",
};

/** What the work is made of. Kept as four lines because that is genuinely the
 *  whole stack — a longer list would be padding. */
export const STACK = [
  { label: "design", tools: "figma" },
  { label: "build", tools: "react, next, tailwind" },
  { label: "motion", tools: "gsap, three" },
  { label: "ship", tools: "vercel" },
];

export type Work = { name: string; href: string; kind: "mine" | "client"; note: string };

export const WORK: Work[] = [
  { name: "splitting point", href: "https://splittingpoint.com", kind: "client", note: "games their mums are proud of. mostly." },
  { name: "skribbl", href: "https://skribbl.dev", kind: "mine", note: "agents, running loose but supervised." },
  { name: "bevel", href: "https://bevel.team", kind: "mine", note: "three dee, game ready, edges softened." },
  { name: "weld", href: "https://weldroblox.com", kind: "mine", note: "shipped solo, slept afterwards." },
  { name: "vizzbees", href: "https://vizzbees.com", kind: "client", note: "saas site. bees were optional." },
  { name: "kleoklaw", href: "https://kleoklaw.com", kind: "client", note: "mobile product. claws included." },
  { name: "bidframe", href: "https://bidframe.org", kind: "mine", note: "reads tenders so you do not have to." },
];

// ── the estimator ────────────────────────────────────────────────────────────
// Same numbers the vending machine used, so nobody who saw a price last month
// gets a different one now.

export type Tier = { key: "single" | "edition"; label: string; price: number; days: number; note: string };

export const TIERS: Tier[] = [
  { key: "single", label: "the single", price: 3000, days: 5, note: "one sharp page." },
  { key: "edition", label: "the edition", price: 7200, days: 12, note: "full site, room to grow." },
];

export type Addon = { key: string; label: string; price: number; days: number };

export const ADDONS: Addon[] = [
  { key: "cms", label: "cms", price: 1600, days: 3 },
  { key: "pages", label: "extra page", price: 900, days: 2 },
  { key: "motion", label: "motion pass", price: 2400, days: 4 },
  { key: "copy", label: "copy pass", price: 1200, days: 3 },
];

/** The spread narrows as the brief gets more specific: every add-on picked is
 *  one fewer unknown, so the top of the range comes down toward the bottom. */
export function slack(addonCount: number) {
  return Math.max(0.05, 0.28 - 0.07 * addonCount);
}

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;

// ── the brief form ───────────────────────────────────────────────────────────

export const SCOPES = [
  { base: 1500, label: "one page" },
  { base: 3600, label: "a small site" },
  { base: 9000, label: "a full site" },
  { base: 14000, label: "a product" },
];

export const SPEEDS = [
  { m: 1, label: "no rush" },
  { m: 1.15, label: "a few weeks" },
  { m: 1.6, label: "yesterday" },
];

export const BANDS = [
  { range: "under $2k", ceil: 2000 },
  { range: "$2k to $5k", ceil: 5000 },
  { range: "$5k to $10k", ceil: 10000 },
  { range: "$10k and up", ceil: 1e9 },
];

/** The rotating textarea prompt. Same four as before. */
export const PLACEHOLDERS = [
  "what are we building?",
  "the honest version, not the deck version",
  "who is it for, and what breaks today?",
  "one paragraph. i read all of it.",
];

/** Validation copy. Blunt on purpose — it was the one bit of the old page that
 *  people quoted back. */
export const ERRORS = {
  name: "a brief with no name on it. bold.",
  email: "that email will not reach anyone. not even you.",
  message: "three words minimum. i build sites, not tarot.",
  failed: "something went sideways.",
};
