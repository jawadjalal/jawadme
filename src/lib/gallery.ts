// The /work gallery as data, in the order a visitor meets it: the ads by brand (each room in curation order, its best
// piece first), then the websites, then the 3D and the game at a smaller scale. Every surface that lists the work (the
// page, its filters, the viewer's order, the sitemap, the share card, llms.txt) reads these rooms, so they cannot disagree.

import { ADS, type Ad } from "@/content/ads";
import { PROJECTS, type Media, type Project } from "@/content/work";
import { BEVEL, CONCEPTS, COSMOS, IGNARU, SITES, type DesignPiece } from "@/lib/design";

/** A picture with its own address at /w/<id>. */
export type Piece = { id: string; src: string; sm: string; w: number; h: number; alt: string; line: string; group: string; credit: string; kind: string; spec: boolean };
export type Entry = { key: string; href: string; media: Media; title: string; line: string; piece?: Piece };
export type Section = "ads" | "web" | "3d";
export type Room = { key: string; title: string; note: string; count: string; entries: Entry[]; section: Section; caseHref?: string };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** The ad's own line: its alt text up to the picture's description. */
export const headline = (a: Ad) => a.alt.split(". ").slice(0, -1).join(". ") || a.alt.replace(/\.$/, "");

const pieceEntry = (p: Piece): Entry => ({ key: p.id, href: "/w/" + p.id, media: { src: p.src, w: p.w, h: p.h, alt: p.alt }, title: p.group, line: p.line, piece: p });
const adPiece = (a: Ad): Piece => ({ id: a.id, src: a.src, sm: a.sm, w: a.w, h: a.h, alt: a.alt, line: headline(a), group: a.campaign, credit: "designed by Jawad Jalal", kind: "Ad design", spec: a.spec });
export const adEntry = (a: Ad): Entry => pieceEntry(adPiece(a));
const design = (credit: string, kind: string) => (d: DesignPiece) => pieceEntry({ ...d, credit, kind });
const projectEntry = (p: Project): Entry => ({ key: p.slug, href: "/work/" + p.slug, media: p.cover, title: p.name, line: p.lines[0] });
const project = (s: string) => PROJECTS.find((p) => p.slug === s)!;
const caseOf = (brand: string) => PROJECTS.find((p) => p.lane === "ads" && p.name === brand);

function adRooms(): Room[] {
  const rooms: Room[] = [];
  const singles: Ad[] = [];
  for (const b of new Set(ADS.map((a) => a.campaign))) {
    const ads = ADS.filter((a) => a.campaign === b);
    if (ads.length < 2) {
      singles.push(...ads);
      continue;
    }
    const c = caseOf(b);
    rooms.push({ key: slug(b), title: b, note: c?.lines[0] ?? "", count: ads.length + " ads", entries: ads.map(adEntry), section: "ads", caseHref: c ? "/work/" + c.slug : undefined });
  }
  if (singles.length) rooms.push({ key: "more-brands", title: "More brands", note: "", count: singles.length + " ads", entries: singles.map(adEntry), section: "ads" });
  return rooms;
}

const web = design("designed and built by Jawad Jalal", "Web design");
const ignaru = project("ignaru");
const fracture = project("derelict-depths");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const sites = [project("ignura"), project("ignura-seo"), project("coresrent")].map(projectEntry).concat(SITES.map(web));

export const ROOMS: Room[] = [
  ...adRooms(),
  { key: "websites", title: "Websites", note: "For his studio, his 3D team and his clients.", count: sites.length + " sites", entries: sites, section: "web" },
  { key: "ignaru", title: "Ignaru", note: ignaru.lines.join(" "), count: "Design tool", entries: [projectEntry(ignaru), ...IGNARU.map(design("designed and built by Jawad Jalal", "Product design"))], section: "web", caseHref: "/work/ignaru" },
  { key: "concepts", title: "Concepts", note: "Pitch sites, redesigns and templates.", count: CONCEPTS.length + " sites", entries: CONCEPTS.map(web), section: "web" },
  { key: "cosmos-models", title: "Cosmos Models", note: "His 3D portfolio from age 13, and 3D art for Blade Ball and Fish It!", count: COSMOS.length + " pieces", entries: COSMOS.map(design("3D by Jawad Jalal", "3D")), section: "3d" },
  { key: "bevel", title: "Bevel", note: "The 3D art team he founded. These pieces are the team's.", count: BEVEL.length + " pieces", entries: BEVEL.map(design("made by the 3D art team he founded", "3D")), section: "3d" },
  {
    key: "fracture",
    title: fracture.name,
    note: fracture.lines.join(" "),
    count: "Roblox game",
    caseHref: "/work/" + fracture.slug,
    section: "3d",
    entries: [fracture.cover, ...fracture.blocks.flatMap((b) => (Array.isArray(b.media) ? b.media : [b.media]))].slice(0, 3).map((m, i) => ({ key: fracture.slug + "-" + i, href: "/work/" + fracture.slug, media: m, title: fracture.name, line: cap(m.alt.replace(/^[^:]*:\s*/, "")) })),
  },
];

/** Every picture with its own address, in the order the gallery hangs them. */
export const GALLERY: Piece[] = ROOMS.flatMap((r) => r.entries.flatMap((e) => (e.piece ? [e.piece] : [])));

export const roomByKey = (k: string | undefined) => ROOMS.find((r) => r.key === k);
