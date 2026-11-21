import { BookLink } from "@/components/BookLink";
import { WORDS } from "@/components/ds/wordmark";
import "./loaderA.css";

// Loader A, "the board": a split-flap board of ivory modules on warm ink, one module per letter of the mark. The modules
// are windows onto whole Arabic words (loader-words.md), each set as one shaped run in Noto Kufi Arabic (SIL OFL 1.1,
// OFL-NotoKufiArabic.txt, subset to these words) and cut only by the module edges, so no letter is drawn apart from its
// word. A new word travels through a row's flaps right to left, the way it reads. The board halts on تصميم while the
// second row keeps searching, seats on عقل مدبر, holds, then locks left to right, one column at a time, into the mark;
// the letters lift off the board, close up to their kerning and travel to the h1.
//
// It runs from an inline script, before hydration and with no dependency: the page renders beneath it and the call stays
// on top. Only ?loader=a turns it on. A repeat visit (localStorage) runs a short beat; reduced motion sees the mark still
// for 300 ms; a click, tap, wheel or any key skips it.

type Glyph = { d: string; a: number; b: number; x: number };
type Line = { w: number; g: Glyph[] };
type Data = { lines: Line[]; gap: number; stream: string[]; seat: string[] };

const SEAT = ["تصميم", "عقل مدبر"];
const STREAM = ["صنعة", "نور", "بناء", "خط", "فكرة", "حبر", "شكل", "ابتكار", "رسم", "قلم", "إتقان", "لون", "هندسة", "ورق", "مهارة", "حرف", "نقطة"];

function xRange(d: string): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  let cmd = "";
  let k = 0;
  for (const tok of d.match(/[A-Za-z]|-?\d*\.?\d+/g) ?? []) {
    if (/[A-Za-z]/.test(tok)) {
      cmd = tok.toUpperCase();
      k = 0;
      continue;
    }
    const isX = cmd === "H" || (cmd !== "V" && k % 2 === 0);
    k++;
    if (!isX) continue;
    lo = Math.min(lo, +tok);
    hi = Math.max(hi, +tok);
  }
  return [lo, hi];
}

/** One line of the mark in lowercase, from his own outlines: a lowercase glyph already in the mark takes the capital's
 *  place at the measured gap of the matching pair (n-d for d-e, M-a for m-a); every other pair keeps its kern. */
function line(src: string[], lsb: number, firstGap: number): Line {
  const box = src.map(xRange);
  const g: Glyph[] = [];
  let right = 0;
  src.forEach((d, i) => {
    const [a, b] = box[i];
    const x = i === 0 ? lsb : right + (i === 1 ? firstGap : a - box[i - 1][1]);
    g.push({ d, a, b, x });
    right = x + b - a;
  });
  return { w: right + 50, g };
}

const [DESIGN, MASTER] = WORDS;
const DATA: Data = {
  lines: [
    line([MASTER.g[9], ...DESIGN.g.slice(1)], 30, xRange(MASTER.g[9])[0] - xRange(MASTER.g[8])[1]),
    line([MASTER.g[6], ...MASTER.g.slice(1)], 50, xRange(MASTER.g[1])[0] - xRange(MASTER.g[0])[1]),
  ],
  gap: 280,
  stream: STREAM,
  seat: SEAT,
};

