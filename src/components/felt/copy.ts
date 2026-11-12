// The words and art for the felt home (src/app/page.tsx), after ignaru.com: felt doors on a dial round one line, and a
// drawer behind each door holding only the main thing. Art: public/felt (transparent squares, 320 and 640 wide; the
// ship-*, onb-*, circle*, more-*, nav-* and yarn pieces come from ignaru.com's set). Stills: public/sites,
// public/showcase, public/ignaru, public/ads, public/menufit.
//
// Facts only. Each number here was read from a live page or a repo; the source sits beside it.

export const BOOK = "https://cal.com/jawad-jalal-hesqbk/intro-call-with-ignura";
export const EMAIL = "hijawadjalal@gmail.com";
export const CV = "/jawad-jalal-cv.pdf";

export const feltSrc = (name: string) => ({
  src: `/felt/${name}-1x.webp`,
  srcSet: `/felt/${name}-1x.webp 320w, /felt/${name}.webp 640w`,
});

/** The page's one line (the h1), in two: who, then what. Ring.tsx sets his face before his name and the Ignaru petal, in
 *  glyphs, before Ignaru; the line under it says the rest (sites and ads for startups). */
export const LINE = ["I'm Jawad, 15,", "building Ignaru."] as const;

/**
 * Every door on the dial, in the order the turn passes along it and the drawer arrows step through it. `art` is the
 * door's own felt piece (first paint), `set` the pieces it changes between, `line` what the dial's centre says while it
 * is the door's turn or under the pointer (under 60 characters; the first door shows the page's line instead).
 */
export const DRAWERS = [
  { id: "work", label: "Work", art: "poster", set: ["poster", "ship", "code"], color: "#1f7ae0", alt: "A yellow felt card with a face on it", line: "" },
  { id: "ads", label: "Ads", art: "palette", set: ["palette", "bezier", "pen"], color: "#f0454f", alt: "A coral felt palette", line: "Ads for startups: one real picture, one line." },
  { id: "sites", label: "Sites", art: "browser", set: ["browser", "canvas", "poster"], color: "#f5b400", alt: "A yellow felt browser window", line: "Sites for startups, designed and built by hand." },
  { id: "ignaru", label: "Ignaru", art: "petal", set: ["petal", "claude", "openai", "gemini", "grok"], color: "#9a4dea", alt: "A purple felt petal, the Ignaru mark", line: "Ignaru, the design tool I'm building." },
  { id: "contact", label: "Contact", art: "call", set: ["call", "circle-comment", "onb-wave"], color: "#3fae63", alt: "A green felt calendar", line: "Email me, book a call, or take my CV." },
] as const;

export type DrawerId = (typeof DRAWERS)[number]["id"];
export const drawerAt = (id: DrawerId) => DRAWERS.findIndex((d) => d.id === id);

/** Ask the page to open one drawer, from anywhere (the bar, the "more" sheet, a link inside another drawer). */
export const openDrawer = (id: DrawerId) => dispatchEvent(new CustomEvent("fh-open", { detail: id }));

/** The bar's three links, each with its small felt mark. Each opens its drawer; sites, contact and the blog live in "more". */
export const NAV = [
  { id: "work", label: "Work", art: "poster" },
  { id: "ads", label: "Ads", art: "palette" },
  { id: "ignaru", label: "Ignaru", art: "petal" },
] as const;

/** A lifted shade of a door's colour, for type and small marks on the dark drawer. */
export const lift = (hex: string) => `color-mix(in oklab, ${hex} 72%, #fff)`;

export type Site = { key: string; name: string; host: string; img: string; w: number; h: number; line: string; tall?: string };

/** The live sites in the Site design drawer. Stills shot at 1440 by 900 on a box (public/showcase and pumpgtm on 8 Nov
 *  2026, monid and ropilot on 5 and 7 Nov). */
