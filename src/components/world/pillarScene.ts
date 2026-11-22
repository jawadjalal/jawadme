import * as THREE from "three";
import { ACCENT } from "@/lib/accent";
import { GLOW, INK, bag, drop, marks, post, shared, view } from "./kit";
import { flames, type FlameKind, type FlameSpec } from "./kit/flame";
import { loadRoom } from "./kit/room";
import type { Mount } from "./kit/Stage";

// The footer's waymarker: one baked PBR GLB (public/world/pillar, built in Blender: painted albedo and normal maps, its
// light baked into a lightmap on uv1) under a fixed iso camera, lit at runtime only by its flames (the kit's flame at
// each flame_<n>: the brazier, three candles and the lantern, which rides the swinging lantern) and finished by the
// kit's post in its PBR mode. Each sign is an arm (arm_<slug>) carrying its carved icon (icon_), the mint line in the
// carving (edge_), its bronze frame (frame_) and an anchor (label_). The links are real anchors laid over the signs;
// the scene moves each to its label every frame and listens to it: hover or focus lights the carving and the frame in
// the accent, lifts and tilts the arm and opens a halo, all on springs; a press knocks the arm. The icons and carving
// lines are unlit (the icons keep the lightmap), so the flames' light never turns the inlays green at rest.

export type Sign = "cal" | "email" | "x" | "github" | "instagram" | "tiktok" | "youtube";
export type PillarOpts = { signs: readonly Sign[]; el: (k: Sign) => HTMLElement | null };

type Cam = { position: number[]; target: number[]; up: number[]; h: number };
const CAM: { d: Cam; m: Cam } = {
  d: { position: [176.224, 169.481, 173.863], target: [0.359, 1.723, -2.003], up: [-0.3954, 0.829, -0.3954], h: 5.664 },
  m: { position: [175.37, 169.128, 175.054], target: [-0.495, 1.37, -0.812], up: [-0.3954, 0.829, -0.3954], h: 6.655 },
};
/** The bake (lightmap.json and flames.json beside the source GLB): the lightmap's scale K = 10.715 at reference
 *  exposure -0.2, so its intensity is pi * K * 2^-0.2 and the frame needs no tone mapping; each flame kind's light
 *  radius, and its candela (the bake's watts / 4 pi at the same exposure; the lantern's at 0.4, since a point light a
 *  few centimetres from its glass has none of Cycles' soft falloff and blows the lantern out). */
const EXPOSURE = Math.pow(2, -0.2);
const LIGHTMAP = { url: "/world/pillar/lightmap.webp", intensity: Math.PI * 10.715 * EXPOSURE };
const LIGHT: Partial<Record<FlameKind, { r: number; cd: number }>> = {
  brazier: { r: 3.2, cd: (115 / (4 * Math.PI)) * EXPOSURE },
  lantern: { r: 2.2, cd: (85 / (4 * Math.PI)) * EXPOSURE * 0.4 },
  candle: { r: 0.7, cd: (2.5 / (4 * Math.PI)) * EXPOSURE },
};
/** Bronze reads grey-green at metallic 1 with no environment map; 0.35 matches the Cycles warm brass. */
const BRONZE_METALNESS = 0.35;
/** "book a call", the main sign, and everything that sets it apart: it rests half lit, its halo is larger, and it is
 *  gilded like the site's call (src/components/gilded): a gold-leaf frame around a dark enamel face. Restyle that arm here. */
