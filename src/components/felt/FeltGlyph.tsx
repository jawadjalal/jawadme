"use client";

/*
 * A felt piece drawn in glyphs: the real felt picture (public/felt) sampled into a grid of characters by the asciicn
 * engine (src/lib/ascii, MIT, vendored), each glyph in the felt's own colour. The glyphs breathe on a slow wave, lean
 * away from the cursor when it comes near, and when the piece changes to another felt picture the cells flip over one
 * by one. Pointing at it (or `reveal`) opens a round window from the cursor that shows the felt picture itself.
 *
 * The engine pauses the loop off screen and in hidden tabs and draws one still frame under reduced motion. The real
 * <img> sits under the glyphs, so the piece is never empty before the script runs. Styles: felt.css (`fg`).
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AsciiGrid, autoLevels, sampleToField } from "@/lib/ascii";
import type { AsciiGridDrawContext, ToneField } from "@/lib/ascii";
import { feltSrc } from "./copy";

/** Empty to dense. Round, soft glyphs first so the felt's fuzz reads in the light parts. */
const RAMP = " .\u00b7:;=+*o%#@";
const SCRAMBLE = "/\\|<>{}[]=+*~^";
/** How far the cursor reaches, in cells, and how hard it pushes. */
const REACH = 7;
const PUSH = 2.6;
const FLIP = 0.75;

type Art = { name: string; img: HTMLImageElement | null };

const load = (name: string) =>
  new Promise<HTMLImageElement | null>((done) => {
    const img = new Image();
    img.decoding = "async";
    img.src = feltSrc(name).src;
    img
      .decode()
      .then(() => done(img))
      .catch(() => done(null));
  });

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export function FeltGlyph({ art, alt, reveal = false, cell = 6, className, priority = false }: { art: string; alt: string; reveal?: boolean; cell?: number; className?: string; priority?: boolean }) {
  const box = useRef<HTMLSpanElement>(null);
  const now = useRef<Art>({ name: art, img: null });
  const was = useRef<Art | null>(null);
  const flipAt = useRef(0);
  const fields = useRef(new Map<string, { key: string; field: ToneField }>());
  const ptr = useRef({ x: -1e4, y: -1e4 });
  const [shown, setShown] = useState(art);

  // the picture: load it, then flip the cells over to it
  useEffect(() => {
    let off = false;
    void load(art).then((img) => {
      if (off) return;
      if (now.current.img && now.current.name !== art) {
        was.current = now.current;
        flipAt.current = performance.now();
      }
      now.current = { name: art, img };
      setShown(art);
    });
    return () => {
      off = true;
    };
  }, [art]);

  // the cursor, in page pixels, read against the box at draw time so it reaches beyond the piece's own edges
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const move = (e: PointerEvent) => {
      ptr.current.x = e.clientX;
      ptr.current.y = e.clientY;
      const el = box.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);

  const fieldFor = (a: Art, columns: number, rows: number, aspect: number) => {
    if (!a.img) return null;
    const key = `${columns}x${rows}`;
    const hit = fields.current.get(a.name);
    if (hit && hit.key === key) return hit.field;
    // levels stretched over the felt alone (transparent samples are left out), so its light and shade use the whole ramp
    const field = autoLevels(sampleToField(a.img, { columns, rows, charset: "standard", fit: "contain", aspect }), 2);
    fields.current.set(a.name, { key, field });
    return field;
  };

  const draw = ({ frame, columns, rows, time, metrics }: AsciiGridDrawContext) => {
    const aspect = (columns * metrics.width) / (rows * metrics.height);
    const next = fieldFor(now.current, columns, rows, aspect);
    if (!next) return;
    const prev = was.current ? fieldFor(was.current, columns, rows, aspect) : null;
    const p = prev ? Math.min(1, (performance.now() - flipAt.current) / 1000 / FLIP) : 1;
    if (p >= 1) was.current = null;

    // the cursor in cells
    const el = box.current;
    let px = -1e4;
    let py = -1e4;
    if (el) {
      const r = el.getBoundingClientRect();
      px = (ptr.current.x - r.left) / metrics.width;
      py = (ptr.current.y - r.top) / metrics.height;
    }
    const ax = metrics.width / metrics.height;
    const step = Math.floor(time * 7);

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        // lean away from the cursor: read the picture from a cell nearer to it, so the glyphs bulge outwards
        const dx = (x + 0.5 - px) * ax;
        const dy = y + 0.5 - py;
        const d = Math.hypot(dx, dy);
        const near = d < REACH ? (1 - d / REACH) ** 2 : 0;
        let sx = x;
        let sy = y;
        if (near > 0 && d > 0.001) {
          sx = Math.round(x - ((dx / d) * PUSH * near) / ax);
          sy = Math.round(y - (dy / d) * PUSH * near);
        }
        const r = hash(x, y);
        const f = prev && r > p ? prev : next;
        if (sx < 0 || sy < 0 || sx >= columns || sy >= rows) continue;
        const i = sy * columns + sx;
        const c = f.colors;
        const a = c ? (c[i * 4 + 3] ?? 0) : 255;
        if (a < 60) continue;
        const R = c ? (c[i * 4] ?? 0) : 255;
        const G = c ? (c[i * 4 + 1] ?? 0) : 255;
        const B = c ? (c[i * 4 + 2] ?? 0) : 255;
        // shade, not fill: mid tones thin out so the felt's own light and shadow draw the form
        // cream and white felt (low chroma, light) would fill in solid: it draws as sparse light glyphs instead
        const chroma = (Math.max(R, G, B) - Math.min(R, G, B)) / 255;
        const pale = chroma < 0.18 && (R + G + B) / 765 > 0.55 ? 0.45 : 1;
        const lum = Math.pow(f.tones[i] ?? 0, 1.5) * pale;
        const wave = 0.07 * Math.sin(x * 0.5 + y * 0.32 - time * 1.3);
        let tone = (a / 255) * (0.06 + 0.94 * lum) + wave + near * 0.2;
        tone = Math.max(0.06, Math.min(1, tone));
        let g = RAMP[Math.min(RAMP.length - 1, 1 + Math.floor(tone * (RAMP.length - 1)))] ?? "#";
        // cells at the flip's front, and a few near the cursor, show a passing glyph
        const front = prev && Math.abs(r - p) < 0.08;
        if (front || (near > 0.35 && hash(x + step, y) < near * 0.5)) g = SCRAMBLE[Math.floor(hash(x, y + step) * SCRAMBLE.length)] ?? "+";
        // the felt's own colour, a little richer, brighter where the glyph is dense
        const L = 0.299 * R + 0.587 * G + 0.114 * B;
        const lift = 1 + 0.6 * tone + near * 0.5;
        const sat = (v: number) => Math.max(0, Math.min(255, (L + (v - L) * 1.6) * lift));
        frame.put(x, y, g, [sat(R), sat(G), sat(B), 255]);
      }
    }
  };

  const f = feltSrc(shown);
  return (
    <span ref={box} className={`fg${reveal ? " is-open" : ""}${className ? ` ${className}` : ""}`} style={{ "--cell": `${cell}px` } as CSSProperties}>
      {/* the felt picture itself, under the glyphs: shown through the round window, and before the engine draws */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="fg-img" src={f.src} srcSet={f.srcSet} sizes="(max-width: 760px) 30vw, 200px" alt={alt} width={320} height={320} decoding="async" fetchPriority={priority ? "high" : "auto"} draggable={false} />
      <AsciiGrid className="fg-glyphs" draw={draw} cell={cell} colored fps={30} paper="transparent" />
    </span>
  );
}
