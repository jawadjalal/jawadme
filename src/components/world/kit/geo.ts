import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// The modelling kit: a batch that bakes every placed piece into one mesh per material and per 48-unit zone of the map
// (few draw calls, and zones off screen are culled), and the pieces themselves, all bevelled so the rim light has an
// edge to catch: slabs, fluted Doric columns, lathed vessels and rock masses that hang under each platform.

const q = new THREE.Quaternion();
const eu = new THREE.Euler();

export const M = (x: number, y: number, z: number, ry = 0, s: number | [number, number, number] = 1, rx = 0, rz = 0) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), q.setFromEuler(eu.set(rx, ry, rz)), Array.isArray(s) ? new THREE.Vector3(s[0], s[1], s[2]) : new THREE.Vector3(s, s, s));

/** A piece ready for the batch: unindexed, position, normal and uv only, and aH, its height above its own base (99 when it takes no contact shade). */
export function prep(geo: THREE.BufferGeometry, ao = true) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") g.deleteAttribute(k);
  const p = g.attributes.position;
  if (!g.attributes.uv) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(p.count * 2), 2));
  if (!g.attributes.normal) g.computeVertexNormals();
  const h = new Float32Array(p.count);
  for (let i = 0; i < p.count; i++) h[i] = ao ? p.getY(i) : 99;
  g.setAttribute("aH", new THREE.BufferAttribute(h, 1));
  return g;
}

export class Batch {
  private parts = new Map<string, { mat: THREE.Material; geos: THREE.BufferGeometry[] }>();
  add(mat: THREE.Material, geo: THREE.BufferGeometry, m: THREE.Matrix4, ao = true) {
    const g = prep(geo, ao).applyMatrix4(m);
    g.computeBoundingBox();
    const c = g.boundingBox!.getCenter(new THREE.Vector3());
    const key = mat.uuid + "|" + Math.floor(c.x / 48) + "," + Math.floor(c.z / 48);
    const e = this.parts.get(key) ?? { mat, geos: [] };
    e.geos.push(g);
    this.parts.set(key, e);
  }
  build(scene: THREE.Object3D, geos: THREE.BufferGeometry[]) {
    for (const { mat, geos: list } of this.parts.values()) {
      const g = mergeGeometries(list)!;
      list.forEach((x) => x.dispose());
      geos.push(g);
      const mesh = new THREE.Mesh(g, mat);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      scene.add(mesh);
    }
    this.parts.clear();
  }
}

/** A bevelled block standing on y = 0. */
export const box = (w: number, h: number, d: number, r = 0.1) => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.2, h / 2.2, d / 2.2)).translate(0, h / 2, 0);

export const lathe = (pts: [number, number][], seg = 24) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

/** A Doric column on y = 0: plinth, torus, a fluted shaft with a little entasis, echinus and abacus; broken > 0 snaps it off that far below the top. */
export function column(h: number, r = 0.55, broken = 0, seed = 1) {
  const sh = h - 1.75;
  const shaft = new THREE.CylinderGeometry(r * 0.86, r, sh, 60, 8);
  const p = shaft.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const a = Math.atan2(z, x);
    const t = (y + sh / 2) / sh;
    const f = (1 - 0.075 * Math.pow(0.5 + 0.5 * Math.cos(a * 20), 2)) * (1 + 0.04 * Math.sin(t * Math.PI));
    const cut = broken > 0 && y > 0 ? (t > 0.99 ? broken * (0.55 + 0.45 * Math.abs(Math.sin(a * 2.3 + seed)) + 0.2 * Math.abs(Math.sin(a * 7 + seed * 3))) : 0) : 0;
    p.setXYZ(i, x * f, y - cut, z * f);
  }
  shaft.computeVertexNormals();
  shaft.translate(0, 0.62 + sh / 2, 0);
  const parts = [box(r * 3, 0.32, r * 3, 0.06), new THREE.CylinderGeometry(r * 1.18, r * 1.32, 0.3, 40).translate(0, 0.47, 0), shaft];
  if (!broken) {
    parts.push(new THREE.CylinderGeometry(r * 1.42, r * 0.9, 0.46, 40).translate(0, 0.62 + sh + 0.23, 0));
    parts.push(box(r * 3.1, 0.42, r * 3.1, 0.06).translate(0, 0.62 + sh + 0.46, 0));
  }
  return mergeGeometries(parts.map((g) => prep(g)))!;
}

const hash = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
const vnoise = (x: number, y: number, z: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = x - xi, fy = y - yi, fz = z - zi;
  const s = (t: number) => t * t * (3 - 2 * t);
  const u = s(fx), v = s(fy), w = s(fz);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
  return l(l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v), l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v), w);
};

/** The rock under a platform: its top is the platform's footprint at y = 0, and it tapers and breaks up as it falls away. */
export function rock(w: number, d: number, depth: number, seed = 0, round = false) {
  const g = round ? new THREE.CylinderGeometry(w / 2, w / 2, depth, 28, 7) : new THREE.BoxGeometry(w, depth, d, Math.ceil(w / 3), 7, Math.ceil(d / 3));
  g.translate(0, -depth / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const t = -y / depth;
    if (t < 0.02) continue;
    const k = 1 - 0.55 * Math.pow(t, 1.3);
    const n = vnoise(x * 0.25 + seed, y * 0.3, z * 0.25) - 0.5;
    const m = vnoise(x * 0.7 + 9, y * 0.8 + seed, z * 0.7) - 0.5;
    const j = (n * 3.2 + m * 1.2) * (0.4 + t);
    p.setXYZ(i, x * k + j, y + m * 1.5 * t, z * k - j * 0.8);
  }
  const out = g.toNonIndexed();
  out.computeVertexNormals();
  g.dispose();
  return out;
}

/** A stone: a low-poly lump for rubble. */
export function stone(seed: number) {
  const g = new THREE.IcosahedronGeometry(1, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 0.75 + 0.5 * vnoise(x * 2 + seed, y * 2, z * 2);
    p.setXYZ(i, x * k, y * k * 0.7, z * k);
  }
  g.computeVertexNormals();
  return g.translate(0, 0.35, 0);
}

export const AMPHORA: [number, number][] = [[0.0, 0], [0.22, 0.02], [0.3, 0.12], [0.48, 0.45], [0.56, 0.8], [0.5, 1.15], [0.28, 1.45], [0.2, 1.6], [0.26, 1.72], [0.3, 1.78], [0.0, 1.8]];
export const BRAZIER: [number, number][] = [[0.0, 0], [0.62, 0], [0.66, 0.16], [0.4, 0.26], [0.2, 0.4], [0.16, 1.8], [0.22, 2.0], [0.2, 2.06], [0.55, 2.16], [0.95, 2.48], [1.06, 2.72], [0.98, 2.78], [0.7, 2.6], [0.0, 2.56]];
