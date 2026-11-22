// The /work gallery as data, in the order a visitor meets it: the ads in one rail (curation order, the newest drop
// first), then the websites, the design tool, the 3D and the game. Every surface that lists the work (the page, the
// viewer's order, the sitemap, the share card, llms.txt) reads these rooms, so they cannot disagree.

import { ADS, type Ad } from "@/content/ads";
import { PROJECTS, type Media, type Project } from "@/content/work";
import { BEVEL, CONCEPTS, COSMOS, IGNARU, SITES, type DesignPiece } from "@/lib/design";

/** A picture with its own address at /w/<id>. */
export type Piece = { id: string; src: string; sm: string; w: number; h: number; alt: string; line: string; group: string; credit: string; kind: string; spec: boolean; slides?: Pic[]; video?: string };
/** a breakdown's slide after its cover */
export type Pic = { src: string; w: number; h: number };
/** `fact` and `year` only where the repo has them (a role's company context, a case's year); never made up. */
export type Entry = { key: string; href: string; media: Media; title: string; line: string; piece?: Piece; fact?: string; year?: number };
export type Section = "ads" | "web" | "3d";
export type Room = { key: string; title: string; note: string; count: string; entries: Entry[]; section: Section; caseHref?: string };

/** The ad's own line: its alt text up to the picture's description. */
export const headline = (a: Ad) => a.alt.split(". ").slice(0, -1).join(". ") || a.alt.replace(/\.$/, "");

const pieceEntry = (p: Piece): Entry => ({ key: p.id, href: "/w/" + p.id, media: { src: p.src, w: p.w, h: p.h, alt: p.alt }, title: p.group, line: p.line, piece: p });
export const adPiece = (a: Ad): Piece => ({ id: a.id, src: a.src, sm: a.sm, w: a.w, h: a.h, alt: a.alt, line: headline(a), group: a.campaign, credit: "designed by jawad jalal", kind: "ad design", spec: a.spec });
export const adEntry = (a: Ad): Entry => pieceEntry(adPiece(a));
/** Facts from his cv (scripts/cv.mjs) and content/site.ts, by project slug or piece id. */
const FACT: Record<string, string> = { ignura: "six figure arr", "site-menufit": "7-figure mrr", "site-bevel": "six figure arr" };
const design = (credit: string, kind: string) => (d: DesignPiece) => ({ ...pieceEntry({ ...d, credit, kind }), fact: FACT[d.id] });
const projectEntry = (p: Project): Entry => ({ key: p.slug, href: "/work/" + p.slug, media: p.cover, title: p.name, line: p.lines[0], fact: FACT[p.slug], year: p.year });
const project = (s: string) => PROJECTS.find((p) => p.slug === s)!;
/** an ad campaign's case study, when it has one */
export const caseOf = (brand: string) => PROJECTS.find((p) => p.lane === "ads" && p.name === brand);

const web = design("designed and built by jawad jalal", "web design");
const ignaru = project("ignaru");
const fracture = project("fracture");

const sites = [project("ignura"), project("ignura-seo"), project("coresrent")].map(projectEntry).concat(SITES.map(web));

export const ROOMS: Room[] = [
  { key: "ads", title: "ads", note: "", count: ADS.length + " ads", entries: ADS.map(adEntry), section: "ads" },
  { key: "websites", title: "websites", note: "for his studio, his 3d team and his clients.", count: sites.length + " sites", entries: sites, section: "web" },
  { key: "ignaru", title: "ignaru", note: ignaru.lines.join(" "), count: "design tool", entries: [projectEntry(ignaru), ...IGNARU.map(design("designed and built by jawad jalal", "product design"))], section: "web", caseHref: "/work/ignaru" },
  { key: "concepts", title: "concepts", note: "pitch sites, redesigns and templates.", count: CONCEPTS.length + " sites", entries: CONCEPTS.map(web), section: "web" },
  { key: "cosmos-models", title: "cosmos models", note: "his 3d portfolio from age 13, and 3d art for blade ball and fish it, two of roblox's biggest games (over 11 billion visits between them).", count: COSMOS.length + " pieces", entries: COSMOS.map(design("3d by jawad jalal", "3d")), section: "3d" },
  { key: "bevel", title: "bevel", note: "the 3d art team he founded. these pieces are the team's.", count: BEVEL.length + " pieces", entries: BEVEL.map(design("made by the 3d art team he founded", "3d")), section: "3d" },
  { key: "fracture", title: fracture.name, note: fracture.lines.join(" "), count: "roblox game", entries: [projectEntry(fracture)], section: "3d", caseHref: "/work/" + fracture.slug },
];

/** Every picture with its own address, in the order the gallery hangs them. */
export const GALLERY: Piece[] = ROOMS.flatMap((r) => r.entries.flatMap((e) => (e.piece ? [e.piece] : [])));
