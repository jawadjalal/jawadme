"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Ad } from "@/content/ads";

/*
 * The hero's ads around the outside of a slow-turning drum, after Outpace's project ring: every card is bent to the
 * drum in WebGL (three, loaded after first paint), its name and headline under it bent with it. It turns on its own;
 * a drag or swipe takes it with momentum and lets it snap to the nearest card; a tap opens the viewer. With focus, the
 * arrow keys step and Enter opens. Until three has loaded, and with no WebGL, the same ads stand in a flat row of links,
 * which stay in the page for screen readers. The camera sits a little above the drum's middle, so the cards going away
 * rise and narrow towards its edges. Reduced motion: no turning on its own, no momentum, the snap is instant.
 */

type Three = typeof import("three");
const TURN = 0.05;
const GAP = 0.09;
const SEG = 28;
const TW = 576;
const TH = 720;
const CH = 116;
const DIST = 9;
const LIFT = 0.32;
const headline = (a: Ad) => {
  const s = a.alt.split(". ")[0];
  return s.length <= 44 ? s.replace(/\.$/, "") : "";
};

export function AdRing({ ads }: { ads: Ad[] }) {
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [live, setLive] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el || !document.createElement("canvas").getContext("webgl2")) return;
    let off = false;
    let dispose = () => {};
    import("three").then((T) => {
      if (!off) dispose = mount(T, el, ads, (id) => router.push("/w/" + id), () => setLive(true));
    });
    return () => {
      off = true;
      dispose();
    };
  }, [ads, router]);
  const n = ads.length;
  return (
    <div ref={box} className={"ring" + (live ? " live" : "")} tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Ads. Drag, or use the arrow keys and Enter.">
      <ul className="ring-flat">
        {ads.map((a, i) => (
          <li key={a.id} data-show={i < 3 || i >= n - 2 ? "" : undefined} style={{ order: (i + 2) % n }}>
            <Link href={"/w/" + a.id} tabIndex={live ? -1 : undefined}>
              <Image src={a.src} alt={a.alt} width={a.w} height={a.h} sizes="(min-width: 768px) 25vw, 62vw" priority={i < 3 || i >= n - 2} />
              <span className="ring-cap">{a.campaign}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function mount(T: Three, el: HTMLDivElement, ads: Ad[], open: (id: string) => void, ready: () => void) {
  const N = ads.length;
  const pitch = (Math.PI * 2) / N;
  const R = 1 / (pitch * (1 - GAP));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.className = "ring-gl";
  el.appendChild(canvas);
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(30, 1, 0.01, 10);
  cam.position.set(0, LIFT, 0);
  cam.lookAt(0, 0, -DIST);
  const ring = new T.Group();
  ring.position.z = -(DIST + R);
  scene.add(ring);

  const hc = TH / TW;
  const hp = hc * ((TH + CH) / TH);
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let k = 0; k <= SEG; k++) {
    const t = k / SEG;
    const a = (t - 0.5) * pitch * (1 - GAP);
    const x = R * Math.sin(a);
    const z = R * Math.cos(a);
    pos.push(x, hp / 2, z, x, -hp / 2, z);
    uv.push(t, 1, t, 0);
    if (k < SEG) idx.push(2 * k, 2 * k + 1, 2 * k + 2, 2 * k + 1, 2 * k + 3, 2 * k + 2);
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);

  const css = getComputedStyle(el);
  const family = css.fontFamily;
  let loaded = 0;
  const cards = ads.map((a, i) => {
    const cv = document.createElement("canvas");
    cv.width = TW;
    cv.height = TH + CH;
    const g = cv.getContext("2d")!;
    g.fillStyle = "#21182a";
    g.fillRect(0, 0, TW, TH);
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const mat = new T.MeshBasicMaterial({ map: tex, transparent: true, side: T.DoubleSide });
    const mesh = new T.Mesh(geo, mat);
    mesh.rotation.y = i * pitch;
    mesh.userData.i = i;
    ring.add(mesh);
    const img = new window.Image();
    img.decoding = "async";
    img.src = a.src;
    const line = headline(a);
    Promise.all([img.decode(), document.fonts.ready]).then(() => {
      g.drawImage(img, 0, 0, TW, TH);
      g.fillStyle = "#e6e5e1";
      g.font = "700 34px " + family;
      g.textBaseline = "alphabetic";
      g.fillText(a.campaign, 2, TH + 45);
      if (line) {
        g.fillStyle = "rgba(230, 229, 225, 0.58)";
        g.font = "600 27px " + family;
        g.fillText(line, 2, TH + 85);
      }
      tex.needsUpdate = true;
      if (++loaded === 3) show();
    }).catch(() => {});
    return { mesh, mat, tex };
  });

  let W = 0;
  let H = 0;
  let radPerPx = 0;
  const size = () => {
    W = el.clientWidth;
    H = el.clientHeight;
    if (!W || !H) return;
    const wc = Math.min(W * (W < 768 ? 0.62 : 0.22), (0.78 * H) / ((TH + CH) / TW));
    const f = wc * DIST;
    cam.fov = (2 * Math.atan(H / 2 / f) * 180) / Math.PI;
    cam.aspect = W / H;
    cam.updateProjectionMatrix();
    renderer.setSize(W, H, false);
    radPerPx = DIST / (f * R);
  };
  size();
  const ro = new ResizeObserver(size);
  ro.observe(el);

  let rot = reduce ? 0 : -pitch * 1.6;
  let vel = 0;
  let target: number | null = reduce ? null : 0;
  let idleAt = performance.now() + 1200;
  let drag: { id: number; x: number; t: number; moved: number } | null = null;
  const nearest = (r: number) => Math.round(r / pitch) * pitch;
  const front = () => (((Math.round(rot / pitch) % N) + N) % N);
  const snap = (r: number) => {
    vel = 0;
    if (reduce) {
      rot = r;
      target = null;
    } else target = r;
    idleAt = performance.now() + 3000;
  };

  const ray = new T.Raycaster();
  const ndc = new T.Vector2();
  const hit = (e: PointerEvent) => {
    const b = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    const h = ray.intersectObjects(ring.children, false)[0];
    return h ? (h.object.userData.i as number) : -1;
  };
  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, t: performance.now(), moved: 0 };
    target = null;
    vel = 0;
    canvas.classList.add("held");
  };
  const move = (e: PointerEvent) => {
    if (!drag) {
      if (e.pointerType === "mouse") canvas.style.cursor = hit(e) >= 0 ? "pointer" : "";
      return;
    }
    if (e.pointerId !== drag.id) return;
    const now = performance.now();
    const dx = e.clientX - drag.x;
    drag.moved += Math.abs(dx);
    if (drag.moved > 6 && !canvas.hasPointerCapture(e.pointerId)) canvas.setPointerCapture(e.pointerId);
    rot -= dx * radPerPx;
    const dt = Math.max(1, now - drag.t) / 1000;
    vel = vel * 0.6 + ((-dx * radPerPx) / dt) * 0.4;
    drag.x = e.clientX;
    drag.t = now;
  };
  const up = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const tap = drag.moved < 6 && e.type === "pointerup";
    if (performance.now() - drag.t > 80) vel = 0;
    drag = null;
    canvas.classList.remove("held");
    if (tap) {
      const i = hit(e);
      if (i >= 0) return open(ads[i].id);
    }
    if (reduce || Math.abs(vel) < 0.4) snap(nearest(rot + (reduce ? 0 : vel * 0.25)));
    idleAt = performance.now() + 3000;
  };
  let wheelT = 0;
  const wheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    target = null;
    vel = 0;
    rot += e.deltaX * radPerPx * 0.8;
    clearTimeout(wheelT);
    wheelT = window.setTimeout(() => snap(nearest(rot)), 140);
  };
  const key = (e: KeyboardEvent) => {
    if (e.target !== el) return;
    const base = target ?? nearest(rot);
    if (e.key === "ArrowRight") snap(base + pitch);
    else if (e.key === "ArrowLeft") snap(base - pitch);
    else if (e.key === "Enter" || e.key === " ") open(ads[front()].id);
    else return;
    e.preventDefault();
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("wheel", wheel, { passive: false });
  el.addEventListener("keydown", key);

  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!drag) {
      if (target !== null) {
        rot += (target - rot) * (1 - Math.exp(-dt * 7));
        if (Math.abs(target - rot) < 1e-4) {
          rot = target;
          target = null;
        }
      } else if (Math.abs(vel) > 0) {
        rot += vel * dt;
        vel *= Math.exp(-dt * 3.4);
        if (Math.abs(vel) < 0.4) snap(nearest(rot + vel * 0.25));
      } else if (!reduce && now > idleAt) rot += TURN * dt;
    }
    ring.rotation.y = -rot;
    for (let i = 0; i < N; i++) {
      let a = i * pitch - rot;
      a = Math.atan2(Math.sin(a), Math.cos(a));
      const t = Math.min(1, Math.max(0, (Math.abs(a) - pitch * 0.5) / (pitch * 2.5)));
      cards[i].mat.color.setScalar(1 - 0.5 * t * t * (3 - 2 * t));
    }
    renderer.render(scene, cam);
  };
  let seen = false;
  const run = () => renderer.setAnimationLoop(seen && !document.hidden ? frame : null);
  const io = new IntersectionObserver(([e]) => {
    seen = e.isIntersecting;
    last = performance.now();
    run();
  });
  io.observe(el);
  document.addEventListener("visibilitychange", run);
  let shown = false;
  const show = () => {
    if (shown) return;
    shown = true;
    ready();
  };
  const fallback = window.setTimeout(show, 2500);

  return () => {
    clearTimeout(fallback);
    clearTimeout(wheelT);
    renderer.setAnimationLoop(null);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", run);
    el.removeEventListener("keydown", key);
    cards.forEach((c) => {
      c.tex.dispose();
      c.mat.dispose();
    });
    geo.dispose();
    renderer.dispose();
    canvas.remove();
  };
}