const LOOK: Partial<Record<Sign, { rest: number; halo: number; frame?: string; face?: string }>> = { cal: { rest: 0.5, halo: 1.8, frame: "#e6c46c", face: "#06140e" } };

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
  const S = shared();
  const b = bag();
  const ppu = { value: 100 };
  const dpr = Math.min(window.devicePixelRatio || 1, ctx.still ? 2 : 1.75);
  const v = view(host, frame, { dpr });
  const P = post(v.renderer, S, b, { small: false, still: ctx.still, flat: true, bloom: 1, pbr: {} });

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
    b.mats.push(m);
    return m;
  };
  const quad = new THREE.PlaneGeometry(1, 1);
  b.geos.push(quad);

  type Arm = { k: Sign; node: THREE.Object3D; base: THREE.Quaternion; baseY: number; lift: THREE.Vector3; swing: THREE.Vector3; label: THREE.Vector3; icon: THREE.MeshBasicMaterial[]; edge: THREE.MeshBasicMaterial[]; frame: THREE.MeshStandardMaterial[]; halo: THREE.Mesh; hot: Spring; knock: Spring };
  const arms: Arm[] = [];
  let lantern: THREE.Object3D | null = null, lanternBase = new THREE.Quaternion();
  let F: ReturnType<typeof flames> | null = null, specs: FlameSpec[] = [];
  let loaded = false, shown = false, gone = false;

  // each arm gets its own copy of a material it lights on hover: the icon unlit with its lightmap, the carving line
  // unlit (its colour is its glow), the frame lit bronze
  const own = <M extends THREE.Material>(mesh: THREE.Object3D | undefined, make: (m: THREE.MeshStandardMaterial) => M, top = false) => {
    const out: M[] = [];
    mesh?.traverse((n) => {
      if (!(n instanceof THREE.Mesh)) return;
      const m = make(n.material as THREE.MeshStandardMaterial);
      if (top) {
        m.polygonOffset = true;
        m.polygonOffsetFactor = m.polygonOffsetUnits = -2;
        n.renderOrder = 1;
      }
      b.mats.push(m);
      n.material = m;
      out.push(m);
    });
    return out;
  };

  loadRoom(v.renderer, "/world/pillar/waymarker.glb", { lightmap: LIGHTMAP.url, lightmapIntensity: LIGHTMAP.intensity, lightmapSRGB: true })
    .then((room) => {
      if (gone) return;
      const root = room.root;
      scene.add(root);
      if (room.lightmap) b.texs.push(room.lightmap);
      root.traverse((n) => {
        if (!(n instanceof THREE.Mesh)) return;
        b.geos.push(n.geometry);
        for (const m of ([] as THREE.Material[]).concat(n.material)) {
          b.mats.push(m);
          if (!(m instanceof THREE.MeshStandardMaterial)) continue;
          for (const t of [m.map, m.normalMap, m.aoMap, m.roughnessMap, m.metalnessMap, m.emissiveMap]) if (t && !b.texs.includes(t)) b.texs.push(t);
          if (m.name === "bronze") m.metalness = BRONZE_METALNESS;
        }
      });
      const find = (name: string) => root.getObjectByName(name);
      lantern = find("fx_lantern") ?? null;
      if (lantern) lanternBase = lantern.quaternion.clone();
      specs = room.flames;
      for (const f of specs) Object.assign(f, LIGHT[f.kind ?? "brazier"]);
      F = flames(scene, specs, { lights: true, gain: 1.2, time: S.time, ppu, bag: b, draw: !ctx.bare });
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
        halo.scale.setScalar(LOOK[k]?.halo ?? 1.4);
        halo.renderOrder = 2;
        scene.add(halo);
        const parentQ = node.parent ? node.parent.getWorldQuaternion(new THREE.Quaternion()) : new THREE.Quaternion();
        const toLocal = parentQ.clone().invert();
        if (ctx.bare && LOOK[k]?.frame) node.visible = false;
        const face = LOOK[k]?.face;
        if (face)
          own(find("board_" + k), (m) => {
            const c = Object.assign(m.clone(), { map: null, normalMap: null });
            c.color.set(face);
            return c;
          });
        arms.push({
          k,
          node,
          base: node.quaternion.clone(),
          baseY: node.position.y,
          lift: lift.applyQuaternion(toLocal),
          swing: THREE.Object3D.DEFAULT_UP.clone().applyQuaternion(toLocal),
          label,
          icon: own(icon, (m) => new THREE.MeshBasicMaterial({ map: m.map, lightMap: m.lightMap, lightMapIntensity: m.lightMapIntensity })),
          edge: own(find("edge_" + k), () => new THREE.MeshBasicMaterial(), true),
          frame: own(find("frame_" + k), (m) => {
            const c = m.clone();
            if (LOOK[k]?.frame) Object.assign(c, { map: null, metalness: BRONZE_METALNESS, roughness: 0.3 }).color.set(LOOK[k]!.frame!);
            return c;
          }),
          halo,
          hot: { x: LOOK[k]?.rest ?? 0, v: 0 },
          knock: { x: 0, v: 0 },
        });
      }
      loaded = true;
    })
    .catch((e) => console.error("pillar", e));

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

  const q = new THREE.Quaternion(), q2 = new THREE.Quaternion(), p = new THREE.Vector3();
  const white = new THREE.Color(1, 1, 1), tint = new THREE.Color();

  function frame(dt: number) {
    S.time.value += dt;
    const t = S.time.value;
    const [W, H] = v.size();
    const a = W / H;
    camera.top = c.h / 2;
    camera.bottom = -c.h / 2;
    camera.left = (-c.h * a) / 2;
    camera.right = (c.h * a) / 2;
    camera.updateProjectionMatrix();
    ppu.value = (H * dpr) / c.h;

    for (const arm of arms) {
      const lit = hover.has(arm.k) || focus.has(arm.k) ? 1 : 0;
      const rest = LOOK[arm.k]?.rest ?? 0;
      spring(arm.hot, ctx.still ? rest : Math.max(rest, lit), dt, 260, 0.62);
      spring(arm.knock, 0, dt, 170, 0.2);
      const h = arm.hot.x, up = Math.max(0, h - rest) / (1 - rest || 1);
      q.setFromAxisAngle(arm.lift, -0.07 * up);
      q2.setFromAxisAngle(arm.swing, 0.12 * arm.knock.x);
      arm.node.quaternion.copy(arm.base).premultiply(q).premultiply(q2);
      arm.node.position.y = arm.baseY + 0.03 * up;
      for (const m of arm.icon) m.color.copy(white).lerp(glow, up).multiplyScalar(1 + 0.8 * up);
      for (const m of arm.edge) m.color.copy(emit).multiplyScalar(0.15 + 1.6 * h);
      const gold = LOOK[arm.k]?.frame;
      for (const m of arm.frame) {
        m.color.set(gold ?? white).lerp(accent, 0.45 * up);
        if (gold) m.emissive.set(gold).multiplyScalar(0.3 * (1 - up)).add(tint.copy(accent).multiplyScalar(0.25 * up));
        else m.emissive.copy(accent).multiplyScalar(0.25 * up);
      }
      (arm.halo.material as THREE.ShaderMaterial).uniforms.uA.value = 0.9 * h;
      const el = o.el(arm.k);
      if (el) {
        p.copy(arm.label).project(camera);
        el.style.left = ((p.x + 1) / 2) * 100 + "%";
        el.style.top = ((1 - p.y) / 2) * 100 + "%";
      }
    }
    if (!ctx.still && lantern) lantern.quaternion.copy(lanternBase).premultiply(q.setFromAxisAngle(camera.getWorldDirection(p).setY(0).normalize(), 0.05 * Math.sin(t * 1.4) + 0.015 * Math.sin(t * 3.1)));
    F?.update();
    P.render(scene, camera, c.h);
    if (loaded && !shown && F) {
      shown = true;
      if (ctx.bare) host.dataset.marks = JSON.stringify(marks(camera, specs));
      ctx.ready();
    }
  }

  return () => {
    gone = true;
    offs.forEach((f) => f());
    v.stop();
    P.dispose();
    drop(b);
  };
}
