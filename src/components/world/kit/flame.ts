import * as THREE from "three";
import type { Bag } from "./bag";
import { GLOW } from "./paint";

// The world's one flame, used by every room, the footer's waymarker and (as a rendered flipbook, public/world/flame)
// the posters. Each flame is three upright ribbons facing the camera, drawn additively: a soft outer tongue, a body
// and a hot white-mint core, each a teardrop (a round bulb tapering to a point) torn by noise that scrolls upward, so
// the tongue licks, sways and splits at the tip. Brightness and height follow flicker() (7.3 and 17.9 Hz, plus a
// 31.7 Hz shimmer); whatever lights the room from the flame uses the same flicker with the same seed (seedOf), so the
// stone moves with it: the painted world through lightFires (./lights), the PBR rooms through the point lights made
// here (o.lights). Sparks and embers rise off the hotter kinds and fade. Colours are GLOW's alone: the outer tongue
// GLOW.glow, the body GLOW.emissive, the core GLOW.core burning to near white at its heart.
// Every flame shares one draw per layer (instancing), plus one Points draw for all the sparks.

export type FlameKind = "brazier" | "candle" | "lantern" | "portal" | "soul";
/** A flame: the base of the fire, its height in world units, its kind, the radius its light reaches and its light's
 *  candela at rest (default: the kind's, scaled by h²), and optionally a node it rides with (its world position is
 *  re-read every frame, e.g. a swinging lantern). */
export type FlameSpec = { p: THREE.Vector3; h: number; kind?: FlameKind; r?: number; cd?: number; node?: THREE.Object3D };

/** Per kind: ribbon width, heat (how far the core burns to white), sparks per flame, point-light candela per h². */
const KIND: Record<FlameKind, { w: number; heat: number; sparks: number; light: number }> = {
  brazier: { w: 1, heat: 1, sparks: 16, light: 4.5 },
  portal: { w: 1.12, heat: 0.8, sparks: 10, light: 3.5 },
  soul: { w: 0.84, heat: 0.5, sparks: 6, light: 3.5 },
  lantern: { w: 0.86, heat: 1, sparks: 0, light: 30 },
  candle: { w: 0.8, heat: 1.1, sparks: 0, light: 24 },
};

/** The ribbons, outside in: quad width (in flame heights), the bulb's radius and centre, the tip, edge softness, noise, brightness. */
const LAYERS = [
  { w: 0.86, r: 0.175, c: 0.19, tip: 0.97, soft: 0.07, n: 0.24, a: 0.42 },
  { w: 0.56, r: 0.13, c: 0.17, tip: 0.76, soft: 0.035, n: 0.11, a: 0.64 },
  { w: 0.3, r: 0.072, c: 0.12, tip: 0.46, soft: 0.03, n: 0.05, a: 0.8 },
];
// The outer two layers add up to GLOW.emissive turning GLOW.core (green near 1, so nothing clips and the hue holds);
// the core adds only what is missing to reach white-hot, so the heart reads near white and its rim stays mint.
const COLOR = [
  "vec3 col = mix(uGlow, uBody, heat);",
  "vec3 col = mix(uBody, uCore, smoothstep(0.1, 0.8, heat));",
  "vec3 col = max(uHot - uCore, 0.0) * smoothstep(0.1, 0.75, heat) * vHeat;",
];

const GLSL = /* glsl */ `
float fh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float fn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(fh(i), fh(i + vec2(1, 0)), f.x), mix(fh(i + vec2(0, 1)), fh(i + 1.0), f.x), f.y); }
float ff(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 3; i++) { s += a * fn(p); p = p * 2.07 + 3.1; a *= 0.5; } return s / 0.875; }
float flicker(float t, float s) { return 0.86 + 0.08 * sin(t * 7.3 + s * 5.1) + 0.05 * sin(t * 17.9 + s * 2.3) + 0.03 * sin(t * 31.7 + s * 11.0); }
`;

