"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Ad } from "@/content/ads";

type Props = {
  ads: Ad[];
  onFront?: (index: number) => void;
};

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Crisp anti-aliased rounded-rectangle shader matching Outpace Studios' curved IMAX ribbon cards
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uSize;
  uniform float uRadius;
  uniform float uHover;
  varying vec2 vUv;

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    vec2 halfSize = uSize * 0.5;
    float d = sdRoundBox(p, halfSize, uRadius);
    float aa = max(fwidth(d), 0.002);
    float alpha = 1.0 - smoothstep(-aa, aa, d);
    if (alpha < 0.01) discard;

    vec4 tex = texture2D(uMap, vUv);
    vec3 col = tex.rgb * (1.0 + uHover * 0.06);
    gl_FragColor = vec4(col, alpha);
  }
`;

/** True Three.js curved cylindrical ribbon carousel — exact Outpace Studios IMAX-style
 *  curved plane geometry with rounded corners, drag-to-spin inertia, and click navigation. */
export function OrbitMarquee({ ads, onFront }: Props) {
  const router = useRouter();
  const hostRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFallback(true);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      setFallback(true);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 100);
    // Camera sits inside the concave cylinder looking out at the sweeping curved ribbon
    camera.position.set(0, 0, 0);

    const ring = new THREE.Group();
    scene.add(ring);

    const N = ads.length;
    // Concave cylinder radius & arc geometry: each 4:5 card bends smoothly along the cylinder wall
    const R = 9.2;
    const arcStep = (Math.PI * 2) / N;
    const cardArc = arcStep * 0.88; // crisp gap between cards
    const cardW = cardArc * R;
    const cardH = cardW * 1.25; // exact natural 4:5 portrait ratio — zero stretching!

    const makeCurvedGeo = () => {
      const segsX = 28;
      const geo = new THREE.PlaneGeometry(cardW, cardH, segsX, 1);
      const pos = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const theta = x / R;
        // Bend onto a CONVEX cylinder so the front cards stretch forward toward the viewer like Outpace
        const cx = Math.sin(theta) * R;
        const cz = Math.cos(theta) * R;
        pos.setXYZ(i, cx, pos.getY(i), cz);
      }
      pos.needsUpdate = true;
      return geo;
    };

    const sharedGeo = makeCurvedGeo();
    const loader = new THREE.TextureLoader();
    const materials: THREE.ShaderMaterial[] = [];
    const textures: THREE.Texture[] = [];
    const meshes: THREE.Mesh[] = [];

    ads.forEach((ad, i) => {
      const tex = loader.load(ad.sm || ad.src);
      // Keep raw sRGB values for ShaderMaterial (avoids 2.2x linear darkening)
      tex.colorSpace = THREE.NoColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      textures.push(tex);

      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        uniforms: {
          uMap: { value: tex },
          uSize: { value: new THREE.Vector2(cardW, cardH) },
          uRadius: { value: cardW * 0.036 },
          uHover: { value: 0 },
        },
      });
      materials.push(mat);

      const mesh = new THREE.Mesh(sharedGeo, mat);
      const pivot = new THREE.Group();
      pivot.rotation.y = i * arcStep;
      mesh.userData = { href: `/w/${ad.id}`, idx: i };
      pivot.add(mesh);
      ring.add(pivot);
      meshes.push(mesh);
    });

    // Place camera outside the convex drum so the center ad stretches proudly forward
    const fitCamera = () => {
      const w = host.clientWidth;
      const h = Math.max(host.clientHeight, 1);
      camera.aspect = w / h;
      const fovRad = (camera.fov * Math.PI) / 180;
      const distFromFront = (cardH / 2) / Math.tan(fovRad / 2) * (w < 768 ? 1.24 : 1.16);
      camera.position.z = R + distFromFront;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    fitCamera();
    window.addEventListener("resize", fitCamera);

    // Drag-to-spin + hover raycast + click navigation
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let rotY = 0;
    let vel = 0;
    let isHover = false;
    let hoveredIdx = -1;
    let dragActive = false;
    let startX = 0;
    let lastX = 0;
    let moved = false;
    let frontIdx = 0;

    const updateNdc = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    };

    const onDown = (e: PointerEvent) => {
      dragActive = true;
      startX = e.clientX;
      lastX = e.clientX;
      moved = false;
      vel = 0;
      setDragging(true);
    };

    const onMove = (e: PointerEvent) => {
      updateNdc(e);
      if (dragActive) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        if (Math.abs(e.clientX - startX) > 6) moved = true;
        const delta = dx * 0.0022;
        rotY += delta;
        vel = delta * 36;
      } else {
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObjects(meshes, false);
        const idx = hits.length ? (hits[0].object.userData.idx as number) : -1;
        hoveredIdx = idx;
        setHovering(idx >= 0);
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!dragActive) return;
      dragActive = false;
      setDragging(false);
      if (!moved) {
        updateNdc(e);
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObjects(meshes, false);
        if (hits.length) {
          const href = hits[0].object.userData.href as string;
          if (href) router.push(href);
        }
      }
    };

    const onEnter = () => {
      isHover = true;
    };
    const onLeave = () => {
      isHover = false;
      hoveredIdx = -1;
      setHovering(false);
      if (dragActive) {
        dragActive = false;
        setDragging(false);
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    dom.addEventListener("pointerenter", onEnter);
    dom.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let inView = true;
    let last = performance.now();
    const render = (now: number) => {
      if (!inView) {
        raf = 0;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!dragActive) {
        const baseSpeed = isHover ? -0.032 : -0.095;
        rotY += (baseSpeed + vel) * dt;
        vel *= Math.pow(0.05, dt);
        if (Math.abs(vel) < 0.0005) vel = 0;
      }

      ring.rotation.y = rotY;
      const f = (((Math.round(-rotY / arcStep) % N) + N) % N);
      if (f !== frontIdx) {
        frontIdx = f;
        onFront?.(f);
      }

      for (let i = 0; i < materials.length; i++) {
        const target = i === hoveredIdx ? 1 : 0;
        const cur = materials[i].uniforms.uHover.value as number;
        materials[i].uniforms.uHover.value = cur + (target - cur) * 0.14;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };

    // Pause WebGL render loop completely when scrolled past the hero (saves ~90% GPU/CPU)
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? true;
        inView = visible;
        if (visible && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(render);
        }
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(host);
    raf = requestAnimationFrame(render);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fitCamera);
      dom.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      dom.removeEventListener("pointerenter", onEnter);
      dom.removeEventListener("pointerleave", onLeave);
      sharedGeo.dispose();
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      if (dom.parentNode === host) host.removeChild(dom);
    };
  }, [ads, router, onFront]);

  if (fallback) {
    return (
      <div className="orbit-stage is-reduced" role="region" aria-label="Selected work carousel">
        <div className="orbit-track">
          {ads.map((ad) => (
            <Link key={ad.id} href={`/w/${ad.id}`} className="orbit-card">
              <div className="orbit-media">
                <Image src={ad.sm || ad.src} alt={ad.alt} width={ad.w} height={ad.h} sizes="280px" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      className={
        "orbit-stage orbit-gl" +
        (dragging ? " is-dragging" : "") +
        (hovering && !dragging ? " is-hovering" : "")
      }
      role="region"
      aria-label="Curved rotating work carousel"
    />
  );
}
