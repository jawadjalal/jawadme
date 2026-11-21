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
    line: "my design tool. a canvas that opens the repo you already have: circle what's wrong and claude code, codex or cursor fixes it in your files.",
    tag: "mine",
    date: "2026-10-15",
    pinned: true,
  }),
  w("ignura", {
    name: "ignura",
    url: "https://ignura.com",
    host: "ignura.com",
    line: "my studio. custom websites designed and built from scratch, with launch pages live in a week.",
    tag: "mine",
    date: "2026-10-03",
    pinned: true,
  }),
  w("varick", {
    name: "varick",
    url: "https://varick-concept.vercel.app",
    host: "varick-concept.vercel.app",
    line: "a redesign concept for varick agents, enterprise ai agents. not affiliated.",
    tag: "concept",
    date: "2026-11-04",
  }),
  w("rocquire", {
    name: "rocquire",
    host: "rocquire concept",
    line: "concept landing for rocquire, a marketplace for whole roblox games. private for now, so here's the still.",
    tag: "concept",
    date: "2026-11-03",
  }),
  w("hyperspell", {
    name: "hyperspell",
    url: "https://hyperspell-concept.vercel.app",
    host: "hyperspell-concept.vercel.app",
    line: "a redesign concept for hyperspell.com, a brain for your company. not affiliated.",
    tag: "concept",
    date: "2026-11-03",
  }),
  w("treg", {
    name: "treg",
    url: "https://treg-pitch.vercel.app",
    host: "treg-pitch.vercel.app",
    line: "pitch site for treg, openrouter for agent tools: one key, 4,100+ endpoints, paid per call.",
    tag: "concept",
    date: "2026-11-02",
  }),
  w("fxpheno", {
    name: "pheno",
    url: "https://fxpheno-portfolio.vercel.app",
    host: "fxpheno-portfolio.vercel.app",
    line: "a portfolio for pheno, a video editor and motion designer.",
    date: "2026-11-02",
  }),
  w("ropilot", {
    name: "ropilot",
    url: "https://ropilot-site.vercel.app",
    host: "ropilot-site.vercel.app",
    line: "mockup for ropilot studio, which writes the luau, models in blender and playtests inside roblox studio.",
    tag: "concept",
    date: "2026-11-01",
  }),
  w("dobig", {
    name: "do big",
    url: "https://dobig-pitch.vercel.app",
    host: "dobig-pitch.vercel.app",
    line: "pitch site for do big studios, who build, run and buy roblox games.",
    tag: "concept",
    date: "2026-10-31",
  }),
  w("lune", {
    name: "lune",
    url: "https://lune-template.vercel.app",
    host: "lune-template.vercel.app",
    line: "a jewellery shop template in astro, with a bag, an engraving preview and a gallery.",
    tag: "template",
    date: "2026-10-30",
  }),
  w("ruled", {
    name: "ruled",
    url: "https://ruled-template.vercel.app",
    host: "ruled-template.vercel.app",
    line: "a launch template for one software product, one plan and one sign-up.",
    tag: "template",
    date: "2026-10-30",
  }),
  w("parade", {
    name: "parade",
    url: "https://parade-template.vercel.app",
    host: "parade-template.vercel.app",
    line: "a template for a video and marketing studio: launch films, social content, campaigns.",
    tag: "template",
    date: "2026-10-30",
  }),
  w("tavola", {
    name: "tavola",
    url: "https://tavola-template.vercel.app",
    host: "tavola-template.vercel.app",
    line: "a template for a neighbourhood trattoria, wine bar or cafe.",
    tag: "template",
    date: "2026-10-30",
  }),
  w("jobbie-cloud", {
    name: "jobbie, cloudline",
    url: "https://jobbie-hero.vercel.app/cloud.html",
    host: "jobbie-hero.vercel.app/cloud.html",
    line: "a hero for jobbie: upload your resume once and wake up to interviews.",
    tag: "concept",
    date: "2026-10-28",
  }),
  w("jobbie", {
    name: "jobbie, three rounds",
    url: "https://jobbie-hero.vercel.app",
    host: "jobbie-hero.vercel.app",
    line: "three rounds of the jobbie hero, from their site today to an engraved knight.",
    tag: "concept",
    date: "2026-10-28",
  }),
  w("mercy", {
    name: "mercy",
    url: "https://mercy-perps.vercel.app",
    host: "mercy-perps.vercel.app",
    line: "a perps trading front-end that pays back 25 to 100% of liquidated margin in usdc.",
    tag: "client",
    date: "2026-10-25",
  }),
  w("menufit", {
    name: "menufit screens",
    url: "https://menufit-screens.vercel.app",
    host: "menufit-screens.vercel.app",
    line: "menufit's meal screens, in light and dark.",
    tag: "client",
    date: "2026-10-23",
  }),
  w("coresrent", {
    name: "coresrent",
    url: "https://coresrent.vercel.app",
    host: "coresrent.vercel.app",
    line: "fund real gpus in verified data centres and earn rent every metered hour. next.js and webgl scenes.",
    tag: "client",
    date: "2026-09-27",
  }),
  w("heyclicky", {
    name: "clicky graph",
    url: "/heyclicky",
    host: "jawadjalal.com/heyclicky",
    line: "a graph demo for heyclicky.com, on a renderer i wrote by hand.",
    tag: "concept",
    date: "2026-09-20",
  }),
  w("splittingpoint", {
    name: "splitting point",
    url: "https://splittingpoint.com",
    host: "splittingpoint.com",
    line: "a landing page build for splitting point.",
    date: "2026-07-19",
  }),
];
