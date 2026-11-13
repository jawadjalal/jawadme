// The wall of work on the home page, as one list. Add or remove a piece by adding or removing its line: WorkFeed packs
// the pieces into rows by itself (wide pieces alone, the rest two or three to a row, live components and icons kept
// together), and a `story` line breaks the wall wherever it sits in the list.
//
// Pictures live in public/work/2026-11 as <file>.webp (960 wide, or 1600 for wide pieces) and <file>-sm.webp (half
// that); their sizes are in feed-sizes.json, written by the converter. Live components are self-contained pages in
// public/components.
//
// `unsolicited: true` marks work made unasked for a company that is not a client: the wall says so on the piece.
// Sources: the ads he posted on X himself (~/night/refs/his-posts-n13), the twenty he picked for his 13 Nov post
// (~/Desktop/mega-post-2), and the ads, brand studies and sites already on this site.

import sizes from "./feed-sizes.json";
import type { StickerPic } from "@/components/portfolio/Sticker";

export type Kind = "ad" | "brand" | "site" | "component" | "icon";

export type Picture = {
  kind: "ad" | "brand" | "site";
  file: string;
  /** whose it is, shown on hover */
  brand: string;
  alt: string;
  caption?: string;
  unsolicited?: boolean;
  w: number;
  h: number;
};

export type Live = {
  kind: "component" | "icon";
  /** the page in public/components */
  embed: string;
  name: string;
  /** width over height of the frame it gets */
  ratio: number;
  /** the window width it is laid out at before it is scaled to the tile (desktop only) */
  stage?: number;
  /** the component's own ground, so its frame is its own colour */
  ground: string;
  caption?: string;
};

/** One line of his story across the wall: at most seven words, true facts only. `pic` is a sticker of his work set
 *  into the line after word `at` (shown in the sticker look). `cta` puts the hire button beside it. */
export type Story = { story: string; cta?: boolean; pic?: StickerPic; at?: number };

export type Piece = Picture | Live;
export type Entry = Piece | Story;

const size = (file: string) => {
  const s = (sizes as Record<string, number[]>)[file];
  if (!s) throw new Error(`feed: no size for ${file}`);
  return { w: s[0], h: s[1] };
};

/** an ad made unasked for a company */
const ad = (file: string, brand: string, alt: string): Picture => ({ kind: "ad", file, brand, alt: `${brand} ad: ${alt}`, unsolicited: true, ...size(file) });
const brand = (file: string, name: string, alt: string): Picture => ({ kind: "brand", file, brand: name, alt: `${name} brand study: ${alt}`, unsolicited: true, ...size(file) });
const site = (file: string, name: string, alt: string, unsolicited = false): Picture => ({ kind: "site", file, brand: name, alt: `${name} site: ${alt}`, unsolicited, ...size(file) });
const live = (embed: string, name: string, ratio: number, stage: number, caption: string): Live => ({ kind: "component", embed, name, ratio, stage, caption, ground: "#111213" });
const icon = (embed: string, name: string): Live => ({ kind: "icon", embed, name, ratio: 1, stage: 360, ground: "#000" });

const logo = (pic: string, alt: string, tilt: number): StickerPic => ({ pic, alt, w: 128, h: 128, tilt });

