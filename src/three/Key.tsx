"use client";

// The call key in the footer: an oversized orange resin keycap. It sinks 4 px worth when hovered and further when
// pressed (the link under it opens Cal), and the camera re-frames per route, our take on a footer object that
// knows which page it is on.

import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerspectiveCamera, RoundedBox, Text } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const ANGLES: Record<string, [number, number, number]> = {
  home: [3.6, 3.9, 4.6],
  work: [-3.9, 3.4, 4.4],
  case: [0.4, 5.6, 3.4],
  other: [4.4, 2.8, 3.8],
};
const angleOf = (path: string) => (path === "/" ? "home" : path === "/work" || path === "/ads" ? "work" : path.startsWith("/work/") ? "case" : "other");
const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));

export function KeyView({ el, path }: { el: HTMLElement; path: string }) {
  const cap = useRef<THREE.Group>(null);
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const s = useRef({ hover: false, down: false, y: 0 });
  const target = new THREE.Vector3(...ANGLES[angleOf(path)]);

  useEffect(() => {
    const st = s.current;
    const on = () => (st.hover = true);
    const off = () => ((st.hover = false), (st.down = false));
    const dn = () => (st.down = true);
    const up = () => (st.down = false);
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("pointerdown", dn);
    el.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
      el.removeEventListener("pointerdown", dn);
      el.removeEventListener("pointerup", up);
    };
  }, [el]);

  useFrame((_, dt) => {
    const st = s.current;
    st.y = damp(st.y, st.down ? -0.24 : st.hover ? -0.1 : 0, 18, dt);
    if (cap.current) cap.current.position.y = st.y;
    const c = cam.current;
    if (c) {
      c.position.lerp(target, 1 - Math.exp(-3 * dt));
      c.lookAt(0, -0.1, 0);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={ANGLES[angleOf(path)]} fov={26} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 6, 4]} intensity={1.6} />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[8, 8, 1]} />
        <Lightformer intensity={1.4} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer intensity={0.8} color="#ffd9c8" position={[5, 1, -2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
      </Environment>
      <mesh position={[0, -0.42, 0]}>
        <boxGeometry args={[2.5, 0.22, 2.5]} />
        <meshStandardMaterial color="#0f0e0c" roughness={0.6} />
      </mesh>
      <group ref={cap}>
        <RoundedBox args={[2.1, 0.62, 2.1]} radius={0.2} smoothness={6} position={[0, 0, 0]}>
          <meshPhysicalMaterial color="#ff4a12" roughness={0.32} clearcoat={1} clearcoatRoughness={0.18} />
        </RoundedBox>
        <Text font="/three/cabinet-800.woff" fontSize={0.36} letterSpacing={-0.03} color="#fff" anchorX="center" anchorY="middle" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.315, 0]}>
          BOOK
        </Text>
      </group>
      <ContactShadows position={[0, -0.53, 0]} opacity={0.4} scale={6} blur={2.2} far={2} color="#0f0e0c" />
    </>
  );
}
