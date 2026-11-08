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
export const LINE = ["I'm Jawad. I make Ignaru,", "and design sites and ads for startups."] as const;

/**
 * Every door on the dial, in the order the turn passes along it and the drawer arrows step through it. `art` is the
 * door's own felt piece (first paint), `set` the pieces it changes between, `line` what the dial's centre says while it
 * is the door's turn or under the pointer (under 60 characters; the first door shows the page's line instead).
 */
export const DRAWERS = [
  { id: "ignaru", label: "Ignaru", art: "petal", set: ["petal", "claude", "openai", "gemini", "grok"], color: "#9a4dea", alt: "A purple felt petal, the Ignaru mark", line: "" },
  { id: "sites", label: "Site design", art: "browser", set: ["browser", "canvas", "poster"], color: "#f5b400", alt: "A yellow felt browser window", line: "Sites for startups, designed and built by hand." },
  { id: "ads", label: "The ad machine", art: "palette", set: ["palette", "bezier", "pen"], color: "#f0454f", alt: "A coral felt palette", line: "Ads that sell, tested on strangers before they run." },
  { id: "before", label: "Before", art: "phone", set: ["phone", "canvas-dashboard", "canvas-phone"], color: "#1f7ae0", alt: "A blue felt phone", line: "Before Ignaru: Okara, and new screens for MenuFit." },
  { id: "contact", label: "Contact", art: "call", set: ["call", "circle-comment", "onb-wave"], color: "#3fae63", alt: "A green felt calendar", line: "Email me, book a call, or take my CV." },
] as const;

export type DrawerId = (typeof DRAWERS)[number]["id"];
export const drawerAt = (id: DrawerId) => DRAWERS.findIndex((d) => d.id === id);

/** Ask the page to open one drawer, from anywhere (the bar, the "more" sheet, a link inside another drawer). */
export const openDrawer = (id: DrawerId) => dispatchEvent(new CustomEvent("fh-open", { detail: id }));

/** The bar's three links, each with its small felt mark. Each opens its drawer; the blog lives in "more". */
export const NAV = [
  { id: "ignaru", label: "Ignaru", art: "petal" },
  { id: "sites", label: "Sites", art: "browser" },
  { id: "ads", label: "Ads", art: "palette" },
] as const;

/** A lifted shade of a door's colour, for type and small marks on the dark drawer. */
export const lift = (hex: string) => `color-mix(in oklab, ${hex} 72%, #fff)`;

export type Site = { key: string; name: string; host: string; img: string; w: number; h: number; line: string };

/** The live sites in the Site design drawer. Stills shot at 1440 by 900 on a box (public/showcase and pumpgtm on 8 Nov
 *  2026, monid and ropilot on 5 and 7 Nov). */
export const SITES: Site[] = [
  { key: "roport", name: "Roport", host: "roport-concept.vercel.app", img: "/showcase/roport-1440.webp", w: 1440, h: 900, line: "A redesign concept for roport.lol, where you hire Roblox developers who shipped." },
  { key: "audora", name: "Audora", host: "audora-site.vercel.app", img: "/showcase/audora-1440.webp", w: 1440, h: 900, line: "A redesign concept for audora.art: paste a fanfic and hear it performed." },
  { key: "monid", name: "Monid", host: "monid-site.vercel.app", img: "/sites/monid.webp", w: 960, h: 600, line: "A spec redesign for Monid, one key for every tool an agent needs." },
  { key: "pumpgtm", name: "PumpGTM", host: "pumpgtm-site.vercel.app", img: "/sites/pumpgtm.webp", w: 1440, h: 900, line: "A redesign concept for pumpgtm.com, which finds buyers and starts the conversation." },
  { key: "ropilot", name: "Ropilot", host: "ropilot-site.vercel.app", img: "/sites/ropilot.webp", w: 960, h: 600, line: "Make Roblox games by asking: it writes, models and playtests." },
];

/** The four ads in the ad machine drawer: spec work, unasked, for two browsers and a screenshot app. */
export const ADS = [
  { key: "aside-297", src: "/ads/aside-297.webp", w: 880, h: 1100, brand: "Aside", alt: "Aside: 300 tasks on 136 websites. Aside passed 297. A grid of 300 marks, three left open." },
  { key: "shotbase-timestamp", src: "/ads/shotbase-timestamp.webp", w: 864, h: 1080, brand: "Shotbase", alt: "Shotbase: That's not a name. That's a timestamp. A screenshot named by date, about to get a smart name." },
  { key: "aside-manifesto", src: "/showcase/aside-manifesto-1080.webp", w: 1080, h: 1350, brand: "Aside", alt: "Aside, in black: Most modern software is just a tab. The apps it holds, drawn in type." },
  { key: "shotbase-reacted", src: "/ads/shotbase-reacted.webp", w: 864, h: 1080, brand: "Shotbase", alt: "Shotbase: They didn't reply. They all reacted at 0:42. A demo video with reactions stacked on one moment." },
] as const;