export const SITES: Site[] = [
  { key: "roport", name: "Roport", host: "roport-concept.vercel.app", img: "/showcase/roport-1440.webp", w: 1440, h: 900, line: "A redesign concept for roport.lol, where you hire Roblox developers who shipped." },
  { key: "audora", name: "Audora", host: "audora-site.vercel.app", img: "/showcase/audora-1440.webp", w: 1440, h: 900, line: "A redesign concept for audora.art: paste a fanfic and hear it performed." },
  { key: "monid", name: "Monid", host: "monid-site.vercel.app", img: "/sites/monid.webp", tall: "/sites/monid-tall.webp", w: 960, h: 600, line: "A spec redesign for Monid, one key for every tool an agent needs." },
  { key: "pumpgtm", name: "PumpGTM", host: "pumpgtm-site.vercel.app", img: "/sites/pumpgtm.webp", w: 1440, h: 900, line: "A redesign concept for pumpgtm.com, which finds buyers and starts the conversation." },
  { key: "ropilot", name: "Ropilot", host: "ropilot-site.vercel.app", img: "/sites/ropilot.webp", tall: "/sites/ropilot-tall.webp", w: 960, h: 600, line: "Make Roblox games by asking: it writes, models and playtests." },
];

export type Ad = { src: string; small: string; alt: string; says: string; brand?: string };
export type AdSet = { key: string; brand: string; says: string; ads: Ad[]; /** the site its lines were read from */ from?: string };

/** One brand's four ads: what each says, then what it shows (the two make its alt text). */
const set = (key: string, brand: string, ads: [says: string, shows: string][]): Ad[] =>
  ads.map(([says, shows], i) => ({ src: `/ads/sets/${key}-${i + 1}.webp`, small: `/ads/sets/${key}-${i + 1}-480.webp`, says, alt: `${brand}: ${says} ${shows}` }));

/** The ad sets, four ads to a brand, each a different idea. Spec work, made unasked. 960 by 1200 copies of the 2160 by
 *  2700 finals (~/Downloads/ad-carousels, 8 Nov 2026), live with the rest at ignaru-spec-ads.vercel.app. */
export const SETS: Record<"hoplite" | "capy" | "browserUse", AdSet> = {
  hoplite: {
    key: "hoplite",
    brand: "Hoplite",
    says: "Your agent works while you sleep.",
    ads: set("hoplite", "Hoplite", [
      ["Your laptop sleeps. Your agents keep coding.", "Black Hoplite marks tiled on red."],
      ["Your agent codes all night. You merge at seven.", "A night sky over a merged pull request."],
      ["You slept twice. Your agent opened four PRs.", "Green commit bars between two nights."],
      ["Close your laptop. Your agent opens the PR.", "A loading spinner around an Open badge."],
    ]),
  },
  capy: {
    key: "capy",
    brand: "Capy",
    says: "Assign it an issue, get a pull request.",
    ads: set("capy", "Capy", [
      ["Ask @capy in Slack. A pull request flies back.", "A capybara riding a pelican."],
      ["Tag @capy in Slack. It writes the PR. You soak.", "A capybara in a bath."],
      ["Nine Linear issues. Nine Capys. Nine PRs.", "Nine capybaras in nine baths."],
      ["Assign Capy in Linear. It writes the PR.", "A capybara in a captain's hat."],
    ]),
  },
  browserUse: {
    key: "browser-use",
    brand: "Browser Use",
    says: "A real browser for any AI model.",
    ads: set("browser-use", "Browser Use", [
      ["Any AI model. A real browser. Free and open source.", "An agent filling in a flight search."],
      ["The AI browser agent. Free and open source.", "A Star 120k button on orange."],
      ["Any model gets a browser. Free, on your machine.", "A stack of import lines."],
      ["Blocked agents get through.", "An Access Denied page and a shoe shop behind it."],
    ]),
  },
};

/** One ad from a single launch: its file stem in public/ads/sets, its brand, what it says, what it shows. */
const one = (key: string, brand: string, says: string, shows: string): Ad => ({ src: `/ads/sets/${key}.webp`, small: `/ads/sets/${key}-480.webp`, brand, says, alt: `${brand}: ${says} ${shows}` });

/** The newest ads (8 Nov 2026, ~/Downloads/ad-carousels/hero-five v3, solidsf and notra), one idea to a brand. The Capy
 *  manga page and the Hoplite aurora lead. */
