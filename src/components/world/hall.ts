import * as THREE from "three";
import { BRAZIER, Batch, GLOW, M, Q, box, column, lathe, type Fire } from "./kit";
import { HALL, type Mats } from "./map";

// The hall of ads: every ad woven into a cloth banner with a gold border and its caption band, hung square to the
// viewer so it reads as a flat, undistorted 4:5 picture (its height is stretched by 1 / cos(pitch) to undo the
// camera's foreshortening). Two rows, staggered like a salon hang: the front row on rods between pairs of columns,
// the back row on brackets from the hall's back wall, higher, so it shows above the gaps. Ads alternate rows in
// reading order, and the camera walks the hall from the first to the last; each banner unrolls from its rod as the
// camera comes near. Each ad is a slot: the mesh that takes its picture and caption, a hot flag that lights its border
// for hover and keyboard focus, and how far it has unrolled.

export type Shot = { t: THREE.Vector3; h: number; w: number; floor: number };
export type Slot = { i: number; pos: THREE.Vector3; pick: THREE.Object3D; ad: (t: THREE.Texture) => void; cap: (t: THREE.Texture) => void; hot: (on: number, knock: number) => void; drop: (v: number) => void };
type Ctx = { B: Batch; m: Mats; scene: THREE.Scene; geos: THREE.BufferGeometry[]; mats: THREE.Material[]; time: { value: number }; n: number; pitch: number };

const PITCH = 12.5;
const FRONT = -10.5, BACK = -13.9;
const at = (j: number) => 34 + j * (PITCH / 2);

export function buildHall(ctx: Ctx) {
  const { B, m, n } = ctx;
  const k = 1 / Math.cos(ctx.pitch);
  const fires: Fire[] = [];
  const slots: Slot[] = [];
  for (let j = 0; j < n; j++) {
    const back = j % 2 === 1;
    const x = at(j);
    const F = M(x, HALL.y, back ? BACK : FRONT, Q);
    const add = (mat: THREE.Material, g: THREE.BufferGeometry, l: THREE.Matrix4) => B.add(mat, g, F.clone().multiply(l));
    const top = back ? 16.2 : 10.1;
    if (back) {
      for (const s of [-1, 1]) add(m.bronze, box(0.24, 0.24, 3.4, 0.05), M(s * 2.9, top + 0.05, -1.7));
      add(m.bronze, box(0.5, 0.8, 0.5, 0.08), M(0, top + 0.2, -0.1));
    } else {
      for (const s of [-1, 1]) add(m.pale, column(10.6, 0.46), M(s * 3.35, 0, 0));
      if (j % 4 === 0) {
        const p = new THREE.Vector3(x + 4.25, HALL.y, -1.6);
        B.add(m.dark, lathe(BRAZIER, 28), M(p.x, p.y, p.z));
        fires.push({ p: p.setY(HALL.y + 2.75), r: 10, soul: false, big: false });
      }
      fires.push({ p: new THREE.Vector3(x + 1.5, HALL.y + 5, FRONT + 3.5), r: 9, soul: false, big: false, lamp: true });
    }
    add(m.bronze, new THREE.CylinderGeometry(0.13, 0.13, 7.6, 12).rotateZ(Math.PI / 2), M(0, top + 0.15, 0.1));
    for (const s of [-1, 1]) add(m.bronze, new THREE.SphereGeometry(0.28, 12, 8), M(s * 3.9, top + 0.15, 0.1));
    const ban = banner(ctx, j, k);
    ban.matrixAutoUpdate = false;
    ban.matrix.copy(F.clone().multiply(M(0, top, 0.12)));
    ctx.scene.add(ban);
    const u = (ban.material as THREE.ShaderMaterial).uniforms;
    slots.push({ i: j, pos: new THREE.Vector3(x, top - 4, back ? BACK : FRONT), pick: ban, ad: (t) => ((u.tAd.value = t), (u.uHas.value = 1)), cap: (t) => (u.tCap.value = t), hot: (on, knock) => ((u.uHot.value = on), (u.uKnock.value = knock)), drop: (v) => (u.uDrop.value = v) });
  }
  const t = (j: number) => new THREE.Vector3(at(j) + 0.4, HALL.y + 8.6, (FRONT + BACK) / 2);
  const shots: [Shot, Shot] = [
    { t: t(0), h: 22, w: 27, floor: HALL.y },
    { t: t(n - 1), h: 22, w: 27, floor: HALL.y },
  ];
  return { shots, slots, fires };
}

