import * as THREE from "three";
import { GLOW } from "./accent";
import type { Bag } from "./bag";
import type { Fire } from "./lights";
import type { Shared } from "./paint";

// The particle systems, all GPU points: flames over each fire, a halo around it, and drifting motes (embers, souls,
// dust) in a box that follows the camera. `u.ign` is ignition time: a fire lights when ign passes its distance from
// `u.door` / 26, with a flare (set it high to have everything lit). `u.center` and `u.ppu` (pixels per world unit) are
// the stage's to update every frame.

export function fx(scene: THREE.Scene, S: Shared, b: Bag) {
  const u = { center: { value: new THREE.Vector3() }, ppu: { value: 60 }, ign: { value: 99 }, door: { value: new THREE.Vector3() } };
  let seed = 3;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const points = (n: number, at: (i: number) => [number, number, number], extra: Record<string, THREE.IUniform>, vs: string, fs: string) => {
    const pos = new Float32Array(n * 3);
    const sd = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos.set(at(i), i * 3);
      sd.set([rnd(), rnd(), rnd()], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(sd, 3));
    b.geos.push(g);
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: S.time, uC: u.center, uPx: u.ppu, uIgn: u.ign, uDoor: u.door, ...extra }, vertexShader: "uniform float uTime, uPx, uIgn; uniform vec3 uC, uDoor; attribute vec3 aSeed; varying float vT; varying vec3 vS;\n" + vs, fragmentShader: "varying float vT; varying vec3 vS;\n" + fs });
    b.mats.push(mat);
    const p = new THREE.Points(g, mat);
    p.frustumCulled = false;
    scene.add(p);
  };
  const IG = "clamp((uIgn - 0.15 - length(position - uDoor) / 26.0) / 0.45, 0.0, 1.0)";
  return {
    u,
    /** Flames over each fire, `per` points apiece, warm or soul-cyan. */
    flames(list: Fire[], soul: boolean, per = 24) {
      if (!list.length) return;
      const [hot, cold] = soul ? ["0.8, 1.0, 1.0", "0.1, 0.55, 0.9"] : [GLOW.hot, GLOW.cold];
      points(list.length * per, (i) => list[i % list.length].p.toArray() as [number, number, number], {}, `
        void main() {
          vS = aSeed;
          float t = fract(uTime * (0.8 + aSeed.x * 0.6) + aSeed.y * 7.13);
          float an = aSeed.z * 40.0, rd = (1.0 - t) * 0.55 * fract(aSeed.x * 13.7);
          vec3 p = position + vec3(cos(an) * rd + sin(uTime * 3.0 + aSeed.y * 20.0) * 0.12 * t, t * 2.1, sin(an) * rd);
          vT = t;
          gl_PointSize = uPx * 0.62 * (1.0 - t * 0.7) * (0.7 + aSeed.z * 0.6) * ${IG};
          gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
        }`, `
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float e = 1.0 - smoothstep(0.3, 0.5, d);
          vec3 c = mix(vec3(${hot}), vec3(${cold}), smoothstep(0.0, 0.7, vT));
          gl_FragColor = vec4(c * e * (1.0 - vT) * 1.6, 1.0);
        }`);
    },
    /** A soft halo around each fire. */
    halos(list: Fire[], color: string) {
      if (!list.length) return;
      points(list.length, (i) => list[i].p.toArray() as [number, number, number], { uCol: { value: new THREE.Color(color) } }, `
        void main() {
          vS = aSeed; vT = 0.0;
          float ig = ${IG};
          gl_PointSize = uPx * 6.5 * ig * (1.0 + 0.6 * exp(-max(0.0, uIgn - 0.6 - length(position - uDoor) / 26.0) * 3.0));
          gl_Position = projectionMatrix * viewMatrix * vec4(position + vec3(0.0, 0.6, 0.0), 1.0);
        }`, `
        uniform vec3 uCol;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float f = pow(max(0.0, 1.0 - d * 2.0), 2.2);
          gl_FragColor = vec4(uCol * f * 0.3, 1.0);
        }`);
    },
    /** n motes drifting up through a box (world units) around the camera's centre; size in world units, soft 0 for hard sparks, 1 for blurred souls. */
    drift(n: number, box: [number, number, number], size: number, up: number, color: string, alpha: number, soft: number) {
      points(n, () => [0, 0, 0], { uBox: { value: new THREE.Vector3(...box) }, uCol: { value: new THREE.Color(color) }, uSize: { value: size }, uUp: { value: up }, uAl: { value: alpha }, uSoft: { value: soft } }, `
        uniform vec3 uBox; uniform float uSize, uUp;
        void main() {
          vS = aSeed;
          vec3 p = aSeed;
          p.y = fract(p.y + uTime * uUp * (0.6 + aSeed.x * 0.8) / uBox.y - uC.y / uBox.y);
          p.x = fract(p.x + sin(uTime * 0.31 + aSeed.z * 30.0) * 0.6 / uBox.x - uC.x / uBox.x);
          p.z = fract(p.z + cos(uTime * 0.23 + aSeed.x * 20.0) * 0.6 / uBox.z - uC.z / uBox.z);
          vT = p.y;
          vec3 w = uC + (p - 0.5) * uBox;
          gl_PointSize = uSize * uPx * (0.5 + fract(aSeed.x * 7.0)) * clamp((uIgn - 0.5) / 1.2, 0.0, 1.0);
          gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
        }`, `
        uniform vec3 uCol; uniform float uAl, uSoft;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float e = mix(1.0 - smoothstep(0.32, 0.42, d), pow(1.0 - d * 2.0, 2.0), uSoft);
          float life = smoothstep(0.0, 0.15, vT) * smoothstep(1.0, 0.65, vT);
          gl_FragColor = vec4(uCol * e * life * uAl * (0.6 + 0.4 * sin(vS.z * 50.0 + vT * 20.0)), 1.0);
        }`);
    },
  };
}
