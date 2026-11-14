// The board: every design laid out once, in clusters by kind, the way a design file looks from above. World units are
// close to the files' own pixels (a strip page is about 2400 tall), so 100% on the zoom readout is roughly the file at
// its real size. Pure and deterministic: the server and the browser lay out the same board.

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
const ASPECT: Record<string, number> = { strips: 2.1, rebuilds: 1.8, banners: 1.9, stickers: 1.9, slides: 1.9, signs: 1.8, badges: 1.8 };

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

/** Splits aspects, in order, into k rows whose aspect sums sit as close to the even share as possible. */
function partition(rs: number[], k: number): number[][] {
  const n = rs.length;
  if (k >= n) return rs.map((_, i) => [i]);
  const pre = [0];
  for (const r of rs) pre.push(pre[pre.length - 1] + r);
  const even = pre[n] / k;
  const best = Array.from({ length: n + 1 }, () => new Array<number>(k + 1).fill(Infinity));
  const cut = Array.from({ length: n + 1 }, () => new Array<number>(k + 1).fill(0));
  best[0][0] = 0;
  for (let j = 1; j <= n; j++)
    for (let m = 1; m <= Math.min(k, j); m++)
      for (let i = m - 1; i < j; i++) {
        const v = best[i][m - 1] + (pre[j] - pre[i] - even) ** 2;
        if (v < best[j][m]) {
          best[j][m] = v;
          cut[j][m] = i;
        }
      }
  const rows: number[][] = [];
  for (let j = n, m = k; m > 0; m--) {
    const i = cut[j][m];
    rows.unshift(Array.from({ length: j - i }, (_, x) => i + x));
    j = i;
  }
  return rows;
}

type Item = { a: Asset; x: number; y: number; w: number; h: number; label: string };
type Block = { w: number; h: number; items: Item[]; title?: string; note?: string; head: number };

const ratio = (a: Asset) => Math.min(Math.max(a.w / a.h, 0.3), 4);

/** A design in several sizes: its frames side by side, one height, bottom-aligned, each named by its size. */
function designBlock(g: Asset[], H: number): Block {
  const gap = H * 0.07;
  const head = H * 0.2;
  let x = 0;
  const items = g.map((a) => {
    const w = ratio(a) * H;
    const it = { a, x, y: head, w, h: H, label: a.size };
    x += w + gap;
    return it;
  });
  return { w: x - gap, h: head + H, items, title: g[0].title, note: `${g.length} sizes`, head };
}

/** Single pieces: justified rows that run the cluster's width, each named by its title. */
function wallBlocks(list: Asset[], H: number, W: number): Block[] {
  const gap = H * 0.08;
  const head = H * 0.09;
  const rs = list.map(ratio);
  const total = rs.reduce((s, r) => s + r, 0);
  const k = Math.max(1, Math.min(list.length, Math.round((total * H) / W)));
  return partition(rs, k).map((row) => {
    const sum = row.reduce((s, i) => s + rs[i], 0);
    const h = Math.min((W - gap * (row.length - 1)) / sum, H * 1.25);
    let x = 0;
    const items = row.map((i) => {
      const w = rs[i] * h;
      const it = { a: list[i], x, y: head, w, h, label: list[i].title };
      x += w + gap;
      return it;
    });
    return { w: x - gap, h: head + h, items, head };
  });
}

/** Blocks onto shelves no wider than W: left to right, then down. */
function shelve(blocks: Block[], W: number, gx: number, gy: number) {
  const placed: { b: Block; x: number; y: number }[] = [];
  let x = 0;
  let y = 0;
  let shelfH = 0;
  let maxW = 0;
  for (const b of blocks) {
    if (x > 0 && x + b.w > W) {
      y += shelfH + gy;
      x = 0;
      shelfH = 0;
    }
    placed.push({ b, x, y });
    x += b.w + gx;
    shelfH = Math.max(shelfH, b.h);
    maxW = Math.max(maxW, x - gx);
  }
  return { placed, w: maxW, h: y + shelfH };
}

