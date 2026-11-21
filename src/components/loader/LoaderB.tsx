"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "./loaderB.css";

// Loader B, on home for every hard load (the long beat on a first visit, a short one on repeats); ?loader=0 turns it
// off. Client navigations never run it: the inline script below only runs in the server HTML. Sparks rise out of the dark and a few real Arabic words drift through them, one or two
// at a time with uneven holds, a stall, and one wrong-footed beat of black; then تصميم ("design") comes apart into
// sparks that gather into the name, which settles solid and docks exactly onto the home h1. The mark is not drawn
// here: it is a clone of the hero's own h1 (whatever face the hero sets it in), so the dock lands on the real thing.
// Words are drawn as whole shaped runs (canvas fillText, direction rtl), never as separate letters. The words and
// what they mean are in loader-words.md. Font: Aref Ruqaa Bold, SIL OFL 1.1, subset to those words.

const FAM = "LoaderB Aref Ruqaa";
const KEY = "lb-b-seen";
const WORD_AR = ["ضياء", "نور", "خط", "تصميم"];

type Item = { i: number; at: number; wide: [number, number]; tall: [number, number]; s: number };
type Beat = { items: Item[]; stall: [number, number]; cut: [number, number]; cond: number; markIn: number; handoff: number; end: number; embers: number };

const FIRST: Beat = {
  items: [
    { i: 0, at: 200, wide: [0.3, 0.64], tall: [0.38, 0.66], s: 1 },
    { i: 1, at: 450, wide: [0.72, 0.32], tall: [0.64, 0.3], s: 0.8 },
    { i: 2, at: 720, wide: [0.44, 0.52], tall: [0.5, 0.5], s: 1.2 },
    { i: 3, at: 1160, wide: [0.5, 0.5], tall: [0.5, 0.5], s: 1.5 },
  ],
  stall: [840, 1060],
  cut: [1080, 1160],
  cond: 1450,
  markIn: 1780,
  handoff: 2080,
  end: 2440,
  embers: 150,
};
const REPEAT: Beat = {
  items: [
    { i: 0, at: 80, wide: [0.3, 0.64], tall: [0.38, 0.66], s: 1 },
    { i: 3, at: 380, wide: [0.5, 0.5], tall: [0.5, 0.5], s: 1.5 },
  ],
  stall: [-1, -1],
  cut: [300, 370],
  cond: 560,
  markIn: 900,
  handoff: 1130,
  end: 1470,
  embers: 70,
};
const OUT = [380, 300, 400, 0];

const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const clamp = (v: number) => Math.min(1, Math.max(0, v));

type Ember = { x: number; y: number; vy: number; r: number; ph: number; sw: number; at: number };
type Word = { cv: HTMLCanvasElement; ox: number; oy: number; x: number; y: number; at: number; out: number; simAt: number; pts: number[] };

const SCRIPT =
  "try{if(!/[?&]loader=0(&|$)/.test(location.search)){var d=document.documentElement;d.classList.add('lb-on');setTimeout(function(){d.classList.remove('lb-on')},6000);window.__lbT=performance.now();window.__lbF=document.fonts.load('700 80px \"LoaderB Aref Ruqaa\"','" + WORD_AR.join(" ") + "')}}catch(e){}";

