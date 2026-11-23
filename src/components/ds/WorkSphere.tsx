"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";

export type SphereItem = {
  key: string;
  href: string;
  title: string;
  line: string;
  section: string;
  /** a small copy for the sphere's texture */
  thumb: string;
  src: string;
  w: number;
  h: number;
  alt: string;
};

type Three = typeof import("three");
type Hooks = { hover: (i: number) => void; open: (i: number) => void; paused: () => boolean };

const VERT = /* glsl */ `
  uniform float uR;
  varying vec2 vUv;
  varying float vFade;
  void main() {
    vUv = uv;
    vec4 c = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vFade = smoothstep(-uR * 0.9, uR * 0.8, c.z);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uSize;
  uniform float uRadius;
  uniform float uLoad;
  uniform float uHover;
  varying vec2 vUv;
  varying float vFade;
  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }
  void main() {
    float d = sdRoundBox((vUv - 0.5) * uSize, uSize * 0.5, uRadius);
    float aa = fwidth(d);
    float a = 1.0 - smoothstep(-aa, aa, d);
    if (a < 0.02) discard;
    vec3 col = mix(vec3(0.17), texture2D(uMap, vUv).rgb, uLoad) * (1.0 + uHover * 0.08);
    col = mix(vec3(0.118), col, 0.18 + 0.82 * vFade);
    gl_FragColor = vec4(col, a);
  }
`;

/** Builds the sphere in host and returns its teardown. Tiles sit on a fibonacci lattice and always face the camera;
 *  drag, wheel and arrow keys spin it with inertia, and thumbnails load front first, four at a time. */
