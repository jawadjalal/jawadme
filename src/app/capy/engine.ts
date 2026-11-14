// The board engine: one <canvas>, a camera, a picture loader with levels of detail, the input (drag, trackpad, wheel,
// pinch, keys), camera flights and the tour. React only draws the chrome around it and listens to `onChange`.
//
// Camera: (x, y) is the world point at the centre of the screen, z is screen pixels per world unit. World units are
// close to the files' own pixels, so z = 1 reads as 100%.
//
// The globe: the flat board is seen through an orthographic globe lens centred on the camera. A world point at distance
// d from the camera sits at angle d / R round a sphere of radius R, so zoomed out the board is a planet with its edges
// curving away, and zoomed in (where d is tiny next to R) it is flat again. Panning spins the globe.

import type { Board, Piece, Rect } from "./arrange";
import { sized } from "./exporters";
import { END_CARD, TITLE_CARD, TOUR, TOUR_MS, type Shot, type TourTarget } from "./tour";

export type View = { x: number; y: number; z: number };

export type EngineState = {
  z: number;
  selected: number[];
  /** the cluster the camera is mostly looking at */
  cluster: number;
  touring: boolean;
  hover: number;
};

type Flight = { t0: number; dur: number; at: (t: number) => View; ease: (t: number) => number; done?: () => void };

const BLUE = "#3b5de8";
const INK = "#0a0a0a";
export const GROUND = "#ffffff";
const TILE = "#e2ded3";
const Z_MAX = 6;
const HALF_PI = Math.PI / 2;

/** One frame's globe lens: the camera centre, the scale, where the centre lands on screen, and the globe's radius. */
type Lens = { vx: number; vy: number; z: number; cx: number; cy: number; R: number };
type Pt = { x: number; y: number; th: number; f: number };
/** World to screen through the lens. `th` is the angle round the globe (past pi/2 is the far side), `f` the shrink there. */
function proj(L: Lens, wx: number, wy: number, o: Pt = { x: 0, y: 0, th: 0, f: 1 }): Pt {
  const dx = wx - L.vx;
  const dy = wy - L.vy;
  const d = Math.hypot(dx, dy);
  const th = d / L.R;
  const f = d < 1e-9 ? 1 : (L.R * Math.sin(Math.min(th, HALF_PI))) / d;
  o.x = L.cx + dx * f * L.z;
  o.y = L.cy + dy * f * L.z;
  o.th = th;
  o.f = f;
  return o;
}
/** Screen to world through the lens. Off the globe it continues flat from the rim, so pans never stall there. */
function unproj(L: Lens, sx: number, sy: number) {
  const ux = (sx - L.cx) / L.z;
  const uy = (sy - L.cy) / L.z;
  const r = Math.hypot(ux, uy);
  if (r < 1e-9) return { x: L.vx, y: L.vy };
  // past the rim the world carries on flat, so a drag or a pan that starts off the globe still moves 1:1
  const k = (r < L.R ? Math.asin(r / L.R) * L.R : L.R * HALF_PI + (r - L.R)) / r;
  return { x: L.vx + ux * k, y: L.vy + uy * k };
}
/** A rect's screen box through the lens: its corners and edge midpoints, boxed. `th` is the angle at its centre. */
const RP: Pt = { x: 0, y: 0, th: 0, f: 1 };
function projRect(L: Lens, r: Rect) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let i = 0; i < 9; i++) {
    proj(L, r.x + (r.w * (i % 3)) / 2, r.y + (r.h * Math.floor(i / 3)) / 2, RP);
    if (i === 4) continue;
    if (RP.x < x0) x0 = RP.x;
    if (RP.x > x1) x1 = RP.x;
    if (RP.y < y0) y0 = RP.y;
    if (RP.y > y1) y1 = RP.y;
  }
  proj(L, r.x + r.w / 2, r.y + r.h / 2, RP);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, th: RP.th, f: RP.f };
}

// ── easing ────────────────────────────────────────────────────────────────
const EASE = {
  glide: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  whip: (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),
  out: (t: number) => 1 - (1 - t) ** 3,
  sine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
};
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * The smooth zoom-and-pan path of van Wijk and Nuij (the one d3 uses): the camera pulls out while it travels so a long
 * flight never smears. Views are [centre x, centre y, width of view in world units]. rho 0 is a straight line.
 */
function zoomPath(a: [number, number, number], b: [number, number, number], rho: number) {
  const [ux0, uy0, w0] = a;
  const [ux1, uy1, w1] = b;
  const dx = ux1 - ux0;
  const dy = uy1 - uy0;
  const d2 = dx * dx + dy * dy;
  if (rho < 0.05 || d2 < 1e-6) {
    // straight: centre moves linearly, the width moves in log space
    const r = Math.log(w1 / w0);
    return { S: Math.abs(r) + Math.sqrt(d2) / Math.max(w0, w1), at: (t: number): [number, number, number] => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(r * t)] };
  }
  const rho2 = rho * rho;
  const rho4 = rho2 * rho2;
  const d1 = Math.sqrt(d2);
  const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
  const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const S = (r1 - r0) / rho;
  return {
    S,
    at: (t: number): [number, number, number] => {
      const s = t * S;
      const c0 = Math.cosh(r0);
      const u = (w0 / (rho2 * d1)) * (c0 * Math.tanh(rho * s + r0) - Math.sinh(r0));
      return [ux0 + u * dx, uy0 + u * dy, (w0 * c0) / Math.cosh(rho * s + r0)];
    },
  };
}

// ── pictures ──────────────────────────────────────────────────────────────
// Level 0 and 1 are 256 and 640 wide copies from the image optimizer, 2 is the site's web preview (about 1200 on the
// long side), 3 is the original file. A piece asks for the smallest level that is sharp at its size on screen.
type Tex = { img: HTMLImageElement | null; state: 0 | 1 | 2 | 3; used: number; at?: number };
const ST = { none: 0, loading: 1, ready: 2, failed: 3 } as const;
const BUDGET = [Infinity, 160, 48, 6];

