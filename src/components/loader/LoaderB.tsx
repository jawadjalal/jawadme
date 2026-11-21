"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { WORDS } from "@/components/ds/wordmark";
import "./loaderB.css";

// Loader B, behind ?loader=b. Embers rise out of the dark, real Arabic words drift up through them, everything stops
// for a held beat, flickers once, then the words come apart into embers that gather into the name in his own
// lettering (WORDS), which then travels to the h1 at the top of home. Words are drawn as whole shaped runs (canvas
// fillText, direction rtl, so the joining and the ruqaa stacking are the font's own); only their ink is ever
// scattered. The words and what they mean are in loader-words.md. Font: Aref Ruqaa Bold, SIL OFL 1.1, subset.

const FAM = "LoaderB Aref Ruqaa";
const KEY = "lb-b-seen";
const GAP = 300;
const W0 = WORDS[0].w;
const VBW = W0 + GAP + WORDS[1].w;
const VBH = 1010;
const WORD_AR = ["جمر", "نور", "خط", "صنع", "حرفة", "بناء", "تصميم"];
const SIZE = [0.95, 0.8, 1.05, 0.78, 0.9, 0.85, 1.28];
const SLOT_WIDE = [[0.2, 0.68], [0.76, 0.74], [0.4, 0.3], [0.14, 0.3], [0.82, 0.3], [0.6, 0.82], [0.5, 0.54]];
const SLOT_TALL = [[0.3, 0.72], [0.7, 0.8], [0.64, 0.3], [0.3, 0.44], [0.72, 0.56], [0.32, 0.24], [0.5, 0.58]];

type Beat = { words: number[]; start: number; step: number; fade: number; holdA: number; holdB: number; flicker: number; cond: number; markIn: number; handoff: number; end: number; embers: number };
const FIRST: Beat = { words: [0, 1, 2, 3, 4, 5, 6], start: 200, step: 100, fade: 240, holdA: 1060, holdB: 1560, flicker: 1340, cond: 1560, markIn: 2000, handoff: 2260, end: 2660, embers: 150 };
const REPEAT: Beat = { words: [0, 2, 6], start: 90, step: 100, fade: 200, holdA: 520, holdB: 700, flicker: -1, cond: 700, markIn: 960, handoff: 1140, end: 1500, embers: 70 };

const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const clamp = (v: number) => Math.min(1, Math.max(0, v));

type Ember = { x: number; y: number; vy: number; r: number; ph: number; sw: number; at: number };
type Word = { cv: HTMLCanvasElement; ox: number; oy: number; x: number; y: number; at: number; pts: number[] };

const SCRIPT = "try{if(/[?&]loader=b(&|$)/.test(location.search)){document.documentElement.classList.add('lb-on');window.__lbT=performance.now();window.__lbF=document.fonts.load('700 80px \"LoaderB Aref Ruqaa\"','جمر نور خط')}}catch(e){}";

