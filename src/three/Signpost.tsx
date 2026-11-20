"use client";

// The footer signpost: a carved stone post with a crystal fracture up its face, a gold-leaf finial and five painted
// arm boards. The boards read their labels from the footer's real link list ([data-arm]) and clicking a board clicks
// that link, so analytics and the booking popup stay on the DOM. Idle, the arms sway; on first sight they swing in;
// a hovered board lifts and its bronze edge catches the brazier. Book a call is the one warm arm and is always lit.
// The whole post turns a few degrees with the cursor. ?still freezes time for the poster render.

import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Text } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { inkMaterial, paintMaterial } from "./signpostMaterial";

const ARMS = [
  { y: 1.9, dir: 1, len: 2.3, yaw: -0.2, roll: 0.07 },
  { y: 1.2, dir: -1, len: 2.05, yaw: 0.24, roll: -0.06 },
  { y: 0.5, dir: 1, len: 1.75, yaw: 0.32, roll: -0.08 },
  { y: -0.25, dir: -1, len: 2.6, yaw: -0.16, roll: 0.05 },
  { y: -1.1, dir: 1, len: 3.15, yaw: -0.1, roll: -0.035 },
];
const BOOK = 4;
const H = 0.62;
const FONT = "/fonts/cinzel-700.woff";
const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));

function arrow(len: number, dir: number, inset: number) {
  const h = H / 2 - inset;
  const tip = h * 0.95;
  const x0 = 0.12 + inset;
  const x1 = len - inset * 1.3;
  const s = new THREE.Shape();
  s.moveTo(x0 * dir, -h);
  s.lineTo((x1 - tip) * dir, -h);
  s.lineTo(x1 * dir, 0);
  s.lineTo((x1 - tip) * dir, h);
  s.lineTo(x0 * dir, h);
  s.lineTo(x0 * dir, -h);
  return s;
}

function extrude(shape: THREE.Shape, depth: number, bevel: number, z: number) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 4 });
  g.translate(0, 0, z);
  return g;
}

/** Smooth normals for the ink hull, so the pushed back faces close round hard edges instead of splitting. */
function hull(g: THREE.BufferGeometry) {
  const c = g.clone();
  c.deleteAttribute("normal");
  c.deleteAttribute("uv");
  const m = mergeVertices(c, 1e-3);
  m.computeVertexNormals();
  return m;
}

function faceted(g: THREE.BufferGeometry) {
  const f = g.toNonIndexed();
  f.computeVertexNormals();
  return f;
}

