// Every project on the site, one typed record each. /work, /work/<slug>, the home page, the sitemap, the OG cards,
// the JSON-LD and /llms.txt all read from here. Ad campaigns are built from the ad curation in ads.ts, so a new
// curation changes the ad case studies too.
//
// Rules: at most three short lines per project, true facts only. Spec work says so. A placeholder is a lane slot
// waiting for Jawad's media: it shows as a marked card and has no page.

import sizes from "./feed-sizes.json";
import { adsOf } from "./ads";

export type Lane = "ads" | "brand-web" | "3d" | "roblox";
export const LANES: { key: Lane; label: string }[] = [
  { key: "ads", label: "Ads" },
  { key: "brand-web", label: "Brand & Web" },
  { key: "3d", label: "3D" },
  { key: "roblox", label: "Roblox" },
];

export type Media = { src: string; w: number; h: number; alt: string; loop?: string; seq?: { base: string; frames: number }; tone?: "ink" | "paper" };
export type Block =
  | { kind: "full"; media: Media }
  | { kind: "pair"; media: [Media, Media] }
  | { kind: "inset"; media: Media }
  | { kind: "grid"; media: Media[] }
  | { kind: "sequence"; media: Media };

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
  cover: Media;
  blocks: Block[];
  /** a lane slot waiting for media: a marked card, no page */
  placeholder?: string;
};

const fd = (file: string, alt: string): Media => {
  const [w, h] = (sizes as Record<string, number[]>)[file];
  return { src: `/work/2026-11/${file}.webp`, w, h, alt };
};
const m = (src: string, w: number, h: number, alt: string, tone?: Media["tone"]): Media => ({ src, w, h, alt, tone });

