import * as THREE from "three";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ACCENT } from "@/lib/accent";
import { GLOW, INK, view } from "./kit";
import type { Mount } from "./kit/Stage";

// The footer's waymarker: one baked GLB (public/world/pillar, built in Blender, unlit with its light baked in) under a
// fixed iso camera. Each sign is an arm (arm_<slug>) carrying its carved icon (icon_), the mint line in the carving
// (edge_), its bronze frame (frame_) and an anchor (label_). The links are real anchors laid over the signs; the scene
// moves each to its label every frame and listens to it: hover or focus lights the carving and the frame in the accent,
// lifts and tilts the arm and opens a halo, all on springs; a press knocks the arm. "book a call" always glows a little.
// Idle, the lantern sways, the flames flicker and one ember drifts up from the brazier.

export type Sign = "cal" | "email" | "x" | "github" | "instagram" | "tiktok" | "youtube";
export type PillarOpts = { signs: readonly Sign[]; el: (k: Sign) => HTMLElement | null };

type Cam = { position: number[]; target: number[]; up: number[]; h: number };
const CAM: { d: Cam; m: Cam } = {
  d: { position: [176.224, 169.481, 173.863], target: [0.359, 1.723, -2.003], up: [-0.3954, 0.829, -0.3954], h: 5.664 },
  m: { position: [175.37, 169.128, 175.054], target: [-0.495, 1.37, -0.812], up: [-0.3954, 0.829, -0.3954], h: 6.655 },
};
const BRAZIER = new THREE.Vector3(1.42, 0.8, 0.2);
const REST: Partial<Record<Sign, number>> = { cal: 0.5 };

type Spring = { x: number; v: number };
const spring = (s: Spring, to: number, dt: number, k: number, z: number) => {
  s.v += (k * (to - s.x) - 2 * z * Math.sqrt(k) * s.v) * dt;
  s.x += s.v * dt;
};

