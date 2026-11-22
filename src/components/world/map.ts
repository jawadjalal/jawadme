import * as THREE from "three";
import { AMPHORA, BRAZIER, Batch, DV, M, Q, box, column, lathe, rock, stone, type Fire, type Palette } from "./kit";

// The map: four chambers on one diorama, seen from the south-east, stepping down toward the viewer. The gate court
// (top, y 6) under a broken pediment; a stair to the long hall of ads (y 0) that runs east along its back wall; a
// causeway to the top of a theatre whose dark orchestra (y -8) holds the statement; a stair down to the landing on
// the river of souls (y -16) where the signpost stands. Everything here is static and baked into the batch; the
// hall's ads are built by ./hall, the moving things (fire, river, souls) by ./scene.

export type Mats = Palette & Record<"court" | "hall" | "orch" | "land", THREE.Material>;
export type Glow = { m: THREE.Matrix4; w: number; h: number; soul: boolean };


export const COURT = { y: 6, x0: -16, z0: -16, x1: 16, z1: 16 };
export const HALL = { y: 0, x0: 22, z0: -16, x1: 186, z1: 0 };
export const THEATRE = { c: new THREE.Vector3(HALL.x1 + 38, -8, 24), r: 20, tiers: 8 };
export const LAND = { c: THEATRE.c.clone().add(new THREE.Vector3(28, -8, 30)), half: 9 };
export const SIGN = LAND.c.clone().add(new THREE.Vector3(-1.5, 0, -1.5));

let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

