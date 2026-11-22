"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Scroll-linked morphing 3D Hades II gilded + spectral sculptural centerpiece
 *  framed inside a clean Brass Hands divider band between work sections. */
export function ScrollMorph() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const host = hostRef.current;
    if (!wrap || !host) return;
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
    renderer.toneMappingExposure = 1.2;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 40);
    camera.position.set(0, 0, 6.2);

    scene.add(new THREE.AmbientLight(0x22262e, 1.3));
    const key = new THREE.DirectionalLight(0xf0d07a, 2.8);
    key.position.set(4, 5, 5);
    scene.add(key);

    const spectral = new THREE.PointLight(0x5fe3b8, 18, 18, 1.6);
    spectral.position.set(-3.2, -1.8, 3.2);
    scene.add(spectral);

    const goldRim = new THREE.PointLight(0xd4a84b, 14, 18, 1.5);
    goldRim.position.set(3.2, 2.2, 2.5);
    scene.add(goldRim);

    // Base subdivided icosahedron whose vertices morph smoothly with scroll progress
    const geo = new THREE.IcosahedronGeometry(1.42, 4);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const base = new Float32Array(pos.array.length);
    base.set(pos.array as Float32Array);

    const mat = new THREE.MeshStandardMaterial({
      color: 0x1b1d22,
      metalness: 0.78,
      roughness: 0.24,
      flatShading: true,
    });

    const core = new THREE.Mesh(geo, mat);
    scene.add(core);

    // Outer gilded wireframe cage that expands & counter-rotates on scroll
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0xd4a84b,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const cage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.78, 1), cageMat);
    scene.add(cage);

    // Spectral equatorial ring
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x5fe3b8,
      emissive: 0x1b5e4a,
      emissiveIntensity: 0.7,
      metalness: 0.6,
      roughness: 0.25,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.025, 10, 64), ringMat);
    ring.rotation.x = Math.PI * 0.38;
    scene.add(ring);

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
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      // Scroll progress 0 -> 1 as band traverses viewport
      const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));

      // Morph vertex displacement smoothly between crystal facet -> organic wave -> star prism
      const arr = pos.array as Float32Array;
      const waveAmp = Math.sin(p * Math.PI) * 0.34;
      const spikeAmp = Math.max(0, (p - 0.45) * 1.8) * 0.22;
      for (let i = 0; i < arr.length; i += 3) {
        const bx = base[i];
        const by = base[i + 1];
        const bz = base[i + 2];
        const ripple = Math.sin(bx * 3.1 + t * 1.6 + p * 6.0) * Math.cos(by * 3.1 - t * 1.2) * waveAmp;
        const facet = Math.abs(Math.sin((bx + by + bz) * 2.4)) * spikeAmp;
        const s = 1 + ripple + facet;
        arr[i] = bx * s;
        arr[i + 1] = by * s;
        arr[i + 2] = bz * s;
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();

      core.rotation.y = t * 0.35 + p * Math.PI * 1.8;
      core.rotation.x = Math.sin(t * 0.4) * 0.25 + p * 0.8;

      cage.rotation.y = -t * 0.25 - p * Math.PI;
      cage.rotation.z = p * 0.9;
      const cageScale = 0.96 + Math.sin(p * Math.PI) * 0.2;
      cage.scale.setScalar(cageScale);

      ring.rotation.z = t * 0.5 + p * 2.2;
      ring.rotation.y = p * 1.4;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      cageMat.dispose();
      ringMat.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={wrapRef} className="morph-band" aria-hidden="true">
      <div ref={hostRef} className="morph-canvas" />
    </div>
  );
}
