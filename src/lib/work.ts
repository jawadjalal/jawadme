// The sketchbook: every site on the work board. Ignaru and Ignura are pinned
// first, the rest run newest first. Facts only: each line comes from the
// project's own page, repo or memory of the build, and each date is the day
// its Vercel project was created.

export type Work = {
  key: string;
  name: string;
  /** Left out for work that is not public, which shows as a still only. */
  url?: string;
  host: string;
  /** 1600px first-screen still, under /public/work */
  still: string;
  /** 780px phone still, shown inset on the big cards */
  phone?: string;
  line: string;
  tag?: "mine" | "concept" | "client" | "template";
  date?: string;
  pos?: string;
  pinned?: boolean;
};

const w = (key: string, o: Omit<Work, "key" | "still" | "phone">): Work => ({
  key,
  still: `/work/${key}.webp`,
  phone: key === "splittingpoint" ? undefined : `/work/${key}-m.webp`,
  ...o,
});

export const WORK: Work[] = [
  w("ignaru", {
    name: "ignaru",
    url: "https://ignaru.com",
    host: "ignaru.com",
    line: "My design tool. A canvas that opens the repo you already have: circle what's wrong and Claude Code, Codex or Cursor fixes it in your files.",
    tag: "mine",
    date: "2026-10-15",
    pinned: true,
  }),
  w("ignura", {
    name: "ignura",
    url: "https://ignura.com",
    host: "ignura.com",
    line: "My studio. Custom websites designed and built from scratch, with launch pages live in a week.",
    tag: "mine",
    date: "2026-10-03",
    pinned: true,
  }),
  w("varick", {
    name: "varick",
    url: "https://varick-concept.vercel.app",
    host: "varick-concept.vercel.app",
    line: "A redesign concept for Varick Agents, enterprise AI agents. Not affiliated.",
    tag: "concept",
    date: "2026-11-04",
  }),
  w("rocquire", {
    name: "rocquire",
    host: "rocquire concept",
    line: "Concept landing for Rocquire, a marketplace for whole Roblox games. Private for now, so here's the still.",
    tag: "concept",
    date: "2026-11-03",
  }),
  w("hyperspell", {
    name: "hyperspell",
    url: "https://hyperspell-concept.vercel.app",
    host: "hyperspell-concept.vercel.app",
    line: "A redesign concept for hyperspell.com, a brain for your company. Not affiliated.",
    tag: "concept",
    date: "2026-11-03",
  }),
  w("treg", {
    name: "treg",
    url: "https://treg-pitch.vercel.app",
    host: "treg-pitch.vercel.app",
    line: "Pitch site for treg, OpenRouter for agent tools: one key, 4,100+ endpoints, paid per call.",
    tag: "concept",
    date: "2026-11-02",
  }),
  w("fxpheno", {
    name: "pheno",
    url: "https://fxpheno-portfolio.vercel.app",
    host: "fxpheno-portfolio.vercel.app",
    line: "A portfolio for Pheno, a video editor and motion designer.",
    date: "2026-11-02",
  }),
  w("ropilot", {
    name: "ropilot",
    url: "https://ropilot-site.vercel.app",
    host: "ropilot-site.vercel.app",
    line: "Mockup for Ropilot Studio, which writes the Luau, models in Blender and playtests inside Roblox Studio.",
    tag: "concept",
    date: "2026-11-01",
  }),
  w("dobig", {
    name: "do big",
    url: "https://dobig-pitch.vercel.app",
    host: "dobig-pitch.vercel.app",
    line: "Pitch site for Do Big Studios, who build, run and buy Roblox games.",
    tag: "concept",
    date: "2026-10-31",
  }),
  w("lune", {
    name: "lune",
    url: "https://lune-template.vercel.app",
    host: "lune-template.vercel.app",
    line: "A jewellery shop template in Astro, with a bag, an engraving preview and a gallery.",
    tag: "template",
    date: "2026-10-30",
  }),
  w("ruled", {
    name: "ruled",
    url: "https://ruled-template.vercel.app",
    host: "ruled-template.vercel.app",
    line: "A launch template for one software product, one plan and one sign-up.",
    tag: "template",
    date: "2026-10-30",
  }),
  w("parade", {
    name: "parade",
    url: "https://parade-template.vercel.app",
    host: "parade-template.vercel.app",
    line: "A template for a video and marketing studio: launch films, social content, campaigns.",
    tag: "template",
    date: "2026-10-30",
  }),
  w("tavola", {
    name: "tavola",
    url: "https://tavola-template.vercel.app",
    host: "tavola-template.vercel.app",
    line: "A template for a neighbourhood trattoria, wine bar or cafe.",
    tag: "template",
    date: "2026-10-30",
  }),
  w("jobbie-cloud", {
    name: "jobbie, cloudline",
    url: "https://jobbie-hero.vercel.app/cloud.html",
    host: "jobbie-hero.vercel.app/cloud.html",
    line: "A hero for Jobbie: upload your resume once and wake up to interviews.",
    tag: "concept",
    date: "2026-10-28",
  }),
  w("jobbie", {
    name: "jobbie, three rounds",
    url: "https://jobbie-hero.vercel.app",
    host: "jobbie-hero.vercel.app",
    line: "Three rounds of the Jobbie hero, from their site today to an engraved knight.",
    tag: "concept",
    date: "2026-10-28",
  }),
  w("mercy", {
    name: "mercy",
    url: "https://mercy-perps.vercel.app",
    host: "mercy-perps.vercel.app",
    line: "A perps trading front-end that pays back 25 to 100% of liquidated margin in USDC.",
    tag: "client",
    date: "2026-10-25",
  }),
  w("coresrent", {
    name: "coresrent",
    url: "https://coresrent.vercel.app",
    host: "coresrent.vercel.app",
    line: "Fund real GPUs in verified data centres and earn rent every metered hour. Next.js and WebGL scenes.",
    tag: "client",
    date: "2026-09-27",
  }),
  w("heyclicky", {
    name: "clicky graph",
    url: "/heyclicky",
    host: "jawadjalal.com/heyclicky",
    line: "A graph demo for heyclicky.com, on a renderer I wrote by hand.",
    tag: "concept",
    date: "2026-09-20",
  }),
  w("splittingpoint", {
    name: "splitting point",
    url: "https://splittingpoint.com",
    host: "splittingpoint.com",
    line: "A landing page build for Splitting Point.",
    date: "2026-07-19",
  }),
];