class Pictures {
  tex: Tex[][];
  queue: { i: number; l: number; pri: number }[] = [];
  inflight = 0;
  max = 8;
  /** when the last picture arrived, so the board keeps drawing while new ones pop in */
  last = 0;
  onReady: () => void;
  constructor(
    private pieces: Piece[],
    onReady: () => void,
  ) {
    this.tex = pieces.map(() => [0, 1, 2, 3].map(() => ({ img: null, state: ST.none, used: 0 }) as Tex));
    this.onReady = onReady;
  }
  url(i: number, l: number) {
    const a = this.pieces[i].a;
    if (l === 0) return sized(a.preview, 256, 70);
    if (l === 1) return sized(a.preview, 640, 74);
    if (l === 2) return a.preview;
    return a.original;
  }
  /** The level a piece wants for `px` device pixels of width on screen. */
  want(i: number, px: number) {
    const a = this.pieces[i].a;
    if (px <= 300) return 0;
    if (px <= 720) return 1;
    const pw = a.w * Math.min(1, 1200 / Math.max(a.w, a.h));
    if (px <= pw * 1.3 || a.type !== "image") return 2;
    return 3;
  }
  request(i: number, l: number, pri: number) {
    const t = this.tex[i][l];
    if (t.state !== ST.none) return;
    const q = this.queue.find((x) => x.i === i && x.l === l);
    if (q) q.pri = Math.min(q.pri, pri);
    else this.queue.push({ i, l, pri });
  }
  pump() {
    if (!this.queue.length || this.inflight >= this.max) return;
    this.queue.sort((a, b) => a.pri - b.pri);
    while (this.queue.length && this.inflight < this.max) {
      const { i, l } = this.queue.shift()!;
      const t = this.tex[i][l];
      if (t.state !== ST.none) continue;
      t.state = ST.loading;
      this.inflight++;
      const img = new Image();
      img.decoding = "async";
      img.src = this.url(i, l);
      img
        .decode()
        .then(() => {
          t.img = img;
          t.state = ST.ready;
          t.used = performance.now();
          t.at = performance.now();
          this.last = t.at;
          this.evict(l);
          this.onReady();
        })
        .catch(() => {
          t.state = ST.failed;
          // no optimizer (a plain static host): the small levels fall back to the preview
          if (l < 2) this.request(i, 2, 0);
        })
        .finally(() => {
          this.inflight--;
          this.pump();
        });
    }
  }
  /** The sharpest ready picture at or under the wanted level, else any ready one. */
  best(i: number, l: number, now: number): HTMLImageElement | null {
    const ts = this.tex[i];
    for (let k = l; k >= 0; k--) if (ts[k].state === ST.ready) return (ts[k].used = now), ts[k].img;
    for (let k = l + 1; k < 4; k++) if (ts[k].state === ST.ready) return (ts[k].used = now), ts[k].img;
    return null;
  }
  /** 0 to 1: how far the first picture of a piece has popped in */
  pop(i: number) {
    const t = this.tex[i][0];
    if (t.state !== ST.ready || !t.at) return 1;
    return Math.min(1, (performance.now() - t.at) / 320);
  }
  ready(i: number, l: number) {
    const s = this.tex[i][l].state;
    return s === ST.ready || s === ST.failed;
  }
  evict(l: number) {
    const held = this.tex.map((ts, i) => ({ i, t: ts[l] })).filter((x) => x.t.state === ST.ready);
    if (held.length <= BUDGET[l]) return;
    held.sort((a, b) => a.t.used - b.t.used);
    // the oldest go; a picture drawn in the last half second is on screen and stays
    const recent = performance.now() - 500;
    for (const { t } of held.slice(0, held.length - BUDGET[l])) {
      if (t.used > recent) continue;
      t.img = null;
      t.state = ST.none;
    }
  }
  get idle() {
    return this.inflight === 0 && this.queue.length === 0;
  }
}

