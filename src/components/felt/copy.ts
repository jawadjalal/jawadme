// The words and art for the felt home (src/app/page.tsx). Four felt slots in the hero and a row of felt links under
// the line; both open the drawers, and every drawer is one thing Jawad has made or done. Art: public/felt (transparent
// squares, 320 and 640 wide; the canvas-*, ship-merge and nav-blog pieces come from ignaru.com's set). Stills:
// public/sites, public/okara, public/menufit, public/ads.
//
// Facts only. Each number here was read from a live page or a repo on 7 Nov 2026; the source sits beside it.

export const BOOK = "https://cal.com/jawad-jalal-hesqbk/intro-call-with-ignura";
export const EMAIL = "hijawadjalal@gmail.com";

export const LINE = "I'm a design engineer. I've shipped Ignaru and Wayari, and I build sites for startups.";

export const feltSrc = (name: string) => ({
  src: `/felt/${name}-1x.webp`,
  srcSet: `/felt/${name}-1x.webp 320w, /felt/${name}.webp 640w`,
});

/** Every drawer, in the order the arrows step through them. */
export const DRAWERS = [
  { id: "ignaru", label: "Ignaru", art: "petal", color: "#9a4dea", ink: "#fff" },
  { id: "wayari", label: "Wayari", art: "ship-merge", color: "#1f7ae0", ink: "#fff" },
  { id: "bidframe", label: "Bidframe", art: "nav-blog", color: "#f5b400", ink: "#1d1600" },
  { id: "okara", label: "Okara", art: "canvas-dashboard", color: "#f0454f", ink: "#fff" },
  { id: "menufit", label: "MenuFit", art: "phone", color: "#f5b400", ink: "#1d1600", wide: true },
  { id: "ads", label: "Ads", art: "palette", color: "#f0454f", ink: "#fff" },
  { id: "sites", label: "Sites", art: "browser", color: "#f5b400", ink: "#1d1600", wide: true },
  { id: "book", label: "Book a call", art: "call", color: "#1f7ae0", ink: "#fff" },
] as const;

export type DrawerId = (typeof DRAWERS)[number]["id"];
export const drawerAt = (id: DrawerId) => DRAWERS.findIndex((d) => d.id === id);

/** Ask the drawers to open on one of them, from anywhere on the page (the felt row under the line). */
export const openDrawer = (id: DrawerId) => dispatchEvent(new CustomEvent("fh-open", { detail: id }));

export type Slot = {
  id: "products" | "work" | "sites" | "book";
  /** the drawer a click opens */
  opens: DrawerId;
  label: string;
  title: string;
  color: string;
  tilt: number;
  shapes: { src: string; alt: string }[];
};

export const SLOTS: Slot[] = [
  {
    id: "products",
    opens: "ignaru",
    label: "Products",
    title: "Products I've shipped",
    color: "#9a4dea",
    tilt: -7,
    shapes: [
      { src: "petal", alt: "A purple felt petal, the Ignaru mark" },
      { src: "claude", alt: "A purple felt asterisk" },
      { src: "openai", alt: "A purple felt knot" },
      { src: "gemini", alt: "A purple felt four-point star" },
      { src: "grok", alt: "A purple felt mark" },
    ],
  },
  {
    id: "work",
    opens: "okara",
    label: "Okara and MenuFit",
    title: "Where I work",
    color: "#f0454f",
    tilt: 5,
    shapes: [
      { src: "canvas-dashboard", alt: "A coral felt dashboard with a bar chart" },
      { src: "canvas-phone", alt: "A coral felt phone" },
      { src: "canvas", alt: "A coral felt browser window" },
      { src: "canvas-button", alt: "A coral felt button with an arrow" },
    ],
  },
  {
    id: "sites",
    opens: "sites",
    label: "Sites",
    title: "Sites for startups",
    color: "#f5b400",
    tilt: -3,
    shapes: [
      { src: "browser", alt: "A yellow felt browser window" },
      { src: "phone", alt: "A yellow felt phone" },
      { src: "poster", alt: "A yellow felt poster" },
    ],
  },
  {
    id: "book",
    opens: "book",
    label: "Book a call",
    title: "Build and ship with me",
    color: "#1f7ae0",
    tilt: 8,
    shapes: [
      { src: "code", alt: "Blue felt code brackets" },
      { src: "terminal", alt: "A blue felt terminal" },
      { src: "call", alt: "A blue felt calendar" },
    ],
  },
];

export type Site = { key: string; name: string; host: string; group: "Products" | "Pitch sites" | "Concepts" | "Templates"; line: string };

/** Every live site, newest work first within each group. Stills: public/sites/<key>.webp and <key>-tall.webp (three
 *  screens, scrolled through on hover), shot at 1440 on a box on 5 and 7 Nov 2026. */