function run(D: Data) {
  if (new URLSearchParams(location.search).get("loader") !== "a") return;
  const root = document.getElementById("ldrA");
  if (!root) return;
  const de = document.documentElement;
  de.classList.add("ldrA-on");
  const IVORY = "#f3ead8";
  const fontReady = document.fonts ? document.fonts.load('700 40px "ldrA Kufi"', D.seat.join("") + D.stream.join("")) : Promise.resolve();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let repeat = false;
  try {
    repeat = localStorage.getItem("ldrA") === "1";
    localStorage.setItem("ldrA", "1");
  } catch {}

  const vw = innerWidth;
  const vh = innerHeight;
  const stack = vw < 700;
  const n0 = D.lines[0].g.length;
  const cw = stack ? Math.floor((vw - 40) / 10) : Math.floor(Math.min(vw * 0.82, 1200) / 16.6);
  const ch = Math.round(cw * 1.42);
  const gx = Math.round(cw * 0.6);
  const gy = Math.round(ch * 0.16);
  const em = cw * 1.02;
  const bw = stack ? 10 * cw : 16 * cw + gx;
  const bh = stack ? 2 * ch + gy : ch;
  const bx = Math.round((vw - bw) / 2);
  const by = Math.round((vh - bh) / 2 - vh * 0.03);
  const fs = Math.round(ch * 0.4);
  const units = D.lines[0].w + D.gap + D.lines[1].w;
  const segW = (s: number) => D.lines[s].g.length * cw;
  const tr = (x: number, y: number) => "translate(" + x + "px," + y + "px)";

  type Cell = { el: HTMLDivElement; t: HTMLDivElement; b: HTMLDivElement; cur: string; seg: number; i: number; x: number; y: number; col: number };

  root.innerHTML = '<div class="ldrA-bg"></div><div class="ldrA-board"></div><p class="ldrA-lbl">setting type <b>00/16</b></p>';
  const bg = root.children[0] as HTMLDivElement;
  const board = root.children[1] as HTMLDivElement;
  const label = root.children[2] as HTMLElement;
  const count = label.querySelector("b") as HTMLElement;

  const svg = (g: Glyph, k: number) =>
    '<svg viewBox="' + (g.a - 20) + " -780 " + (g.b - g.a + 40) + ' 1020" width="' + ((g.b - g.a + 40) / 1000) * k + '" height="' + 1.02 * k + '"><path d="' + g.d + '"/></svg>';
  const inCell = (g: Glyph) => [(cw - ((g.b - g.a) / 1000) * em) / 2 - 0.02 * em, ch / 2 + 0.33 * em - 0.78 * em];
  const latin = (c: Cell) => {
    const g = D.lines[c.seg].g[c.i];
    const [x, y] = inCell(g);
    return '<div class="ldrA-lt" style="left:' + x + "px;top:" + y + 'px">' + svg(g, em) + "</div>";
  };
  const widths: Record<string, number> = {};
  const arabic = (c: Cell, word: string) => {
    const w = widths[word] || 0;
    const size = w ? Math.min(ch * 0.62, (fs * segW(c.seg) * 0.8) / w) : fs;
    return '<span class="ldrA-ar" lang="ar" dir="rtl" style="left:' + -c.i * cw + "px;width:" + segW(c.seg) + "px;font-size:" + size + "px;line-height:" + ch + 'px">' + word + "</span>";
  };

  const cells: Cell[] = [];
  D.lines.forEach((l, s) =>
    l.g.forEach((_, i) => {
      const el = document.createElement("div");
      el.className = "ldrA-c";
      const x = (s === 0 || stack ? bx : bx + n0 * cw + gx) + i * cw;
      const y = stack && s === 1 ? by + ch + gy : by;
      el.style.cssText = "left:" + x + "px;top:" + y + "px;width:" + (cw - 2) + "px;height:" + ch + "px";
      el.innerHTML = '<div class="ldrA-h ldrA-t"><div class="ldrA-f"></div></div><div class="ldrA-h ldrA-b"><div class="ldrA-f"></div></div>';
      board.appendChild(el);
      cells.push({ el, t: el.querySelector(".ldrA-t .ldrA-f")!, b: el.querySelector(".ldrA-b .ldrA-f")!, cur: "", seg: s, i, x, y, col: stack ? i : s * n0 + i });
    }),
  );

  const flip = (c: Cell, html: string, d: number) => {
    const prev = c.cur;
    c.cur = html;
    c.t.innerHTML = html;
    const fall = document.createElement("div");
    fall.className = "ldrA-fl ldrA-t";
    fall.innerHTML = '<div class="ldrA-f">' + prev + "</div>";
    c.el.appendChild(fall);
    fall.animate([{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }], { duration: d, easing: "ease-in" }).onfinish = () => {
      if (!fall.isConnected) return;
      fall.remove();
      const land = document.createElement("div");
      land.className = "ldrA-fl ldrA-b";
      land.innerHTML = '<div class="ldrA-f">' + html + "</div>";
      c.el.appendChild(land);
      land.animate([{ transform: "rotateX(90deg)" }, { transform: "rotateX(0deg)" }], { duration: d, easing: "ease-out" }).onfinish = () => {
        if (!land.isConnected) return;
        if (c.cur === html) c.b.innerHTML = html;
        land.remove();
      };
    };
  };

  const queue: [number, () => void][] = [];
  const at = (t: number, fn: () => void) => queue.push([t, fn]);
  const say = (s: number, word: string, t: number, step: number) =>
    cells
      .filter((c) => c.seg === s)
      .reverse()
      .forEach((c, k) => at(t + k * step, () => flip(c, arabic(c, word), 46)));

  // The held beat, the stream, the halt with the second row still searching, the seat, the hold, the lock, the lift.
  const P = repeat
    ? { start: 60, s0: [60, 250], s1: [120, 300], seat0: 440, stutter: [] as number[], seat1: 470, lock: 640, step: 12, wait: 0, close: 170, go: 330 }
    : { start: 240, s0: [240, 470, 690], s1: [300, 510, 720], seat0: 880, stutter: [1080], seat1: 1290, lock: 1520, step: 17, wait: 80, close: 210, go: 340 };
  let w = 0;
  P.s0.forEach((t) => say(0, D.stream[w++ % D.stream.length], t, 16));
  P.s1.forEach((t) => say(1, D.stream[w++ % D.stream.length], t, 15));
  say(0, D.seat[0], P.seat0, 16);
  P.stutter.forEach((t) => say(1, D.stream[w++ % D.stream.length], t, 30));
  say(1, D.seat[1], P.seat1, 16);
  let locked = 0;
  cells.forEach((c) =>
    at(P.lock + c.col * P.step + (!stack && c.seg === 1 ? P.wait : 0), () => {
      flip(c, latin(c), 40);
      count.textContent = String(++locked).padStart(2, "0") + "/16";
    }),
  );
  at(P.lock + (stack ? 9 : 15) * P.step + (stack ? 0 : P.wait) + 110, () => lift(P.close, P.go));

  const letters = cells.map((c) => {
    const g = D.lines[c.seg].g[c.i];
    const el = document.createElement("div");
    el.className = "ldrA-l";
    el.innerHTML = svg(g, em);
    const [ix, iy] = inCell(g);
    return { el, g, c, grid: [c.x + ix, c.y + iy] };
  });
  const kern = (L: (typeof letters)[number]) => {
    const lx = stack ? bx : (vw - (units / 1000) * em) / 2;
    const off = !stack && L.c.seg === 1 ? D.lines[0].w + D.gap : 0;
    return [lx + ((off + L.g.x) / 1000) * em - 0.02 * em, L.grid[1]];
  };
  const target = () => {
    const h1 = document.querySelector("main h1");
    const r = h1 ? h1.getBoundingClientRect() : null;
    if (h1 && r && r.width > 8 && r.height > 8) {
      const range = document.createRange();
      range.selectNodeContents(h1.querySelector("svg") || h1);
      const t = range.getBoundingClientRect();
      return { left: t.left, base: t.top + t.height * 0.8, k: t.width / (units / 1000), color: getComputedStyle(h1).color, found: true };
    }
    const k = (stack ? 170 : 240) / (units / 1000);
    const g = Math.max(12, vw / 120);
    return { left: g, base: g + 0.74 * k + 6, k, color: IVORY, found: false };
  };

  let phase = 0;
  const lift = (close: number, go: number) => {
    if (phase) return;
    phase = 1;
    queue.length = 0;
    const T = target();
    const layer = document.createElement("div");
    layer.className = "ldrA-ls";
    root.appendChild(layer);
    letters.forEach((L) => layer.appendChild(L.el));
    cells.forEach((c, k) => {
      c.el.querySelectorAll(".ldrA-f").forEach((f) => (f.innerHTML = ""));
      c.el.animate(
        [
          { transform: "scaleY(1)", opacity: 1, easing: "cubic-bezier(.7,0,.2,1)" },
          { transform: "scaleY(0.02)", opacity: 0.6, offset: 0.6 },
          { transform: "scaleY(0.02)", opacity: 0 },
        ],
        { duration: 190, delay: close ? k * 5 : 0, fill: "forwards" },
      );
    });
    const total = close + go;
    letters.forEach((L, k) => {
      const [kx, ky] = kern(L);
      const tx = T.left + (((L.c.seg ? D.lines[0].w + D.gap : 0) + L.g.x) / 1000) * T.k - 0.02 * T.k;
      const last: Keyframe = { transform: tr(tx, T.base - 0.78 * T.k) + " scale(" + T.k / em + ")", color: T.color };
      const frames: Keyframe[] = close
        ? [
            { transform: tr(L.grid[0], L.grid[1]), color: IVORY, easing: "linear" },
            { transform: tr(L.grid[0], L.grid[1]), color: IVORY, offset: 90 / total, easing: "cubic-bezier(.45,0,.2,1)" },
            { transform: tr(kx, ky), color: IVORY, offset: close / total, easing: "cubic-bezier(.7,0,.15,1)" },
            last,
          ]
        : [{ transform: tr(L.grid[0], L.grid[1]), color: IVORY, easing: "cubic-bezier(.7,0,.15,1)" }, last];
      const a = L.el.animate(frames, { duration: total, fill: "forwards" });
      if (k === letters.length - 1) a.onfinish = () => end(T.found);
    });
    bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: go, delay: close, easing: "cubic-bezier(.45,0,.2,1)", fill: "forwards" });
    label.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: "forwards" });
  };

  const end = (found: boolean) => {
    removeEventListener("pointerdown", skip, true);
    removeEventListener("keydown", skip, true);
    removeEventListener("wheel", skip, true);
    removeEventListener("touchmove", skip, true);
    const finish = () => {
      de.classList.remove("ldrA-on");
      root.innerHTML = "";
    };
    if (found) return finish();
    root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" }).onfinish = finish;
  };
  function skip(e: Event) {
    if (phase || (e.target instanceof Element && e.target.closest(".ldrA-cta"))) return;
    cells.forEach((c) => {
      c.cur = c.t.innerHTML = c.b.innerHTML = latin(c);
      c.el.querySelectorAll(".ldrA-fl").forEach((f) => f.remove());
    });
    count.textContent = "16/16";
    lift(0, 320);
  }
  addEventListener("pointerdown", skip, true);
  addEventListener("keydown", skip, true);
  addEventListener("wheel", skip, true);
  addEventListener("touchmove", skip, true);

  if (reduce) {
    phase = 1;
    root.classList.add("ldrA-still");
    count.textContent = "16/16";
    const layer = document.createElement("div");
    layer.className = "ldrA-ls";
    root.appendChild(layer);
    letters.forEach((L) => {
      const [kx, ky] = kern(L);
      L.el.style.transform = tr(kx, ky);
      L.el.style.color = IVORY;
      layer.appendChild(L.el);
    });
    setTimeout(() => end(true), 300);
    return;
  }

  const t0 = performance.now();
  let shift = 0;
  let ready = false;
  const measure = () => {
    D.stream.concat(D.seat).forEach((word) => {
      const m = document.createElement("span");
      m.className = "ldrA-ar ldrA-m";
      m.style.fontSize = fs + "px";
      m.textContent = word;
      root.appendChild(m);
      widths[word] = m.getBoundingClientRect().width;
      m.remove();
    });
    shift = Math.min(300, Math.max(0, performance.now() - t0 - P.start));
    ready = true;
  };
  fontReady.then(measure, measure);
  const tick = () => {
    if (phase) return;
    const t = performance.now() - t0 - shift;
    if (!ready && t < P.start + 300) {
      requestAnimationFrame(tick);
      return;
    }
    const due = queue.filter((q) => q[0] <= t);
    for (const q of due) queue.splice(queue.indexOf(q), 1);
    due.sort((x, y) => x[0] - y[0]).forEach((q) => q[1]());
    if (!phase) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function LoaderA() {
  return (
    <>
      <div id="ldrA" className="ldrA" aria-hidden="true" dangerouslySetInnerHTML={{ __html: "" }} suppressHydrationWarning />
      <BookLink src="loader" className="ldrA-cta">
        <span>
          book a call <span aria-hidden="true">↗</span>
        </span>
        <small>15 min, video</small>
      </BookLink>
      <script dangerouslySetInnerHTML={{ __html: "(" + run.toString() + ")(" + JSON.stringify(DATA) + ")" }} />
    </>
  );
}