export const NEW = {
  capy: one("hero-capy", "Capy", "Pile on the tickets. Capy's AI writes the code.", "A manga page: a capybara on a cloud between a Slack thread and a merged pull request."),
  hoplite: one("hero-hoplite", "Hoplite", "Go to sleep. Your AI agent writes the code.", "The Hoplite mark drawn as a constellation over an aurora."),
  proto: one("hero-proto", "Proto", "A new design tool. Free as Figma. Exact as Cursor.", "Neon mesh shapes round a pink triangle, one selected."),
  paradev: one("hero-paradev", "Paradev", "Run ten coding agents. Get pinged when one needs you.", "A list of agents on red silk, one asking for input."),
  clonk: one("hero-clonk", "Clonk", "No credits. Just your Claude plan. It builds the whole app.", "A phone app in front of a Greek temple on a hill."),
  solidsf: one("solidsf-1", "solidSF", "Free CAD. Free drawings.", "A drawing of a bank card stamped Card not required."),
  solidsf2: one("solidsf-4", "solidSF", "Parametric CAD. Free account, no card.", "A dollar sign and a zero drawn in CAD on black."),
  notra: one("notra-1", "Notra", "ChatGPT named three. Not you.", "A ChatGPT answer naming three rivals, and Notra's scan showing who was left out."),
} satisfies Record<string, Ad>;

/** The newest five as one set, for the ads drawer's lead cell. */
export const FIVE: AdSet = { key: "five", brand: "The newest five", says: "One ad each for five AI launches.", ads: [NEW.capy, NEW.hoplite, NEW.proto, NEW.paradev, NEW.clonk] };

/** Aside, in black: the one ad that is all type. */
export const ASIDE = { src: "/showcase/aside-manifesto-1080.webp", small: "/showcase/aside-manifesto-540.webp", alt: "Aside, in black: Most modern software is just a tab. The apps it holds, drawn in type." };

/** One real-life ad (10 Nov 2026): a photograph in the brand's own colour, its logo and type, one line from its site.
 *  960 by 1200 copies of the 1080 by 1350 finals. Spec work, made unasked. */
const real = (key: string, brand: string, says: string, shows: string): Ad => ({ src: `/ads/sets/real-${key}.webp`, small: `/ads/sets/real-${key}-480.webp`, brand, says, alt: `${brand}: ${says} ${shows}` });