// A banner: the ad in the middle, a woven band with its caption below, a valance above, fringe at the hem; it hangs
// from y = 0 and moves in the updraft, more at the hem than at the rod. Hot (hover or focus), it sways wider, its hem
// lifts toward the viewer and its border burns in the accent; knocked (a press), it swings on its rod.
function banner(ctx: Ctx, i: number, k: number) {
  const W = 5.4, H = 7.6;
  const geo = new THREE.PlaneGeometry(W, H * k, 8, 24).translate(0, (-H * k) / 2, 0);
  ctx.geos.push(geo);
  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: { uTime: ctx.time, tAd: { value: null }, tCap: { value: null }, uHas: { value: 0 }, uHot: { value: 0 }, uKnock: { value: 0 }, uAcc: { value: new THREE.Color(GLOW.glow).multiplyScalar(2.2) }, uDrop: { value: 1 }, uSeed: { value: i * 1.7 } },
    vertexShader: `
      uniform float uTime, uSeed, uHot, uKnock; varying vec2 vUv; varying float vS;
      void main() {
        vUv = uv;
        vec3 p = position;
        float hang = pow(1.0 - uv.y, 1.3);
        float w = (sin(uTime * 1.1 + p.x * 0.7 + uSeed) * 0.22 + sin(uTime * 2.3 + p.y * 1.4 + uSeed * 2.0) * 0.06) * hang * (1.0 + 1.3 * uHot);
        p.z += w + (0.45 * uHot + 0.9 * uKnock) * hang;
        p.x += 0.35 * uKnock * hang;
        vS = cos(uTime * 1.1 + p.x * 0.7 + uSeed) * hang;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `
      uniform sampler2D tAd, tCap; uniform float uHas, uHot, uDrop; uniform vec3 uAcc; varying vec2 vUv; varying float vS;
      void main() {
        float edge = vUv.y - (1.0 - uDrop);
        if (edge < 0.0) discard;
        float H = 7.6, W = 5.4;
        vec2 q = vec2(vUv.x * W, vUv.y * H);
        float tooth = abs(fract(q.x * 3.0) - 0.5) * 0.36;
        if (q.y < tooth) discard;
        vec3 cloth = vec3(0.27, 0.06, 0.035) * (0.86 + 0.14 * sin(q.x * 90.0) * sin(q.y * 90.0));
        float hot = clamp(uHot, 0.0, 1.0);
        vec3 gold = mix(vec3(0.62, 0.42, 0.18), uAcc, hot);
        vec3 c = cloth;
        vec2 a0 = vec2(0.4, 1.55), a1 = vec2(5.0, 7.3);
        float inAd = step(a0.x, q.x) * step(q.x, a1.x) * step(a0.y, q.y) * step(q.y, a1.y);
        float bord = step(a0.x - 0.14, q.x) * step(q.x, a1.x + 0.14) * step(a0.y - 0.14, q.y) * step(q.y, a1.y + 0.14) - inAd;
        c = mix(c, gold, bord);
        if (q.y > 7.5) c = mix(c, gold, step(7.58, q.y) * step(q.y, 7.7) + step(H - 0.04, q.y));
        if (q.y > 0.35 && q.y < 1.35 && q.x > 0.35 && q.x < 5.05) {
          vec4 t = texture2D(tCap, vec2((q.x - 0.35) / 4.7, (q.y - 0.35) / 1.0));
          c = mix(c, t.rgb, t.a);
        }
        if (inAd > 0.5) c = uHas > 0.5 ? texture2D(tAd, (q - a0) / (a1 - a0)).rgb * (0.88 + 0.12 * hot) : vec3(0.13, 0.1, 0.08);
        else c *= (0.92 + 0.3 * vS) * (1.0 + 0.35 * hot);
        if (uDrop < 1.0) c = mix(c, vec3(0.5, 0.33, 0.14) * (0.6 + 0.4 * sin(edge * 900.0)), step(edge, 0.018));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  ctx.mats.push(mat);
  return new THREE.Mesh(geo, mat);
}
