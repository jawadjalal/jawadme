"use client";

// The Mark in the hero. Scrolling the hero turns it 35 degrees and walks it through its four materials, and the
// matching word in the supporting line lights up (the hero's data-lane). At rest at the top it cycles on its own,
// slowly. It follows the pointer a little and squishes when pressed.

import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import type * as THREE from "three";
import { markGeometry } from "./jShape";
import { markMaterial } from "./markMaterial";

const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));

export function MarkView({ el }: { el: HTMLElement }) {
  const geo = useMemo(markGeometry, []);
  const mat = useMemo(markMaterial, []);
  const group = useRef<THREE.Group>(null);
  const dpr = useThree((s) => s.viewport.dpr);
  const st = useRef({ mix: 0, px: 0, py: 0, squash: 0, vel: 0, born: 0, lane: -1 });
  const hero = el.closest<HTMLElement>("[data-hero]") ?? el;

  useEffect(() => {
    const s = st.current;
    const move = (e: PointerEvent) => {
      s.px = (e.clientX / innerWidth) * 2 - 1;
      s.py = (e.clientY / innerHeight) * 2 - 1;
    };
    const press = () => (s.vel -= 9);
    addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerdown", press);
    return () => {
      removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", press);
    };
  }, [el]);

  useFrame((state, dt) => {
    const s = st.current;
    const g = group.current;
    if (!g) return;
    s.born += dt;
    const r = hero.getBoundingClientRect();
    const p = Math.min(Math.max(-r.top / (r.height * 0.7), 0), 1);
    const idle = Math.floor(s.born / 2.6) % 4;
    const target = p > 0.015 ? p * 3 : s.born < 1.6 ? 0 : idle;
    s.mix = damp(s.mix, target, p > 0.015 ? 7 : 2.2, dt);
    mat.uniforms.uMix.value = s.mix;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uDpr.value = dpr;
    const lane = Math.round(s.mix);
    if (lane !== s.lane) {
      s.lane = lane;
      hero.dataset.lane = String(lane);
    }
    s.vel += (-s.squash * 160 - s.vel * 11) * dt;
    s.squash += s.vel * dt;
    const intro = Math.min(s.born / 1.4, 1);
    const ease = 1 - Math.pow(1 - intro, 4);
    g.rotation.y = damp(g.rotation.y, -0.42 + p * 0.61 + s.px * 0.22 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + (1 - ease) * -1.6, 6, dt);
    g.rotation.x = damp(g.rotation.x, 0.1 + s.py * 0.08, 6, dt);
    g.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
    const sc = (0.86 + 0.14 * ease);
    g.scale.set(sc * (1 - s.squash * 0.5), sc * (1 + s.squash), sc * (1 - s.squash * 0.5));
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.2, 10]} fov={24} />
      <group ref={group}>
        <mesh geometry={geo} material={mat} />
      </group>
      <ContactShadows position={[0, -1.85, 0]} opacity={0.32} scale={7} blur={2.6} far={3} resolution={512} color="#0f0e0c" />
    </>
  );
}
