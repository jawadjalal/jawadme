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

/** The page's one line (the h1): who, then what. Ring.tsx sets his face before his name and a felt petal before Ignaru. */
export const LINE = ["I'm Jawad, 15, building Ignaru,", "and designing sites and ads for startups."] as const;

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
export type AdSet = { key: string; brand: string; says: string; ads: Ad[] };

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

/** The real-life sets. Every line is the company's own, or a fact from its site (boat.dev, instabox.sh, nebula.gg). */
export const REAL = {
  boat: {
    key: "boat",
    brand: "boat.dev",
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
    says: "A cloud machine for every agent, shot as a real black box.",
    ads: [
      real("instabox-desks", "InstaBox", "Give every agent a machine.", "An empty office at night with a black cube on every desk."),
      real("instabox-pause", "InstaBox", "It pauses itself.", "Three frames of one black cube going dark: working, idle, paused."),
    ],
  },
} satisfies Record<string, AdSet>;

/** Products I started and sites I built for clients, each a real capture of its own first screen (public/design,
 *  1400 wide). Facts as profile.ts and the CV have them; Bidframe and Weld ended in 2026. */
export const MADE: Site[] = [
  { key: "bevel", name: "Bevel", host: "bevel.team", img: "/design/bevel-team.webp", w: 1600, h: 1000, line: "Founder. A 3D art team you can hire by the job, at published rates." },
  { key: "bidframe", name: "Bidframe", host: "bidframe.org", img: "/design/bidframe.webp", w: 1400, h: 875, line: "One of four builders, hackathon. Reads a tender and flags what would disqualify your bid." },
  { key: "weld", name: "Weld", host: "weldroblox.com", img: "/design/weld.webp", w: 1400, h: 663, line: "Founder. A marketplace for how Roblox studios hire developers." },
  { key: "splittingpoint", name: "Splitting Point", host: "splittingpoint.com", img: "/design/splittingpoint.webp", w: 1400, h: 909, line: "Client. The landing page for a Roblox games studio." },
  { key: "vizzbees", name: "Vizzbees", host: "vizzbees.com", img: "/design/vizzbees.webp", w: 1400, h: 788, line: "Client. A SaaS site build." },
  { key: "kleoklaw", name: "Kleoklaw", host: "kleoklaw.com", img: "/design/kleoklaw.webp", w: 1400, h: 788, line: "Client. The site for a mobile product." },
];

export type Job = { name: string; logo: string; tile?: string; role: string; line: string; href: string; now?: boolean };

/** Where he has worked, newest first. Roles and lines as profile.ts and the CV have them; MenuFit's 1.5 million users
 *  is his own confirmed number (9 Nov 2026). He has left Okara and MenuFit. */
export const JOBS: Job[] = [
  { name: "Ignaru", logo: "/logos/ignaru.png", role: "Founder", line: "The design tool I'm building.", href: "https://ignaru.com", now: true },
  { name: "Ignura", logo: "/logos/ignura.png", role: "Founder", line: "A design studio.", href: "https://ignura.com", now: true },
  { name: "Okara", logo: "/logos/okara.png", tile: "#fff", role: "Product development intern", line: "An AI CMO. I got in by taking its dashboard apart, unasked.", href: "https://okara.ai" },
  { name: "MenuFit", logo: "/logos/menufit-bag-128.webp", role: "Product Designer", line: "Eating out healthy, 1.5 million users. New screens for the app.", href: "https://menufit.com" },
  { name: "SOF Agency", logo: "/logos/sof.png", role: "PR and partnerships", line: "PR, partnerships and crowdfunding for game studios.", href: "https://sof.agency" },
  { name: "Basket Ent", logo: "/logos/basketent.png", role: "Acquisitions and liveops", line: "Acquisitions, then liveops after each one.", href: "https://basketent.com" },
];
