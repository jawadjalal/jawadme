// Every project on the site, one typed record each. /work, /work/<slug>, the home page, the sitemap, the OG cards,
// the JSON-LD and /llms.txt all read from here. Ad campaigns are built from the ad curation in ads.ts, so a new
// curation changes the ad case studies too.
//
// Rules: at most three short lines per project, true facts only. Spec work says so.

import sizes from "./feed-sizes.json";
import { adsOf } from "./ads";

export type Lane = "ads" | "brand-web" | "3d" | "roblox";
export const LANES: { key: Lane; label: string }[] = [
  { key: "ads", label: "ads" },
  { key: "brand-web", label: "brand & web" },
  { key: "3d", label: "3d" },
  { key: "roblox", label: "roblox" },
];

export type Media = { src: string; w: number; h: number; alt: string; loop?: string; seq?: { base: string; frames: number }; tone?: "ink" | "paper" };
export type Block =
  | { kind: "full"; media: Media }
  | { kind: "pair"; media: [Media, Media] }
  | { kind: "inset"; media: Media }
  | { kind: "grid"; media: Media[] }
  | { kind: "sequence"; media: Media };

export type Beat = "build";
export type Project = {
  slug: string;
  name: string;
  year: number;
  lane: Lane;
  disciplines: string[];
  client?: string;
  link?: { href: string; label: string };
  spec?: boolean;
  lines: [string] | [string, string] | [string, string, string];
  /** the beat each line tells on the case page, in the same order; a line left out carries no label */
  beats?: Beat[];
  cover: Media;
  /** the case page's first picture when it isn't the cover: a still cut from a screenshot (scripts/case-cuts.mjs) */
  lead?: Media;
  blocks: Block[];
};

const fd = (file: string, alt: string): Media => {
  const [w, h] = (sizes as Record<string, number[]>)[file];
  return { src: `/work/2026-11/${file}.webp`, w, h, alt };
};
const m = (src: string, w: number, h: number, alt: string, tone?: Media["tone"]): Media => ({ src, w, h, alt, tone });

const campaign = (slug: string, name: string, year: number, lines: Project["lines"], disciplines = ["ad campaign", "art direction"]): Project => {
  const ads = adsOf(name).map((a) => ({ src: a.src, w: a.w, h: a.h, alt: a.alt }));
  return {
    slug,
    name,
    year,
    lane: "ads",
    disciplines,
    spec: true,
    lines,
    cover: ads[0],
    blocks: [
      ...(ads.length === 2 ? [{ kind: "inset" as const, media: ads[1] }] : []),
      ...(ads.length > 2 ? [{ kind: "pair" as const, media: [ads[1], ads[2]] as [Media, Media] }] : []),
      ...(ads.length > 3 ? [{ kind: "grid" as const, media: ads.slice(3) }] : []),
    ],
  };
};