export const SITES: Site[] = [
  { key: "ignaru", name: "Ignaru", host: "ignaru.com", group: "Products", line: "A design canvas that opens your repo. Circle what's wrong and your agent fixes it." },
  { key: "wayari", name: "Wayari", host: "wayari.com", group: "Products", line: "Coding agents that go from a prompt to a reviewed pull request." },
  { key: "ignura", name: "Ignura", host: "ignura.com", group: "Products", line: "My studio: bespoke websites for founders and brands." },
  { key: "rocquire", name: "Rocquire", host: "rocquire-concept.vercel.app", group: "Pitch sites", line: "A verified marketplace for buying whole Roblox games." },
  { key: "treg", name: "treg", host: "treg-pitch.vercel.app", group: "Pitch sites", line: "OpenRouter for agent tools: one key, 4,100+ endpoints, paid per call." },
  { key: "dobig", name: "Do Big Studios", host: "dobig-pitch.vercel.app", group: "Pitch sites", line: "They build, run and buy Roblox games millions play." },
  { key: "ropilot", name: "Ropilot", host: "ropilot-site.vercel.app", group: "Pitch sites", line: "Make Roblox games by asking: it writes, models and playtests." },
  { key: "jobbie", name: "Jobbie", host: "jobbie-hero.vercel.app", group: "Pitch sites", line: "Three rounds of a hero for Jobbie, from their site today to an engraved knight." },
  { key: "mercy", name: "Mercy", host: "mercy-perps.vercel.app", group: "Pitch sites", line: "Perps that pay back 25 to 100% of liquidated margin. A prototype." },
  { key: "fxpheno", name: "Pheno", host: "fxpheno-portfolio.vercel.app", group: "Pitch sites", line: "A portfolio for a video editor and motion designer." },
  { key: "coresrent", name: "CoresRent", host: "coresrent.vercel.app", group: "Pitch sites", line: "Fund real GPUs in verified data centres and earn rent every metered hour." },
  { key: "monid", name: "Monid", host: "monid-site.vercel.app", group: "Concepts", line: "A spec redesign for Monid, one key for every tool an agent needs. Not affiliated." },
  { key: "founders", name: "Founders School", host: "founders-school-concept.vercel.app", group: "Concepts", line: "A redesign concept for founders.school. Not affiliated." },
  { key: "paradev", name: "Paradev", host: "paradev-concept.vercel.app", group: "Concepts", line: "A design concept for paradev.com. Not affiliated." },
  { key: "hyperspell", name: "Hyperspell", host: "hyperspell-concept.vercel.app", group: "Concepts", line: "A redesign concept for hyperspell.com. Not affiliated." },
  { key: "varick", name: "Varick Agents", host: "varick-concept.vercel.app", group: "Concepts", line: "A redesign concept for Varick Agents. Not affiliated." },
  { key: "lune", name: "Lune", host: "lune-template.vercel.app", group: "Templates", line: "A jewellery shop, with a bag, an engraving preview and a gallery." },
  { key: "ruled", name: "Ruled", host: "ruled-template.vercel.app", group: "Templates", line: "An AI bookkeeper for small businesses." },
  { key: "tavola", name: "Tavola", host: "tavola-template.vercel.app", group: "Templates", line: "A trattoria and wine bar on a London street." },
  { key: "parade", name: "Parade", host: "parade-template.vercel.app", group: "Templates", line: "A studio for launch films and short-form video." },
];

/** MenuFit's screens, rendered one by one from menufit-screens.vercel.app (390 by 844, light and dark). */
export const MENUFIT = {
  core: [
    { key: "today", name: "Today" },
    { key: "meal", name: "Meal" },
    { key: "lunch-logged", name: "Lunch logged" },
    { key: "counter-card", name: "Counter card" },
    { key: "nearby", name: "Nearby" },
    { key: "hacks", name: "Hacks" },
    { key: "log-a-meal", name: "Log a meal" },
    { key: "your-week", name: "Your week" },
  ],
  states: [
    { key: "loading", name: "Loading" },
    { key: "no-hacks-nearby", name: "No hacks nearby" },
    { key: "location-off", name: "Location off" },
  ],
};

/** Spec ads: made to show a company what I'd do, never sent as their work. Lines from the company's own site. */
export const ADS = [
  { key: "devin-night-shift", alt: "You log off. Devin doesn't. A grid of hours: your green squares stop at 6pm, Devin's blue ones fill the night." },
  { key: "devin-out-of-office", alt: "Out of office until Monday. For anything urgent, @Devin. A Slack thread where Devin fixes a bug." },
  { key: "devin-boarding-pass", alt: "Your backlog is now boarding. A boarding pass from Problem to Merged PR." },
  { key: "devin-wontfix", alt: "Remember wontfix? An old issue where Devin removes the wontfix label and merges the fix." },
  { key: "devin-laptop-closed", alt: "Laptop closed. Devin keeps working. Devin's sessions list, one at 56 hours." },
  { key: "devin-merged-pr", alt: "From problem to merged PR. Devin's pull request card for enterprise SSO, with its test recording." },
  // Gojiberry and Context.dev drop in here, as { key: "gojiberry-…" } and { key: "contextdev-…" } with their stills in
  // public/ads, once those pitches have been sent. They are not public yet (Claude outputs/ads/gojiberry, contextdev).
] as const;
