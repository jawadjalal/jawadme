"use client";

// The pillar in the hero: a carved column with a FRACTURE vein up its shaft. It sways slowly at rest; scrolling the
// hero turns it, dollies in and opens the crack, and the ember rim light leans toward the pointer.
// ?still=0 (whole) and ?still=1 (cracked open) freeze it for poster renders; reduced motion holds the still=0 frame.

import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { pillarGeometries } from "./pillarShape";
import { emberGeometry, emberMaterial, hazeMaterial, inkMaterial, pillarMaterial, pillarUniforms, poolMaterial } from "./pillarMaterial";

const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));
const FOV = 26;
const HALF_H = 3.75;
const HALF_W = 1.7;
const MID_Y = -0.3;

export function PillarView({ el }: { el: HTMLElement }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const parts = useMemo(pillarGeometries, []);
  const u = useMemo(pillarUniforms, []);
  const mats = useMemo(() => ({ stone: pillarMaterial(u), ink: inkMaterial(), ember: emberMaterial(u), pool: poolMaterial(u), haze: hazeMaterial(u) }), [u]);
  const embers = useMemo(() => emberGeometry(), []);
  const group = useRef<THREE.Group>(null);
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const st = useRef({ px: 0.4, py: -0.2, born: 0, open: 0 });
  const hero = el.closest<HTMLElement>("[data-hero]") ?? el;
  const still = useMemo(() => {
    const q = Number(new URLSearchParams(location.search).get("still") ?? -1);
    return q >= 0 ? q : matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : -1;
  }, []);

  useEffect(() => () => {
    for (const geo of [...parts, embers]) geo.dispose();
    for (const mat of Object.values(mats)) mat.dispose();
  }, [parts, embers, mats]);

  useEffect(() => {
    if (still >= 0) return;
    const s = st.current;
    const move = (e: PointerEvent) => {
      s.px = (e.clientX / innerWidth) * 2 - 1;
      s.py = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, [still]);

  useFrame((state, dt) => {
    const s = st.current;
    const g = group.current;
    const c = cam.current;
    if (!g || !c) return;
    const frozen = still >= 0;
    s.born += dt;
    const t = frozen ? 0 : state.clock.elapsedTime;
    const r = hero.getBoundingClientRect();
    const p = frozen ? Math.min(still, 1) : Math.min(Math.max(-r.top / (r.height * 0.7), 0), 1);
    const ease = frozen ? 1 : 1 - Math.pow(1 - Math.min(s.born / 1.8, 1), 4);
    s.open = frozen ? p : damp(s.open, p, 5, dt);
    u.uOpen.value = s.open * ease;
    u.uTime.value = t;
    mats.ember.uniforms.uDpr.value = dpr;
    const cur = u.uCursor.value;
    cur.set(damp(cur.x, s.px, 4, dt), damp(cur.y, s.py, 4, dt));
    if (frozen) cur.set(0.4, -0.2);

    const turn = 0.5 + Math.sin(t * 0.16) * 0.35 * (1 - s.open) + s.open * 0.6;
    g.rotation.y = frozen ? turn : damp(g.rotation.y, turn + cur.x * 0.16 + (1 - ease) * -1.4, 5, dt);
    g.rotation.x = frozen ? 0 : damp(g.rotation.x, cur.y * 0.04, 5, dt);

    const box = el.getBoundingClientRect();
    const aspect = box.width / Math.max(box.height, 1);
    const tan = Math.tan(((FOV / 2) * Math.PI) / 180);
    const fit = Math.max(HALF_H / tan, HALF_W / (tan * aspect));
    const dist = fit * (1.0 - 0.05 * s.open);
    c.position.set(cur.x * -0.25, MID_Y - 1.3 + s.open * 0.25 - cur.y * 0.15, dist);
    c.lookAt(0, MID_Y + 0.05 * s.open, 0);
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={FOV} near={1} far={60} position={[0, -1.6, 20]} />
      <group ref={group}>
        {parts.map((geo, i) => (
          <group key={i}>
            <mesh geometry={geo} material={mats.stone} />
            <mesh geometry={geo} material={mats.ink} />
          </group>
        ))}
      </group>
      <mesh position={[0, -0.2, -3.5]} material={mats.haze} renderOrder={-1}>
        <planeGeometry args={[11, 10]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -3.31, 0.3]} material={mats.pool} renderOrder={1}>
        <planeGeometry args={[7, 5]} />
      </mesh>
      <points geometry={embers} material={mats.ember} renderOrder={2} />
    </>
  );
}