export function layoutBoard(assets: Asset[], kinds: string[]): Board {
  const pieces: Piece[] = [];
  const labels: Label[] = [];
  const clusters: Cluster[] = [];

  // each kind laid out on its own, at the origin
  const laid = kinds.map((kind) => {
    const H = ROW[kind] ?? 1400;
    const groups = new Map<string, Asset[]>();
    for (const a of assets) if (a.kind === kind) groups.set(a.group, [...(groups.get(a.group) ?? []), a]);
    const shown = [...groups.values()].map(faces);
    const designs = shown.filter((g) => g.length > 1).map((g) => designBlock(g, H));
    const singles = shown.filter((g) => g.length === 1).map((g) => g[0]);
    const area = [...designs.map((b) => b.w * b.h), ...singles.map((a) => ratio(a) * H * H * 1.2)].reduce((s, v) => s + v, 0);
    const widest = Math.max(0, ...designs.map((b) => b.w));
    const W = Math.max(widest, Math.sqrt(area * (ASPECT[kind] ?? 1.6)));
    const walls = singles.length ? wallBlocks(singles, H, W) : [];
    const { placed, w, h } = shelve([...designs, ...walls], W, H * 0.3, H * 0.3);
    return { kind, H, placed, w, h, count: shown.reduce((s, g) => s + g.length, 0) };
  });

  // the clusters onto the board's own shelves, the strips first. Titles are one world size everywhere, and a cluster is
  // never narrower than its title. The shelf width is the one that fills a 16:10 screen best.
  const T = 1900;
  const G = 2400;
  const head = T * 1.35;
  const widths = laid.map((c) => Math.max(c.w, kindName(c.kind).length * T * 0.5 + T * 1.1));
  const pack = (BW: number) => {
    let x = 0;
    let y = 0;
    let shelfH = 0;
    let w = 0;
    const at = laid.map((c, ci) => {
      if (x > 0 && x + widths[ci] > BW) {
        y += shelfH + G;
        x = 0;
        shelfH = 0;
      }
      const pos = { x, y };
      x += widths[ci] + G;
      shelfH = Math.max(shelfH, c.h + head);
      w = Math.max(w, x - G);
      return pos;
    });
    return { at, w, h: y + shelfH };
  };
  const lo = Math.max(...widths, 1);
  const hi = widths.reduce((s, v) => s + v + G, 0);
  let best = pack(hi);
  for (let k = 0; k <= 60; k++) {
    const cand = pack(lo + ((hi - lo) * k) / 60);
    if (Math.min(16 / cand.w, 10 / cand.h) > Math.min(16 / best.w, 10 / best.h)) best = cand;
  }
  laid.forEach((c, ci) => {
    const cx = best.at[ci].x;
    const cy = best.at[ci].y + head;
    const first = pieces.length;
    c.placed.forEach(({ b, x: bx, y: by }, bi) => {
      if (b.title) labels.push({ kind: "design", x: cx + bx, y: cy + by + b.head * 0.42, size: c.H * 0.075, text: b.title, note: b.note });
      for (const it of b.items) {
        const p: Piece = { a: it.a, i: pieces.length, x: cx + bx + it.x, y: cy + by + it.y, w: it.w, h: it.h, cluster: ci, block: bi, label: it.label };
        pieces.push(p);
        labels.push({ kind: "frame", x: p.x, y: p.y - c.H * 0.022, size: c.H * 0.032, text: it.label });
      }
    });
    clusters.push({
      kind: c.kind,
      name: kindName(c.kind),
      count: c.count,
      x: cx,
      y: best.at[ci].y,
      w: widths[ci],
      h: c.h + head,
      title: T,
      first,
      last: pieces.length - 1,
    });
  });
  return { x: 0, y: 0, w: best.w, h: best.h, pieces, clusters, labels };
}

/** Assets left off the board: the "big 15" number posters, whose whole picture is the numeral. */
export const LEFT_OUT = /^number-15/;
