// The board: every design laid out once, scattered in clusters by kind like continents, which the engine then wraps
// onto a globe. World units are close to the files' own pixels (a strip page is about 2400 tall), so 100% on the zoom
// readout is roughly the file at its real size. Pure and deterministic: a seeded scatter, so the server and the browser
// lay out the same board.

export type Asset = {
  id: string;
  title: string;
  group: string;
  kind: string;
  size: string;
  w: number;
  h: number;
  type: "image" | "video" | "gif";
  preview: string;
  original: string;
  thumb?: string;
  svg?: string;
  pdf?: string;
};

export type Rect = { x: number; y: number; w: number; h: number };

export type Piece = Rect & {
  a: Asset;
  i: number;
  cluster: number;
  block: number;
  /** the small name over the frame: the size inside a design, the title on a wall of singles */
  label: string;
};

export type Label = { x: number; y: number; size: number; text: string; note?: string; kind: "design" | "frame" };

export type Cluster = Rect & { kind: string; name: string; count: number; title: number; first: number; last: number };

export type Board = Rect & { pieces: Piece[]; clusters: Cluster[]; labels: Label[] };

export const KIND_NAME: Record<string, string> = {
  sponsors: "Capy posters v3, with every sponsor",
  strips: "Manga strips",
  rebuilds: "Level-up rebuilds",
  posters: "Posters",
  banners: "Banners",
  stickers: "Stickers",
  wallpapers: "Wallpapers",
  social: "Social",
  badges: "Badges",
  signs: "Signs",
  slides: "Slides",
  motion: "Motion",
};
export const kindName = (k: string) => KIND_NAME[k] ?? k.charAt(0).toUpperCase() + k.slice(1).replace(/-/g, " ");

/** Row height per kind, in world units: the strips lead and are set largest. */
const ROW: Record<string, number> = {
  sponsors: 2400,
  strips: 2400,
  rebuilds: 1700,
  posters: 1700,
  banners: 1600,
  stickers: 1200,
  wallpapers: 1500,
  social: 1350,
  badges: 1500,
  signs: 1400,
  slides: 900,
  motion: 1080,
};
/** How wide each cluster is allowed to run, as a share of its square-ish packing: strips run wide, the rest stack. */
const ASPECT: Record<string, number> = { sponsors: 2.1, strips: 2.1, rebuilds: 1.8, banners: 1.9, stickers: 1.9, slides: 1.9, signs: 1.8, badges: 1.8 };

const typeRank = { video: 0, image: 1, gif: 2 } as const;
/** One frame per shape: a sticker at 1024 and 2048, or a loop as MP4 and GIF, is one piece. */
export function faces(g: Asset[]): Asset[] {
  const by = new Map<string, Asset>();
  for (const a of g) {
    const key = (a.w / a.h).toFixed(2);
    const b = by.get(key);
    if (!b || typeRank[a.type] < typeRank[b.type] || (a.type === b.type && a.w * a.h > b.w * b.h)) by.set(key, a);
  }
  const keep = new Set(by.values());
  return g.filter((a) => keep.has(a));
}

type Item = { a: Asset; x: number; y: number; w: number; h: number; label: string };
type Block = { w: number; h: number; items: Item[]; title?: string; note?: string; head: number };

const ratio = (a: Asset) => Math.min(Math.max(a.w / a.h, 0.3), 4);

/** A single piece as its own block, a touch bigger or smaller than its neighbours so the scatter never reads as a grid. */
function singleBlock(a: Asset, label: string, H: number, rnd: () => number): Block {
  const h = H * (0.78 + rnd() * 0.42);
  const head = h * 0.09;
  const w = ratio(a) * h;
  return { w, h: head + h, items: [{ a, x: 0, y: head, w, h, label }], head };
}