/** The real-life sets. Lines are written by Ignura from facts on each company's site (boat.dev, instabox.sh, nebula.gg). */
export const REAL = {
  outpace: {
    key: "outpace",
    brand: "Outpace",
    from: "outpacestudios.com",
    says: "A design and development studio for startups. Their orange is a running track, so the ads are shot on one.",
    ads: [
      real("outpace-1", "Outpace", "No fluff. No 90-day timelines.", "Starting blocks on a running track, their mark painted on the lane."),
      real("outpace-2", "Outpace", "We work inside your team. Not around it.", "A relay baton lying across a lane line."),
      real("outpace-3", "Outpace", "Most requests land in 1-3 business days.", "Three frames: starting blocks, a baton, a finish tape. Day one, day two, day three."),
      real("outpace-4", "Outpace", "Our clients raised $200M+. Yours could be next.", "A finish tape breaking over an orange track."),
    ],
  },
  cursor: {
    key: "cursor",
    brand: "Cursor",
    from: "cursor.com",
    says: "The coding agent. Their site sets the product in painted landscapes, so the agents work in one.",
    ads: [
      real("cursor-1", "Cursor", "Launch fleets of agents that work in parallel.", "Rows of white kites flying over a hillside."),
      real("cursor-2", "Cursor", "Hand off the task. Keep the decisions.", "An empty chair facing a house frame, beside a desk with a computer in a meadow."),
      real("cursor-3", "Cursor", "Stay on the frontier.", "A lit glass cube on a hill at dusk."),
      real("cursor-4", "Cursor", "Ambitious tasks, for hours or days.", "A desk with a lit screen in a meadow under the Milky Way."),
    ],
  },
  treg: {
    key: "treg",
    brand: "treg",
    from: "treg.to",
    says: "OpenRouter for agent tools: one token, pay per call.",
    ads: [
      real("treg-1", "treg", "Seats you'd never buy for one agent run.", "An empty theatre with one seat in a spotlight."),
      real("treg-2", "treg", "The task, not the tool.", "A pegboard wall of hand tools with one outline lit."),
      real("treg-3", "treg", "Fractions of a cent per call.", "A coin payphone on a concrete wall."),
      real("treg-4", "treg", "One base URL, one token.", "A heavy ring of keys, then one key set in a glass block."),
    ],
  },
  boat: {
    key: "boat",
    brand: "boat.dev",
    from: "boat.dev",
    says: "Cloud computers for agents. They call one a boat, so the ads are real boats.",
    ads: [
      real("boat-hire", "boat.dev", "Boats for hire.", "A boat hire hut whose price board reads $0.036 an hour, printed in blue."),
      real("boat-fork", "boat.dev", "Fork a boat.", "One sailing boat, then two identical ones, side by side."),
      real("boat-fleet", "boat.dev", "Every agent gets a boat.", "A hundred identical sailing boats seen from above."),
    ],
  },
  nebula: {
    key: "nebula",
    brand: "Nebula",
    from: "nebula.gg",
    says: "A workspace for teams and agents. Their launch film's blue cube, photographed.",
    ads: [
      real("nebula-multiplayer", "Nebula", "multiplayer", "White chairs gathered round a blue glass cube on grass."),
      real("nebula-approve", "Nebula", "Work nobody asked for waits for your OK.", "A blue cube waiting at a closed garden gate, with an Approve button under it."),
      real("nebula-workspace", "Nebula", "One workspace.", "A team bench with four folded shirts and a blue cube in the fifth place."),
    ],
  },
  instabox: {
    key: "instabox",
    brand: "InstaBox",
    from: "instabox.sh",
    says: "A cloud machine for every agent, shot as a real black box.",
    ads: [
      real("instabox-desks", "InstaBox", "Give every agent a machine.", "An empty office at night with a black cube on every desk."),
      real("instabox-pause", "InstaBox", "It pauses itself.", "Three frames of one black cube going dark: working, idle, paused."),
    ],
  },
  sideshift: {
    key: "sideshift",
    brand: "SideShift",
    from: "sideshift.app",
    says: "The UGC platform for brands.",
    ads: [
      real("sideshift-1", "SideShift", "Get hundreds of creator applications overnight.", "Envelopes heaped under a letterbox in the morning."),
      real("sideshift-2", "SideShift", "Run your creator program in-house.", "A ring light set up in an ordinary office."),
      real("sideshift-3", "SideShift", "Your budget. Your approval.", "A rubber stamp beside a print stamped with a tick."),
      real("sideshift-4", "SideShift", "Your creator campaigns, handled.", "Three instant prints on green: letters, a ring light, a tick."),
    ],
  },
  dreamstate: {
    key: "dreamstate",
    brand: "Dreamstate",
    from: "trydreamstate.com",
    says: "An AI Head of Growth that asks before it sends.",
    ads: [
      real("dreamstate-1", "Dreamstate", "Your head of growth is in.", "An office door ajar with blue light behind it."),
      real("dreamstate-2", "Dreamstate", "You only do the last one.", "Four small frames: binoculars, a typewriter, a sealed letter, a blue button."),
      real("dreamstate-3", "Dreamstate", "It does the work. You press approve.", "A blue button on a desk, beside their own Actions card."),
      real("dreamstate-4", "Dreamstate", "Written. Sealed. Waiting for your yes.", "A tray of letters sealed in blue wax."),
    ],
  },
  stan: {
    key: "stan",
    brand: "Stan",
    from: "stan.store",
    says: "A creator store that lives in your link-in-bio.",
    ads: [
      real("stan-1", "Stan", "Sell what you know.", "Four prints on purple: a ring light, books, a microphone, a calendar."),
      real("stan-2", "Stan", "Keep the whole pie.", "A whole uncut pie on purple."),
      real("stan-3", "Stan", "Stan brings it all home.", "One key on a long rack built for many."),
      real("stan-4", "Stan", "A whole store, one link wide.", "A shop one door wide, with the Stan sign over it."),
    ],
  },
} satisfies Record<string, AdSet>;