/** The flicker every flame and its light share, around 0.86 (0.7 to 1.02): two sines, plus a fast shimmer. */
export const flicker = (t: number, s: number) => 0.86 + 0.08 * Math.sin(t * 7.3 + s * 5.1) + 0.05 * Math.sin(t * 17.9 + s * 2.3) + 0.03 * Math.sin(t * 31.7 + s * 11.0);
/** A flame's seed from where it stands, so a flame and a light standing in for it agree without sharing an index. */
export const seedOf = (p: THREE.Vector3) => {
  const v = Math.sin(p.x * 12.9898 + p.z * 78.233) * 43758.5453;
  return (v - Math.floor(v)) * 10;
};

/** Draw `list` into `scene`. Draw into a linear (half-float) target, as ./post does: additive layers summed in sRGB
 *  wash out to cyan. Each flame carries a flickering point light for lit PBR rooms; o.lights false leaves them out (the painted
 *  world reads lightFires instead); o.draw false keeps only those lights (a poster whose flames are CSS). o.gain scales the flame's output: 1 untone-mapped, higher under AgX. o.time and o.ppu share a stage's
 *  uniforms (seconds; drawing-buffer pixels per world unit), so the shaders need no update() for them; o.bag frees the
 *  GPU side with the stage's (./bag), otherwise dispose(). */