/** A seeded random (mulberry32 over a string hash): the same scatter on the server and in the browser. */
function seeded(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Scatters boxes outward from the origin along a jittered golden-angle spiral: each one takes the first free spot, so the
 * first boxes sit in the middle and the rest settle round them in a loose, round island. `squash` flattens it a little
 * for wide screens.
 */
function scatter(boxes: { w: number; h: number }[], gap: number, rnd: () => number, squash = 0.82): Rect[] {
  const out: Rect[] = [];
  if (!boxes.length) return out;
  const area = boxes.reduce((s, b) => s + (b.w + gap) * (b.h + gap), 0);
  const step = Math.sqrt(area / boxes.length) * 0.22;
  const a0 = rnd() * Math.PI * 2;
  let k0 = 0;
  for (const b of boxes) {
    for (let k = Math.max(0, k0 - 40); ; k++) {
      const r = step * Math.sqrt(k);
      const t = a0 + k * 2.39996323;
      const x = r * Math.cos(t) + (rnd() - 0.5) * step * 0.7 - b.w / 2;
      const y = r * Math.sin(t) * squash + (rnd() - 0.5) * step * 0.7 - b.h / 2;
      if (!out.some((o) => x < o.x + o.w + gap && x + b.w + gap > o.x && y < o.y + o.h + gap && y + b.h + gap > o.y)) {
        out.push({ x, y, w: b.w, h: b.h });
        k0 = k;
        break;
      }
    }
  }
  return out;
}

const bounds = (rs: Rect[]) => {
  const x = Math.min(...rs.map((r) => r.x));
  const y = Math.min(...rs.map((r) => r.y));
  return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y };
};

export function layoutBoard(assets: Asset[], kinds: string[]): Board {
  const pieces: Piece[] = [];
  const labels: Label[] = [];
  const clusters: Cluster[] = [];

  // each kind scattered on its own, round the origin: the biggest blocks in the middle, the small ones round them
  const laid = kinds.map((kind) => {
    const H = ROW[kind] ?? 1400;
    const rnd = seeded(kind);
    const groups = new Map<string, Asset[]>();
    for (const a of assets) if (a.kind === kind) groups.set(a.group, [...(groups.get(a.group) ?? []), a]);
    const shown = [...groups.values()].map(faces);
    // every frame is its own piece, so the island reads as a scatter, not a grid; a design's sizes stay neighbours
    const blocks = shown.flatMap((g) => g.map((a) => singleBlock(a, g.length > 1 ? a.size : a.title, H, rnd)));
    const at = scatter(blocks, H * 0.28, rnd);
    const bb = at.length ? bounds(at) : { x: 0, y: 0, w: H, h: H };
    const placed = blocks.map((b, i) => ({ b, x: at[i].x - bb.x, y: at[i].y - bb.y }));
    return { kind, H, placed, w: bb.w, h: bb.h, count: shown.reduce((s, g) => s + g.length, 0) };
  });

  // the clusters scattered the same way, as continents, the first kind in the middle. Titles are one world size
  // everywhere, and a cluster is never narrower than its title.
  const T = 4200;
  const G = 4200;
  const head = T * 1.35;
  const widths = laid.map((c) => Math.max(c.w, kindName(c.kind).length * T * 0.5 + T * 1.1));
  const spots = scatter(
    laid.map((c, ci) => ({ w: widths[ci], h: c.h + head })),
    G,
    seeded("board"),
    0.7,
  );
  const all = bounds(spots);
  laid.forEach((c, ci) => {
    const ox = spots[ci].x - all.x;
    const oy = spots[ci].y - all.y;
    const cx = ox + (widths[ci] - c.w) / 2;
    const cy = oy + head;
    const first = pieces.length;
    c.placed.forEach(({ b, x: bx, y: by }, bi) => {
      if (b.title) labels.push({ kind: "design", x: cx + bx, y: cy + by + b.head * 0.42, size: c.H * 0.075, text: b.title, note: b.note });
      for (const it of b.items) {
        const p: Piece = { a: it.a, i: pieces.length, x: cx + bx + it.x, y: cy + by + it.y, w: it.w, h: it.h, cluster: ci, block: bi, label: it.label };
        pieces.push(p);
        labels.push({ kind: "frame", x: p.x, y: p.y - c.H * 0.022, size: c.H * 0.032, text: it.label });
      }
    });
    clusters.push({ kind: c.kind, name: kindName(c.kind), count: c.count, x: ox, y: oy, w: widths[ci], h: c.h + head, title: T, first, last: pieces.length - 1 });
  });
  return { x: 0, y: 0, w: all.w, h: all.h, pieces, clusters, labels };
}

/** Assets left off the board: the "big 15" number posters, whose whole picture is the numeral. */
export const LEFT_OUT = /^number-15/;