/** Products I made and sites I built for clients, each a real capture of its own first screen (public/design, 1400
 *  wide). Roles as he gave them on 10 Nov 2026: Bevel and Weld founder, Bidframe one of four builders at a hackathon. */
export const MADE: Site[] = [
  { key: "bevel", name: "Bevel", host: "bevel.team", img: "/design/bevel-team.webp", w: 1600, h: 1000, line: "Founder. A 3D art team you can hire by the job, at published rates." },
  { key: "bidframe", name: "Bidframe", host: "bidframe.org", img: "/design/bidframe.webp", w: 1400, h: 875, line: "One of four builders, hackathon. Reads a tender and flags what would disqualify your bid." },
  { key: "weld", name: "Weld", host: "weldroblox.com", img: "/design/weld.webp", w: 1400, h: 663, line: "Founder. A marketplace for how Roblox studios hire developers." },
  { key: "splittingpoint", name: "Splitting Point", host: "splittingpoint.com", img: "/design/splittingpoint.webp", w: 1400, h: 909, line: "Client. The landing page for a Roblox games studio." },
  { key: "vizzbees", name: "Vizzbees", host: "vizzbees.com", img: "/design/vizzbees.webp", w: 1400, h: 788, line: "Client. A SaaS site build." },
  { key: "kleoklaw", name: "Kleoklaw", host: "kleoklaw.com", img: "/design/kleoklaw.webp", w: 1400, h: 788, line: "Client. The site for a mobile product." },
];

export type Job = { name: string; /** its own mark, where the site has a proper one; otherwise the name is set in type */ logo?: string; tile?: string; role: string; line: string; href: string; now?: boolean };

/** Where he has worked, newest first. Roles and lines as profile.ts and the CV have them; MenuFit's 1.5 million users
 *  is his own confirmed number (9 Nov 2026). He has left Okara and MenuFit. */
export const JOBS: Job[] = [
  { name: "Ignaru", logo: "/logos/ignaru.png", role: "Founder", line: "The design tool I'm building.", href: "https://ignaru.com", now: true },
  { name: "Ignura", role: "Founder", line: "A design studio.", href: "https://ignura.com", now: true },
  { name: "Okara", logo: "/logos/okara.png", tile: "#fff", role: "Product development intern", line: "An AI CMO. I got in by taking its dashboard apart, unasked.", href: "https://okara.ai" },
  { name: "MenuFit", logo: "/logos/menufit-bag-128.webp", role: "Product Designer", line: "Eating out healthy, 1.5 million users. New screens for the app.", href: "https://menufit.com" },
  { name: "SOF Agency", role: "PR and partnerships", line: "PR, partnerships and crowdfunding for game studios.", href: "https://sof.agency" },
  { name: "Basket Ent", logo: "/logos/basketent.png", role: "Acquisitions and liveops", line: "Acquisitions, then liveops after each one.", href: "https://basketent.com" },
];

/** One of his best ads (scored 6 or more by him, 11 Nov 2026; ~/night/real/picks-scores and panel-scores). 960 by 1200
 *  copies of the 1080 by 1350 finals, and 480 wide for small places. Spec work, made unasked. */
const best = (key: string, brand: string, says: string, shows: string, score: number, h = 1200): Ad & { score: number; h: number } => ({ src: `/ads/best/${key}.webp`, small: `/ads/best/${key}-480.webp`, brand, says, alt: `${brand}: ${says} ${shows}`, score, h });