export function flames(scene: THREE.Scene, list: FlameSpec[], o: { lights?: boolean; gain?: number; time?: { value: number }; ppu?: { value: number }; bag?: Bag; draw?: boolean } = {}) {
  const time = o.time ?? { value: 0 };
  const ppu = o.ppu ?? { value: 100 };
  const gain = { value: o.gain ?? 1 };
  const glow = new THREE.Color(GLOW.glow), body = new THREE.Color(GLOW.emissive), core = new THREE.Color(GLOW.core), hot = core.clone().lerp(new THREE.Color(1, 1, 1), 0.9);
  const n = list.length, N = Math.max(1, n);
  const seeds = list.map((f) => seedOf(f.p));
  const kinds = list.map((f) => KIND[f.kind ?? "brazier"]);
  const cds = list.map((f, i) => f.cd ?? kinds[i].light * f.h * f.h);
  const fA = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4).setUsage(THREE.DynamicDrawUsage);
  const lA = new THREE.InstancedBufferAttribute(new Float32Array(n).fill(1), 1).setUsage(THREE.DynamicDrawUsage);
  const sA = new THREE.InstancedBufferAttribute(new Float32Array(seeds), 1);
  const vA = new THREE.InstancedBufferAttribute(new Float32Array(kinds.flatMap((k) => [k.w, k.heat])), 2);
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const objs: THREE.Object3D[] = [];
  const quad = new THREE.PlaneGeometry(1, 1, 1, 1).translate(0, 0.5, 0);
  geos.push(quad);

  const draw = o.draw !== false;
  if (draw) LAYERS.forEach((L, li) => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: time, uGain: gain, uGlow: { value: glow }, uBody: { value: body }, uCore: { value: core }, uHot: { value: hot } },
      vertexShader: /* glsl */ `
        uniform float uTime;
        attribute vec4 aF; attribute float aS, aL; attribute vec2 aV;
        varying vec2 vQ; varying float vS, vL, vFl, vHeat;
        ${GLSL}
        void main() {
          vS = aS; vL = aL; vHeat = aV.y;
          vFl = flicker(uTime, aS);
          float h = aF.w * smoothstep(0.08, 0.7, aL) * (0.9 + 0.12 * vFl);
          vec3 right = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]));
          float w = ${L.w.toFixed(3)} * aV.x;
          vQ = vec2(position.x * w, uv.y);
          vec3 p = aF.xyz + right * position.x * w * h + vec3(0.0, position.y * h, 0.0);
          gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime, uGain; uniform vec3 uGlow, uBody, uCore, uHot;
        varying vec2 vQ; varying float vS, vL, vFl, vHeat;
        ${GLSL}
        void main() {
          float y = vQ.y, x = vQ.x, t = uTime;
          x -= (ff(vec2(vS * 3.1, t * 0.8)) - 0.5) * 0.32 * y * y + sin(t * 2.7 + vS * 4.0) * 0.025 * y;
          float n = ff(vec2(x * 3.2 + vS * 7.0, y * 2.4 - t * 2.1));
          float n2 = fn(vec2(x * 7.0 - vS * 3.0, y * 5.5 - t * 3.4));
          float tip = ${L.tip.toFixed(3)} * (0.92 + 0.1 * vFl) + (n - 0.5) * 0.18;
          float yy = y + (n2 - 0.5) * 0.05 * y;
          float r = ${L.r.toFixed(3)}, c = ${L.c.toFixed(3)};
          float hw = yy < c ? r * sqrt(max(0.0, 1.0 - (c - yy) * (c - yy) / (c * c))) : r * pow(max(0.0, cos(clamp((yy - c) / (tip - c), 0.0, 1.0) * 1.5708)), 1.1);
          float shape = hw - abs(x) + ((n - 0.5) * 0.9 + (n2 - 0.5) * 0.5) * ${L.n.toFixed(3)} * (0.2 + y);
          ${li === 0 ? "shape -= smoothstep(0.45, 0.75, n2) * 0.12 * smoothstep(0.3, 0.85, y);" : ""}
          float m = smoothstep(0.0, max(${L.soft.toFixed(3)} * (0.4 + y), fwidth(shape) * 1.2), shape) * smoothstep(1.0, 0.82, y);
          if (m < 0.004) discard;
          float heat = clamp(shape / r, 0.0, 1.0) * (1.0 - 0.45 * y);
          ${COLOR[li]}
          gl_FragColor = vec4(col * m * ${L.a.toFixed(3)} * uGain * vFl * clamp(vL, 0.0, 1.8), 1.0);
          #include <colorspace_fragment>
        }`,
    });
    mats.push(mat);
    const g = new THREE.InstancedBufferGeometry();
    g.index = quad.index;
    g.setAttribute("position", quad.getAttribute("position"));
    g.setAttribute("uv", quad.getAttribute("uv"));
    g.setAttribute("aF", fA);
    g.setAttribute("aS", sA);
    g.setAttribute("aL", lA);
    g.setAttribute("aV", vA);
    g.instanceCount = n;
    geos.push(g);
    const mesh = new THREE.Mesh(g, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 3;
    scene.add(mesh);
    objs.push(mesh);
  });

  // sparks (fast, hot, small) and embers (slow, larger, cooling to GLOW.glow): each reads its flame's base, height
  // and level from a uniform array by index, so a moving flame takes its sparks along
  const sI: number[] = [], sS: number[] = [];
  list.forEach((_, i) => {
    for (let j = 0; j < kinds[i].sparks; j++) sI.push(i), sS.push(seeds[i] * 3.7 + j * 1.618);
  });
  const sparkAt = Array.from({ length: N }, () => new THREE.Vector4());
  const sparkLv = new Float32Array(N).fill(1);
  if (draw && sI.length) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(sI.length * 3), 3));
    g.setAttribute("aI", new THREE.Float32BufferAttribute(sI, 1));
    g.setAttribute("aS", new THREE.Float32BufferAttribute(sS, 1));
    geos.push(g);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: time, uPpu: ppu, uGain: gain, uAt: { value: sparkAt }, uLv: { value: sparkLv }, uCore: { value: core }, uHot: { value: hot }, uGlow: { value: glow } },
      vertexShader: /* glsl */ `
        uniform float uTime, uPpu; uniform vec4 uAt[${N}]; uniform float uLv[${N}];
        attribute float aI, aS; varying float vL, vS, vE;
        float h1(float x) { return fract(sin(x * 91.7) * 43758.5); }
        void main() {
          int i = int(aI + 0.5);
          vec4 f = uAt[i];
          float h = f.w;
          vE = step(0.7, h1(aS + 6.0));
          float life = fract(uTime / mix(0.9 + h1(aS) * 0.9, 2.2 + h1(aS) * 1.6, vE) + h1(aS + 1.0));
          float a = h1(aS + 2.0) * 6.2832, rr = sqrt(h1(aS + 3.0)) * 0.16 * h;
          vec3 p = f.xyz + vec3(cos(a) * rr, h * 0.42, sin(a) * rr);
          p.y += life * h * mix(1.1 + h1(aS + 4.0) * 0.7, 0.7 + h1(aS + 4.0) * 0.5, vE);
          p.x += sin(uTime * 2.3 + aS * 13.0) * 0.14 * h * life;
          p.z += cos(uTime * 1.9 + aS * 7.0) * 0.14 * h * life;
          vL = life; vS = h1(aS + 5.0);
          gl_PointSize = smoothstep(0.3, 0.9, uLv[i]) * max(1.0, uPpu * h * mix(0.022, 0.034, vE) * (1.0 - life * 0.5) * (0.7 + 0.6 * vS));
          gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uCore, uHot, uGlow; uniform float uGain; varying float vL, vS, vE;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float e = 1.0 - smoothstep(0.2, 0.5, d);
          float a = smoothstep(0.0, 0.06, vL) * (1.0 - smoothstep(0.45, 1.0, vL));
          vec3 c = vE > 0.5 ? mix(uCore, uGlow, vL) * 0.7 : mix(uHot, uCore, smoothstep(0.0, 0.5, vL));
          gl_FragColor = vec4(c * e * a * uGain * (0.6 + 0.5 * vS), 1.0);
          #include <colorspace_fragment>
        }`,
    });
    mats.push(mat);
    const pts = new THREE.Points(g, mat);
    pts.frustumCulled = false;
    pts.renderOrder = 3;
    scene.add(pts);
    objs.push(pts);
  }

  const fire = new THREE.Color().setRGB(GLOW.fire[0], GLOW.fire[1], GLOW.fire[2]).multiplyScalar(1 / GLOW.fire[1]);
  const lights = o.lights !== false
    ? list.map((f) => {
        const l = new THREE.PointLight(fire, 0, f.r ?? f.h * 6, 2);
        scene.add(l);
        objs.push(l);
        return l;
      })
    : [];
  const place = (i: number) => {
    const f = list[i];
    if (f.node) f.node.getWorldPosition(f.p);
    fA.setXYZW(i, f.p.x, f.p.y, f.p.z, f.h);
    sparkAt[i].set(f.p.x, f.p.y, f.p.z, f.h);
    lights[i]?.position.set(f.p.x, f.p.y + f.h * 0.4, f.p.z);
  };
  for (let i = 0; i < n; i++) place(i);
  const moving = list.some((f) => f.node);
  o.bag?.geos.push(...geos);
  o.bag?.mats.push(...mats);

  return {
    /** The flames' point lights, one per flame in list order (empty with o.lights false). */
    lights,
    /** Advance to time t (seconds); ppu is drawing-buffer pixels per world unit, for the sparks. With o.time and o.ppu
     *  shared, call it without arguments, and only for lights or flames that ride a node. */
    update(t = time.value, pixelsPerUnit = ppu.value) {
      time.value = t;
      ppu.value = pixelsPerUnit;
      if (moving) {
        for (let i = 0; i < n; i++) if (list[i].node) place(i);
        fA.needsUpdate = true;
      }
      for (let i = 0; i < lights.length; i++) lights[i].intensity = cds[i] * flicker(t, seeds[i]) * Math.min(1.8, sparkLv[i]);
    },
    /** Set flame i's level: 0 out, 1 burning, above 1 a flare (the world's ignition wave). */
    level(i: number, v: number) {
      if (lA.getX(i) === v) return;
      lA.setX(i, v);
      lA.needsUpdate = true;
      sparkLv[i] = v;
    },
    dispose() {
      objs.forEach((x) => x.removeFromParent());
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
    },
  };
}
