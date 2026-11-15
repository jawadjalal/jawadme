// The wall of work on the home page, as one list. Add or remove a piece by adding or removing its line: WorkFeed packs
// the pieces into rows by itself (wide pieces alone, the rest two or three to a row, live components and icons kept
// together), and a `story` line breaks the wall wherever it sits in the list.
//
// Pictures live in public/work/2026-11 as <file>.webp (960 wide, or 1600 for wide pieces) and <file>-sm.webp (half
// that); their sizes are in feed-sizes.json, written by the converter. Live components are self-contained pages in
// public/components.
//
// Every piece carries a one-line caption under it: whose it is and what it is. `unsolicited: true` marks work made
// unasked for a company that is not a client, and its caption says "unsolicited".
//
// A video loop is a picture with `video`: the poster is <file>.webp as usual, the clip is public/work/2026-11/<video>
// (an mp4, muted). It plays only while it is on screen, and never with reduced motion. To add an Ignaru panel recording:
//   clip("panel-rename", "panel-rename.mp4", "Ignaru", "the rename panel, recorded", "Renaming a frame in Ignaru."),
// Sources: the ads he posted on X himself (~/night/refs/his-posts-n13), the twenty he picked for his 13 Nov post
// (~/Desktop/mega-post-2), and the ads, brand studies and sites already on this site.

import sizes from "./feed-sizes.json";
import type { StickerPic } from "@/components/portfolio/Sticker";

export type Kind = "ad" | "brand" | "site" | "product" | "component" | "icon";