// The first pass, strongest first. The packer sets wide pieces alone at full width and everything else two to a row,
// and an odd one left over shares a row with the wide piece beside it.
export const FEED: Entry[] = [
  ad("whop-blimp", "Whop", "an orange Whop blimp over a crowd, in halftone. The fastest path to your next dollar."),
  ad("outpace-corners", "Outpace", "No corners cut. A running track drawn as an arch in Outpace orange."),
  ad("offense-swarm", "Offense", "Give your agent a swarm. A red swarm of points over a desert at night."),
  ad("jam-books", "Jam", "What AI reads before it answers, printed on the spines of four old books."),
  ad("hyperspell-brain", "Hyperspell", "A brain for your company. An office block at dusk, its windows lit pink."),
  brand("outpace-board", "Outpace Studios", "their orange as a running track, on posters, a ticket, a stopwatch and their own site."),
  ad("click-keys", "Click", "We never hold your keys. A blue Click key tag among old iron keys."),
  ad("shown-drive-in", "Shown Media", "Get your brand shown at scale. The Shown mark on a drive-in screen at dusk."),
  live("exploded-view", "Exploded view", 1.1, 320, "Exploded view, a live component. Press assemble."),
  live("effort-switch", "Effort switch", 1.1, 520, "Effort switch, live. Drag it."),

  { story: "Making things for money since thirteen.", pic: { pic: "/work/2026-11/sticker-swarm.webp", alt: "a crop of his Offense ad: a red swarm of points at night", w: 160, h: 160, tilt: -7 }, at: 3 },

  site("site-menufit", "MenuFit", "app screens for eating out healthy, light and dark."),
  ad("standout-door", "Standout", "Get introduced to your dream role. A green door in a hedge."),
  ad("superlog-missing", "Superlog", "See what's missing. A stack of numbered logs with one gap."),
  ad("dreamstate-receipt", "Dreamstate", "Tools you stop paying for, as a receipt totalled up to one plan."),
  ad("cursor-review", "Cursor", "Ready for review. A field half ploughed, half green, the diff counts between."),
  icon("icon-agents", "Agents app icon"),
  icon("icon-billboard", "Billboard app icon"),
  icon("icon-sol", "Sol app icon"),
  ad("offense-defense", "Offense", "The best defense is offense. Red lines bursting from an app."),
  ad("whop-income", "Whop", "To deliver everyone a sustainable income. A tall orange Whop banner on a street."),
  ad("hyperspell-books", "Hyperspell", "Your agent read every book but yours. A shelf of encyclopaedias and one pink spine."),
  ad("capy-manga", "Capy", "Pile on the tickets. Capy's AI writes the code. A manga page."),

  { story: "Took Okara's dashboard apart, unasked. Got in.", pic: logo("/logos/okara.png", "the Okara mark", 6), at: 1 },

  brand("fishaudio-board", "Fish Audio", "engraved fish and an ear in their lilac and coral, with their own lines."),
  ad("fish-ai", "Fish Audio", "AI that sounds like AI doesn't. A curved concert hall lit pink."),
  ad("fish-whisper", "Fish Audio", "A whisper stays a whisper. A chandelier of pink light."),
  ad("hoplite-sleep", "Hoplite", "Go to sleep. Your AI agent writes the code. The mark drawn as a constellation."),
  ad("wonder-ships", "Wonder", "What you design is what ships. A container ship seen from above."),
  live("change-review", "Change review", 16 / 10, 760, "Change review, live. Approve each file."),
  ad("boat-hire", "boat.dev", "Boats for hire. A blue boat hut with its price per hour."),
  ad("boat-fork", "boat.dev", "Fork a boat. Two identical sailing boats on blue water."),
  ad("click-remotes", "Click", "One account. Every market. A heap of remotes and one blue one."),
  ad("suna-gut", "Suna", "Hear your gut, day and night. A stippled sun under rings of sound."),
  brand("launchpoint-brand", "Launchpoint", "fine lines drawn into one flare."),
  brand("suna-brand", "Suna", "a stippled sun over the name."),

  { story: "Now I run Ignura, a design studio.", cta: true, pic: logo("/logos/ignura.png", "the Ignura mark", -8), at: 3 },

  site("site-roport", "Roport", "a redesign concept for roport.lol, where you hire Roblox developers who shipped.", true),
  ad("offense-key", "Offense", "Scan for secrets. A key on a red tag dropped on a doormat."),
  ad("jam-flags", "Jam", "Every page each answer cites, as coloured tabs on an iron door."),
  ad("shown-eye", "Shown Media", "One job. Get you seen. The Shown mark in the pupil of an eye."),
  ad("whop-tower", "Whop", "The new economy. A black tower with a tall orange Whop banner."),
  icon("icon-darkroom", "Darkroom app icon"),
  icon("icon-frames", "Frames app icon"),
  icon("icon-sandbox", "Sandbox app icon"),
  ad("superlog-bugs", "Superlog", "Find unknown bugs. Bark beetle tracks under the bark."),
  ad("shown-told", "Shown Media", "Shown, not told. The word shown lit on a billboard at night."),
  ad("outpace-momentum", "Outpace", "Here's what momentum looks like. Lanes curving into an arch."),
  ad("outpace-field", "Outpace", "Momentum. An orange track in a green field, seen from above."),
  ad("shown-theatre", "Shown Media", "The Shown mark as a theatre sign: now showing your launch."),
  ad("launchpoint-distribution", "Launchpoint", "Distribution is everything. Purple rings round their arrow."),

  { story: "And I'm building Ignaru, a design tool.", pic: logo("/logos/ignaru.png", "the Ignaru mark", 7), at: 3 },

  site("site-audora", "Audora", "a redesign concept for audora.art: paste a fanfic and hear it performed.", true),
  ad("offense-tube", "Offense", "Find the hole before they do. A pipe with one hole circled in red."),
  ad("serveros-fishing", "ServerOS", "Stop babysitting your servers. A man fishing off a jetty."),
  ad("dreamstate-favourite", "Dreamstate", "ChatGPT has a favourite. Make it you. A shop front with a blue sign."),
  ad("hyperspell-world", "Hyperspell", "A company world model. A columned building lit pink at night."),
  ad("click-market", "Click", "Every market. Every screen. Towers at night, one outlined in blue."),
  ad("serveros-babysit", "ServerOS", "Stop babysitting your servers. Yellow shards over green hills."),
  ad("simular-walk", "Simular", "Give it a task, then walk away. The mark pressed into raked sand."),
  site("site-mercy", "Mercy", "a dark first screen with the live phone app."),
  ad("aside-manifesto", "Aside", "Most modern software is just a tab. The apps it holds, drawn in type."),
  ad("whop-fly", "Whop", "Your agent runs the business. You fly. A pilot's visor reflecting mountains."),
  ad("shown-liftoff", "Shown Media", "Liftoff is the easy part. A rocket launch watched by a crowd."),
  ad("outpace-team", "Outpace", "We work inside your team. Not around it. A relay baton across a lane line."),
  ad("click-land", "Click", "Land instantly. A runway at night, its lights in Click blue."),
  ad("instabox-box", "InstaBox", "Every agent gets its own box. Shipping containers painted green."),

  { story: "Want ads like these for your launch?", cta: true, pic: { pic: "/design/jawad-cut.webp", alt: "Jawad's memoji", w: 640, h: 723, tilt: -6, cut: true }, at: 6 },
];