const PROJECTS_ALL: Project[] = [
  {
    slug: "ignaru",
    name: "ignaru",
    year: 2026,
    lane: "brand-web",
    disciplines: ["product design", "brand", "website", "engineering"],
    link: { href: "https://ignaru.com", label: "ignaru.com" },
    lines: ["design tool.", "circle what's wrong on the canvas. your coding agent fixes it in your files."],
    beats: ["build"],
    cover: { ...m("/work/case/ignaru-live-1.webp", 1920, 1200, "ignaru.com today: agentic design that sells, over a grid of ads made in it", "ink"), loop: "/work/case/ignaru-scroll.mp4" },
    lead: m("/work/case/cut/ignaru-lead.webp", 1346, 722, "ignaru.com today: agentic design that sells, over a row of ads made in it", "ink"),
    blocks: [
      { kind: "full", media: fd("ignaru-canvas-ads", "the ignaru canvas: an ad set laid out as frames, layers on the left, the composer at the foot") },
      { kind: "pair", media: [m("/work/case/cut/ignaru-composer.webp", 742, 685, "the ignaru composer with its model menu open"), m("/work/case/cut/ignaru-palette.webp", 748, 690, "the ignaru command palette")] },
      { kind: "full", media: m("/work/case/cut/ignaru-board.webp", 1346, 432, "one page in ignaru 0.3.0: the brand, the ads, a part and the reel, each in its own group", "ink") },
      { kind: "pair", media: [m("/work/case/cut/ignaru-changes.webp", 666, 512, "ignaru's changes panel: two files and a commit message"), m("/work/case/cut/ignaru-share.webp", 596, 463, "ignaru's share sheet")] },
      { kind: "inset", media: m("/work/case/cut/ignaru-table.webp", 744, 495, "the ignaru canvas zoomed into one frame, the table") },
    ],
  },
  {
    slug: "ignura-seo",
    name: "ignura studio seo",
    year: 2026,
    lane: "brand-web",
    disciplines: ["brand", "website", "illustration"],
    lines: ["the site from the ai-native seo and geo days.", "pipes, balls and one question: does ai name your company?"],
    beats: ["build"],
    cover: { ...m("/work/case/seo-named.webp", 1920, 1200, "does ai name your company? the seo and geo landing, october 2026"), loop: "/work/case/seo-scroll.mp4" },
    blocks: [
      { kind: "full", media: m("/work/case/seo-climb.webp", 1920, 1200, "climb google and ai chats: the hero with its pipe and ball machine") },
      { kind: "pair", media: [m("/work/case/seo-named-m.webp", 900, 1948, "the landing on a phone"), m("/work/case/seo-climb-m.webp", 900, 1948, "the later hero on a phone")] },
      { kind: "full", media: m("/work/case/seo-build.webp", 1920, 1200, "build it, run it: the dark section with its 3d objects") },
      { kind: "pair", media: [m("/work/case/seo-find.webp", 1920, 1200, "find: your company, then every gap"), m("/work/case/seo-run.webp", 1920, 1200, "run: nothing goes out without your yes")] },
      { kind: "inset", media: m("/work/case/seo-hand.webp", 1920, 1200, "you could do this by hand. or let it ask.") },
      { kind: "full", media: m("/work/case/seo-measure.webp", 1920, 1200, "find: the weekly measure, 20 buyer questions asked every week") },
    ],
  },
  {
    slug: "ignura",
    name: "ignura studio",
    year: 2026,
    lane: "brand-web",
    disciplines: ["brand", "website"],
    link: { href: "https://ignura.com", label: "ignura.com" },
    lines: ["my ad and brand studio's site: ads and brands people stop for."],
    beats: ["build"],
    cover: fd("ignura-home", "the ignura home page beside a wall of its ads"),
    blocks: [{ kind: "inset", media: fd("ignura-phone", "the ignura home page on a phone") }],
  },
  {
    slug: "coresrent",
    name: "coresrent",
    year: 2026,
    lane: "brand-web",
    client: "coresrent",
    disciplines: ["website", "webgl"],
    link: { href: "https://coresrent.vercel.app", label: "coresrent.vercel.app" },
    lines: ["fund real gpus in verified data centres and earn rent every metered hour."],
    beats: ["build"],
    cover: m("/showcase/coresrent-1440.webp", 1440, 900, "coresrent, the first screen with its webgl scene"),
    blocks: [{ kind: "pair", media: [m("/work/coresrent.webp", 1600, 1000, "coresrent home page"), m("/work/coresrent-m.webp", 780, 1688, "coresrent on a phone")] }],
  },
  campaign("shown-media", "shown media", 2026, ["one mark, every screen it could be shown on."]),
  campaign("palantir", "palantir", 2026, ["the mark, made by a ship and its crew."]),
  campaign("whop", "whop", 2026, ["the new economy, painted, printed and flown."]),
  campaign("outpace", "outpace", 2026, ["their orange as a running track, wherever it fits."]),
  {
    slug: "derelict-depths",
    name: "fracture",
    year: 2026,
    lane: "roblox",
    disciplines: ["game design", "3d", "ui", "engineering"],
    link: { href: "/derelictdepths", label: "jawadjalal.com/derelictdepths" },
    lines: ["a roblox mining game i design and build, formerly derelict depths.", "68 ores, six floors, one mole king."],
    beats: ["build"],
    cover: m("/work/fracture/mole-king.webp", 1920, 1080, "fracture key art: a miner swings at the armoured mole king in a torchlit hall", "ink"),
    blocks: [
      { kind: "full", media: m("/work/fracture/strike.webp", 1920, 1080, "fracture key art: a miner splits a gold vein, sparks and ore flying", "ink") },
      { kind: "pair", media: [m("/work/fracture/crew.webp", 1920, 1080, "fracture key art: two miners face a mole bursting out of the floor", "ink"), m("/work/fracture/shaft.webp", 1920, 1080, "fracture key art: a miner dives down a shaft past crystals and lava", "ink")] },
    ],
  },
];

/** campaigns with no ads in the current curation drop out */
export const PROJECTS = PROJECTS_ALL.filter((p) => p.lane !== "ads" || p.cover);
export const REAL = PROJECTS;
export const projectBySlug = (slug: string) => REAL.find((p) => p.slug === slug);
export const nextOf = (p: Project) => REAL[(REAL.indexOf(p) + 1) % REAL.length];
export const laneLabel = (l: Lane) => LANES.find((x) => x.key === l)!.label;

/** home, selected work: the order Jawad can change */
export const SELECTED = ["ignaru", "coresrent", "ignura-seo", "ignura"]
  .map((s) => projectBySlug(s))
  .filter((p): p is Project => Boolean(p));
