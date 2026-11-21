// The /work gallery as data: the ads grouped into rooms by brand, in the order of the curation (its best piece first),
// with the rest of the design work hung between them as rooms of their own. Every surface that lists the work (the
// page, its filters, the sitemap, the share card, llms.txt) reads these rooms, so they cannot disagree.

import { ADS, type Ad } from "@/content/ads";
import { PROJECTS, type Media, type Project } from "@/content/work";

export type Entry = { key: string; href: string; media: Media; title: string; line: string };
export type Room = { key: string; title: string; note: string; count: string; entries: Entry[]; caseHref?: string };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** The ad's own line: its alt text up to the picture's description. */
export const headline = (a: Ad) => a.alt.split(". ").slice(0, -1).join(". ") || a.alt.replace(/\.$/, "");

export const adEntry = (a: Ad): Entry => ({ key: a.id, href: "/w/" + a.id, media: { src: a.src, w: a.w, h: a.h, alt: a.alt }, title: a.campaign, line: headline(a) });
const projectEntry = (p: Project): Entry => ({ key: p.slug, href: "/work/" + p.slug, media: p.cover, title: p.name, line: p.lines[0] });
const caseOf = (brand: string) => PROJECTS.find((p) => p.lane === "ads" && p.name === brand);

function brandRooms(): Room[] {
  const brands = [...new Set(ADS.map((a) => a.campaign))];
  const rooms: Room[] = [];
  const singles: Ad[] = [];
  for (const b of brands) {
    const ads = ADS.filter((a) => a.campaign === b);
    if (ads.length < 2) {
      singles.push(...ads);
      continue;
    }
    const c = caseOf(b);
    rooms.push({ key: slug(b), title: b, note: c?.lines[0] ?? "", count: ads.length + " ads", entries: ads.map(adEntry), caseHref: c ? "/work/" + c.slug : undefined });
  }
  if (singles.length) rooms.push({ key: "more-brands", title: "More brands", note: "", count: singles.length + " ads", entries: singles.map(adEntry) });
  return rooms;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const SITES = PROJECTS.filter((p) => p.lane === "brand-web");
const GAMES = PROJECTS.filter((p) => p.lane === "roblox" || p.lane === "3d");

const designRooms: Room[] = [
  { key: "brand-web", title: "Sites and products", note: "Brands, websites and a design tool, designed and built.", count: SITES.length + " projects", entries: SITES.map(projectEntry) },
  ...GAMES.map((p) => ({
    key: p.lane,
    title: p.name,
    note: p.lines.join(" "),
    count: "Roblox game",
    caseHref: "/work/" + p.slug,
    entries: [p.cover, ...p.blocks.flatMap((b) => (Array.isArray(b.media) ? b.media : [b.media]))].slice(0, 3).map((m, i) => ({ key: p.slug + "-" + i, href: "/work/" + p.slug, media: m, title: p.name, line: cap(m.alt.replace(/^[^:]*:\s*/, "")) })),
  })),
];

/** Brand rooms with the design rooms hung after the second and the fourth. */
export const ROOMS: Room[] = (() => {
  const brands = brandRooms();
  const out = [...brands];
  designRooms.forEach((r, i) => out.splice(Math.min(out.length, 2 + i * 3), 0, r));
  return out;
})();

export const roomByKey = (k: string | undefined) => ROOMS.find((r) => r.key === k);