export type Picture = {
  kind: "ad" | "brand" | "site" | "product";
  file: string;
  /** whose it is, first word of the caption */
  brand: string;
  /** what it is, the rest of the caption ("ad", "brand study", "site concept") */
  what: string;
  /** a muted loop shown in place of the picture, which becomes its poster */
  video?: string;
  alt: string;
  caption?: string;
  unsolicited?: boolean;
  /** a breakdown: the cover is `file`, these are the slides after it (files in public/work/2026-11), opened in the viewer */
  slides?: string[];
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

/** a picture's one-line caption: whose it is and what it is */
export const captionOf = (p: Picture) => `${p.brand}${p.kind === "product" ? ", " : " "}${p.what}${p.unsolicited ? ", unsolicited" : ""}`;
export type Entry = Piece | Story;

const size = (file: string) => {
  const s = (sizes as Record<string, number[]>)[file];
  if (!s) throw new Error(`feed: no size for ${file}`);
  return { w: s[0], h: s[1] };
};

/** an ad made unasked for a company */
const ad = (file: string, brand: string, alt: string): Picture => ({ kind: "ad", file, brand, what: "ad", alt: `${brand} ad: ${alt}`, unsolicited: true, ...size(file) });
const brand = (file: string, name: string, alt: string): Picture => ({ kind: "brand", file, brand: name, what: "brand study", alt: `${name} brand study: ${alt}`, unsolicited: true, ...size(file) });
const site = (file: string, name: string, what: string, alt: string, unsolicited = false): Picture => ({ kind: "site", file, brand: name, what, alt: `${name} ${what}: ${alt}`, unsolicited, ...size(file) });
/** a Capy hackathon manga strip, panel or clean text poster (unasked for): Capy's mascot in ink, screentone and speed lines */
const capy = (file: string, what: string, alt: string): Picture => ({ kind: "ad", file, brand: "Capy", what: `hackathon ${what}`, alt: `Capy hackathon ${what}: ${alt}`, unsolicited: true, ...size(file) });

/** his own product */
const own = (file: string, name: string, what: string, alt: string): Picture => ({ kind: "product", file, brand: name, what, alt: `${name}, ${what}: ${alt}`, ...size(file) });
/** a muted loop (an Ignaru panel recording, say), with <file>.webp as its poster */
export const clip = (file: string, video: string, name: string, what: string, alt: string): Picture => ({ kind: "product", file, video, brand: name, what, alt, ...size(file) });
const live = (embed: string, name: string, ratio: number, stage: number, caption: string): Live => ({ kind: "component", embed, name, ratio, stage, caption, ground: "#111213" });
const icon = (embed: string, name: string): Live => ({ kind: "icon", embed, name, ratio: 1, stage: 360, ground: "#000" });

/** a breakdown carousel (cover plus four 4:5 slides), made from the finished piece: how one ad, poster or site was built */
const breakdown = (key: string, name: string, what: string, alt: string, unsolicited = true): Picture => ({
  kind: "brand",
  file: `bd-${key}-cover`,
  brand: name,
  what,
  alt: `${name} ${what}: ${alt}`,
  unsolicited,
  slides: ["01", "02", "03", "04"].map((n) => `bd-${key}-${n}`),
  ...size(`bd-${key}-cover`),
});

const logo = (pic: string, alt: string, tilt: number): StickerPic => ({ pic, alt, w: 128, h: 128, tilt });

// The first pass, strongest first. The packer sets wide pieces alone at full width and everything else two to a row,
// and an odd one left over shares a row with the wide piece beside it.
export const FEED: Entry[] = [
  // 14 Nov: the x post kit (~/night/real/xpost-n14) and four breakdowns (~/night/real/breakdowns-n14) lead
  // 14 Nov evening: jawadjalal.com/capy as a manga globe (the tour and stills), and the Ignaru canvas with an ad set on it
  capy("capy-manga-s2-wide", "manga strip", "the bug at 5:58. Tik, tok, the phone cracks at 5:58, click, submitted at 6:00 PM."),
  clip("reel-n14", "reel-n14.mp4", "Ignura", "this week's ads, one reel", "A 12 second reel of this week's unsolicited ads: PostHog, Mastra, InstaBox, Rainbrand, a Capy hackathon poster and brand boards."),
  own("ignaru-canvas-ads", "Ignaru", "the canvas, a whole ad set on it", "the Ignaru canvas: an ad engine run laid out as frames, the layers list on the left and the composer at the foot."),
  ad("rainbrand-press", "Rainbrand", "On-brand, on repeat. A real offset press, its rollers inked in their five colours."),
  breakdown("ad-anatomy", "PostHog", "ad, taken apart", "the till ad slide by slide: the line read off posthog.com, the before and after crop, the type, four sizes."),
  ad("mastra-lightning", "Mastra", "Your agents can now respond to real-world events. Lightning drawn in their orange."),
  capy("capy-clean-one", "poster", "One day. One app. One YC interview. Set in black type, INTERVIEW in red, the day as comic panels."),
  breakdown("site-rebuild", "jawadjalal.com", "taken apart", "the fixed column, the type, the stickers, the squircle buttons and the drifting wall, measured.", false),
  ad("instabox-midrun", "InstaBox", "Fork a machine, mid-run. LA traffic at night, one lane splitting off in their green."),
  own("ignaru-canvas-zoom", "Ignaru", "the canvas, zoomed into one ad", "the Ignaru canvas zoomed into one ad: a creator marketing poster with a receipt, stamps and a chart."),
  capy("capy-panel-bulb", "manga panel", "the idea: a bulb goes PING over the capybara's head, speed lines all round."),
  capy("capy-panel-panic", "manga panel", "5:58 and the phone cracks; the capybara grabs it, sweating."),
  breakdown("boat-system", "boat.dev", "hackathon system, taken apart", "one event, one system: the poster, the deck sign, the badges and the kit banner, with the grid and the type."),
  capy("capy-manga-s1-wide", "manga strip", "the idea: PING, KA-CHUNK, TAK TAK TAK, the app on a phone."),

  own("ignaru-app-composer", "Ignaru", "the design tool I'm building", "the Ignaru composer with its model menu open: Opus 5.5, effort set to high."),
  own("ignaru-canvas", "Ignaru", "the design tool I'm building", "the Ignaru canvas: a landing page frame with numbered comments, a mood board and a start button beside it."),
  ad("whop-blimp", "Whop", "an orange Whop blimp over a crowd, in halftone. The fastest path to your next dollar."),
  capy("capy-panel-submitted", "manga panel", "SUBMITTED. A blue phone with a tick, the capybara asleep on the desk at 6:00 PM."),
  ad("posthog-n13-ad1", "PostHog", "a real till whose display reads 000.00, marked with PostHog's highlighter"),
  ad("mastra-n13-ad1", "Mastra", "one drawer painted Mastra green in a wall of mono drawers."),
  ad("instabox-n13-ad1", "InstaBox", "a real black tea chest (Met 121779, CC0) with the lid seam glowing their green, light spilling down the leather."),
  ad("rainbrand-n13-ad2", "Rainbrand", "a real prairie rainbow in mono, the band repainted in their five colours (no green), under their own notice bar '[NOTICE] // Bloom is now"),
  own("ignaru-app-palette", "Ignaru", "the design tool I'm building", "the Ignaru command palette: start a thread, spawn an agent, show the terminal."),
  ad("outpace-corners", "Outpace", "No corners cut. A running track drawn as an arch in Outpace orange."),
  ad("offense-swarm", "Offense", "Give your agent a swarm. A red swarm of points over a desert at night."),
  ad("jam-books", "Jam", "What AI reads before it answers, printed on the spines of four old books."),
  capy("capy-clean-dinner", "poster", "Ship it to a real phone by dinner. Black type over the day's schedule in comic panels."),
  ad("hyperspell-brain", "Hyperspell", "A brain for your company. An office block at dusk, its windows lit pink."),
  brand("outpace-board", "Outpace Studios", "their orange as a running track, on posters, a ticket, a stopwatch and their own site."),
  ad("click-keys", "Click", "We never hold your keys. A blue Click key tag among old iron keys."),
  ad("shown-drive-in", "Shown Media", "Get your brand shown at scale. The Shown mark on a drive-in screen at dusk."),
  own("ignaru-app-agent", "Ignaru", "the design tool I'm building", "Ignaru's start-an-agent sheet: a brief, a role picked from builder to critic, and its own branch."),
  capy("capy-manga-s3-wide", "manga strip", "the demo: 3, 2, 1 under the stage lights, then DEMO IT LIVE."),
  live("exploded-view", "Exploded view", 1.1, 320, "Exploded view, a live component. Press assemble."),
  live("effort-switch", "Effort switch", 1.1, 520, "Effort switch, live. Drag it."),

  ad("posthog-n13-ad4", "PostHog", "one cookie on a plate, the only colour in the frame, under the cookie-banner title"),
  ad("mastra-n13-ad3", "Mastra", "a real magnifying glass replaces the o of 'observe', set in their green as on their hero."),
  capy("capy-panel-countdown", "manga panel", "3: one number under three stage spotlights."),
  brand("spreadjam-c1", "Spreadjam", "board 1 of the Spreadjam study"),
  ad("instabox-n13-ad4", "InstaBox", "the o of 'Cloud' is a disc of a real night thundercloud (NOAA NSSL, public domain) lit green from inside."),
  capy("capy-panel-live", "manga panel", "DEMO IT LIVE. A huge phone held up in a hall, speed lines behind."),
  ad("rainbrand-n13-ad4", "Rainbrand", "a badlands butte in mono with only its top rock layer in their five colours, under their h1 'THE BRAND LAYER FOR AGENTS' set in their lettering in"),
  { story: "Making things for money since thirteen.", pic: { pic: "/work/2026-11/sticker-swarm.webp", alt: "a crop of his Offense ad: a red swarm of points at night", w: 160, h: 160, tilt: -7 }, at: 3 },

  site("site-menufit", "MenuFit", "app screens", "app screens for eating out healthy, light and dark."),
  ad("standout-door", "Standout", "Get introduced to your dream role. A green door in a hedge."),
  ad("superlog-missing", "Superlog", "See what's missing. A stack of numbered logs with one gap."),
  ad("dreamstate-receipt", "Dreamstate", "Tools you stop paying for, as a receipt totalled up to one plan."),
  ad("cursor-review", "Cursor", "Ready for review. A field half ploughed, half green, the diff counts between."),
  capy("capy-manga-s4-wide", "manga strip", "silent: the cursor is born, climbs a tower and delivers the app."),
  icon("icon-agents", "Agents app icon"),
  icon("icon-billboard", "Billboard app icon"),
  icon("icon-sol", "Sol app icon"),
  ad("offense-defense", "Offense", "The best defense is offense. Red lines bursting from an app."),
  ad("whop-income", "Whop", "To deliver everyone a sustainable income. A tall orange Whop banner on a street."),
  ad("hyperspell-books", "Hyperspell", "Your agent read every book but yours. A shelf of encyclopaedias and one pink spine."),
  capy("capy-panel-go", "manga panel", "GO!! 10:00 AM, the capybara bursts through the page."),

  ad("posthog-n13-ad3", "PostHog", "an empty terminal hall lit PostHog orange, the word terminal? behind the pillar"),
  ad("mastra-n13-ad2", "Mastra", "the bolt in their orange passing in front of one phrase."),
  capy("capy-clean-open", "poster", "Build an app people open every day. Black type, the day as comic panels."),
  brand("spreadjam-c2", "Spreadjam", "board 2 of the Spreadjam study"),
  ad("instabox-n13-ad2", "InstaBox", "one carriageway of LA traffic glowing green, splitting into two while the cars keep moving."),
  capy("capy-panel-delivery", "manga panel", "the cursor drops an app onto a phone, the capybara peeking in."),
  { story: "Took apart Okara's dashboard. Got in.", pic: logo("/logos/okara.png", "the Okara mark", 6), at: 2 },

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

  ad("posthog-n13-ad2", "PostHog", "two culture plates, agar in PostHog red, under the pricing joke about going viral"),
  ad("rainbrand-n13-ad1", "Rainbrand", "a real offset press whose ink film and roller carry their five colours in sequence, under their own lettering 'ON-BRAND, ON REPEAT.' on their grey"),
  brand("spreadjam-c3", "Spreadjam", "board 3 of the Spreadjam study"),
  ad("mastra-n13-ad4", "Mastra", "their own hero trace, the agent run bar running off the page."),
  capy("capy-manga-s5-wide", "manga strip", "a four panel day: GO at 10, lunch at 12:30, asleep on the desk by 6:30."),
  brand("spreadjam-c4", "Spreadjam", "board 4 of the Spreadjam study"),
  { story: "Now I run Ignura, an ad and brand studio.", cta: true, pic: logo("/logos/ignura.png", "the Ignura mark", -8), at: 3 },
  own("ignura-home", "Ignura", "my ad and brand studio", "the Ignura home page: ads and brands people stop for, beside a wall of its ads."),
  own("ignura-phone", "Ignura", "my ad and brand studio", "the Ignura home page on a phone, the wall under the first screen."),

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

  ad("instabox-n13-ad3", "InstaBox", "the one thing you do to get a machine, their install line 'npx instabox@latest sh' with Copy, rebuilt from their home page and set as the single"),
  ad("rainbrand-n13-ad3", "Rainbrand", "their hero brush and cursor, three identical copies side by side in one white window, under 'Your brands, ready for agents.'"),
  capy("capy-panel-sleep", "manga panel", "Z Z Z: the capybara asleep on a desk of pizza boxes, the app on the phone."),
  brand("spreadjam-c5", "Spreadjam", "board 5 of the Spreadjam study"),
  { story: "And I'm building Ignaru, a design tool.", pic: logo("/logos/ignaru.png", "the Ignaru mark", 7), at: 3 },
  own("ignaru-app-changes", "Ignaru", "the design tool I'm building", "Ignaru's changes panel: two files, a commit message and the diff."),
  own("ignaru-app-share", "Ignaru", "the design tool I'm building", "Ignaru's share sheet: view, comment and edit links, and who can run an agent."),

  ad("offense-tube", "Offense", "Find the hole before they do. A pipe with one hole circled in red."),
  ad("serveros-fishing", "ServerOS", "Stop babysitting your servers. A man fishing off a jetty."),
  ad("dreamstate-favourite", "Dreamstate", "ChatGPT has a favourite. Make it you. A shop front with a blue sign."),
  ad("hyperspell-world", "Hyperspell", "A company world model. A columned building lit pink at night."),
  ad("click-market", "Click", "Every market. Every screen. Towers at night, one outlined in blue."),
  ad("serveros-babysit", "ServerOS", "Stop babysitting your servers. Yellow shards over green hills."),
  ad("simular-walk", "Simular", "Give it a task, then walk away. The mark pressed into raked sand."),
  ad("aside-manifesto", "Aside", "Most modern software is just a tab. The apps it holds, drawn in type."),
  ad("whop-fly", "Whop", "Your agent runs the business. You fly. A pilot's visor reflecting mountains."),
  ad("shown-liftoff", "Shown Media", "Liftoff is the easy part. A rocket launch watched by a crowd."),
  ad("outpace-team", "Outpace", "We work inside your team. Not around it. A relay baton across a lane line."),
  ad("click-land", "Click", "Land instantly. A runway at night, its lights in Click blue."),
  ad("instabox-box", "InstaBox", "Every agent gets its own box. Shipping containers painted green."),

  { story: "Want ads like these for your launch?", cta: true, pic: { pic: "/design/jawad-die.webp", alt: "Jawad's memoji", w: 697, h: 781, tilt: -5, cut: true }, at: 6 },
];