export function LoaderB() {
  const [armed, setArmed] = useState(false);
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const markRef = useRef<SVGSVGElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (/[?&]loader=b(&|$)/.test(location.search)) setArmed(true);
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
    const dpr = Math.min(devicePixelRatio || 1, 1.5);

    const mw = Math.min(vw * (vw < 600 ? 0.86 : 0.7), 980);
    const mh = (mw * VBH) / VBW;
    const mx = (vw - mw) / 2;
    const my = (vh - mh) / 2 - vh * 0.02;
    mark.style.width = mw + "px";
    mark.style.height = mh + "px";
    mark.style.transform = "translate(" + mx + "px," + my + "px)";

    let dead = false;
    let raf = 0;
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
      setGone(true);
    };

    let handoffAt = -1;
    let t0 = 0;
    const slot = () => {
      const h1 = document.querySelector("h1");
      const r = h1?.getBoundingClientRect();
      if (r && r.width > 40 && r.height > 8) return { x: r.left, y: r.top, w: r.width, h: r.height };
      const pad = Math.max(16, vw * 0.03);
      return { x: pad, y: 22, w: Math.min(vw * 0.5, 280), h: 36 };
    };
    const handoff = (dur: number) => {
      const s = slot();
      const k = Math.min(s.w / mw, s.h / mh);
      const x = s.x;
      const y = s.y + (s.h - mh * k) / 2;
      const from = "translate(" + mx + "px," + my + "px) scale(1)";
      const to = "translate(" + x + "px," + y + "px) scale(" + k + ")";
      const opt = { duration: dur, fill: "forwards" as const };
      anims.push(
        mark.animate([{ transform: from, opacity: 1, offset: 0 }, { transform: to, opacity: 1, offset: 0.78 }, { transform: to, opacity: 0, offset: 1 }], { ...opt, easing: "cubic-bezier(0.7,0,0.2,1)" }),
        ground.animate([{ opacity: 1 }, { opacity: 0 }], { ...opt, duration: dur - 60, easing: "ease-in" }),
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
      mark.style.opacity = "1";
      handoff(340);
    };
    addEventListener("keydown", onSkip, true);
    addEventListener("pointerdown", onSkip, true);

    if (reduced) {
      mark.style.opacity = "1";
      timers.push(window.setTimeout(finish, 300));
      return finish;
    }

    const T0 = (window as unknown as { __lbT?: number }).__lbT ?? performance.now();
    const font = '700 %spx "' + FAM + '", "Noto Naskh Arabic", "Geeza Pro", serif';

    (async () => {
      const w = window as unknown as { __lbF?: Promise<unknown> };
      await Promise.race([(w.__lbF ?? document.fonts.load('700 80px "' + FAM + '"', WORD_AR.join(" "))).catch(() => {}), new Promise((r) => setTimeout(r, 900))]);
      if (dead) return;

      const base = vw < 600 ? vw * 0.2 : Math.min(150, vw * 0.1);
      const P = 40;
      const slots = tall ? SLOT_TALL : SLOT_WIDE;
      const words: Word[] = cfg.words.map((idx, k) => {
        const size = base * SIZE[idx];
        const f = font.replace("%s", String(size));
        const probe = document.createElement("canvas").getContext("2d")!;
        probe.font = f;
        probe.direction = "rtl";
        probe.textAlign = "center";
        const m = probe.measureText(WORD_AR[idx]);
        const left = Math.ceil(m.actualBoundingBoxLeft);
        const asc = Math.ceil(m.actualBoundingBoxAscent);
        const w = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight);
        const h = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);
        const ox = P + left;
        const oy = P + asc;
        const draw = (scale: number, glow: boolean) => {
          const c = document.createElement("canvas");
          c.width = Math.ceil((w + 2 * P) * scale);
          c.height = Math.ceil((h + 2 * P) * scale);
          const g = c.getContext("2d")!;
          g.scale(scale, scale);
          g.font = f;
          g.direction = "rtl";
          g.textAlign = "center";
          if (glow) {
            const grad = g.createLinearGradient(0, oy - asc, 0, oy + h - asc);
            grad.addColorStop(0, "#ffe4b8");
            grad.addColorStop(0.5, "#ffa04e");
            grad.addColorStop(1, "#e2531a");
            g.fillStyle = grad;
            g.shadowColor = "rgba(255,110,30,0.85)";
            g.shadowBlur = 26;
            g.fillText(WORD_AR[idx], ox, oy);
            g.shadowBlur = 0;
          } else g.fillStyle = "#fff";
          g.fillText(WORD_AR[idx], ox, oy);
          return { c, g };
        };
        const glow = draw(dpr, true);
        const mask = draw(1, false);
        const data = mask.g.getImageData(0, 0, mask.c.width, mask.c.height).data;
        const pts: number[] = [];
        const step = vw < 600 ? 2 : 3;
        for (let y = 0; y < mask.c.height; y += step) for (let x = 0; x < mask.c.width; x += step) if (data[(y * mask.c.width + x) * 4 + 3] > 140) pts.push(x - ox, y - oy);
        const [sx, sy] = slots[idx];
        return { cv: glow.c, ox, oy, x: sx * vw, y: sy * vh, at: cfg.start + k * cfg.step, pts };
      });

      const tc = document.createElement("canvas");
      tc.width = Math.ceil(mw);
      tc.height = Math.ceil(mh);
      const tg = tc.getContext("2d")!;
      tg.scale(mw / VBW, mw / VBW);
      tg.translate(0, 760);
      WORDS.forEach((wd, i) => {
        tg.save();
        tg.translate(i ? W0 + GAP : 0, 0);
        wd.g.forEach((d) => tg.fill(new Path2D(d)));
        tg.restore();
      });
      const td = tg.getImageData(0, 0, tc.width, tc.height).data;
      const tpts: number[] = [];
      const tstep = mw < 500 ? 1 : 2;
      for (let y = 0; y < tc.height; y += tstep) for (let x = 0; x < tc.width; x += tstep) if (td[(y * tc.width + x) * 4 + 3] > 140) tpts.push(mx + x, my + y);
      const N = Math.min(2600, tpts.length / 2);
      const pick = (arr: number[], n: number) => {
        const out: number[] = [];
        const total = arr.length / 2;
        for (let i = 0; i < n; i++) {
          const j = Math.floor(((i + Math.random() * 0.999) * total) / n);
          out.push(arr[j * 2], arr[j * 2 + 1]);
        }
        return out;
      };

      const src: { x: number; y: number }[] = [];
      const per = Math.ceil(N / words.length);
      for (const w of words) {
        const p = pick(w.pts, Math.min(per, w.pts.length / 2));
        for (let i = 0; i < p.length; i += 2) src.push({ x: w.x + p[i], y: w.y + p[i + 1] });
      }
      while (src.length < N) src.push({ ...src[Math.floor(Math.random() * src.length)] });
      src.length = N;
      const tgt = pick(tpts, N);
      const order = src.map((s, i) => ({ s, k: s.x + (Math.random() - 0.5) * 140 })).sort((a, b) => a.k - b.k);
      const ts: { x: number; y: number }[] = [];
      for (let i = 0; i < N; i++) ts.push({ x: tgt[i * 2], y: tgt[i * 2 + 1] });
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
        sx[i] = order[i].s.x;
        sy[i] = order[i].s.y;
        tx[i] = ts[i].x;
        ty[i] = ts[i].y;
        dl[i] = (i / N) * 110 + Math.random() * 50;
        du[i] = 240 + Math.random() * 80;
        ax[i] = (Math.random() - 0.5) * 120;
        ay[i] = -30 - Math.random() * 90;
      }

      const spr = document.createElement("canvas");
      spr.width = spr.height = 64;
      const sg = spr.getContext("2d")!;
      const rg = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
      rg.addColorStop(0, "rgba(255,214,150,1)");
      rg.addColorStop(0.25, "rgba(255,140,60,0.7)");
      rg.addColorStop(1, "rgba(255,80,20,0)");
      sg.fillStyle = rg;
      sg.fillRect(0, 0, 64, 64);
      const heat = document.createElement("canvas");
      heat.width = 256;
      heat.height = 128;
      const hg = heat.getContext("2d")!;
      hg.scale(1, 0.5);
      const hr = hg.createRadialGradient(128, 256, 0, 128, 256, 256);
      hr.addColorStop(0, "rgba(255,90,20,0.9)");
      hr.addColorStop(0.5, "rgba(200,50,10,0.35)");
      hr.addColorStop(1, "rgba(120,20,0,0)");
      hg.fillStyle = hr;
      hg.fillRect(0, 0, 256, 256);

      cv.width = Math.round(vw * dpr);
      cv.height = Math.round(vh * dpr);
      const ctx = cv.getContext("2d")!;
      const embers: Ember[] = Array.from({ length: cfg.embers }, () => ({ x: Math.random() * vw, y: vh * (0.55 + Math.random() * 0.6), vy: 40 + Math.random() * 90, r: 1 + Math.random() * 2.4, ph: Math.random() * 6.28, sw: 0.6 + Math.random() * 1.4, at: Math.random() * cfg.holdA * 0.9 }));

      t0 = Math.max(T0, performance.now() - 700);
      let last = t0;
      let simT = 0;
      let wordT = 0;
      const frame = (now: number) => {
        if (dead) return;
        const t = now - t0;
        const dt = Math.min(now - last, 50);
        last = now;
        const holding = t >= cfg.holdA && t < cfg.holdB;
        const lurch = t >= cfg.holdB && t < cfg.holdB + 160 ? 2.4 : 1;
        if (!holding) simT += (dt * lurch) / 1000;
        if (t < cfg.holdA) wordT += dt / 1000;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, vw, vh);
        const cut = cfg.flicker >= 0 && t >= cfg.flicker && t < cfg.flicker + 70;
        const flash = cfg.flicker >= 0 && t >= cfg.flicker - 50 && t < cfg.flicker ? 1.5 : 1;
        const fadeOut = handoffAt >= 0 ? 1 - clamp((t - handoffAt) / 260) : 1;

        ctx.globalCompositeOperation = "lighter";
        const heatA = (0.16 + 0.1 * clamp((t - 200) / 1000) + 0.05 * Math.sin(simT * 3)) * (cut ? 0 : 1) * fadeOut;
        ctx.globalAlpha = heatA;
        ctx.drawImage(heat, 0, vh * 0.5, vw, vh * 0.5);
        for (const e of embers) {
          if (t < e.at || cut) continue;
          const age = simT - e.at / 1000;
          const y = e.y - e.vy * age;
          const x = e.x + Math.sin(age * e.sw + e.ph) * 18;
          if (y < -20) continue;
          const tw = 0.55 + 0.45 * Math.sin(simT * 7 + e.ph * 3);
          ctx.globalAlpha = Math.min(1, clamp(y / (vh * 0.9)) * 1.1) * tw * fadeOut * clamp((t - e.at) / 300);
          const s = e.r * 7;
          ctx.drawImage(spr, x - s / 2, y - s / 2, s, s);
        }
        ctx.globalCompositeOperation = "source-over";

        const peel = clamp((t - cfg.cond) / 320);
        words.forEach((w, i) => {
          const a = clamp((t - w.at) / cfg.fade);
          if (a <= 0 || peel >= 1 || cut) return;
          const k = ease(a);
          const gather = 0.14 * Math.min(1, wordT / 1.2);
          const px = w.x + (vw / 2 - w.x) * gather + Math.sin(wordT * 0.9 + i * 1.7) * 8;
          const py = w.y - wordT * 34 + (vh / 2 - w.y) * gather * 0.6 + (holding ? Math.sin(t * 0.09 + i * 2) * 0.8 : 0) + (1 - k) * 22;
          ctx.globalAlpha = Math.min(1, k * flash * (1 - ease(peel)) * fadeOut);
          ctx.drawImage(w.cv, px - w.ox, py - w.oy, w.cv.width / dpr, w.cv.height / dpr);
        });

        if (t >= cfg.cond && t < cfg.markIn + 200) {
          ctx.globalCompositeOperation = "lighter";
          const fade = 1 - clamp((t - cfg.markIn) / 160);
          for (let i = 0; i < N; i++) {
            const u = clamp((t - cfg.cond - dl[i]) / du[i]);
            const e = ease(u);
            const bow = Math.sin(u * Math.PI);
            const x = sx[i] + (tx[i] - sx[i]) * e + ax[i] * bow;
            const y = sy[i] + (ty[i] - sy[i]) * e + ay[i] * bow;
            ctx.globalAlpha = (u === 0 ? 0 : 0.35 + 0.65 * u) * fade * fadeOut;
            const s = 1.5 + (1 - u) * 0.8;
            ctx.fillStyle = u < 1 ? "#ffa656" : "#ffd9a0";
            ctx.fillRect(x - s / 2, y - s / 2, s, s);
          }
          ctx.globalCompositeOperation = "source-over";
        }
        ctx.globalAlpha = 1;

        if (t >= cfg.markIn && handoffAt < 0) {
          const u = clamp((t - cfg.markIn) / 140);
          mark.style.opacity = String(u);
          mark.style.filter = "drop-shadow(0 0 " + (6 + 16 * (1 - u)) + "px rgba(255,110,30," + (0.35 + 0.4 * (1 - u)) + "))";
        }
        if (t >= cfg.handoff && handoffAt < 0) {
          handoffAt = t;
          mark.style.opacity = "1";
          mark.style.filter = "";
          handoff(cfg.end - cfg.handoff);
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
        <i className="lb-seed" />
      </div>
      {armed ? (
        <svg className="lb-mark" ref={markRef} viewBox={"0 -760 " + VBW + " " + VBH} role="img" aria-label="design mastermind">
          <g fill="currentColor">
            {WORDS.map((w, i) => (
              <g key={w.t} transform={"translate(" + (i ? W0 + GAP : 0) + ")"}>
                {w.g.map((d, j) => (
                  <path key={j} d={d} />
                ))}
              </g>
            ))}
          </g>
        </svg>
      ) : null}
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
