"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Lightweight, 60fps Joyco-inspired 3D architectural pillars in Hades II obsidian + gilded gold
 *  with soft spectral viridian rim-lighting. Responds smoothly to mouse parallax. */
export function HeroPillars() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 60);
    camera.position.set(0, 0.2, 11.5);

    // Subtle atmospheric lighting: warm gilded key + Hades II spectral viridian rim
    const amb = new THREE.AmbientLight(0x20242a, 1.4);
    scene.add(amb);

    const goldKey = new THREE.DirectionalLight(0xf0d07a, 2.4);
    goldKey.position.set(5, 8, 6);
    scene.add(goldKey);

    const spectralRim = new THREE.PointLight(0x5fe3b8, 16, 26, 1.6);
    spectralRim.position.set(0, -1.5, 4.5);
    scene.add(spectralRim);

    const backGold = new THREE.PointLight(0xd4a84b, 12, 22, 1.5);
    backGold.position.set(-6, 3, -2);
    scene.add(backGold);

    // Shared materials: dark fluted obsidian stone + burnished gilded gold rings
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x1a1c20,
      roughness: 0.55,
      metalness: 0.25,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4a84b,
      roughness: 0.28,
      metalness: 0.88,
    });

    const buildPillar = (height: number, radius: number) => {
      const g = new THREE.Group();
      // Fluted shaft (14-sided cylinder gives crisp architectural facets)
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.92, radius, height, 14), stoneMat);
      g.add(shaft);

      // Gilded capital & base plinths
      const capRing = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.16, radius * 0.96, 0.26, 14), goldMat);
      capRing.position.y = height / 2 + 0.12;
      g.add(capRing);

      const abacus = new THREE.Mesh(new THREE.BoxGeometry(radius * 2.35, 0.22, radius * 2.35), stoneMat);
      abacus.position.y = height / 2 + 0.34;
      g.add(abacus);

      const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.05, radius * 1.24, 0.28, 14), goldMat);
      baseRing.position.y = -height / 2 - 0.14;
      g.add(baseRing);

      // Subtle gilded collar band
      const band = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.98, 0.045, 10, 28), goldMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = height / 2 - 0.35;
      g.add(band);

      return g;
    };

    const group = new THREE.Group();
    const specs = [
      { x: -5.8, y: -0.3, z: -0.5, h: 6.8, r: 0.52, ry: 0.2 },
      { x: -3.7, y: -0.8, z: -2.4, h: 6.2, r: 0.44, ry: -0.15 },
      { x: 5.8, y: -0.25, z: -0.5, h: 6.8, r: 0.52, ry: -0.2 },
      { x: 3.7, y: -0.8, z: -2.4, h: 6.2, r: 0.44, ry: 0.15 },
    ];

    const pillars = specs.map((s) => {
      const p = buildPillar(s.h, s.r);
      p.position.set(s.x, s.y, s.z);
      p.rotation.y = s.ry;
      group.add(p);
      return { mesh: p, baseY: s.y, baseRot: s.ry };
    });

    scene.add(group);

    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const onResize = () => {
      if (!host) return;
      const w = host.clientWidth;
      const h = Math.max(host.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const t0 = performance.now();
    const render = (now: number) => {
      const t = (now - t0) / 1000;
      tx += (mx - tx) * 0.05;
      ty += (my - ty) * 0.05;

      group.rotation.y = tx * 0.14;
      group.rotation.x = ty * 0.06;

      pillars.forEach((p, idx) => {
        p.mesh.position.y = p.baseY + Math.sin(t * 0.7 + idx * 1.4) * 0.09;
        p.mesh.rotation.y = p.baseRot + t * 0.06 * (idx % 2 === 0 ? 1 : -1);
      });

      spectralRim.position.x = Math.sin(t * 0.5) * 3.2;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      stoneMat.dispose();
      goldMat.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className="hero-pillars" aria-hidden="true" />;
}