export function mount(host: HTMLElement, ctx: Parameters<Mount>[1], o: PillarOpts) {
  const scene = new THREE.Scene();
  scene.background = INK;
  const phone = host.clientWidth < host.clientHeight;
  const c = phone ? CAM.m : CAM.d;
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
  camera.position.fromArray(c.position);
  camera.up.fromArray(c.up);
  camera.lookAt(new THREE.Vector3().fromArray(c.target));
  camera.updateMatrixWorld();

  const accent = new THREE.Color(ACCENT.accent), glow = new THREE.Color(ACCENT.glow), emit = new THREE.Color(GLOW.emissive);
  const geos: THREE.BufferGeometry[] = [], mats: THREE.Material[] = [];
  const time = { value: 0 };

  const haloMat = (a: number) => {
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uC: { value: new THREE.Color(GLOW.glow) }, uA: { value: a } },
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "uniform vec3 uC; uniform float uA; varying vec2 vUv; void main() { float d = length(vUv - 0.5) * 2.0; float f = pow(max(0.0, 1.0 - d), 2.4); gl_FragColor = vec4(uC * f * uA, 1.0); }",
    });
    mats.push(m);
    return m;
  };
  const quad = new THREE.PlaneGeometry(1, 1);
  geos.push(quad);

  type Arm = { k: Sign; node: THREE.Object3D; base: THREE.Quaternion; baseY: number; lift: THREE.Vector3; swing: THREE.Vector3; label: THREE.Vector3; icon: THREE.MeshBasicMaterial[]; edge: THREE.MeshBasicMaterial[]; frame: THREE.MeshBasicMaterial[]; halo: THREE.Mesh; hot: Spring; knock: Spring; want: number };
  const arms: Arm[] = [];
  let lantern: THREE.Object3D | null = null, lanternBase = new THREE.Quaternion(), flames: THREE.Object3D | null = null, flameBase = new THREE.Vector3();
  const ember = new THREE.Mesh(quad, haloMat(0));
  ember.renderOrder = 2;
  const emberAt = BRAZIER.clone();
  let loaded = false, shown = false, gone = false;

  const own = (mesh: THREE.Object3D | undefined, top = false) => {
    const out: THREE.MeshBasicMaterial[] = [];
    mesh?.traverse((n) => {
      if (!(n instanceof THREE.Mesh)) return;
      const m = (n.material as THREE.MeshBasicMaterial).clone();
      if (top) {
        m.polygonOffset = true;
        m.polygonOffsetFactor = m.polygonOffsetUnits = -2;
        n.renderOrder = 1;
      }
      mats.push(m);
      n.material = m;
      out.push(m);
    });
    return out;
  };

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load("/world/pillar/waymarker.glb", (g) => {
    if (gone) return;
    const root = g.scene;
    scene.add(root);
    root.updateMatrixWorld(true);
    root.traverse((n) => {
      if (n instanceof THREE.Mesh) {
        geos.push(n.geometry);
        mats.push(...([] as THREE.Material[]).concat(n.material));
      }
    });
    const find = (name: string) => root.getObjectByName(name);
    lantern = find("fx_lantern") ?? find("fx_lantern_glass") ?? null;
    if (lantern) lanternBase = lantern.quaternion.clone();
    flames = find("fx_flames") ?? null;
    if (flames) flameBase = flames.scale.clone();
    find("ember_origin")?.getWorldPosition(emberAt);
    const camDir = camera.getWorldDirection(new THREE.Vector3());
    for (const k of o.signs) {
      const icon = find("icon_" + k);
      if (!icon) continue;
      const node = find("arm_" + k) ?? icon;
      const label = new THREE.Vector3();
      (find("label_" + k) ?? icon).getWorldPosition(label);
      const hinge = node.getWorldPosition(new THREE.Vector3());
      const along = label.clone().sub(hinge).setY(0);
      if (along.lengthSq() < 1e-6) along.set(1, 0, 0);
      along.normalize();
      const lift = new THREE.Vector3().crossVectors(along, THREE.Object3D.DEFAULT_UP).normalize();
      const halo = new THREE.Mesh(quad, haloMat(0));
      halo.position.copy(label).addScaledVector(camDir, -0.4);
      halo.quaternion.copy(camera.quaternion);
      halo.scale.setScalar(k === "cal" ? 1.8 : 1.4);
      halo.renderOrder = 2;
      scene.add(halo);
      const parentQ = node.parent ? node.parent.getWorldQuaternion(new THREE.Quaternion()) : new THREE.Quaternion();
      const toLocal = parentQ.clone().invert();
      arms.push({
        k,
        node,
        base: node.quaternion.clone(),
        baseY: node.position.y,
        lift: lift.applyQuaternion(toLocal),
        swing: THREE.Object3D.DEFAULT_UP.clone().applyQuaternion(toLocal),
        label,
        icon: own(icon),
        edge: own(find("edge_" + k), true),
        frame: own(find("frame_" + k)),
        halo,
        hot: { x: REST[k] ?? 0, v: 0 },
        knock: { x: 0, v: 0 },
        want: 0,
      });
    }
    ember.position.copy(emberAt);
    ember.quaternion.copy(camera.quaternion);
    scene.add(ember);
    loaded = true;
  }, undefined, (e) => console.error("pillar", e));

  const offs: (() => void)[] = [];
  const on = (el: HTMLElement, type: string, fn: () => void) => {
    el.addEventListener(type, fn);
    offs.push(() => el.removeEventListener(type, fn));
  };
  const hover = new Set<Sign>(), focus = new Set<Sign>();
  for (const k of o.signs) {
    const el = o.el(k);
    if (!el) continue;
    on(el, "pointerenter", () => hover.add(k));
    on(el, "pointerleave", () => hover.delete(k));
    on(el, "focusin", () => focus.add(k));
    on(el, "focusout", () => focus.delete(k));
    on(el, "pointerdown", () => {
      const a = arms.find((x) => x.k === k);
      if (a) a.knock.v += 6;
    });
  }

  const v = view(host, frame, { dpr: Math.min(window.devicePixelRatio || 1, ctx.still ? 2 : 1.75) });
  const q = new THREE.Quaternion(), q2 = new THREE.Quaternion(), p = new THREE.Vector3();
  const white = new THREE.Color(1, 1, 1);
  let emberT = 0;

  function frame(dt: number) {
    time.value += dt;
    const t = time.value;
    const [W, H] = v.size();
    const a = W / H;
    camera.top = c.h / 2;
    camera.bottom = -c.h / 2;
    camera.left = (-c.h * a) / 2;
    camera.right = (c.h * a) / 2;
    camera.updateProjectionMatrix();

    for (const arm of arms) {
      const lit = hover.has(arm.k) || focus.has(arm.k) ? 1 : 0;
      const rest = REST[arm.k] ?? 0;
      spring(arm.hot, ctx.still ? rest : Math.max(rest, lit), dt, 260, 0.62);
      spring(arm.knock, 0, dt, 170, 0.2);
      const h = arm.hot.x, up = Math.max(0, h - rest) / (1 - rest || 1);
      q.setFromAxisAngle(arm.lift, -0.07 * up);
      q2.setFromAxisAngle(arm.swing, 0.12 * arm.knock.x);
      arm.node.quaternion.copy(arm.base).premultiply(q).premultiply(q2);
      arm.node.position.y = arm.baseY + 0.03 * up;
      for (const m of arm.icon) m.color.copy(white).lerp(glow, up).multiplyScalar(1 + 0.8 * up);
      for (const m of arm.edge) m.color.copy(emit).multiplyScalar(0.15 + 1.6 * h);
      for (const m of arm.frame) m.color.copy(white).lerp(accent, 0.45 * up).multiplyScalar(1 + 0.4 * up);
      (arm.halo.material as THREE.ShaderMaterial).uniforms.uA.value = 0.9 * h;
      const el = o.el(arm.k);
      if (el) {
        p.copy(arm.label).project(camera);
        el.style.left = ((p.x + 1) / 2) * 100 + "%";
        el.style.top = ((1 - p.y) / 2) * 100 + "%";
      }
    }
    if (!ctx.still) {
      if (lantern) lantern.quaternion.copy(lanternBase).premultiply(q.setFromAxisAngle(camera.getWorldDirection(p).setY(0).normalize(), 0.05 * Math.sin(t * 1.4) + 0.015 * Math.sin(t * 3.1)));
      if (flames) flames.scale.set(flameBase.x * (1 + 0.04 * Math.sin(t * 13.1)), flameBase.y * (1 + 0.07 * Math.sin(t * 9.3) + 0.04 * Math.sin(t * 17.7)), flameBase.z);
      emberT = (emberT + dt / 3.4) % 1;
      ember.position.copy(emberAt).add(p.set(Math.sin(t * 1.7) * 0.18 * emberT, emberT * 2.4, Math.cos(t * 1.3) * 0.12 * emberT));
      ember.scale.setScalar(0.22 * (1 - emberT * 0.5));
      (ember.material as THREE.ShaderMaterial).uniforms.uA.value = Math.sin(Math.PI * emberT) * 0.9;
    }
    v.renderer.setRenderTarget(null);
    v.renderer.render(scene, camera);
    if (loaded && !shown) {
      shown = true;
      ctx.ready();
    }
  }

  return () => {
    gone = true;
    offs.forEach((f) => f());
    v.stop();
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => {
      if (m instanceof THREE.MeshBasicMaterial) m.map?.dispose();
      m.dispose();
    });
  };
}