export const BEST = {
  corners: best("outpace-corners", "Outpace", "No corners cut.", "A running track drawn as an arch in Outpace orange, the line set in the dark lane inside it.", 8),
  scale: best("shown-scale", "Shown Media", "Get your brand shown at scale.", "The Shown mark lit up on an old drive-in screen at dusk.", 7),
  seen: best("shown-seen", "Shown Media", "One job. Get you seen.", "A close-up of an eye with the Shown mark in the pupil.", 7),
  told: best("shown-told", "Shown Media", "Shown, not told.", "The word shown lit on a billboard at night.", 7),
  income: best("whop-income", "Whop", "To deliver everyone a sustainable income.", "A halftone street with a tall orange Whop banner: Bet on yourself.", 7),
  team: best("outpace-team", "Outpace", "We work inside your team. Not around it.", "A relay baton lying across a lane line.", 7),
  momentum: best("outpace-momentum", "Outpace", "Here's what momentum looks like.", "The track's lanes curving into an arch on orange.", 7, 1707),
  review: best("cursor-review", "Cursor", "Ready for review.", "A field half ploughed, half green, with the diff counts between.", 6),
  found: best("dreamstate-found", "Dreamstate", "Found one.", "A lone swimmer seen from above, boxed and tagged Buyer found.", 6),
  fluff: best("outpace-fluff", "Outpace", "No fluff. No 90-day timelines.", "Starting blocks on a running track, their mark painted on the lane.", 6),
  raised: best("outpace-raised", "Outpace", "Our clients raised $200M+. Yours could be next.", "A finish tape breaking over an orange track.", 6),
  ship: best("outpace-ship", "Outpace", "Ship fast. Look credible.", "The Outpace mark laid out as a running track on green.", 6),
  headed: best("outpace-headed", "Outpace", "Tell us where you're headed.", "A red running track leading into trees and hills.", 6),
  liftoff: best("shown-liftoff", "Shown Media", "Liftoff is the easy part.", "A rocket launch watched by a crowd, 100M+ views on a board.", 6),
  economy: best("whop-economy", "Whop", "The new economy.", "An old shop window painted with sale signs, a Get started tag on it.", 6),
  fly: best("whop-fly", "Whop", "Your agent runs the business. You fly.", "A pilot in a visor, mountains reflected in it.", 6),
  list: best("whop-list", "Whop", "Free to list. 22M+ people a month.", "Garage sale signs nailed to a tree, a Join marketplace tag on them.", 6),
};

/** His best ads as sets, for the ads drawer, best first. */
export const BEST_SETS: AdSet[] = [
  { key: "outpace-best", brand: "Outpace", from: "outpacestudios.com", says: "A design and development studio for startups. Their orange is a running track, so every ad is one.", ads: [BEST.corners, BEST.team, BEST.ship, BEST.headed, BEST.fluff, BEST.raised] },
  { key: "shown-best", brand: "Shown Media", says: "Launch videos for tech and AI. Their mark is a play button, so it goes where things get shown.", ads: [BEST.scale, BEST.seen, BEST.told, BEST.liftoff] },
  { key: "whop-best", brand: "Whop", from: "whop.com", says: "Their own lines, in their orange, on real photographs.", ads: [BEST.income, BEST.economy, BEST.fly, BEST.list] },
];

/** A piece on the wall: three widths of one picture (440, 880 and the full file), its size, and what it is. */
export type Piece = { key: string; brand: string; alt: string; small: string; mid: string; src: string; w: number; h: number };

const piece = (dir: string, key: string, brand: string, says: string, shows: string, w = 1080, h = 1350): Piece => ({
  key,
  brand,
  alt: `${brand}: ${says} ${shows}`.trim(),
  small: `${dir}/${key}-440.webp`,
  mid: `${dir}/${key}-880.webp`,
  src: `${dir}/${key}.webp`,
  w,
  h,
});
const more = (key: string, brand: string, says: string, shows: string, w?: number, h?: number) => piece("/ads/more", key, brand, says, shows, w, h);

/** The newest ads (11 and 12 Nov 2026): his top twenty (~/Desktop/top-20, less those already in the drawers and two held
 *  back) and the 12 Nov sets (~/night/real/set-*-n12). Spec work, made unasked: none of these companies is a client.
 *  The Jam ad leads (his favourite of the night). */