const campaign = (slug: string, name: string, year: number, lines: Project["lines"], disciplines = ["Ad campaign", "Art direction"]): Project => {
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
    slug: "menufit",
    name: "MenuFit",
    year: 2026,
    lane: "brand-web",
    client: "MenuFit",
    disciplines: ["Product design", "App screens"],
    link: { href: "https://menufit.com", label: "menufit.com" },
    lines: ["Designed for 1.5M users.", "The app for eating out healthy, light and dark."],
    cover: m("/showcase/menufit-screens-1440.webp", 1440, 900, "MenuFit app screens for eating out healthy, light and dark"),
    blocks: [
      { kind: "grid", media: [
        m("/menufit/today-light.webp", 540, 1169, "MenuFit, the Today screen in light"),
        m("/menufit/meal-dark.webp", 540, 1169, "MenuFit, a meal in dark"),
        m("/menufit/nearby-light.webp", 540, 1169, "MenuFit, healthy picks nearby"),
      ] },
      { kind: "full", media: m("/design/menufit.webp", 1470, 800, "MenuFit screens laid out side by side") },
      { kind: "grid", media: [
        m("/menufit/log-a-meal-dark.webp", 540, 1169, "MenuFit, logging a meal in dark"),
        m("/menufit/your-week-light.webp", 540, 1169, "MenuFit, your week in light"),
        m("/menufit/the-hack-dark.webp", 540, 1169, "MenuFit, the order hack in dark"),
      ] },
    ],
  },
  {
    slug: "ignaru",
    name: "Ignaru",
    year: 2026,
    lane: "brand-web",
    disciplines: ["Product design", "Brand", "Website", "Engineering"],
    link: { href: "https://ignaru.com", label: "ignaru.com" },
    lines: ["My design tool.", "Circle what's wrong on the canvas. Your coding agent fixes it in your files."],
    cover: { ...m("/work/case/ignaru-live-1.webp", 1920, 1200, "ignaru.com today: agentic design that sells, over a grid of ads made in it", "ink"), loop: "/work/case/ignaru-scroll.mp4" },
    blocks: [
      { kind: "full", media: fd("ignaru-canvas-ads", "The Ignaru canvas: an ad set laid out as frames, layers on the left, the composer at the foot") },
      { kind: "grid", media: [
        fd("ignaru-app-composer", "The Ignaru composer with its model menu open"),
        fd("ignaru-app-palette", "The Ignaru command palette"),
        fd("ignaru-app-agent", "Ignaru's start-an-agent sheet"),
      ] },
      { kind: "full", media: m("/work/case/ignaru-live-5.webp", 1920, 1200, "ignaru.com: design the brand on one canvas", "ink") },
      { kind: "pair", media: [fd("ignaru-app-changes", "Ignaru's changes panel: two files, a commit message and the diff"), fd("ignaru-app-share", "Ignaru's share sheet")] },
      { kind: "inset", media: fd("ignaru-canvas-zoom", "The Ignaru canvas zoomed into one ad") },
    ],
  },
  {
    slug: "ignura-seo",
    name: "Ignura SEO",
    year: 2026,
    lane: "brand-web",
    disciplines: ["Brand", "Website", "Illustration"],
    lines: ["The site from the AI-native SEO and GEO days.", "Pipes, balls and one question: does AI name your company?"],
    cover: { ...m("/work/case/seo-named.webp", 1920, 1200, "Does AI name your company? The SEO and GEO landing, October 2026"), loop: "/work/case/seo-scroll.mp4" },
    blocks: [
      { kind: "full", media: m("/work/case/seo-climb.webp", 1920, 1200, "Climb Google and AI chats: the hero with its pipe and ball machine") },
      { kind: "pair", media: [m("/work/case/seo-named-m.webp", 900, 1948, "The landing on a phone"), m("/work/case/seo-climb-m.webp", 900, 1948, "The later hero on a phone")] },
      { kind: "full", media: m("/work/case/seo-build.webp", 1920, 1200, "Build it, run it: the dark section with its 3D objects") },
      { kind: "pair", media: [m("/work/case/seo-find.webp", 1920, 1200, "Find: your company, then every gap"), m("/work/case/seo-run.webp", 1920, 1200, "Run: nothing goes out without your yes")] },
      { kind: "inset", media: m("/work/case/seo-hand.webp", 1920, 1200, "You could do this by hand. Or let it ask.") },
      { kind: "full", media: m("/work/case/seo-measure.webp", 1920, 1200, "Find: the weekly measure, 20 buyer questions asked every week") },
    ],
  },
  {
    slug: "ignura",
    name: "Ignura",
    year: 2026,
    lane: "brand-web",
    disciplines: ["Brand", "Website"],
    link: { href: "https://ignura.com", label: "ignura.com" },
    lines: ["My ad and brand studio's site: ads and brands people stop for."],
    cover: fd("ignura-home", "The Ignura home page beside a wall of its ads"),
    blocks: [{ kind: "inset", media: fd("ignura-phone", "The Ignura home page on a phone") }],
  },
  {
    slug: "okara",
    name: "Okara",
    year: 2026,
    lane: "brand-web",
    client: "Okara",
    disciplines: ["Product design"],
    lines: ["Product design for an AI CMO.", "Its launch film did 14M views on X in a day."],
    cover: m("/okara/credits.webp", 1200, 750, "Okara, the credits screen"),
    blocks: [{ kind: "pair", media: [m("/okara/feed.webp", 800, 1127, "Okara, the feed"), m("/okara/morning.webp", 1200, 749, "Okara, the morning brief")] }],
  },
  {
    slug: "coresrent",
    name: "CoresRent",
    year: 2026,
    lane: "brand-web",
    client: "CoresRent",
    disciplines: ["Website", "WebGL"],
    link: { href: "https://coresrent.vercel.app", label: "coresrent.vercel.app" },
    lines: ["Fund real GPUs in verified data centres and earn rent every metered hour."],
    cover: m("/showcase/coresrent-1440.webp", 1440, 900, "CoresRent, the first screen with its WebGL scene"),
    blocks: [{ kind: "pair", media: [m("/work/coresrent.webp", 1600, 1000, "CoresRent home page"), m("/work/coresrent-m.webp", 780, 1688, "CoresRent on a phone")] }],
  },
  campaign("shown-media", "Shown Media", 2026, ["One mark, every screen it could be shown on."]),
  campaign("palantir", "Palantir", 2026, ["The mark, made by a ship and its crew."]),
  campaign("whop", "Whop", 2026, ["The new economy, painted, printed and flown."]),
  campaign("outpace", "Outpace", 2026, ["Their orange as a running track, wherever it fits."]),
  {
    slug: "derelict-depths",
    name: "Derelict Depths",
    year: 2026,
    lane: "roblox",
    disciplines: ["Game design", "3D", "UI", "Engineering"],
    link: { href: "/derelictdepths", label: "jawadjalal.com/derelictdepths" },
    lines: ["A Roblox mining game I design and build.", "68 ores, six floors, one Mole King."],
    cover: m("/derelictdepths/img/poster-1280.jpg", 1280, 720, "Derelict Depths release art", "ink"),
    blocks: [
      { kind: "pair", media: [m("/derelictdepths/img/mole-king-1280.jpg", 1280, 720, "The Mole King", "ink"), m("/derelictdepths/img/ore-room-1280.jpg", 1280, 720, "An ore room", "ink")] },
      { kind: "full", media: m("/derelictdepths/img/town-1280.jpg", 1280, 720, "The town above the mine", "ink") },
      { kind: "inset", media: m("/derelictdepths/img/look-king-front-1280.jpg", 1280, 873, "The Mole King model, front", "ink") },
      { kind: "pair", media: [m("/derelictdepths/img/smeltery-1280.jpg", 1280, 720, "The smeltery", "ink"), m("/derelictdepths/img/thumb-king-1280.jpg", 1280, 720, "Thumbnail art: the king", "ink")] },
    ],
  },
  placeholderOf("3d-turntable-01", "3D piece 01", "3d", "Awaiting Jawad's renders or turntable (A5)"),
  placeholderOf("3d-turntable-02", "3D piece 02", "3d", "Awaiting Jawad's renders or turntable (A5)"),
  placeholderOf("roblox-02", "Roblox piece 02", "roblox", "Awaiting a second Roblox UI or art piece"),
];

function placeholderOf(slug: string, name: string, lane: Lane, why: string): Project {
  return {
    slug,
    name,
    year: 2026,
    lane,
    disciplines: [],
    lines: [why],
    cover: m("", 4, 5, why),
    blocks: [],
    placeholder: why,
  };
}

/** campaigns with no ads in the current curation drop out */
export const PROJECTS = PROJECTS_ALL.filter((p) => p.lane !== "ads" || p.cover);
export const REAL = PROJECTS.filter((p) => !p.placeholder);
export const projectBySlug = (slug: string) => REAL.find((p) => p.slug === slug);
export const nextOf = (p: Project) => REAL[(REAL.indexOf(p) + 1) % REAL.length];
export const laneLabel = (l: Lane) => LANES.find((x) => x.key === l)!.label;

/** home, selected work: the order Jawad can change */
export const SELECTED = ["ignaru", "menufit", "shown-media", "derelict-depths", "ignura-seo", "palantir"]
  .map((s) => projectBySlug(s))
  .filter((p): p is Project => Boolean(p));
