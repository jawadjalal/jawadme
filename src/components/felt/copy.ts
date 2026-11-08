// The words and art for the felt home (src/app/page.tsx), after ignaru.com: a ring of felt doors around one line, and
// a drawer behind each door. Every drawer is one thing Jawad has made or done. Art: public/felt (transparent squares,
// 320 and 640 wide; the ship-*, onb-*, circle*, more-*, nav-* and yarn pieces come from ignaru.com's set). Stills:
// public/sites, public/okara, public/menufit, public/ads.
//
// Facts only. Each number here was read from a live page or a repo on 7 Nov 2026; the source sits beside it.

export const BOOK = "https://cal.com/jawad-jalal-hesqbk/intro-call-with-ignura";
export const EMAIL = "hijawadjalal@gmail.com";
export const CV = "/jawad-jalal-cv.pdf";

/** The line in the ring's centre: who, then what. The break falls after the first sentence where there is room. */
export const LINE = ["I'm Jawad, a design engineer.", "I build Ignaru, and sites for startups."] as const;

export const feltSrc = (name: string) => ({
  src: `/felt/${name}-1x.webp`,
  srcSet: `/felt/${name}-1x.webp 320w, /felt/${name}.webp 640w`,
});

/**
 * Every door on the ring, in the order the turn passes along it and the drawer arrows step through it. `art` is the
 * door's own felt piece (first paint), `set` the pieces it changes between, `line` what the ring's centre says while
 * it is the door's turn or under the pointer (under 60 characters).
 */
export const DRAWERS = [
  { id: "ignaru", label: "Ignaru", art: "petal", set: ["petal", "claude", "openai", "gemini", "grok"], color: "#9a4dea", alt: "A purple felt petal, the Ignaru mark", line: "" },
  { id: "wayari", label: "Wayari", art: "ship-merge", set: ["ship-merge", "ship-branch", "ship"], color: "#1f7ae0", alt: "A blue felt merge arrow", line: "Wayari takes a prompt to a reviewed pull request." },
  { id: "okara", label: "Okara", art: "canvas-dashboard", set: ["canvas-dashboard", "canvas-button", "canvas"], color: "#f0454f", alt: "A coral felt dashboard", line: "Okara took me on after I pulled its dashboard apart." },
  { id: "menufit", label: "MenuFit", art: "phone", set: ["phone", "poster", "canvas-phone"], color: "#f5b400", alt: "A yellow felt phone", line: "I design MenuFit's screens, for 1.5 million people." }, // profile.ts: "1.5m users"
  { id: "bidframe", label: "Bidframe", art: "onb-check", set: ["onb-check", "circle", "nav-blog"], color: "#3fae63", alt: "A green felt tick", line: "Bidframe finds the clause that loses the bid." },
  { id: "ads", label: "Ads", art: "palette", set: ["palette", "bezier", "pen"], color: "#f0454f", alt: "A coral felt palette", line: "Spec ads for Devin: one line, one picture each." },
  { id: "bevel", label: "Bevel", art: "more-shader", set: ["more-shader", "yarn", "circle-cursor"], color: "#7a5cf0", alt: "A marbled felt ball", line: "Bevel is my 3D art team for game studios." },
  { id: "sites", label: "Sites", art: "browser", set: ["browser", "canvas", "poster"], color: "#f5b400", alt: "A yellow felt browser window", line: "20 live sites I designed and built." },
  { id: "about", label: "About", art: "nav-about", set: ["nav-about", "onb-wave", "onb-spark"], color: "#9a4dea", alt: "A purple felt speech bubble with an i", line: "Design engineer in London. I founded Ignura and Bevel." },
  { id: "book", label: "Book a call", art: "call", set: ["call", "circle-comment", "more-team"], color: "#1f7ae0", alt: "A blue felt calendar", line: "Fifteen minutes about your launch. No prep needed." },
] as const;

export type DrawerId = (typeof DRAWERS)[number]["id"];
export const drawerAt = (id: DrawerId) => DRAWERS.findIndex((d) => d.id === id);

/** Ask the page to open one drawer, from anywhere (the bar, the "more" sheet, a link inside another drawer). */
export const openDrawer = (id: DrawerId) => dispatchEvent(new CustomEvent("fh-open", { detail: id }));

/** The bar's three links, each with its small felt mark, after ignaru.com's: two open drawers, the blog is a page. */
export const NAV = [
  { id: "sites", label: "Work", art: "browser", href: "/#sites" },
  { id: "about", label: "About", art: "nav-about", href: "/#about" },
  { id: "blog", label: "Blog", art: "nav-blog", href: "/blog" },
] as const;

/** A lifted shade of a door's colour, for type and small marks on the dark drawer. */
export const lift = (hex: string) => `color-mix(in oklab, ${hex} 72%, #fff)`;

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
  { key: "devin-laptop-closed", alt: "Laptop closed. Devin keeps working. Devin's sessions list." },
  { key: "devin-merged-pr", alt: "From problem to merged PR. Devin's pull request card for enterprise SSO, with its test recording." },
  // Gojiberry and Context.dev drop in here, as { key: "gojiberry-…" } and { key: "contextdev-…" } with their stills in
  // public/ads, once those pitches have been sent. They are not public yet (Claude outputs/ads/gojiberry, contextdev).
] as const;