function useParts() {
  return useMemo(() => {
    const post = faceted(new THREE.CylinderGeometry(0.27, 0.34, 5.1, 8, 1).rotateY(Math.PI / 8));
    post.translate(0, -0.03, 0);
    const cap = faceted(new THREE.CylinderGeometry(0.44, 0.36, 0.24, 8, 1).rotateY(Math.PI / 8)).translate(0, 2.6, 0);
    const neck = faceted(new THREE.CylinderGeometry(0.31, 0.31, 0.1, 8, 1).rotateY(Math.PI / 8)).translate(0, 2.2, 0);
    const step1 = faceted(new THREE.CylinderGeometry(1.25, 1.4, 0.32, 8, 1).rotateY(Math.PI / 8)).translate(0, -2.92, 0);
    const step2 = faceted(new THREE.CylinderGeometry(0.62, 0.74, 0.3, 8, 1).rotateY(Math.PI / 8)).translate(0, -2.62, 0);
    const prof = [
      [0, 0], [0.3, 0], [0.3, 0.07], [0.15, 0.13], [0.2, 0.26], [0.25, 0.4], [0.2, 0.55], [0.09, 0.7], [0.045, 0.86], [0.02, 1.0], [0, 1.08],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const finial = faceted(new THREE.LatheGeometry(prof, 8)).translate(0, 2.72, 0);
    const shard = faceted(new THREE.OctahedronGeometry(0.2, 0)).scale(0.7, 1.6, 0.7);
    const boards = ARMS.map((a) => {
      const frame = extrude(arrow(a.len, a.dir, 0), 0.1, 0.035, -0.05);
      const panel = extrude(arrow(a.len, a.dir, 0.075), 0.03, 0.012, 0.06);
      return { frame, panel, frameInk: hull(frame) };
    });
    const band = faceted(new THREE.CylinderGeometry(0.35, 0.35, 0.16, 8, 1).rotateY(Math.PI / 8));
    const rocks = [
      [1.25, -2.98, 0.9, 0.26],
      [1.62, -3.02, 0.35, 0.16],
      [-1.3, -3.0, 0.75, 0.2],
    ].map(([x, y, z, r], i) => faceted(new THREE.DodecahedronGeometry(r, 0).rotateY(i * 1.3).rotateX(i * 0.7).scale(1.2, 0.75, 1)).translate(x, y, z));
    return {
      stone: [post, cap, neck, step1, step2],
      stoneInk: [post, cap, neck, step1, step2].map(hull),
      finial,
      finialInk: hull(finial),
      shard,
      boards,
      band,
      bandInk: hull(band),
      rocks,
      rocksInk: rocks.map(hull),
    };
  }, []);
}

function useMaterials() {
  return useMemo(() => {
    const ink = inkMaterial(0.034);
    const stone = paintMaterial({ base: "#55506f", dark: "#12101c", rim: "#4656a8", kind: 0, crack: 1 });
    const plinth = paintMaterial({ base: "#433f5a", dark: "#0e0d16", rim: "#2c3466", kind: 0 });
    const gold = paintMaterial({ base: "#FFB43A", dark: "#6a3410", rim: "#ffdca0", kind: 3 });
    const crystal = paintMaterial({ base: "#9ff7f2", dark: "#1d6f78", rim: "#5FE3E0", kind: 3 });
    const bronze = paintMaterial({ base: "#a07a40", dark: "#22170e", rim: "#4a4f8a", kind: 2 });
    const frames = ARMS.map((_, i) => paintMaterial({ base: "#8d6a3c", dark: "#24180f", rim: "#4a4f8a", kind: 2, ember: i === BOOK ? 0.7 : 0 }));
    const panels = ARMS.map((_, i) =>
      i === BOOK
        ? paintMaterial({ base: "#FF8A2A", dark: "#9a2a14", rim: "#ffcf8a", kind: 1 })
        : paintMaterial({ base: "#4a3a52", dark: "#15101d", rim: "#3d4a8f", kind: 1 }),
    );
    const glows = ARMS.map(
      (_, i) =>
        new THREE.ShaderMaterial({
          uniforms: { uA: { value: i === BOOK ? 0.7 : 0 } },
          vertexShader: `varying vec2 vU; void main() { vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
          fragmentShader: `uniform float uA; varying vec2 vU; void main() { vec2 q = (vU - 0.5) * 2.0; float d = length(q); float a = pow(max(1.0 - d, 0.0), 1.6) * uA; gl_FragColor = vec4(vec3(1.0, 0.42, 0.1), a); }`,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
    );
    return { ink, stone, plinth, gold, crystal, bronze, frames, panels, glows };
  }, []);
}

function Embers({ still }: { still: boolean }) {
  const { geo, mat } = useMemo(() => {
    const n = 34;
    const p = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const r = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      p[i * 3] = (Math.abs(r) - 0.5) * 3.4 + 0.9;
      p[i * 3 + 1] = -2.6;
      p[i * 3 + 2] = ((Math.abs(Math.sin(i * 78.233) * 9631.7) % 1) - 0.5) * 1.6 + 0.4;
      seed[i] = Math.abs(Math.sin(i * 3.17) * 1000) % 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    geo.setAttribute("seed", new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
attribute float seed;
uniform float uTime;
varying float vA;
void main() {
  float t = fract(uTime * (0.05 + seed * 0.05) + seed);
  vec3 p = position;
  p.y += t * 5.2;
  p.x += sin(uTime * 0.7 + seed * 40.0) * 0.25 * t;
  vA = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.55, 1.0, t)) * (0.4 + 0.6 * seed);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (2.0 + seed * 3.0) * (16.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`,
      fragmentShader: /* glsl */ `
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vA;
  gl_FragColor = vec4(vec3(1.0, 0.54, 0.16) * a, a);
}`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geo, mat };
  }, []);
  useFrame((s) => (mat.uniforms.uTime.value = still ? 7.3 : s.clock.elapsedTime));
  return <points geometry={geo} material={mat} />;
}

function Shadow() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `varying vec2 vU; void main() { vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `varying vec2 vU; void main() { float d = length(vU - 0.5) * 2.0; float a = smoothstep(1.0, 0.25, d) * 0.75; gl_FragColor = vec4(0.012, 0.01, 0.02, a); }`,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0.2, -3.07, 0.2]} scale={[5.4, 3.4, 1]} material={mat}>
      <planeGeometry />
    </mesh>
  );
}

export function SignpostView({ el }: { el: HTMLElement }) {
  const parts = useParts();
  const m = useMaterials();
  const root = el.closest<HTMLElement>("[data-signpost]") ?? el;
  const links = useMemo(() => [...root.querySelectorAll<HTMLElement>("[data-arm]")], [root]);
  const labels = useMemo(() => links.map((l) => l.dataset.label ?? l.textContent?.trim() ?? ""), [links]);
  const still = useMemo(() => new URLSearchParams(location.search).has("still"), []);
  const [hot, setHot] = useState(-1);
  const post = useRef<THREE.Group>(null);
  const arms = useRef<(THREE.Group | null)[]>([]);
  const shard = useRef<THREE.Mesh>(null);
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const st = useRef({ px: 0, py: 0, born: still ? 99 : 0, lift: ARMS.map(() => 0), ember: ARMS.map((_, i): number => (i === BOOK ? 0.7 : 0)) });

  useLayoutEffect(() => cam.current?.lookAt(0.3, 0.7, 0), []);

  useEffect(() => {
    const s = st.current;
    const move = (e: PointerEvent) => {
      s.px = (e.clientX / innerWidth) * 2 - 1;
      s.py = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    const off: (() => void)[] = [];
    links.forEach((l, i) => {
      const on = () => setHot(i);
      const out = () => setHot((h) => (h === i ? -1 : h));
      l.addEventListener("pointerenter", on);
      l.addEventListener("pointerleave", out);
      l.addEventListener("focusin", on);
      l.addEventListener("focusout", out);
      off.push(() => {
        l.removeEventListener("pointerenter", on);
        l.removeEventListener("pointerleave", out);
        l.removeEventListener("focusin", on);
        l.removeEventListener("focusout", out);
      });
    });
    return () => {
      removeEventListener("pointermove", move);
      off.forEach((f) => f());
    };
  }, [links]);

  useEffect(() => {
    if (hot < 0) {
      delete root.dataset.hot;
      el.style.cursor = "";
      delete el.dataset.cursor;
      return;
    }
    root.dataset.hot = String(hot);
    el.style.cursor = "pointer";
    el.dataset.cursor = hot === BOOK ? "book" : "view";
  }, [hot, root, el]);

  useFrame((state, dt) => {
    const s = st.current;
    const t = still ? 2.4 : state.clock.elapsedTime;
    if (!still) s.born += dt;
    const p = post.current;
    if (p) {
      p.rotation.y = damp(p.rotation.y, -0.1 + s.px * 0.13, 4, dt);
      p.rotation.x = damp(p.rotation.x, s.py * 0.035, 4, dt);
    }
    m.stone.uniforms.uTime.value = t;
    if (shard.current) {
      shard.current.rotation.y = t * 0.6;
      shard.current.position.y = 4.05 + Math.sin(t * 1.1) * 0.07;
    }
    ARMS.forEach((a, i) => {
      const g = arms.current[i];
      if (!g) return;
      const on = hot === i;
      s.lift[i] = still ? 0 : damp(s.lift[i], on ? 1 : 0, 10, dt);
      s.ember[i] = still ? s.ember[i] : damp(s.ember[i], on ? 1 : i === BOOK ? 0.7 : 0, 8, dt);
      m.frames[i].uniforms.uEmber.value = s.ember[i];
      m.glows[i].uniforms.uA.value = s.ember[i];
      const tt = Math.max(s.born - 0.35 - i * 0.11, 0);
      const swing = s.born > 6 ? 0 : Math.exp(-3.2 * tt) * Math.cos(8 * tt) * 0.55 * a.dir;
      const sway = Math.sin(t * 0.8 + i * 1.7) * 0.022 + Math.sin(t * 1.9 + i) * 0.006;
      g.position.y = a.y + s.lift[i] * 0.13;
      g.rotation.z = a.roll + sway + swing + s.lift[i] * 0.06 * a.dir;
      g.rotation.y = a.yaw + Math.sin(t * 0.55 + i * 2.3) * 0.03;
    });
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={[0.6, 1.0, 16.5]} fov={30} />
      <group ref={post}>
        {parts.stone.map((g, i) => (
          <mesh key={i} geometry={g} material={i > 2 ? m.plinth : m.stone} />
        ))}
        {parts.stoneInk.map((g, i) => (
          <mesh key={i} geometry={g} material={m.ink} />
        ))}
        {parts.rocks.map((g, i) => (
          <mesh key={i} geometry={g} material={m.plinth} />
        ))}
        {parts.rocksInk.map((g, i) => (
          <mesh key={i} geometry={g} material={m.ink} />
        ))}
        <mesh geometry={parts.finial} material={m.gold} />
        <mesh geometry={parts.finialInk} material={m.ink} />
        <mesh ref={shard} geometry={parts.shard} material={m.crystal} position={[0, 4.05, 0]} />
        {ARMS.map((a, i) => (
          <group key={i} position={[0, a.y, 0]}>
            <group scale={[1 - (a.y + 2.5) * 0.014, 1, 1 - (a.y + 2.5) * 0.014]}>
              <mesh geometry={parts.band} material={m.bronze} />
              <mesh geometry={parts.bandInk} material={m.ink} />
            </group>
          </group>
        ))}
        {ARMS.map((a, i) => {
          const b = parts.boards[i];
          const book = i === BOOK;
          const lit = hot === i;
          return (
            <group
              key={i}
              ref={(g) => {
                arms.current[i] = g;
              }}
              position={[0, a.y, 0]}
              rotation={[0, a.yaw, a.roll]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHot(i);
              }}
              onPointerOut={() => setHot((h) => (h === i ? -1 : h))}
              onClick={(e) => {
                e.stopPropagation();
                (links[i]?.querySelector("a") ?? links[i])?.click();
              }}
            >
              <mesh position={[a.dir * a.len * 0.55, 0, -0.2]} scale={[a.len + 1.6, 1.9, 1]} material={m.glows[i]} raycast={() => null}>
                <planeGeometry />
              </mesh>
              <mesh geometry={b.frame} material={m.frames[i]} />
              <mesh geometry={b.frameInk} material={m.ink} />
              <mesh geometry={b.panel} material={m.panels[i]} />
              <Text
                font={FONT}
                fontSize={0.34}
                maxWidth={a.len - 0.6}
                anchorX="center"
                anchorY="middle"
                position={[a.dir * (0.12 + (a.len - 0.35) / 2), -0.01, 0.106]}
                color={book ? (lit ? "#2a0a04" : "#07060B") : lit ? "#FFE3A6" : "#FFB43A"}
                outlineWidth={book ? 0 : 0.012}
                outlineColor="#07060B"
                letterSpacing={0.04}
              >
                {labels[i] ?? ""}
              </Text>
            </group>
          );
        })}
      </group>
      <Shadow />
      <Embers still={still} />
    </>
  );
}