// ── the engine ────────────────────────────────────────────────────────────
export class Engine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  board: Board;
  view: View = { x: 0, y: 0, z: 0.05 };
  vw = 1;
  vh = 1;
  dpr = 1;
  /** screen insets the chrome covers, so fits and flights frame things in the clear part */
  inset = { t: 72, r: 24, b: 88, l: 24 };
  /** the globe's radius in world units: the board's far corners sit about 86 degrees round it */
  R = 1;
  pics: Pictures;
  selected: number[] = [];
  hover = -1;
  flight: Flight | null = null;
  tour: { t0: number; i: number; shotT0: number; path: ((t: number) => View) | null; from: View; target: View; landed?: boolean } | null = null;
  hidden = false;
  /** true once anyone has moved the camera; until then a resize or a chrome change refits the board */
  touched = false;
  fonts = { sans: "ui-sans-serif, system-ui, sans-serif", print: "Impact, sans-serif" };
  onChange: (s: EngineState) => void = () => {};
  /** frame times while the tour runs, for measuring */
  frames: number[] = [];
  /** record mode: the clock only moves when the recorder says so */
  manual: number | null = null;

  private raf = 0;
  private dirty = true;
  private last = 0;
  private vel = { x: 0, y: 0 };
  private pointers = new Map<number, { x: number; y: number }>();
  private drag: { x: number; y: number; t: number; moved: number; samples: { x: number; y: number; t: number }[]; mode: "pan" | "marquee"; add: boolean } | null = null;
  private pinch: { d: number; cx: number; cy: number } | null = null;
  /** the marquee, in screen px */
  private marquee: Rect | null = null;
  private back: View | null = null;
  private videos = new Map<number, HTMLVideoElement>();
  private videoBox: HTMLDivElement;
  private lastState = "";
  private lastDx = 0;
  /** camera speed in screen px per ms, smoothed: drives the speed lines */
  private speed = 0;
  private prevView: View | null = null;
  /** the punch when a flight lands on a piece */
  private impact: { t0: number } | null = null;
  /** hover lift, eased per piece */
  private lift = new Map<number, number>();
  private mini: { x: number; y: number; w: number; h: number; k: number } | null = null;
  private miniDrag = false;
  /** prefers-reduced-motion: flights cut, no throw, no drift */
  calm = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  private off: (() => void)[] = [];
  private born = performance.now();

  constructor(canvas: HTMLCanvasElement, board: Board) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.board = board;
    // the board's corners stay just this side of the horizon at the whole-board view
    this.R = Math.max(1, Math.hypot(board.w, board.h) / 2 / 1.5);
    this.pics = new Pictures(board.pieces, () => (this.dirty = true));
    this.videoBox = document.createElement("div");
    this.videoBox.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
    document.body.appendChild(this.videoBox);
    this.resize();
    this.view = this.fitView(board, 1);
    this.bind();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.off.forEach((f) => f());
    this.prune(new Set());
    this.videoBox.remove();
  }

  now() {
    return this.manual ?? performance.now();
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.vw = Math.max(1, r.width);
    this.vh = Math.max(1, r.height);
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.vw * this.dpr);
    this.canvas.height = Math.round(this.vh * this.dpr);
    if (!this.touched && this.board) this.view = this.fitView(this.board);
    this.dirty = true;
  }

  // ── camera maths ────────────────────────────────────────────────────────
  get zMin() {
    return this.fitView(this.board, 1).z * 0.45;
  }
  /** The view that frames `r` in the clear part of the screen, with `pad` as a share of it left around. */
  fitView(r: Rect, pad = 1, inset = this.inset): View {
    const aw = Math.max(40, this.vw - inset.l - inset.r);
    const ah = Math.max(40, this.vh - inset.t - inset.b);
    const m = pad === 1 ? 0.06 : 0.1;
    // on the globe a rect's half-width w shows as R sin(w / R): a big rect curves away and needs less room
    const ext = (half: number) => 2 * this.R * Math.sin(Math.min(half / this.R, HALF_PI));
    // the whole board frames the whole globe, rim and all: that is the shot that reads as a planet
    const z = r === this.board ? (Math.min(aw, ah) * (1 - m * 2)) / (2 * this.R) : Math.min((aw * (1 - m * 2)) / ext(r.w / 2), (ah * (1 - m * 2)) / ext(r.h / 2), Z_MAX);
    // the globe is drawn about the screen centre, so the whole board keeps the camera on its own centre
    if (r === this.board) return { x: r.x + r.w / 2, y: r.y + r.h / 2, z };
    // shift the centre so the rect sits in the middle of the clear area, not of the whole screen
    const cx = r.x + r.w / 2 - (inset.l - inset.r) / 2 / z;
    const cy = r.y + r.h / 2 - (inset.t - inset.b) / 2 / z;
    return { x: cx, y: cy, z };
  }
  lens(view: View = this.view, cx = this.vw / 2, cy = this.vh / 2, z = view.z): Lens {
    return { vx: view.x, vy: view.y, z, cx, cy, R: this.R };
  }
  /** How far the world reaches from the centre for `s` screen px: past the globe's rim it stops at a quarter turn. */
  half(s: number, z = this.view.z) {
    const q = s / (z * this.R);
    return q >= 1 ? this.R * HALF_PI : this.R * Math.asin(q);
  }
  toWorld(sx: number, sy: number) {
    return unproj(this.lens(), sx, sy);
  }
  zoomAt(sx: number, sy: number, k: number) {
    const w = this.toWorld(sx, sy);
    const z = clamp(this.view.z * k, this.zMin, Z_MAX);
    const off = Math.hypot(sx - this.vw / 2, sy - this.vh / 2);
    if (off >= 0.97 * this.R * this.view.z) {
      // the cursor is off the globe (or on its very rim): no point there to hold, so zoom about the centre
      this.view = { ...this.view, z };
      this.dirty = true;
      return;
    }
    // keep the world point under the cursor: a damped solve, since the lens squeezes moves near the rim by cos(th)
    const v = { x: w.x - (sx - this.vw / 2) / z, y: w.y - (sy - this.vh / 2) / z, z };
    let best = { ...v };
    let bestE = Infinity;
    if (off > 0.5)
      for (let n = 0; n < 12; n++) {
        const o = proj(this.lens(v), w.x, w.y);
        const e = Math.hypot(o.x - sx, o.y - sy);
        if (e < bestE) (bestE = e), (best = { ...v });
        if (e < 0.5 || o.th >= HALF_PI) break;
        const k = z * Math.max(Math.cos(o.th), 0.25);
        v.x += (o.x - sx) / k;
        v.y += (o.y - sy) / k;
      }
    else best = v;
    this.view = best;
    this.dirty = true;
  }
  pieceAt(sx: number, sy: number) {
    const L = this.lens();
    const ps = this.board.pieces;
    for (let i = ps.length - 1; i >= 0; i--) {
      const r = projRect(L, ps[i]);
      if (r.th < HALF_PI && sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h) return i;
    }
    return -1;
  }
  /** The cluster with the most of itself on screen. */
  activeCluster() {
    const { x, y } = this.view;
    const hw = this.half(this.vw / 2);
    const hh = this.half(this.vh / 2);
    let best = 0;
    let bi = 0;
    this.board.clusters.forEach((c, i) => {
      const ox = Math.max(0, Math.min(x + hw, c.x + c.w) - Math.max(x - hw, c.x));
      const oy = Math.max(0, Math.min(y + hh, c.y + c.h) - Math.max(y - hh, c.y));
      const a = ox * oy;
      if (a > best) (best = a), (bi = i);
    });
    return bi;
  }
  visiblePieces(): Piece[] {
    const { x, y } = this.view;
    const hw = this.half(this.vw / 2);
    const hh = this.half(this.vh / 2);
    return this.board.pieces.filter((p) => p.x < x + hw && p.x + p.w > x - hw && p.y < y + hh && p.y + p.h > y - hh);
  }

  // ── flights ─────────────────────────────────────────────────────────────
  stopMotion() {
    this.flight = null;
    this.vel = { x: 0, y: 0 };
    if (this.tour) this.stopTour();
  }
  flyTo(target: View, opts: { dur?: number; rho?: number; ease?: (t: number) => number; done?: () => void; punch?: boolean } = {}) {
    this.touched = true;
    const from = { ...this.view };
    const p = zoomPath([from.x, from.y, this.vw / from.z], [target.x, target.y, this.vw / target.z], opts.rho ?? 1.1);
    const dur = this.calm ? 1 : (opts.dur ?? clamp(Math.abs(p.S) * 230, 500, 700));
    this.flight = {
      t0: this.now(),
      dur,
      ease: opts.ease ?? EASE.glide,
      at: (t) => {
        const [x, y, w] = p.at(t);
        return { x, y, z: this.vw / w };
      },
      done: () => {
        if (opts.punch && !this.calm) this.impact = { t0: this.now() };
        opts.done?.();
      },
    };
    this.dirty = true;
  }
  rectOf(t: TourTarget): Rect | null {
    const b = this.board;
    if ("all" in t) return b;
    if ("cluster" in t) return b.clusters.find((c) => c.kind === t.cluster) ?? null;
    if ("group" in t) {
      const ps = b.pieces.filter((p) => p.a.group === t.group);
      return ps.length ? unionRect(ps) : null;
    }
    const p = b.pieces.find((q) => q.a.id === t.piece);
    if (!p) return null;
    if (!t.frac) return p;
    const [x0, y0, x1, y1] = t.frac;
    return { x: p.x + p.w * x0, y: p.y + p.h * y0, w: p.w * (x1 - x0), h: p.h * (y1 - y0) };
  }

  select(ids: number[], fly = true) {
    this.selected = ids;
    if (fly && ids.length) {
      const r = ids.length === 1 ? this.board.pieces[ids[0]] : unionRect(ids.map((i) => this.board.pieces[i]));
      this.flyTo(this.fitView(r, 0), { punch: ids.length === 1 });
    }
    this.dirty = true;
  }
  /** Click: focus a piece, remembering where we came from so Esc flies back out. */
  focus(i: number) {
    if (!this.back) this.back = { ...this.view };
    this.select([i]);
  }
  /** Leaves any focus: Esc after this fits the board rather than returning to an old view. */
  forget() {
    this.back = null;
  }
  escape() {
    if (this.tour) return this.stopTour();
    if (this.selected.length || this.back) {
      const to = this.back ?? this.fitView(this.board);
      this.back = null;
      this.selected = [];
      this.flyTo(to);
    } else this.flyTo(this.fitView(this.board));
    this.dirty = true;
  }
  step(dir: 1 | -1, across = false) {
    const ps = this.board.pieces;
    const cs = this.board.clusters;
    if (!this.selected.length) {
      const c = cs[this.activeCluster()];
      return this.focus(dir > 0 ? c.first : c.last);
    }
    const cur = ps[this.selected[this.selected.length - 1]];
    if (across) {
      const c = cs[(cur.cluster + dir + cs.length) % cs.length];
      return this.focus(c.first);
    }
    const c = cs[cur.cluster];
    const n = c.last - c.first + 1;
    this.focus(c.first + ((cur.i - c.first + dir + n) % n));
  }
  fit() {
    this.back = null;
    this.flyTo(this.fitView(this.board));
  }
  zoomBy(k: number) {
    const z = clamp(this.view.z * k, this.zMin, Z_MAX);
    this.flyTo({ ...this.view, z }, { dur: 260, rho: 0, ease: EASE.out });
  }
  actualSize() {
    // 100%: about the centre, or the selection's centre
    const r = this.selected.length ? unionRect(this.selected.map((i) => this.board.pieces[i])) : null;
    const c = r ? { x: r.x + r.w / 2, y: r.y + r.h / 2 } : this.view;
    this.flyTo({ x: c.x, y: c.y, z: 1 }, { rho: 0.6 });
  }

  // ── tour ────────────────────────────────────────────────────────────────
  startTour() {
    this.flight = null;
    this.touched = true;
    this.vel = { x: 0, y: 0 };
    this.selected = [];
    this.back = null;
    const all = this.fitView(this.board, 1, { t: 24, r: 24, b: 24, l: 24 });
    this.view = { ...all, z: all.z * 0.72 };
    const t = this.now();
    this.tour = { t0: t, i: -1, shotT0: t, path: null, from: this.view, target: this.view };
    this.frames = [];
    this.dirty = true;
  }
  stopTour() {
    this.tour = null;
    this.back = null;
    this.dirty = true;
  }
  private shotView(s: Shot): View {
    const r = this.rectOf(s.to) ?? this.board;
    const clear = { t: 32, r: 32, b: 32, l: 32 };
    const v = this.fitView(r, "all" in s.to ? 1 : 0, clear);
    return v;
  }
  private runTour(now: number) {
    const T = this.tour!;
    const t = now - T.t0;
    if (t >= TOUR_MS) {
      this.tour = null;
      this.dirty = true;
      return;
    }
    // which shot are we in
    let acc = 0;
    let i = 0;
    for (; i < TOUR.length; i++) {
      if (t < acc + TOUR[i].move + TOUR[i].hold) break;
      acc += TOUR[i].move + TOUR[i].hold;
    }
    const s = TOUR[i];
    if (i !== T.i) {
      T.i = i;
      T.landed = false;
      T.shotT0 = T.t0 + acc;
      T.from = { ...this.view };
      T.target = this.shotView(s);
      const p = zoomPath([T.from.x, T.from.y, this.vw / T.from.z], [T.target.x, T.target.y, this.vw / T.target.z], s.rho ?? 0.9);
      T.path = (u) => {
        const [x, y, w] = p.at(u);
        return { x, y, z: this.vw / w };
      };
    }
    const lt = now - T.shotT0;
    const landed = lt >= s.move;
    if (landed && !T.landed && "piece" in s.to && !s.to.frac && !this.calm) this.impact = { t0: T.shotT0 + s.move };
    T.landed = landed;
    if (lt < s.move && s.move > 0) {
      this.view = T.path!(EASE[s.ease ?? "glide"](lt / s.move));
    } else {
      // the hold: keep drifting in, slowing, so the frame never stops dead
      const h = s.hold ? clamp((lt - s.move) / s.hold, 0, 1) : 1;
      const d = this.calm ? 0 : (s.drift ?? 0.05);
      this.view = { ...T.target, z: T.target.z * (1 + d * EASE.out(h)) };
    }
    this.dirty = true;
  }

  // ── input ───────────────────────────────────────────────────────────────
  private bind() {
    const c = this.canvas;
    const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement | Window, k: K, f: (e: HTMLElementEventMap[K]) => void, o?: AddEventListenerOptions) => {
      el.addEventListener(k, f as EventListener, o);
      this.off.push(() => el.removeEventListener(k, f as EventListener, o));
    };
    on(c, "pointerdown", (e) => this.down(e));
    on(c, "pointermove", (e) => this.move(e));
    on(c, "pointerup", (e) => this.up(e));
    on(c, "pointercancel", (e) => this.up(e));
    on(c, "lostpointercapture", (e) => {
      if (this.pointers.has(e.pointerId)) this.up(e);
    });
    on(c, "pointerleave", () => {
      if (this.hover !== -1) (this.hover = -1), (this.dirty = true);
    });
    on(c, "wheel", (e) => this.wheel(e), { passive: false });
    // Safari's own pinch gesture events: stop the page zoom, the wheel handler does the work
    on(c, "gesturestart" as keyof HTMLElementEventMap, (e) => e.preventDefault());
    on(window, "resize", () => this.resize());
  }
  private down(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    this.touched = true;
    this.canvas.setPointerCapture(e.pointerId);
    if (this.miniDrag) return; // a second finger while dragging the minimap is ignored
    this.pointers.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
    this.stopMotion();
    if (this.pointers.size === 1 && this.inMini(e.offsetX, e.offsetY)) {
      this.miniDrag = true;
      this.miniTo(e.offsetX, e.offsetY, true);
      return;
    }
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
      this.drag = null;
      this.marquee = null;
      return;
    }
    const mode = e.shiftKey ? "marquee" : "pan";
    this.drag = { x: e.offsetX, y: e.offsetY, t: performance.now(), moved: 0, samples: [{ x: e.offsetX, y: e.offsetY, t: performance.now() }], mode, add: e.shiftKey };
    this.canvas.style.cursor = mode === "pan" ? "grabbing" : "crosshair";
  }
  private move(e: PointerEvent) {
    const prev = this.pointers.get(e.pointerId);
    if (!prev) {
      if (this.inMini(e.offsetX, e.offsetY)) {
        this.canvas.style.cursor = "pointer";
        if (this.hover !== -1) (this.hover = -1), (this.dirty = true);
        return;
      }
      const h = this.pieceAt(e.offsetX, e.offsetY);
      if (h !== this.hover) {
        this.hover = h;
        this.canvas.style.cursor = h >= 0 ? "pointer" : "grab";
        this.dirty = true;
      }
      return;
    }
    this.pointers.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
    if (this.miniDrag) return this.miniTo(e.offsetX, e.offsetY, false);
    if (this.pinch && this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      const w0 = this.toWorld(this.pinch.cx, this.pinch.cy);
      const w1 = this.toWorld(cx, cy);
      this.view.x += w0.x - w1.x;
      this.view.y += w0.y - w1.y;
      this.zoomAt(cx, cy, d / this.pinch.d);
      this.pinch = { d, cx, cy };
      return;
    }
    const g = this.drag;
    if (!g) return;
    const dx = e.offsetX - prev.x;
    const dy = e.offsetY - prev.y;
    g.moved += Math.abs(dx) + Math.abs(dy);
    if (g.mode === "pan") {
      // the grabbed point stays under the finger, so dragging spins the globe
      const a = this.toWorld(prev.x, prev.y);
      const b = this.toWorld(e.offsetX, e.offsetY);
      this.view.x += a.x - b.x;
      this.view.y += a.y - b.y;
      const t = performance.now();
      g.samples.push({ x: e.offsetX, y: e.offsetY, t });
      while (g.samples.length > 2 && t - g.samples[0].t > 90) g.samples.shift();
    } else {
      this.marquee = { x: Math.min(g.x, e.offsetX), y: Math.min(g.y, e.offsetY), w: Math.abs(g.x - e.offsetX), h: Math.abs(g.y - e.offsetY) };
    }
    this.dirty = true;
  }
  private up(e: PointerEvent) {
    const known = this.pointers.delete(e.pointerId);
    if (this.miniDrag) {
      if (!known) return; // an ignored second finger lifting does not end the minimap drag
      this.miniDrag = false;
      this.pinch = null;
      return;
    }
    if (this.pinch) {
      if (this.pointers.size < 2) this.pinch = null;
      // the finger left on the glass carries on as a pan
      const rest = [...this.pointers.values()][0];
      if (rest) this.drag = { x: rest.x, y: rest.y, t: performance.now(), moved: 99, samples: [], mode: "pan", add: false };
      return;
    }
    const g = this.drag;
    this.drag = null;
    this.canvas.style.cursor = this.hover >= 0 ? "pointer" : "grab";
    if (!g) return;
    if (g.mode === "marquee") {
      const m = this.marquee;
      this.marquee = null;
      if (m && g.moved > 4) {
        const L = this.lens();
        const hit = this.board.pieces
          .filter((p) => {
            const r = projRect(L, p);
            return r.th < HALF_PI && r.x < m.x + m.w && r.x + r.w > m.x && r.y < m.y + m.h && r.y + r.h > m.y;
          })
          .map((p) => p.i);
        this.select(g.add ? [...new Set([...this.selected, ...hit])] : hit, false);
      } else {
        const i = this.pieceAt(e.offsetX, e.offsetY);
        if (i >= 0) this.select(this.selected.includes(i) ? this.selected.filter((x) => x !== i) : [...this.selected, i], false);
      }
      this.dirty = true;
      return;
    }
    if (g.moved < 5 && performance.now() - g.t < 600) {
      const i = this.pieceAt(e.offsetX, e.offsetY);
      if (i >= 0) this.focus(i);
      else {
        this.selected = [];
        this.dirty = true;
      }
      return;
    }
    // inertia from the last ~90 ms of the drag
    const s = g.samples;
    if (s.length >= 2) {
      const a = s[0];
      const b = s[s.length - 1];
      const dt = Math.max(8, b.t - a.t);
      if (!this.calm && performance.now() - b.t < 60) this.vel = { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt };
    }
  }
  private wheel(e: WheelEvent) {
    e.preventDefault();
    this.touched = true;
    this.stopMotion();
    let dy = e.deltaY;
    let dx = e.deltaX;
    if (dx !== 0) this.lastDx = performance.now();
    if (e.deltaMode === 1) (dy *= 16), (dx *= 16);
    if (e.ctrlKey || e.metaKey) {
      // trackpad pinch (the browser reports it as ctrl + wheel), or cmd-scroll
      this.zoomAt(e.offsetX, e.offsetY, Math.exp(-dy * 0.0105));
    } else if (e.deltaMode === 1 || (dx === 0 && (Math.abs(dy) % 120 === 0 || Math.abs(dy) % 100 === 0) && Math.abs(dy) >= 100 && performance.now() - this.lastDx > 400)) {
      // a mouse wheel's notches zoom toward the cursor
      this.zoomAt(e.offsetX, e.offsetY, Math.exp(-dy * 0.0021));
    } else {
      // pan through the lens, so the content under the cursor tracks the fingers
      const a = this.toWorld(e.offsetX, e.offsetY);
      const b = this.toWorld(e.offsetX - dx, e.offsetY - dy);
      this.view.x += a.x - b.x;
      this.view.y += a.y - b.y;
      this.dirty = true;
    }
  }

  // ── the loop ────────────────────────────────────────────────────────────
  private loop(ts: number) {
    this.raf = requestAnimationFrame(this.loop);
    if (this.manual !== null) return; // the recorder drives frames itself
    const dt = this.last ? Math.min(64, ts - this.last) : 16;
    this.last = ts;
    this.tick(performance.now(), dt);
  }
  tick(now: number, dt: number) {
    if (this.tour) {
      this.frames.push(dt);
      this.runTour(now);
    } else if (this.flight) {
      const f = this.flight;
      const t = clamp((now - f.t0) / f.dur, 0, 1);
      this.view = f.at(f.ease(t));
      if (t >= 1) {
        this.flight = null;
        f.done?.();
      }
      this.dirty = true;
    } else if (Math.abs(this.vel.x) + Math.abs(this.vel.y) > 0.01) {
      const a = this.toWorld(this.vw / 2, this.vh / 2);
      const b = this.toWorld(this.vw / 2 + this.vel.x * dt, this.vh / 2 + this.vel.y * dt);
      this.view.x += a.x - b.x;
      this.view.y += a.y - b.y;
      const k = Math.exp(-dt / 325);
      this.vel.x *= k;
      this.vel.y *= k;
      this.dirty = true;
    }
    // until anyone touches it, the globe turns slowly on its own
    // (for the first minute, so a page left open goes quiet)
    if (!this.touched && !this.tour && !this.flight && this.manual === null && !this.calm && now - this.born < 60000) {
      const f = this.fitView(this.board);
      const a = (now / 52000) * Math.PI * 2;
      this.view = { x: f.x + Math.cos(a) * this.R * 0.3, y: f.y + Math.sin(a) * this.R * 0.18, z: f.z };
      this.dirty = true;
    }
    // the camera never leaves the board, so the globe never turns to an empty face
    const b = this.board;
    this.view.x = clamp(this.view.x, b.x, b.x + b.w);
    this.view.y = clamp(this.view.y, b.y, b.y + b.h);
    if (this.videos.size) this.dirty = true;
    // camera speed for the speed lines: pan in screen px plus zoom rate, per ms, eased
    if (dt > 0) {
      const pv = this.prevView ?? this.view;
      const v = this.view;
      const raw = (Math.hypot((v.x - pv.x) * v.z, (v.y - pv.y) * v.z) + Math.abs(Math.log(v.z / pv.z)) * this.vw * 0.6) / dt;
      const moving = !!(this.flight || this.tour);
      this.speed += ((moving ? raw : 0) - this.speed) * Math.min(1, dt / 70);
      this.prevView = { ...v };
      if (this.speed > 0.05) this.dirty = true;
    }
    if (this.impact && now - this.impact.t0 < 360) this.dirty = true;
    if (performance.now() - this.pics.last < 400) this.dirty = true;
    // hover lift: ease every lifted piece toward its target here, so a piece that leaves the screen still settles
    if (this.hover >= 0 && !this.lift.has(this.hover)) this.lift.set(this.hover, 0);
    for (const [i, l] of this.lift) {
      const want = i === this.hover ? 1 : 0;
      let v = this.calm ? want : l + (want - l) * Math.min(1, dt / 60);
      if (Math.abs(want - v) < 0.01) v = want;
      if (v !== l) this.dirty = true;
      if (v === 0 && want === 0) this.lift.delete(i);
      else this.lift.set(i, v);
    }
    if (this.dirty) {
      this.dirty = false;
      this.draw(this.ctx, this.view, this.vw, this.vh, this.dpr, true);
      this.pics.pump();
      this.emit();
    }
  }
  private emit() {
    const s: EngineState = { z: this.view.z, selected: this.selected, cluster: this.activeCluster(), touring: !!this.tour, hover: this.hover };
    const key = `${Math.round(s.z * 100)}|${s.selected.join(",")}|${s.cluster}|${s.touring}|${s.hover}`;
    if (key !== this.lastState) {
      this.lastState = key;
      this.onChange(s);
    }
  }

  // ── drawing ─────────────────────────────────────────────────────────────
  /** Manga focus lines: thin ink wedges from the screen edge toward a clear centre, as strong as the camera is fast. */
  private speedLines(ctx: CanvasRenderingContext2D, vw: number, vh: number, k: number, seed: number) {
    if (k <= 0.01) return;
    const cx = vw / 2;
    const cy = vh / 2;
    const R = Math.hypot(vw, vh) * 0.62;
    const inner = Math.min(vw, vh) * (0.62 - 0.22 * k);
    let r = seed;
    const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
    ctx.fillStyle = `rgba(10,10,10,${0.5 * k})`;
    ctx.beginPath();
    const N = 80;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + rnd() * 0.05;
      const w = (0.002 + rnd() * 0.009) * (0.6 + k);
      const r0 = inner * (0.85 + rnd() * 0.5);
      if (rnd() < 0.25) continue;
      ctx.moveTo(cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R);
      ctx.lineTo(cx + Math.cos(a) * r0 * (vw / Math.min(vw, vh)) * 0.75, cy + Math.sin(a) * r0 * 0.75);
      ctx.lineTo(cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R);
      ctx.closePath();
    }
    ctx.fill();
  }

  /** Draws the board for `view` into `ctx`. `live` also asks for sharper pictures and draws the chrome on the canvas. */
  draw(ctx: CanvasRenderingContext2D, view: View, vw: number, vh: number, dpr: number, live: boolean) {
    const now = this.now();
    if (live) this.mini = null; // set again by drawMini only when the minimap is really on screen
    // the landing punch: a quick zoom pump and a small shake, gone in a third of a second
    let punch = 0;
    if (live && this.impact) {
      const p = (now - this.impact.t0) / 340;
      if (p >= 0 && p < 1) punch = 1 - p;
      else if (p >= 1) this.impact = null;
    }
    const z = view.z * (1 + 0.03 * (punch > 0 ? Math.sin(Math.PI * (1 - punch)) : 0));
    const shake = punch * punch * 5;
    const L = this.lens(view, vw / 2 + Math.sin(now * 0.11) * shake, vh / 2 + Math.cos(now * 0.13) * shake, z);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = GROUND;
    ctx.fillRect(0, 0, vw, vh);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const b = this.board;
    const P: Pt = { x: 0, y: 0, th: 0, f: 1 };
    /** how much a world size shrinks at a point: the mean of the squeeze toward the rim and round it */
    const local = (q: Pt) => Math.sqrt(q.f * Math.max(0, Math.cos(Math.min(q.th, HALF_PI))));
    /** things fade as they turn over the horizon */
    const fade = (th: number) => clamp((HALF_PI - th) / 0.22, 0, 1);
    this.drawGlobe(ctx, L, vw, vh, true);

    // cluster titles, in the print face with the blue plate a hair off register
    for (const c of b.clusters) {
      proj(L, c.x, c.y + c.title * 0.95, P);
      const al = fade(P.th);
      const size = c.title * z * local(P);
      if (size < 7 || al <= 0) continue;
      const x = P.x;
      const y = P.y;
      if (y < -size || y - size > vh || x > vw || x < -size * 30) continue;
      ctx.globalAlpha = al;
      ctx.font = `italic 900 ${size}px ${this.fonts.print}`;
      setStretch(ctx, "extra-condensed");
      ctx.textBaseline = "alphabetic";
      const t = c.name.toUpperCase();
      const w = ctx.measureText(t).width;
      // lettered like a sound effect: a slight tilt, a white knockout stroke, the blue plate off register, black on top
      const tilt = (c.kind.length % 3) - 1;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((tilt * 1.6 - 1.2) * (Math.PI / 180));
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = size * 0.11;
      ctx.strokeText(t, size * 0.02, size * 0.015);
      ctx.fillStyle = BLUE;
      ctx.fillText(t, size * 0.045, size * 0.04);
      ctx.fillStyle = INK;
      ctx.fillText(t, 0, 0);
      ctx.restore();
      setStretch(ctx, "normal");
      const ns = Math.max(9, size * 0.16);
      if (ns < 60) {
        ctx.font = `500 ${ns}px ${this.fonts.sans}`;
        ctx.fillStyle = "#6f6f6f";
        ctx.fillText(String(c.count), x + w + size * 0.08, y - size * 0.62);
      }
      ctx.globalAlpha = 1;
    }

    // the pieces, each boxed through the lens: squeezed toward the rim, gone over the horizon
    const vids = new Set<number>();
    const cx = vw / 2;
    const cy = vh / 2;
    const boxes: (ReturnType<typeof projRect> | null)[] = new Array(b.pieces.length).fill(null);
    for (const p of b.pieces) {
      // far side of the globe: skip without boxing it
      proj(L, p.x + p.w / 2, p.y + p.h / 2, P);
      if (P.th > HALF_PI + Math.hypot(p.w, p.h) / 2 / this.R) continue;
      const r = projRect(L, p);
      const al = fade(r.th);
      const { x, y, w, h } = r;
      if (al <= 0 || x > vw || y > vh || x + w < 0 || y + h < 0) {
        // just off screen: warm the smallest picture so a pan never shows a blank tile
        if (live && al > 0 && x < vw * 1.6 && y < vh * 1.6 && x + w > -vw * 0.6 && y + h > -vh * 0.6) this.pics.request(p.i, 0, 1e6 + Math.hypot(x + w / 2 - cx, y + h / 2 - cy));
        continue;
      }
      boxes[p.i] = r;
      const dist = Math.hypot(x + w / 2 - cx, y + h / 2 - cy);
      const lvl = this.pics.want(p.i, w * dpr);
      if (live) {
        this.pics.request(p.i, 0, dist);
        if (lvl > 0) this.pics.request(p.i, lvl, dist + 200 * lvl);
      }
      // a picture that just arrived fades in over its tile; the lift (eased in tick) raises it toward the cursor
      const pop = live && this.manual === null && !this.calm ? this.pics.pop(p.i) : 1;
      const lf = live ? (this.lift.get(p.i) ?? 0) : 0;
      const ink = clamp(Math.min(w, h * 1.5) * 0.012, 0.6, 5);
      const lift = lf * clamp(w * 0.012, 0, 6);
      const dx = x - lift;
      const dy = y - lift;
      ctx.globalAlpha = al;
      // a hard ink shadow, offset like a printed panel
      if (w > 5) {
        ctx.fillStyle = INK;
        ctx.fillRect(dx + ink + lift * 1.6, dy + ink + lift * 1.6, w, h);
      }
      let drawn = false;
      if (live && p.a.type === "video" && w > 140) {
        const v = this.video(p.i);
        vids.add(p.i);
        if (v.readyState >= 2) {
          ctx.drawImage(v, dx, dy, w, h);
          drawn = true;
        }
      }
      if (!drawn) {
        const img = this.pics.best(p.i, lvl, now);
        if (img && pop < 1) {
          ctx.fillStyle = TILE;
          ctx.fillRect(dx, dy, w, h);
          ctx.globalAlpha = al * EASE.out(pop);
          ctx.drawImage(img, dx, dy, w, h);
          ctx.globalAlpha = al;
        } else if (img) ctx.drawImage(img, dx, dy, w, h);
        else {
          ctx.fillStyle = TILE;
          ctx.fillRect(dx, dy, w, h);
        }
      }
      if (w > 4) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(0.75, ink * 0.55);
        ctx.strokeRect(dx, dy, w, h);
      }
      ctx.globalAlpha = 1;
    }
    if (live) this.prune(vids);

    // the light on the globe: a soft shade toward the rim, over the pieces so they curve with it
    this.drawGlobe(ctx, L, vw, vh, false);

    // design titles (world-scaled) and frame names (screen-sized, like a design tool)
    ctx.textBaseline = "alphabetic";
    for (const l of b.labels) {
      if (l.kind === "design") {
        proj(L, l.x, l.y, P);
        const al = fade(P.th);
        const s = l.size * z * local(P);
        if (s < 9 || al <= 0) continue;
        const x = P.x;
        const y = P.y;
        if (y < -s || y > vh + s || x > vw) continue;
        ctx.globalAlpha = al;
        ctx.font = `650 ${s}px ${this.fonts.sans}`;
        ctx.fillStyle = INK;
        ctx.fillText(l.text, x, y);
        if (l.note) {
          const w = ctx.measureText(l.text).width;
          ctx.font = `500 ${s * 0.62}px ${this.fonts.sans}`;
          ctx.fillStyle = "#7a7a7a";
          ctx.fillText(l.note, x + w + s * 0.4, y);
        }
        ctx.globalAlpha = 1;
      }
    }
    const sel = new Set(this.selected);
    ctx.font = `500 11px ${this.fonts.sans}`;
    for (const p of b.pieces) {
      const r = boxes[p.i];
      if (!r || r.w < 70 || r.y < -2 || r.y - 20 > vh) continue;
      const on = live && (sel.has(p.i) || p.i === this.hover);
      ctx.globalAlpha = fade(r.th);
      ctx.fillStyle = on ? BLUE : "#6f6f6f";
      ctx.fillText(clip(ctx, p.label, r.w), r.x, r.y - 6);
    }
    ctx.globalAlpha = 1;

    if (live && !this.calm) this.speedLines(ctx, vw, vh, clamp((this.speed - 0.9) / 3.5, 0, 1) * 0.85, 1 + (Math.floor(now / 50) % 997));
    if (live && punch > 0.35) this.speedLines(ctx, vw, vh, (punch - 0.35) * 1.1, 7 + Math.floor(now / 40));

    if (!live || this.tour) {
      if (live && this.tour) this.drawTourOverlay(ctx, vw, vh, now - this.tour.t0);
      return;
    }

    // hover, selection and marquee: screen-space, crisp at any zoom
    if (this.hover >= 0 && !sel.has(this.hover)) {
      const r = projRect(L, b.pieces[this.hover]);
      ctx.strokeStyle = BLUE;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }
    if (this.selected.length) this.drawSelection(ctx, L);
    this.drawMini(ctx, view, vw, vh);
    if (this.marquee) {
      const m = this.marquee;
      ctx.fillStyle = "rgba(59,93,232,0.08)";
      ctx.fillRect(m.x, m.y, m.w, m.h);
      ctx.strokeStyle = BLUE;
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(m.x) + 0.5, Math.round(m.y) + 0.5, Math.round(m.w), Math.round(m.h));
    }
  }

  /**
   * The globe itself, in two passes. Under the pieces: a soft shadow on the ground, the white sphere, its graticule turning
   * with the board. Over them: a shade toward the rim and the ink outline. It all fades out as you zoom in and the
   * board goes flat.
   */
  private sprites: { shade: HTMLCanvasElement; shadow: HTMLCanvasElement } | null = null;
  /** The shade and the cast shadow, painted once and scaled per frame: a big radial gradient every frame is slow. */
  private globeSprites() {
    if (this.sprites) return this.sprites;
    const make = (w: number, h: number, paint: (c: CanvasRenderingContext2D) => void) => {
      const cv = document.createElement("canvas");
      cv.width = w;
      cv.height = h;
      paint(cv.getContext("2d")!);
      return cv;
    };
    const S = 512;
    const shade = make(S, S, (c) => {
      const r = S / 2;
      const g = c.createRadialGradient(r - r * 0.35, r - r * 0.4, r * 0.1, r, r, r);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.72, "rgba(10,10,10,0.015)");
      g.addColorStop(1, "rgba(10,10,10,0.13)");
      c.fillStyle = g;
      c.beginPath();
      c.arc(r, r, r, 0, Math.PI * 2);
      c.fill();
    });
    const shadow = make(S, S / 4, (c) => {
      c.scale(1, 0.25);
      const g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      g.addColorStop(0, "rgba(10,10,10,0.16)");
      g.addColorStop(1, "rgba(10,10,10,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, S, S);
    });
    return (this.sprites = { shade, shadow });
  }
  private drawGlobe(ctx: CanvasRenderingContext2D, L: Lens, vw: number, vh: number, under: boolean) {
    const rad = L.R * L.z;
    const big = Math.max(vw, vh);
    const show = clamp(1.7 - rad / big, 0, 1);
    if (show <= 0) return;
    const { cx, cy } = L;
    ctx.save();
    // the sprites are soft gradients: the cheap filter looks the same and scales far faster
    ctx.imageSmoothingQuality = "low";
    if (under) {
      ctx.globalAlpha = show;
      // the shadow it casts, a flat ellipse below
      if (cy + rad * 0.9 < vh && rad < big) ctx.drawImage(this.globeSprites().shadow, cx - rad * 0.9, cy + rad * 1.04 - rad * 0.225, rad * 1.8, rad * 0.45);
      // the graticule: the world's own grid, so it turns as the board does
      const step = (L.R * Math.PI) / 12;
      const reach = L.R * HALF_PI;
      const P: Pt = { x: 0, y: 0, th: 0, f: 1 };
      ctx.strokeStyle = "rgba(10,10,10,0.09)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const vert of [true, false]) {
        const c0 = vert ? L.vx : L.vy;
        const o0 = vert ? L.vy : L.vx;
        for (let g0 = Math.ceil((c0 - reach) / step) * step; g0 <= c0 + reach; g0 += step) {
          const span = Math.sqrt(Math.max(0, reach * reach - (g0 - c0) ** 2));
          let pen = false;
          for (let k = 0; k <= 40; k++) {
            const t = o0 - span + (2 * span * k) / 40;
            proj(L, vert ? g0 : t, vert ? t : g0, P);
            if (P.th > HALF_PI) {
              pen = false;
              continue;
            }
            if (pen) ctx.lineTo(P.x, P.y);
            else ctx.moveTo(P.x, P.y);
            pen = true;
          }
        }
      }
      ctx.stroke();
    } else {
      // the shade toward the rim, lit from the top left: only while the rim is in view
      ctx.globalAlpha = show;
      if (rad < big * 0.8) ctx.drawImage(this.globeSprites().shade, cx - rad, cy - rad, rad * 2, rad * 2);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawSelection(ctx: CanvasRenderingContext2D, L: Lens) {
    const ps = this.selected.map((i) => this.board.pieces[i]);
    ctx.strokeStyle = BLUE;
    const boxes = ps.map((p) => projRect(L, p));
    if (ps.length > 1)
      for (const r of boxes) {
        ctx.lineWidth = 1;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      }
    const r = unionRect(boxes);
    const x = Math.round(r.x) + 0.5;
    const y = Math.round(r.y) + 0.5;
    const w = Math.round(r.w);
    const h = Math.round(r.h);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);
    // corner handles
    const k = 7;
    for (const [hx, hy] of [
      [x, y],
      [x + w, y],
      [x, y + h],
      [x + w, y + h],
    ]) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(hx - k / 2, hy - k / 2, k, k);
      ctx.lineWidth = 1;
      ctx.strokeRect(hx - k / 2, hy - k / 2, k, k);
    }
    // the size label under the frame
    const a = ps[0].a;
    const text = ps.length === 1 ? `${a.w} × ${a.h}` : `${ps.length} selected`;
    ctx.font = `600 11px ${this.fonts.sans}`;
    const tw = ctx.measureText(text).width;
    const pw = tw + 12;
    const lx = clamp(x + w / 2 - pw / 2, 4, this.vw - pw - 4);
    const ly = Math.min(y + h + 8, this.vh - 26);
    ctx.fillStyle = BLUE;
    roundRect(ctx, lx, ly, pw, 18, 3);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle";
    ctx.fillText(text, lx + 6, ly + 9.5);
    ctx.textBaseline = "alphabetic";
  }

  /** A game-style minimap: the clusters, every piece as a fleck, and the camera's frame. Click or drag it to travel. */
  private drawMini(ctx: CanvasRenderingContext2D, view: View, vw: number, vh: number) {
    if (this.hidden || vw < 900) return;
    const b = this.board;
    const W = 168;
    const k = W / b.w;
    const H = b.h * k;
    const x = vw - W - 22;
    const y = vh - H - 22;
    this.mini = { x, y, w: W, h: H, k };
    ctx.fillStyle = INK;
    ctx.fillRect(x - 6 + 3, y - 6 + 3, W + 12, H + 12);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x - 6, y - 6, W + 12, H + 12);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 6, y - 6, W + 12, H + 12);
    const act = this.activeCluster();
    b.clusters.forEach((c, i) => {
      ctx.fillStyle = i === act ? "rgba(59,93,232,0.14)" : "rgba(10,10,10,0.04)";
      ctx.fillRect(x + c.x * k, y + c.y * k, c.w * k, c.h * k);
    });
    ctx.fillStyle = "rgba(10,10,10,0.55)";
    for (const p of b.pieces) ctx.fillRect(x + p.x * k, y + p.y * k, Math.max(0.8, p.w * k), Math.max(0.8, p.h * k));
    const hw = this.half(vw / 2, view.z);
    const hh = this.half(vh / 2, view.z);
    const vwW = hw * 2 * k;
    const vhW = hh * 2 * k;
    const fx = x + (view.x - hw) * k;
    const fy = y + (view.y - hh) * k;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 6, y - 6, W + 12, H + 12);
    ctx.clip();
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(fx, fy, Math.max(3, vwW), Math.max(3, vhW));
    ctx.fillStyle = "rgba(59,93,232,0.08)";
    ctx.fillRect(fx, fy, Math.max(3, vwW), Math.max(3, vhW));
    ctx.restore();
  }
  private inMini(sx: number, sy: number) {
    const m = this.mini;
    return m && sx >= m.x - 6 && sx <= m.x + m.w + 6 && sy >= m.y - 6 && sy <= m.y + m.h + 6 ? m : null;
  }
  private miniTo(sx: number, sy: number, fly: boolean) {
    const m = this.mini!;
    const t = { x: (sx - m.x) / m.k, y: (sy - m.y) / m.k, z: this.view.z };
    if (fly) this.flyTo(t, { dur: 420, rho: 0.6 });
    else {
      this.flight = null;
      this.view = t;
      this.dirty = true;
    }
  }

  /** The tour's title card, captions, end card: drawn on the canvas so the recording and the live page match. */
  private drawTourOverlay(ctx: CanvasRenderingContext2D, vw: number, vh: number, t: number) {
    const u = Math.min(vw, vh * 1.6);
    // title card
    if (t < TITLE_CARD.out + 500) {
      const a = t < TITLE_CARD.out ? 1 : 1 - EASE.out(clamp((t - TITLE_CARD.out) / 500, 0, 1));
      const rise = 1 - EASE.out(clamp(t / 700, 0, 1));
      ctx.fillStyle = `rgba(255,255,255,${0.86 * a})`;
      ctx.fillRect(0, 0, vw, vh);
      this.bigType(ctx, ["CAPY HACKATHON", "ASSETS"], vw / 2, vh / 2 + rise * u * 0.04, u * 0.115, a, "center");
      ctx.globalAlpha = a * clamp((t - 250) / 500, 0, 1);
      ctx.font = `500 ${Math.max(12, u * 0.017)}px ${this.fonts.sans}`;
      ctx.fillStyle = "#4a4a4a";
      ctx.textAlign = "center";
      ctx.fillText(`${this.board.pieces.length} pieces, ${this.board.clusters.length} kinds. Unofficial fan work by Jawad Jalal.`, vw / 2, vh / 2 + u * 0.15);
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;
    }
    // captions: a black block wipes in from the left, the type rises into it
    let acc = 0;
    const caps: { s: number; e: number; c: NonNullable<Shot["caption"]> }[] = [];
    for (const s of TOUR) {
      if (s.caption) caps.push({ s: acc, e: TOUR_MS, c: s.caption });
      acc += s.move + s.hold;
    }
    caps.forEach((c, i) => (c.e = caps[i + 1]?.s ?? END_CARD));
    for (const c of caps) {
      if (t < c.s || t > c.e) continue;
      const inn = EASE.out(clamp((t - c.s) / 420, 0, 1));
      const out = EASE.glide(clamp((c.e - t) / 280, 0, 1));
      const k = Math.min(inn, out);
      const s = Math.max(28, u * 0.055);
      const pad = Math.max(16, u * 0.022);
      const x = pad * 1.4;
      const y = vh - pad * 1.4;
      ctx.font = `italic 900 ${s}px ${this.fonts.print}`;
      setStretch(ctx, "extra-condensed");
      const tw = ctx.measureText(c.c.title.toUpperCase()).width;
      setStretch(ctx, "normal");
      const ns = s * 0.3;
      ctx.font = `500 ${ns}px ${this.fonts.sans}`;
      const sw = c.c.sub ? ns * 2.2 + ctx.measureText(c.c.sub).width : 0;
      const bw = Math.max(tw + s * 0.08, sw) + pad * 2;
      const bh = s * 1.05 + pad * 1.1 + ns * 1.4;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y - bh, bw * k, bh);
      ctx.clip();
      ctx.fillStyle = INK;
      ctx.fillRect(x, y - bh, bw, bh);
      const lift = (1 - inn) * s * 0.5;
      ctx.font = `700 ${ns}px ${this.fonts.sans}`;
      ctx.fillStyle = BLUE;
      ctx.fillText(c.c.n, x + pad, y - bh + pad + ns + lift);
      if (c.c.sub) {
        ctx.fillStyle = "#bdbdbd";
        ctx.font = `500 ${ns}px ${this.fonts.sans}`;
        ctx.fillText(c.c.sub, x + pad + ns * 2.2, y - bh + pad + ns + lift);
      }
      ctx.font = `italic 900 ${s}px ${this.fonts.print}`;
      setStretch(ctx, "extra-condensed");
      ctx.fillStyle = BLUE;
      ctx.fillText(c.c.title.toUpperCase(), x + pad + s * 0.035, y - pad + s * 0.03 + lift);
      ctx.fillStyle = "#fff";
      ctx.fillText(c.c.title.toUpperCase(), x + pad, y - pad + lift);
      setStretch(ctx, "normal");
      ctx.restore();
    }
    // end card
    if (t > END_CARD) {
      const a = EASE.out(clamp((t - END_CARD) / 600, 0, 1));
      ctx.fillStyle = `rgba(255,255,255,${0.8 * a})`;
      ctx.fillRect(0, 0, vw, vh);
      this.bigType(ctx, ["JAWADJALAL.COM/CAPY"], vw / 2, vh / 2 + (1 - a) * u * 0.03, u * 0.085, a, "center");
      ctx.globalAlpha = a;
      ctx.font = `500 ${Math.max(12, u * 0.016)}px ${this.fonts.sans}`;
      ctx.fillStyle = "#4a4a4a";
      ctx.textAlign = "center";
      ctx.fillText("Unofficial, unsolicited fan work. Not made by or for Capy or YC.", vw / 2, vh / 2 + u * 0.09);
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;
    }
    // a hairline of progress along the bottom
    if (!this.hidden) {
      ctx.fillStyle = BLUE;
      ctx.fillRect(0, vh - 3, vw * clamp(t / TOUR_MS, 0, 1), 3);
    }
  }
  private bigType(ctx: CanvasRenderingContext2D, lines: string[], x: number, cy: number, s: number, a: number, align: CanvasTextAlign) {
    ctx.globalAlpha = a;
    ctx.font = `italic 900 ${s}px ${this.fonts.print}`;
    setStretch(ctx, "extra-condensed");
    ctx.textAlign = align;
    const lh = s * 0.86;
    const y0 = cy - (lh * (lines.length - 1)) / 2 + s * 0.33;
    lines.forEach((l, i) => {
      ctx.fillStyle = BLUE;
      ctx.fillText(l, x + s * 0.035, y0 + i * lh + s * 0.03);
      ctx.fillStyle = INK;
      ctx.fillText(l, x, y0 + i * lh);
    });
    ctx.textAlign = "left";
    setStretch(ctx, "normal");
    ctx.globalAlpha = 1;
  }

  // ── motion pieces play when they are big enough to see ───────────────────
  private video(i: number) {
    let v = this.videos.get(i);
    if (!v) {
      v = document.createElement("video");
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.preload = "auto";
      v.src = this.board.pieces[i].a.original;
      this.videoBox.appendChild(v);
      v.play().catch(() => {});
      this.videos.set(i, v);
    }
    return v;
  }
  private prune(keep: Set<number>) {
    for (const [i, v] of this.videos)
      if (!keep.has(i)) {
        v.pause();
        v.removeAttribute("src");
        v.load();
        v.remove();
        this.videos.delete(i);
      }
  }

  // ── for the recorder and the exporter ───────────────────────────────────
  /** Renders a frame at an exact time (record mode). */
  frameAt(ms: number) {
    this.manual = ms;
    this.tick(ms, 1000 / 30);
    this.dirty = true;
    this.tick(ms, 0);
  }
  redraw() {
    this.dirty = true;
  }
}

function unionRect(rs: Rect[]): Rect {
  const x = Math.min(...rs.map((r) => r.x));
  const y = Math.min(...rs.map((r) => r.y));
  const r = Math.max(...rs.map((p) => p.x + p.w));
  const b = Math.max(...rs.map((p) => p.y + p.h));
  return { x, y, w: r - x, h: b - y };
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function clip(ctx: CanvasRenderingContext2D, t: string, w: number) {
  if (ctx.measureText(t).width <= w) return t;
  let s = t;
  while (s.length > 1 && ctx.measureText(s + "…").width > w) s = s.slice(0, -1);
  return s + "…";
}
function setStretch(ctx: CanvasRenderingContext2D, s: string) {
  (ctx as unknown as { fontStretch?: string }).fontStretch = s;
}