function mountSphere(THREE: Three, host: HTMLElement, items: SphereItem[], on: Hooks) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const dom = renderer.domElement;
  host.appendChild(dom);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  const ball = new THREE.Group();
  scene.add(ball);

  const R = 10;
  const N = items.length;
  const S = R * Math.sqrt((4 * Math.PI) / N) * 0.8;
  const geo = new THREE.PlaneGeometry(1, 1);
  const blank = new THREE.DataTexture(new Uint8Array([43, 43, 43, 255]), 1, 1);
  blank.needsUpdate = true;
  const loader = new THREE.TextureLoader();
  const golden = Math.PI * (3 - Math.sqrt(5));
  const slot = items.map((_, i) => i).sort((a, b) => ((Math.sin(a * 91.7) * 4375.85) % 1) - ((Math.sin(b * 91.7) * 4375.85) % 1));

  const tiles = items.map((it, i) => {
    const j = slot.indexOf(i);
    const y = 1 - ((j + 0.5) / N) * 2;
    const r = Math.sqrt(1 - y * y);
    const home = new THREE.Vector3(Math.cos(j * golden) * r, y, Math.sin(j * golden) * r).multiplyScalar(R);
    const w = it.w >= it.h ? S : (S * it.w) / it.h;
    const h = it.w >= it.h ? (S * it.h) / it.w : S;
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      uniforms: {
        uMap: { value: blank },
        uSize: { value: new THREE.Vector2(w, h) },
        uRadius: { value: S * 0.04 },
        uLoad: { value: 0 },
        uHover: { value: 0 },
        uR: { value: R },
      },
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(home);
    mesh.scale.set(w, h, 1);
    mesh.userData.i = i;
    ball.add(mesh);
    return { mesh, mat, home, w, h, lift: 0, state: 0 as 0 | 1 | 2, tex: null as InstanceType<Three["Texture"]> | null };
  });
  const meshes = tiles.map((t) => t.mesh);

  let rpx = 1;
  const fit = () => {
    const w = host.clientWidth;
    const h = Math.max(host.clientHeight, 1);
    renderer.setSize(w, h);
    camera.aspect = w / h;
    rpx = w < 700 ? w * 0.72 : Math.min(h * 0.46, w * 0.4);
    const half = Math.tan(((camera.fov / 2) * Math.PI) / 180);
    const alpha = Math.atan((rpx / (h / 2)) * half);
    camera.position.set(0, 0, R / Math.sin(alpha));
    camera.updateProjectionMatrix();
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(host);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const idle = reduce ? 0 : 0.06;
  const axisX = new THREE.Vector3(1, 0, 0);
  const axisY = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion();
  const inv = new THREE.Quaternion();
  const p = new THREE.Vector3();
  const spin = (yaw: number, pitch: number) => {
    ball.quaternion.premultiply(q.setFromAxisAngle(axisY, yaw));
    ball.quaternion.premultiply(q.setFromAxisAngle(axisX, pitch));
  };
  ball.quaternion.setFromAxisAngle(axisX, 0.18);

  let vYaw = 0;
  let vPitch = 0;
  let drag: { id: number; x: number; y: number; sx: number; sy: number; t: number } | null = null;
  let hovered = -1;
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  const pick = (e: PointerEvent) => {
    const b = dom.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(meshes, false).find((x) => x.point.z > 0);
    return hit ? (hit.object.userData.i as number) : -1;
  };
  const setHover = (i: number) => {
    if (i === hovered) return;
    hovered = i;
    dom.style.cursor = i >= 0 ? "pointer" : "";
    on.hover(i);
  };

  const onDown = (e: PointerEvent) => {
    if (drag) return;
    dom.setPointerCapture(e.pointerId);
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now() };
    vYaw = 0;
    vPitch = 0;
    host.dataset.drag = "";
  };
  const onMove = (e: PointerEvent) => {
    if (!drag) {
      if (e.pointerType === "mouse") setHover(pick(e));
      return;
    }
    if (e.pointerId !== drag.id) return;
    const now = performance.now();
    const dt = Math.max((now - drag.t) / 1000, 1 / 240);
    const yaw = (e.clientX - drag.x) / rpx;
    const pitch = (e.clientY - drag.y) / rpx;
    spin(yaw, pitch);
    vYaw = vYaw * 0.4 + (yaw / dt) * 0.6;
    vPitch = vPitch * 0.4 + (pitch / dt) * 0.6;
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.t = now;
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) setHover(-1);
  };
  const onUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const still = Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) <= 6;
    if (performance.now() - drag.t > 90) {
      vYaw = 0;
      vPitch = 0;
    }
    drag = null;
    delete host.dataset.drag;
    if (still) {
      const i = pick(e);
      if (i >= 0) on.open(i);
    }
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const k = e.deltaMode === 1 ? 16 : 1;
    vYaw = Math.max(-4, Math.min(4, vYaw - (e.deltaX * k) / rpx * 3));
    vPitch = Math.max(-4, Math.min(4, vPitch - (e.deltaY * k) / rpx * 3));
  };
  const onKey = (e: KeyboardEvent) => {
    if (on.paused()) return;
    const k = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (!k) return;
    vYaw += k[0] * 0.9;
    vPitch += k[1] * 0.9;
  };
  const onLeave = () => setHover(-1);

  dom.addEventListener("pointerdown", onDown);
  dom.addEventListener("pointermove", onMove);
  dom.addEventListener("pointerup", onUp);
  dom.addEventListener("pointercancel", onUp);
  dom.addEventListener("pointerleave", onLeave);
  dom.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKey);

  let inflight = 0;
  const loadNext = () => {
    while (inflight < 4) {
      let best = -1;
      let bestZ = -R * 0.35;
      for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].state) continue;
        const z = p.copy(tiles[i].home).applyQuaternion(ball.quaternion).z;
        if (z > bestZ) {
          bestZ = z;
          best = i;
        }
      }
      if (best < 0) return;
      const t = tiles[best];
      t.state = 1;
      inflight++;
      loader.load(
        items[best].thumb,
        (tex) => {
          inflight--;
          tex.colorSpace = THREE.NoColorSpace;
          tex.anisotropy = 4;
          t.tex = tex;
          t.mat.uniforms.uMap.value = tex;
          t.state = 2;
        },
        undefined,
        () => {
          inflight--;
          t.state = 2;
        },
      );
    }
  };

  let raf = 0;
  let visible = true;
  let last = performance.now();
  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!drag) {
      spin((idle + vYaw) * dt, vPitch * dt);
      const decay = Math.pow(0.06, dt);
      vYaw *= decay;
      vPitch *= decay;
    }
    inv.copy(ball.quaternion).invert();
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      t.lift += ((i === hovered ? 1 : 0) - t.lift) * Math.min(1, dt * 12);
      const facing = p.copy(t.home).applyQuaternion(ball.quaternion).z / R;
      const s = (0.45 + 0.55 * Math.min(1, Math.max(0, (facing + 0.2) / 1.2))) * (1 + 0.24 * t.lift);
      t.mesh.quaternion.copy(inv);
      t.mesh.position.copy(t.home).multiplyScalar(1 + 0.08 * t.lift);
      t.mesh.scale.set(t.w * s, t.h * s, 1);
      t.mat.uniforms.uHover.value = t.lift;
      if (t.state === 2 && t.tex) t.mat.uniforms.uLoad.value += (1 - t.mat.uniforms.uLoad.value) * Math.min(1, dt * 6);
    }
    loadNext();
    renderer.render(scene, camera);
    if (visible && !on.paused()) raf = requestAnimationFrame(frame);
  };
  const wake = () => {
    if (raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    wake();
  });
  io.observe(host);
  const onVis = () => {
    visible = !document.hidden;
    wake();
  };
  document.addEventListener("visibilitychange", onVis);
  wake();

  return {
    wake,
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("keydown", onKey);
      geo.dispose();
      blank.dispose();
      tiles.forEach((t) => {
        t.mat.dispose();
        t.tex?.dispose();
      });
      renderer.dispose();
      dom.remove();
    },
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** /work: every piece on one sphere you spin forever. Without WebGL it falls back to a swipe grid. */
export function WorkSphere({ items }: { items: SphereItem[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mode, setMode] = useState<"boot" | "gl" | "grid">("boot");
  const [hover, setHover] = useState(-1);
  const [open, setOpen] = useState(-1);
  const openRef = useRef(-1);
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    openRef.current = open;
    if (open < 0) {
      wakeRef.current();
      return;
    }
    closeRef.current?.focus();
    track("work_open", { key: items[open].key });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let gone = false;
    let dispose = () => {};
    import("three")
      .then((THREE) => {
        if (gone) return;
        const s = mountSphere(THREE, host, items, { hover: setHover, open: setOpen, paused: () => openRef.current >= 0 });
        wakeRef.current = s.wake;
        dispose = s.dispose;
        setMode("gl");
      })
      .catch(() => setMode("grid"));
    return () => {
      gone = true;
      dispose();
    };
  }, [items]);

  const counts = ["ads", "web", "3d"].map((s) => [s, items.filter((i) => i.section === s).length] as const);
  const shown = hover >= 0 ? items[hover] : null;
  const item = open >= 0 ? items[open] : null;

  return (
    <div className="sph" data-mode={mode}>
      <header className="sph-hud">
        <h1 className="sph-h1">
          work <span>{items.length} pieces</span>
        </h1>
        <p className="sph-hint">
          <span className="sph-fine">drag or scroll to spin · click to open</span>
          <span className="sph-coarse">swipe to spin · tap to open</span>
        </p>
      </header>

      <div ref={hostRef} className="sph-stage" aria-hidden="true" />

      <p className="sph-status" aria-hidden="true">
        {shown ? (
          <>
            <span className="sph-status-k">{shown.section}</span>
            <span className="sph-status-v">
              {shown.title}
              {shown.line ? " / " + shown.line : ""}
            </span>
          </>
        ) : (
          counts.map(([s, n]) => (
            <span key={s} className="sph-status-k">
              {s} {pad(n)}
            </span>
          ))
        )}
      </p>

      <ol className="vh">
        {items.map((it) => (
          <li key={it.key}>
            <Link href={it.href}>
              {it.title}: {it.line || it.alt}
            </Link>
          </li>
        ))}
      </ol>

      {mode === "grid" ? (
        <ul className="sph-grid" aria-label="all work">
          {items.map((it) => (
            <li key={it.key}>
              <Link href={it.href} className="sph-card">
                <Image src={it.thumb} alt={it.alt} width={it.w} height={it.h} sizes="160px" unoptimized />
                <span>{it.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {item ? (
        <div className="sph-box" role="dialog" aria-modal="true" aria-label={item.title} onClick={() => setOpen(-1)}>
          <figure className="sph-fig" onClick={(e) => e.stopPropagation()}>
            <div className="sph-pic" style={{ aspectRatio: item.w + " / " + item.h, backgroundImage: "url(" + item.thumb + ")" }}>
              <Image src={item.src} alt={item.alt} width={item.w} height={item.h} sizes="(min-width: 900px) 60vw, 100vw" priority />
            </div>
            <figcaption className="sph-cap">
              <span className="sph-cap-k">
                {item.section} / {pad(open + 1)}
              </span>
              <strong>{item.title}</strong>
              {item.line ? <span>{item.line}</span> : null}
              <Link href={item.href} className="sph-cap-go">
                open ↗
              </Link>
            </figcaption>
          </figure>
          <button ref={closeRef} type="button" className="sph-close" onClick={() => setOpen(-1)}>
            close ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}