export function LoaderB() {
  const [armed, setArmed] = useState(false);
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const grainRef = useRef<HTMLCanvasElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (document.documentElement.classList.contains("lb-on")) setArmed(true);
    else setGone(true);
  }, []);

  useEffect(() => {
    if (!armed) return;
    const root = document.documentElement;
    const el = rootRef.current!;
    const hold = (e: Event) => e.preventDefault();
    el.addEventListener("wheel", hold, { passive: false });
    const ground = groundRef.current!;
    const cv = cvRef.current!;
    const grain = grainRef.current!;
    const mark = markRef.current!;
    const cta = ctaRef.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = !!localStorage.getItem(KEY);
    } catch {}
    const cfg = seen ? REPEAT : FIRST;
    const vw = innerWidth;
    const vh = innerHeight;
    const tall = vh > vw * 1.1;
    const dpr = Math.min(devicePixelRatio || 1, vw < 600 ? 1.25 : 1.5);

    let dead = false;
    let raf = 0;
    let handoffAt = -1;
    let t0 = 0;
    const timers: number[] = [];
    const anims: Animation[] = [];
    const finish = () => {
      if (dead) return;
      dead = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.cancel());
      el.removeEventListener("wheel", hold);
      removeEventListener("keydown", onSkip, true);
      removeEventListener("pointerdown", onSkip, true);
      try {
        localStorage.setItem(KEY, "1");
      } catch {}
      root.classList.remove("lb-on");
      el.hidden = true;
      setGone(true);
    };

    const src = document.querySelector<HTMLElement>("main h1");
    const B = src?.getBoundingClientRect();
    if (!src || !B || B.width < 40 || scrollY > 10 || B.top > vh * 0.5) {
      anims.push(ground.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: "forwards" }), cta.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: "forwards" }));
      timers.push(window.setTimeout(finish, 230));
      return finish;
    }
    const cs = getComputedStyle(src);
    mark.innerHTML = src.innerHTML;
    Object.assign(mark.style, { width: B.width + "px", height: B.height + "px", display: cs.display, flexDirection: cs.flexDirection, alignItems: cs.alignItems, gap: cs.gap, padding: cs.padding, color: cs.color });
    const k = Math.min((vw * 0.86) / B.width, (vh * 0.4) / B.height, 2.2);
    const cx = (vw - B.width * k) / 2;
    const cy = (vh - B.height * k) / 2 - vh * 0.02;
    const big = "translate(" + cx + "px," + cy + "px) scale(" + k + ")";
    const dock = () => {
      const r = src.getBoundingClientRect();
      return "translate(" + r.left + "px," + r.top + "px) scale(" + r.width / B.width + ")";
    };
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const token = (name: string, fallback: string) => {
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = fallback;
      probe.fillStyle = getComputedStyle(el).getPropertyValue(name).trim() || fallback;
      probe.fillRect(0, 0, 1, 1);
      return Array.from(probe.getImageData(0, 0, 1, 1).data.slice(0, 3));
    };
    const acc = token("--accent", "#73e8b5");
    const glow = token("--accent-glow", "#8af5c6");
    const spark = token("--accent-spark", "#4dffae");
    const ivory = token("--ivory", "#f8e3c2");
    const mix = (a: number[], b: number[], u: number) => a.map((v, i) => Math.round(v + (b[i] - v) * u));
    const css = (c: number[], a = 1) => "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
    const hot = mix(spark, [255, 255, 255], 0.4);
    const GLOW = "drop-shadow(0 0 7px " + css(glow, 0.75) + ")";
    const NOGLOW = "drop-shadow(0 0 0 " + css(glow, 0) + ")";

    const handoff = (dur: number) => {
      const opt = { duration: dur, fill: "forwards" as const };
      anims.push(
        mark.animate([{ transform: big, filter: GLOW }, { transform: dock(), filter: NOGLOW }], { ...opt, easing: "cubic-bezier(0.65,0,0.2,1)" }),
        ground.animate([{ opacity: 1 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { ...opt, duration: dur - 20 }),
        cta.animate([{ opacity: 1 }, { opacity: 1, offset: 0.55 }, { opacity: 0 }], opt),
      );
      timers.push(window.setTimeout(finish, dur));
    };
    const onSkip = (e: Event) => {
      if (e.target instanceof Element && e.target.closest("a")) return;
      if (e instanceof KeyboardEvent && (e.key === "Tab" || e.key === "Shift" || e.key === "Meta" || e.key === "Control" || e.key === "Alt")) return;
      if (handoffAt >= 0) return;
      const t = performance.now() - t0;
      handoffAt = t;
      if (reduced || t < cfg.markIn - 200) {
        anims.push(ground.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }), cta.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }));
        timers.push(window.setTimeout(finish, 210));
        return;
      }
      mark.style.transform = big;
      mark.style.opacity = "1";
      handoff(340);
    };
    addEventListener("keydown", onSkip, true);
    addEventListener("pointerdown", onSkip, true);

    if (reduced) {
      mark.style.transform = dock();
      mark.style.opacity = "1";
      timers.push(window.setTimeout(finish, 300));
      return finish;
    }
    mark.style.transform = big;

    const T0 = (window as unknown as { __lbT?: number }).__lbT ?? performance.now();
    const font = '700 %spx "' + FAM + '", "Noto Naskh Arabic", "Geeza Pro", serif';

    (async () => {
      const w = window as unknown as { __lbF?: Promise<unknown> };
      await Promise.race([(w.__lbF ?? document.fonts.load('700 80px "' + FAM + '"', WORD_AR.join(" "))).catch(() => {}), new Promise((r) => setTimeout(r, 900))]);
      if (dead) return;

      const tick = () => new Promise<void>((r) => setTimeout(r));
      const tile = document.createElement("canvas");
      tile.width = tile.height = 128;
      const tg0 = tile.getContext("2d")!;
      const gi = tg0.createImageData(128, 128);
      for (let p = 0; p < gi.data.length; p += 4) {
        gi.data[p] = glow[0];
        gi.data[p + 1] = glow[1];
        gi.data[p + 2] = glow[2];
        gi.data[p + 3] = Math.random() * 4.5;
      }
      tg0.putImageData(gi, 0, 0);
      grain.width = vw;
      grain.height = vh;
      const gg = grain.getContext("2d")!;
      gg.fillStyle = gg.createPattern(tile, "repeat")!;
      gg.fillRect(0, 0, vw, vh);
      await tick();
      if (dead) return;

      const base = vw < 600 ? vw * 0.2 : Math.min(150, vw * 0.1);
      const P = 40;
      const words: Word[] = [];
      for (const it of cfg.items) {
        await tick();
        if (dead) return;
        const size = base * it.s;
        const f = font.replace("%s", String(size));
        const probe = document.createElement("canvas").getContext("2d")!;
        probe.font = f;
        probe.direction = "rtl";
        probe.textAlign = "center";
        const m = probe.measureText(WORD_AR[it.i]);
        const left = Math.ceil(m.actualBoundingBoxLeft);
        const asc = Math.ceil(m.actualBoundingBoxAscent);
        const wd = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight);
        const h = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);
        const ox = P + left;
        const oy = P + asc;
        const draw = (scale: number, lit: boolean) => {
          const c = document.createElement("canvas");
          c.width = Math.ceil((wd + 2 * P) * scale);
          c.height = Math.ceil((h + 2 * P) * scale);
          const g = c.getContext("2d")!;
          g.scale(scale, scale);
          g.font = f;
          g.direction = "rtl";
          g.textAlign = "center";
          if (lit) {
            g.lineJoin = "round";
            g.strokeStyle = css(glow, 0.1);
            g.lineWidth = size * 0.26;
            g.strokeText(WORD_AR[it.i], ox, oy);
            g.strokeStyle = css(glow, 0.16);
            g.lineWidth = size * 0.15;
            g.strokeText(WORD_AR[it.i], ox, oy);
            g.strokeStyle = css(glow, 0.3);
            g.lineWidth = size * 0.07;
            g.strokeText(WORD_AR[it.i], ox, oy);
            g.fillStyle = css(glow);
          } else g.fillStyle = "#fff";
          g.fillText(WORD_AR[it.i], ox, oy);
          return { c, g };
        };
        const lit = draw(dpr, true);
        const pts: number[] = [];
        if (it.i === 3) {
          const mask = draw(1, false);
          const data = mask.g.getImageData(0, 0, mask.c.width, mask.c.height).data;
          for (let y = 0; y < mask.c.height; y += 2) for (let x = 0; x < mask.c.width; x += 2) if (data[(y * mask.c.width + x) * 4 + 3] > 140) pts.push(x - ox, y - oy);
        }
        const [sx, sy] = tall ? it.tall : it.wide;
        words.push({ cv: lit.c, ox, oy, x: sx * vw, y: sy * vh, at: it.at, out: it.i === 3 ? cfg.cond : it.at + OUT[it.i], simAt: -1, pts });
      }
      await tick();
      if (dead) return;
      const design = words[words.length - 1];

      const tpts: number[] = [];
      const svgs = mark.querySelectorAll("svg");
      if (svgs.length) {
        const r0 = mark.getBoundingClientRect();
        const rx = Math.max(0, Math.floor(r0.left));
        const ry = Math.max(0, Math.floor(r0.top));
        const rw = Math.min(vw, Math.ceil(r0.right)) - rx;
        const rh = Math.min(vh, Math.ceil(r0.bottom)) - ry;
        const tc = document.createElement("canvas");
        tc.width = rw;
        tc.height = rh;
        const tg = tc.getContext("2d")!;
        svgs.forEach((s) => {
          const r = s.getBoundingClientRect();
          const vb = (s.getAttribute("viewBox") ?? "0 0 1 1").split(" ").map(Number);
          tg.save();
          tg.translate(r.left - rx, r.top - ry);
          tg.scale(r.width / vb[2], r.width / vb[2]);
          tg.translate(-vb[0], -vb[1]);
          s.querySelectorAll("path").forEach((p) => tg.fill(new Path2D(p.getAttribute("d") ?? "")));
          tg.restore();
        });
        const td = tg.getImageData(0, 0, rw, rh).data;
        const tstep = B.width * k < 500 ? 1 : 2;
        for (let y = 0; y < rh; y += tstep) for (let x = 0; x < rw; x += tstep) if (td[(y * rw + x) * 4 + 3] > 140) tpts.push(rx + x, ry + y);
      } else {
        const r0 = mark.getBoundingClientRect();
        for (let n = 0; n < 6000; n++) tpts.push(r0.left + Math.random() * r0.width, r0.top + Math.random() * r0.height);
      }
      await tick();
      if (dead) return;
      const N = Math.min(2000, tpts.length / 2);
      const pick = (arr: number[], n: number) => {
        const out: number[] = [];
        const total = arr.length / 2;
        for (let i = 0; i < n; i++) {
          const j = Math.floor(((i + Math.random() * 0.999) * total) / n);
          out.push(arr[j * 2], arr[j * 2 + 1]);
        }
        return out;
      };
      const sp = pick(design.pts, N);
      const src2: { x: number; y: number; k: number }[] = [];
      for (let i = 0; i < N; i++) {
        const x = design.x + sp[i * 2];
        src2.push({ x, y: design.y + sp[i * 2 + 1], k: x + (Math.random() - 0.5) * 120 });
      }
      src2.sort((a, b) => a.k - b.k);
      const tp = pick(tpts, N);
      const ts: { x: number; y: number }[] = [];
      for (let i = 0; i < N; i++) ts.push({ x: tp[i * 2], y: tp[i * 2 + 1] });
      ts.sort((a, b) => a.x - b.x);
      const sx = new Float32Array(N);
      const sy = new Float32Array(N);
      const tx = new Float32Array(N);
      const ty = new Float32Array(N);
      const dl = new Float32Array(N);
      const du = new Float32Array(N);
      const ax = new Float32Array(N);
      const ay = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        sx[i] = src2[i].x;
        sy[i] = src2[i].y;
        tx[i] = ts[i].x;
        ty[i] = ts[i].y;
        dl[i] = (i / N) * 100 + Math.random() * 40;
        du[i] = 220 + Math.random() * 80;
        ax[i] = (Math.random() - 0.5) * 120;
        ay[i] = -30 - Math.random() * 90;
      }

      const spr = document.createElement("canvas");
      spr.width = spr.height = 64;
      const sg = spr.getContext("2d")!;
      sg.shadowColor = css(spark, 0.9);
      sg.shadowBlur = 22;
      sg.fillStyle = css(hot);
      for (let pass = 0; pass < 3; pass++) {
        sg.beginPath();
        sg.arc(32, 32, 7, 0, Math.PI * 2);
        sg.fill();
      }
      cv.width = Math.round(vw * dpr);
      cv.height = Math.round(vh * dpr);
      const ctx = cv.getContext("2d")!;
      const flying = css(spark);
      const landed = css(mix(glow, ivory, 0.5));
      const embers: Ember[] = Array.from({ length: Math.round(cfg.embers * (vw < 600 ? 0.6 : 1)) }, () => ({ x: Math.random() * vw, y: vh * (0.55 + Math.random() * 0.6), vy: 40 + Math.random() * 90, r: 1 + Math.random() * 2.4, ph: Math.random() * 6.28, sw: 0.6 + Math.random() * 1.4, at: Math.random() * cfg.cond * 0.7 }));

      t0 = Math.max(T0, performance.now() - 1300);
      let last = t0;
      let simT = 0;
      const frame = (now: number) => {
        if (dead) return;
        const t = now - t0;
        const dt = Math.min(now - last, 50);
        last = now;
        const nap = t >= cfg.stall[0] + 60 && t < cfg.stall[1] ? cfg.stall[1] : t >= cfg.cut[0] + 50 && t < cfg.cut[1] - 20 ? cfg.cut[1] - 20 : 0;
        if (nap) {
          timers.push(window.setTimeout(() => (raf = requestAnimationFrame(frame)), nap - t));
          last = now;
          return;
        }
        const stalled = t >= cfg.stall[0] && t < cfg.stall[1];
        const cut = t >= cfg.cut[0] && t < cfg.cut[1];
        const lurch = t >= cfg.cut[1] && t < cfg.cut[1] + 160 ? 2.4 : 1;
        if (!stalled) simT += (dt * lurch) / 1000;
        const fadeOut = handoffAt >= 0 ? 1 - clamp((t - handoffAt) / 260) : 1;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, vw, vh);
        ctx.globalCompositeOperation = "lighter";
        if (!cut)
          for (const e of embers) {
            if (t < e.at) continue;
            const age = simT - e.at / 1000;
            const y = e.y - e.vy * age;
            const x = e.x + Math.sin(age * e.sw + e.ph) * 18;
            if (y < -20) continue;
            ctx.globalAlpha = Math.min(1, clamp(y / (vh * 0.9)) * 1.1) * (0.55 + 0.45 * Math.sin(simT * 7 + e.ph * 3)) * fadeOut * clamp((t - e.at) / 300);
            const s = e.r * 7;
            ctx.drawImage(spr, x - s / 2, y - s / 2, s, s);
          }
        if (cut && t > cfg.cut[1] - 90) {
          ctx.globalAlpha = 0.9 * clamp((t - (cfg.cut[1] - 90)) / 60);
          ctx.drawImage(spr, design.x - 9, design.y - 9, 18, 18);
        }
        ctx.globalCompositeOperation = "source-over";

        const peel = clamp((t - cfg.cond) / 240);
        words.forEach((wd, i) => {
          if (t < wd.at || t >= wd.out + 240 * (i === words.length - 1 ? 1 : 0) || cut) return;
          if (wd.simAt < 0) wd.simAt = simT;
          const inA = ease(clamp((t - wd.at) / 120));
          const outA = i === words.length - 1 ? 1 - ease(peel) : 1 - clamp((t - wd.out) / 90);
          const age = simT - wd.simAt;
          const py = wd.y - age * 46 + (1 - inA) * 18 + (stalled ? Math.sin(t * 0.09 + i * 2) * 0.8 : 0);
          const px = wd.x + Math.sin(age * 1.3 + i * 1.7) * 6;
          ctx.globalAlpha = Math.min(1, inA * outA * fadeOut);
          ctx.drawImage(wd.cv, px - wd.ox, py - wd.oy, wd.cv.width / dpr, wd.cv.height / dpr);
        });

        if (t >= cfg.cond && t < cfg.markIn + 220) {
          ctx.globalCompositeOperation = "lighter";
          const fade = 1 - clamp((t - cfg.markIn) / 180);
          for (let i = 0; i < N; i++) {
            const u = clamp((t - cfg.cond - dl[i]) / du[i]);
            const e = ease(u);
            const bow = Math.sin(u * Math.PI);
            const x = sx[i] + (tx[i] - sx[i]) * e + ax[i] * bow;
            const y = sy[i] + (ty[i] - sy[i]) * e + ay[i] * bow;
            ctx.globalAlpha = (u === 0 ? 0 : 0.5 + 0.5 * u) * fade * fadeOut;
            const s = 2.3 - u * 0.5;
            ctx.fillStyle = u < 1 ? flying : landed;
            ctx.fillRect(x - s / 2, y - s / 2, s, s);
            if (i % 7 === 0) {
              ctx.globalAlpha *= 0.35;
              ctx.drawImage(spr, x - 5, y - 5, 10, 10);
            }
          }
          ctx.globalCompositeOperation = "source-over";
        }
        ctx.globalAlpha = 1;

        if (t >= cfg.markIn && handoffAt < 0) {
          const u = ease(clamp((t - cfg.markIn) / 170));
          mark.style.opacity = String(u);
          mark.style.filter = "drop-shadow(0 0 " + (5 + 10 * (1 - u)) + "px " + css(glow, 0.5 + 0.4 * (1 - u)) + ")";
        }
        if (t >= cfg.handoff && handoffAt < 0) {
          handoffAt = t;
          mark.style.opacity = "1";
          handoff(Math.max(200, cfg.end - t));
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    })();

    return finish;
  }, [armed]);

  if (gone) return null;
  return (
    <div className="lb" ref={rootRef}>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div className="lb-ground" ref={groundRef} aria-hidden="true">
        <canvas className="lb-cv" ref={cvRef} />
        <canvas className="lb-grain" ref={grainRef} />
        <i className="lb-seed" />
      </div>
      <div className="lb-mark" ref={markRef} aria-hidden="true" />
      <Link href="/cal?src=loader" className="lb-cta" ref={ctaRef}>
        <span>
          book a call <span aria-hidden="true">↗</span>
        </span>
        <small>15 min</small>
      </Link>
      <span className="lb-hint" aria-hidden="true">
        click or press any key to skip
      </span>
    </div>
  );
}