export const MORE: Piece[] = [
  more("jam", "Jam", "What AI reads before it answers.", "Four old books stacked, their spines printed in Jam's colours."),
  more("offense", "Offense", "Give your agent a swarm.", "A red swarm of points over a desert at night."),
  more("hyperspell", "Hyperspell", "A brain for your company.", "An office block at dusk, its windows lit pink."),
  more("click-land", "Click", "Land instantly.", "A runway at night, its lights in Click blue."),
  more("whop-blimp", "Whop", "The fastest path to your next dollar.", "An orange Whop blimp over a crowd, in halftone.", 1600, 900),
  more("simular-walk", "Simular", "Give it a task, then walk away.", "Sai's mark in green, pressed into raked sand."),
  more("grokbot", "Grok Bot", "AI teammates that work 24/7.", "A tower at night, lit blue, under a full moon."),
  more("instabox-box", "InstaBox", "Every agent gets its own box.", "A stack of shipping containers painted InstaBox green."),
  more("outpace-marathon", "Outpace", "Marathon. Your design and dev team, month to month.", "A running track curling round the line on orange."),
  more("launchpoint", "Launchpoint", "Copied videos don't get paid.", "The same purple poster pasted twice on a wall."),
  more("outpace-field", "Outpace", "Momentum.", "An orange track in a green field, the word painted round its bend, seen from above.", 1080, 1920),
  more("serveros", "ServerOS", "Stop babysitting your servers.", "A man fishing off a jetty, a list of fixed outages above him."),
  more("simular-click", "Simular", "If you can click it, Sai can.", "A green bar standing in black ridges."),
  more("click-market", "Click", "Every market. Every screen.", "Towers at night, one outlined in Click blue."),
  more("whop-tower", "Whop", "The new economy.", "A black and white tower block with a tall orange Whop banner."),
  more("instabox-address", "InstaBox", "Every box gets an address.", "A long row of green letterboxes."),
  more("outpace-ideation", "Outpace", "From ideation to hand-off.", "A track winding across the poster on green."),
];

/** Brand studies, unasked (each says so in its own corner): the Outpace and Fish Audio boards, Launchpoint and Suna's
 *  lead pieces. 2000 wide copies of the 2400 finals (~/night/real/brand-*). Chosen over the Shown, Monid and Dreamstate
 *  boards, which read as kits rather than worlds. */
const board = (key: string, brand: string, says: string, w: number, h: number) => piece("/design/boards", key, brand, says, "", w, h);
export const BOARDS = {
  outpace: board("outpace-board", "Outpace Studios", "A brand study: their orange as a running track, on posters, a ticket, a stopwatch and their own site.", 2000, 1125),
  fish: board("fishaudio-board", "Fish Audio", "A brand study: engraved fish and an ear in their lilac and coral, with their own lines.", 2000, 1125),
  launchpoint: board("launchpoint-hero", "Launchpoint", "Trust every number. Fine lines drawn into one flare.", 2000, 2000),
  suna: board("suna-hero", "Suna", "Finally understand your gut. A stippled sun over the name.", 2000, 2000),
} satisfies Record<string, Piece>;

export type ShelfItem = { src: string; big: string; alt: string };

/** The first screen's shelf: only ads he scored 7 or 8, the 8 in the middle. Each opens the ads drawer. */
export const SHELF: ShelfItem[] = [BEST.told, BEST.income, BEST.corners, BEST.scale, BEST.team, BEST.seen].map((a) => ({ src: a.small, big: a.src, alt: a.alt }));

/** Where he has worked, for the capsule under the home line: his own two first, then the jobs. Facts as JOBS, profile.ts
 *  and the CV have them (MenuFit's 1.5M users is his own number, 9 Nov 2026). */
export const WORKED: { name: string; role: string; logo?: string; tile?: string }[] = [
  { name: "Ignaru", role: "founder", logo: "/logos/ignaru.png" },
  { name: "Bevel", role: "founder", logo: "/logos/bevel.png" },
  { name: "MenuFit", role: "product designer, 1.5M users", logo: "/logos/menufit-bag-128.webp" },
  { name: "Okara", role: "intern", logo: "/logos/okara.png", tile: "#fff" },
  { name: "SOF Agency", role: "PR and partnerships" },
  { name: "Basket Ent", role: "acquisitions and liveops", logo: "/logos/basketent.png" },
];