export function buildMap(B: Batch, m: Mats) {
  const fires: Fire[] = [];
  const glows: Glow[] = [];
  const fire = (x: number, y: number, z: number, soul = false, big = false) => {
    B.add(m.dark, lathe(BRAZIER, 28), M(x, y, z, 0, big ? 1.25 : 1));
    fires.push({ p: new THREE.Vector3(x, y + (big ? 3.4 : 2.75), z), r: big ? 12 : 9.5, soul, big });
  };
  const amphora = (x: number, y: number, z: number, s = 1, tip = 0) => B.add(m.pale, lathe(AMPHORA, 20), M(x, y + (tip ? 0.5 : 0), z, rnd() * 6, s, tip, 0));
  const rubble = (x: number, y: number, z: number, n: number, spread: number) => {
    for (let i = 0; i < n; i++) B.add(m.stone, stone(i + x), M(x + (rnd() - 0.5) * spread, y, z + (rnd() - 0.5) * spread, rnd() * 6, [0.3 + rnd() * 0.6, 0.3 + rnd() * 0.5, 0.3 + rnd() * 0.6]));
  };
  const drum = (x: number, y: number, z: number, ry: number) => B.add(m.pale, column(2.9, 0.55, 0.6, x), M(x, y + 0.55, z, ry, 1, 0, Math.PI / 2));

  // a platform: bevelled slab with a cornice under its lip, the carved floor on top, the rock hanging below
  const platform = (x0: number, z0: number, x1: number, z1: number, y: number, floor: THREE.Material, depth: number) => {
    const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    B.add(m.stone, box(w + 0.4, 2.2, d + 0.4, 0.18), M(cx, y - 2.2, cz), false);
    B.add(m.dark, box(w + 1.1, 0.55, d + 1.1, 0.16), M(cx, y - 2.75, cz), false);
    B.add(floor, new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), M(cx, y + 0.012, cz), false);
    B.add(m.rock, rock(w + 0.6, d + 0.6, depth, x0), M(cx, y - 2.6, cz));
  };
  // a wall along x (dir 0) or z (dir 1) from a to b, its face toward the room, ruined to random heights in places
  const wall = (dir: 0 | 1, a: number, b: number, at: number, y: number, h: number, frieze: number, ruin = 0.3, step = 4) => {
    for (let s = a; s < b - 0.01; s += step) {
      const len = Math.min(step, b - s);
      const broken = rnd() < ruin;
      const hh = broken ? h * (0.45 + rnd() * 0.35) : h;
      const c = s + len / 2;
      const [x, z] = dir === 0 ? [c, at] : [at, c];
      const ry = dir === 0 ? 0 : Math.PI / 2;
      B.add(m.stone, box(len + 0.02, hh, 1.4, 0.12), M(x, y, z, ry));
      B.add(m.dark, box(len + 0.04, 1.1, 1.8, 0.1), M(x, y, z, ry));
      if (!broken) {
        B.add(m.trim, box(len + 0.04, 1.2, 1.6, 0.06), M(x, y + frieze, z, ry));
        B.add(m.stone, box(len + 0.06, 0.55, 2.1, 0.12), M(x, y + h, z, ry));
      } else rubble(dir === 0 ? c : at + 2, y, dir === 0 ? at + 2 : c, 3, 2.5);
      const [px, pz] = dir === 0 ? [s, at + 0.75] : [at + 0.75, s];
      B.add(m.pale, box(step > 5 ? 1.8 : 1.1, hh - 0.3, step > 5 ? 0.9 : 0.5, 0.1), M(px, y, pz, ry));
      if (step > 5) B.add(m.dark, box(len - 3.2, hh * 0.62, 0.3, 0.06), M(dir === 0 ? c : at + 0.7, y + 1.4, dir === 0 ? at + 0.7 : c, ry));
    }
  };
  const parapet = (x0: number, z0: number, x1: number, z1: number, y: number, gaps: [number, number][] = []) => {
    const len = Math.hypot(x1 - x0, z1 - z0), ry = -Math.atan2(z1 - z0, x1 - x0);
    for (let s = 0; s < len - 0.01; s += 3) {
      const t0 = s, t1 = Math.min(len, s + 3), mid = (t0 + t1) / 2;
      if (gaps.some(([g0, g1]) => mid > g0 && mid < g1) || rnd() < 0.12) continue;
      const x = x0 + ((x1 - x0) * mid) / len, z = z0 + ((z1 - z0) * mid) / len;
      B.add(m.stone, box(t1 - t0 - 0.5, 0.9, 0.55, 0.1), M(x, y, z, ry));
      B.add(m.pale, box(t1 - t0 - 0.2, 0.22, 0.8, 0.08), M(x, y + 0.9, z, ry));
      B.add(m.pale, box(0.75, 1.35, 0.75, 0.1), M(x0 + ((x1 - x0) * t0) / len, y, z0 + ((z1 - z0) * t0) / len, ry));
    }
  };
  const stair = (from: THREE.Vector3, dir: THREE.Vector3, steps: number, rise: number, run: number, width: number, mat: THREE.Material) => {
    const ry = -Math.atan2(dir.z, dir.x);
    for (let i = 0; i < steps; i++) {
      const top = from.y - rise * (i + 1);
      const p = from.clone().addScaledVector(dir, run * (i + 0.5));
      B.add(mat, box(run + 0.04, 1.2, width, 0.06), M(p.x, top - 1.2, p.z, ry), false);
    }
    for (const side of [-1, 1]) {
      const n = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(side * (width / 2 + 0.4));
      const len = steps * run;
      const mid = from.clone().addScaledVector(dir, len / 2).add(n);
      B.add(m.stone, box(len + 0.8, 1.2, 0.8, 0.12), M(mid.x, from.y - (steps * rise) / 2 - 0.4, mid.z, ry, 1, 0, Math.atan2(steps * rise, len)));
      const end = from.clone().addScaledVector(dir, len).add(n);
      B.add(m.pale, box(1.1, 2.0, 1.1, 0.1), M(end.x, from.y - steps * rise, end.z, ry));
      B.add(m.pale, box(1.1, 2.0, 1.1, 0.1), M(from.x + n.x, from.y, from.z + n.z, ry));
    }
  };

  // ---------- the gate court
  const C = COURT;
  platform(C.x0, C.z0, C.x1, C.z1, C.y, m.court, 16);
  wall(0, C.x0, C.x1, C.z0 - 0.7, C.y, 10, 8, 0.25);
  wall(1, C.z0 + 1.4, C.z1, C.x0 - 0.7, C.y, 10, 8, 0.35);
  parapet(C.x0 + 1, C.z1 - 0.4, C.x1 - 0.4, C.z1 - 0.4, C.y);
  parapet(C.x1 - 0.4, C.z1 - 0.4, C.x1 - 0.4, C.z0 + 1.5, C.y, [[17, 29]]);

  // the gate itself, set square to the viewer across the back corner
  const G = M(-9.6, C.y, -9.6, Q);
  const g = (mat: THREE.Material, geo: THREE.BufferGeometry, l: THREE.Matrix4, ao = true) => B.add(mat, geo, G.clone().multiply(l), ao);
  [[19, 0.45, 8.2], [17.2, 0.9, 6.8], [15.4, 1.35, 5.4]].forEach(([w, h, d], i) => g(m.pale, box(w, h, d, 0.1), M(0, 0, 0.4 - i * 0.15), false));
  for (const sx of [-1, 1]) {
    g(m.stone, box(3.4, 12, 3.6, 0.14), M(sx * 5.1, 1.35, 0));
    g(m.dark, box(4.1, 0.9, 4.3, 0.12), M(sx * 5.1, 1.35, 0));
    g(m.pale, box(4.2, 0.75, 4.4, 0.12), M(sx * 5.1, 12.6, 0));
    g(m.trim, box(3.5, 1.2, 3.7, 0.04), M(sx * 5.1, 6.8, 0));
    g(m.pale, column(15.2, 0.62), M(sx * 10.2, 0, 1.0));
    g(m.bronze, box(3.1, 11.0, 0.32, 0.06), M(sx * 3.4, 1.35, -0.6, sx * 0.62).multiply(M(-sx * 1.55, 0, 0)));
  }
  g(m.stone, box(15.2, 2.1, 4.4, 0.14), M(0, 13.35, 0));
  g(m.trim, box(15.4, 1.2, 4.6, 0.04), M(0, 15.2, 0));
  g(m.pale, box(16.4, 0.6, 5.2, 0.12), M(0, 16.4, 0));
  const ped = new THREE.Shape();
  [[-8.2, 0], [4.4, 0], [3.8, 0.7], [4.6, 1.3], [2.8, 1.9], [2.0, 3.1], [1.0, 3.5], [0, 4.4]].forEach(([x, y], i) => (i ? ped.lineTo(x, y) : ped.moveTo(x, y)));
  g(m.stone, new THREE.ExtrudeGeometry(ped, { depth: 4.2, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 1 }).translate(0, 0, -2.1), M(0, 17.0, 0));
  const chip = new THREE.Shape();
  [[0, 0], [3.2, 0], [0.6, 1.6]].forEach(([x, y], i) => (i ? chip.lineTo(x, y) : chip.moveTo(x, y)));
  g(m.stone, new THREE.ExtrudeGeometry(chip, { depth: 2.8, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1, bevelSegments: 1 }), M(9.5, 0, 7.2, 0.7, 1, -Math.PI / 2 + 0.2));
  glows.push({ m: G.clone().multiply(M(0, 7.35, -1.2)), w: 6.8, h: 12, soul: true });
  const door = new THREE.Vector3(0, 3.5, 3).applyMatrix4(G);
  fires.push({ p: door, r: 16, soul: true, big: true, lamp: true });
  for (const sx of [-1, 1]) {
    const p = new THREE.Vector3(sx * 7.6, 1.35, 3.2).applyMatrix4(G);
    fire(p.x, p.y, p.z, false, true);
  }
  fire(9.5, C.y, 11.5);
  fire(-11.5, C.y, 9.5);
  fire(11.5, C.y, -14.2);
  drum(6, C.y, 4, 0.4);
  drum(8.2, C.y, 2.8, -0.7);
  B.add(m.pale, column(6.5, 0.55, 1.6, 5), M(-12.5, C.y, -1));
  rubble(7, C.y, 6, 9, 4);
  rubble(-12, C.y, 5, 6, 3);
  [[-13.6, -6], [-13.4, -4.6], [-5.5, -13.6], [-4.0, -13.8], [-13.4, 3]].forEach(([x, z], i) => amphora(x, C.y, z, 0.9 + (i % 2) * 0.25));
  amphora(3, C.y, 9, 0.9, Math.PI / 2);
  B.add(m.stone, box(5.2, 0.9, 1.8, 0.12), M(-2, C.y, 12.5, 0.3));
  B.add(m.dark, box(4.6, 0.35, 2.0, 0.1), M(-2, C.y + 0.9, 12.5, 0.3));

  // the stair down to the hall
  stair(new THREE.Vector3(C.x1, C.y, -9), new THREE.Vector3(1, 0, 0), 12, 0.5, 0.5, 7, m.pale);
  B.add(m.rock, rock(7, 9, 8, 2), M(19, -1, -9));

  // ---------- the hall: floor, back wall with its frieze, front parapet; the ads themselves are ./hall's
  const H = HALL;
  platform(H.x0, H.z0, H.x1, H.z1, H.y, m.hall, 14);
  wall(0, H.x0, H.x1, H.z0 - 0.7, H.y, 19, 16.4, 0.06, 6.25);
  parapet(H.x0 + 1, H.z1 - 0.4, H.x1 - 0.5, H.z1 - 0.4, H.y);
  rubble(30, H.y, -2, 5, 3);
  rubble(120, H.y, -2.5, 4, 3);
  rubble(176, H.y, -2, 6, 3);

  // ---------- the causeway and the theatre
  const T = THEATRE;
  const cx = H.x1 + 11;
  B.add(m.stone, box(22, 2.2, 7, 0.16), M(cx, -2.2, -8), false);
  B.add(m.hall, new THREE.PlaneGeometry(22, 7).rotateX(-Math.PI / 2), M(cx, 0.012, -8), false);
  B.add(m.rock, rock(21, 6, 6, 8), M(cx, -2.6, -8));
  parapet(H.x1 + 0.5, -11.6, H.x1 + 22, -11.6, 0);
  parapet(H.x1 + 0.5, -4.4, H.x1 + 20, -4.4, 0);
  B.add(m.rock, rock(T.r * 2 + 2, 0, 16, 3, true), M(T.c.x, T.c.y - 1.6, T.c.z));
  const back = T.c.clone().addScaledVector(DV, -15);
  B.add(m.rock, rock(66, 0, 18, 5, true), M(back.x, T.c.y - 1.2, back.z));
  B.add(m.stone, new THREE.CylinderGeometry(T.r + 0.6, T.r + 0.6, 1.6, 64).translate(0, -0.8, 0), M(T.c.x, T.c.y, T.c.z), false);
  B.add(m.orch, new THREE.CircleGeometry(T.r, 96).rotateX(-Math.PI / 2), M(T.c.x, T.c.y + 0.012, T.c.z), false);
  const mid = (-3 * Math.PI) / 4, span = (105 * Math.PI) / 180;
  for (let k = 0; k < T.tiers; k++) {
    const r0 = T.r + 1 + k * 2, r1 = T.r + 1 + T.tiers * 2 + 1;
    const s = new THREE.Shape();
    const a0 = -(mid - span), a1 = -(mid + span);
    s.absarc(0, 0, r1, a1, a0, false);
    s.absarc(0, 0, r0, a0, a1, true);
    const geo = new THREE.ExtrudeGeometry(s, { depth: k + 1, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 1, curveSegments: 64 }).rotateX(-Math.PI / 2);
    B.add(k % 2 ? m.stone : m.pale, geo, M(T.c.x, T.c.y - 0.1, T.c.z), false);
  }
  for (const a of [-0.78, -0.3, 0.3, 0.78].map((t) => mid + t * span)) {
    for (let k = 0; k < T.tiers * 2; k++) {
      const r = T.r + 1.5 + k;
      B.add(m.dark, box(1.0, 0.5 * (k + 1) + 0.04, 1.6, 0.04), M(T.c.x + Math.cos(a) * r, T.c.y, T.c.z + Math.sin(a) * r, -a), false);
    }
  }
  const crown = T.r + 1 + T.tiers * 2 - 0.2;
  let prev: THREE.Vector3 | null = null;
  for (let a = mid - span + 0.04; a <= mid + span; a += 0.155) {
    const p = new THREE.Vector3(T.c.x + Math.cos(a) * crown, T.c.y + T.tiers, T.c.z + Math.sin(a) * crown);
    if (Math.abs(a - Math.atan2(-8 - T.c.z, H.x1 + 22 - T.c.x)) < 0.12) {
      prev = null;
      continue;
    }
    const ruined = rnd() < 0.28;
    B.add(m.pale, column(ruined ? 3 + rnd() * 3 : 9, 0.5, ruined ? 1 : 0, a), M(p.x, p.y, p.z, -a));
    if (prev && !ruined && rnd() > 0.3) {
      const c = prev.clone().add(p).multiplyScalar(0.5);
      B.add(m.stone, box(prev.distanceTo(p) + 1.4, 1.1, 1.5, 0.1), M(c.x, p.y + 9.4, c.z, -Math.atan2(p.z - prev.z, p.x - prev.x)));
    }
    prev = ruined ? null : p;
  }
  const front = Math.PI / 4;
  for (let a = front - 1.35; a < front + 1.35; a += 0.12) {
    if (Math.abs(a - front) < 0.16) continue;
    B.add(m.stone, box(2.2, 0.9, 0.6, 0.08), M(T.c.x + Math.cos(a) * (T.r + 0.1), T.c.y, T.c.z + Math.sin(a) * (T.r + 0.1), Math.PI / 2 - a));
  }
  for (const t of [-0.88, -0.45, 0.45, 0.88]) {
    const a = mid + t * span * 0.8;
    fire(T.c.x + Math.cos(a) * (T.r - 1.5), T.c.y, T.c.z + Math.sin(a) * (T.r - 1.5), Math.abs(t) > 0.6);
  }
  fire(T.c.x + Math.cos(front - 0.4) * (T.r - 1.6), T.c.y, T.c.z + Math.sin(front - 0.4) * (T.r - 1.6));
  fire(T.c.x + Math.cos(front + 0.4) * (T.r - 1.6), T.c.y, T.c.z + Math.sin(front + 0.4) * (T.r - 1.6));

  // ---------- the stair down to the landing, the landing, its pier, the signpost, the lanterns and the boat
  const top = T.c.clone().addScaledVector(DV, T.r + 0.4);
  stair(top, DV, 16, 0.5, 0.52, 5, m.pale);
  const L = LAND;
  platform(L.c.x - L.half, L.c.z - L.half, L.c.x + L.half, L.c.z + L.half, L.c.y, m.land, 10);
  parapet(L.c.x - L.half + 0.4, L.c.z + L.half - 0.4, L.c.x + L.half - 0.4, L.c.z + L.half - 0.4, L.c.y, [[7, 13]]);
  for (let i = 0; i < 9; i++) B.add(m.wood, box(1.0, 0.28, 3.4, 0.05), M(L.c.x + L.half + 0.6 + i * 1.05, L.c.y - 0.3, L.c.z + 3 + (rnd() - 0.5) * 0.2, rnd() * 0.04 - 0.02), false);
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) B.add(m.wood, box(0.4, 3.4, 0.4, 0.05), M(L.c.x + L.half + 0.8 + i * 2.8, L.c.y - 3.2, L.c.z + 3 + s * 1.9));
  B.add(m.wood, box(0.55, 9.2, 0.55, 0.06), M(SIGN.x, SIGN.y, SIGN.z));
  B.add(m.bronze, box(1.0, 0.5, 1.0, 0.06), M(SIGN.x, SIGN.y + 9.2, SIGN.z));
  B.add(m.wood, box(7.2, 2.4, 0.32, 0.08), M(SIGN.x, SIGN.y + 5.3, SIGN.z, Q).multiply(M(0, 0, 0.35)));
  B.add(m.wood, box(4.8, 1.2, 0.26, 0.06), M(SIGN.x, SIGN.y + 8.1, SIGN.z, Q + 0.9).multiply(M(2.1, 0, 0)));
  B.add(m.wood, box(4.2, 1.1, 0.26, 0.06), M(SIGN.x, SIGN.y + 2.9, SIGN.z, Q - 1.1).multiply(M(-1.9, 0, 0)));
  for (const [x, z] of [[L.c.x - L.half + 1.2, L.c.z + L.half - 1.2], [L.c.x + L.half - 1.2, L.c.z - L.half + 1.2], [L.c.x + L.half + 9.6, L.c.z + 3]]) {
    B.add(m.bronze, box(0.32, 4.4, 0.32, 0.04), M(x, L.c.y, z));
    fires.push({ p: new THREE.Vector3(x, L.c.y + 4.7, z), r: 9, soul: true, big: false });
  }
  const hull = new THREE.CylinderGeometry(1.5, 1.5, 11, 18, 10, false, Math.PI, Math.PI);
  const hp = hull.attributes.position;
  for (let i = 0; i < hp.count; i++) {
    const t = hp.getY(i) / 5.5;
    const k = Math.sqrt(Math.max(0.02, 1 - Math.pow(Math.abs(t), 2.4)));
    hp.setXYZ(i, hp.getX(i) * k, hp.getY(i), hp.getZ(i) * k * 0.7 + Math.pow(Math.abs(t), 3) * 0.9);
  }
  hull.computeVertexNormals();
  const boat = M(L.c.x + 17.5, L.c.y - 1.4, L.c.z + 9.5, -Q, 1).multiply(M(0, 0, 0, 0, 1, Math.PI / 2, Math.PI / 2));
  B.add(m.wood, hull, boat, false);
  B.add(m.dark, box(1.9, 0.2, 9.4, 0.05), M(L.c.x + 17.5, L.c.y - 1.5, L.c.z + 9.5, -Q + Math.PI / 2), false);
  B.add(m.bronze, box(0.22, 4.2, 0.22, 0.03), M(L.c.x + 21.4, L.c.y - 1.6, L.c.z + 5.6));
  fires.push({ p: new THREE.Vector3(L.c.x + 21.4, L.c.y + 2.8, L.c.z + 5.6), r: 8, soul: true, big: false });

  // ---------- the abyss: spires of rock below the platforms
  for (let i = 0; i < 26; i++) {
    const x = -40 + rnd() * 340, z = -40 + rnd() * 140;
    const inside = (x > C.x0 - 6 && x < C.x1 + 6 && z > C.z0 - 6 && z < C.z1 + 6) || (x > H.x0 - 4 && x < H.x1 + 4 && z > H.z0 - 4 && z < H.z1 + 4) || Math.hypot(x - T.c.x, z - T.c.z) < 42;
    if (inside) continue;
    const w = 3 + rnd() * 6;
    B.add(m.rock, rock(w, w, 26, i, true), M(x, -14 - rnd() * 14, z, rnd() * 6));
  }
  return { fires, glows, door };
}
