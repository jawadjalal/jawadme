import * as THREE from "three";

// The hero pillar, turned in code: a stepped square plinth, an Attic base (two gilded tori around a scotia), a fluted
// shaft with entasis and rounded flute ends, and a Doric-ish capital (gilded annulets, echinus, chamfered abacus).
// Every piece carries aGold (gilding mask), aShaft (where the fracture may open) and aHull (the direction the ink
// outline pushes out, smooth even where the shading is faceted).

type Profile = { pts: [number, number][]; gold: number }[];

export const SHAFT = { y0: -2.3, y1: 2.0, r0: 0.76, r1: 0.66, flutes: 20 };

const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 10): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });

function turn(profile: Profile, sides: number) {
  const pos: number[] = [];
  const nor: number[] = [];
  const hull: number[] = [];
  const gold: number[] = [];
  const idx: number[] = [];
  const square = sides === 4;
  const columns = square
    ? [0, 1, 2, 3].flatMap((c) => [(c - 0.5) * (Math.PI / 2), (c + 0.5) * (Math.PI / 2)].map((a) => [a, c * (Math.PI / 2)]))
    : Array.from({ length: sides + 1 }, (_, i) => [(i / sides) * Math.PI * 2, (i / sides) * Math.PI * 2]);
  for (const piece of profile) {
    const p = piece.pts;
    const n = p.length;
    const off = pos.length / 3;
    const n2 = p.map((_, j) => {
      const a = p[Math.max(j - 1, 0)];
      const b = p[Math.min(j + 1, n - 1)];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [(b[1] - a[1]) / l, -(b[0] - a[0]) / l];
    });
    for (const [a, mid] of columns) {
      const scale = 1 / Math.cos(a - mid);
      p.forEach(([r, y], j) => {
        pos.push(Math.cos(a) * r * scale, y, Math.sin(a) * r * scale);
        nor.push(Math.cos(mid) * n2[j][0], n2[j][1], Math.sin(mid) * n2[j][0]);
        const h = Math.hypot(n2[j][0], n2[j][1]) || 1;
        hull.push((Math.cos(a) * n2[j][0]) / h, n2[j][1] / h, (Math.sin(a) * n2[j][0]) / h);
        gold.push(piece.gold);
      });
    }
    const pairs = square ? [0, 2, 4, 6].map((c) => [c, c + 1]) : Array.from({ length: sides }, (_, c) => [c, c + 1]);
    for (const [ca, cb] of pairs)
      for (let j = 0; j < n - 1; j++) {
        const a = off + ca * n + j;
        const b = off + cb * n + j;
        idx.push(a, a + 1, b, b, a + 1, b + 1);
      }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("aHull", new THREE.Float32BufferAttribute(hull, 3));
  g.setAttribute("aGold", new THREE.Float32BufferAttribute(gold, 1));
  g.setAttribute("aShaft", new THREE.Float32BufferAttribute(new Float32Array(pos.length / 3), 1));
  g.setIndex(idx);
  return g;
}

function shaft() {
  const { y0, y1, r0, r1, flutes } = SHAFT;
  const seg = flutes * 14;
  const rows = 150;
  const pos: number[] = [];
  const idx: number[] = [];
  const fill = 0.16;
  for (let j = 0; j <= rows; j++) {
    const t = j / rows;
    const y = y0 + (y1 - y0) * t;
    const R = r0 + (r1 - r0) * Math.pow(t, 1.35) + 0.018 * Math.sin(t * Math.PI);
    const ends = Math.min(Math.min(t * (y1 - y0), (1 - t) * (y1 - y0)) / 0.2, 1);
    const reach = Math.sqrt(Math.max(1 - Math.pow(1 - ends, 2), 0));
    const D = 0.052 * reach;
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      const u = ((i / seg) * flutes) % 1;
      const x = (u - 0.5) / (0.5 - fill / 2);
      const cut = Math.abs(x) < 1 ? D * Math.sqrt(1 - x * x) : 0;
      const r = R - cut;
      pos.push(Math.cos(a) * r, y, Math.sin(a) * r);
    }
  }
  const w = seg + 1;
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < seg; i++) {
      const a = j * w + i;
      idx.push(a, a + w, a + 1, a + 1, a + w, a + w + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const n = g.attributes.normal as THREE.BufferAttribute;
  for (let j = 0; j <= rows; j++) {
    const a = j * w;
    const b = a + seg;
    const v = new THREE.Vector3(n.getX(a) + n.getX(b), n.getY(a) + n.getY(b), n.getZ(a) + n.getZ(b)).normalize();
    n.setXYZ(a, v.x, v.y, v.z);
    n.setXYZ(b, v.x, v.y, v.z);
  }
  const count = pos.length / 3;
  const hull = new Float32Array(count * 3);
  for (let k = 0; k < count; k++) {
    const x = pos[k * 3];
    const z = pos[k * 3 + 2];
    const l = Math.hypot(x, z) || 1;
    hull[k * 3] = x / l;
    hull[k * 3 + 2] = z / l;
  }
  g.setAttribute("aHull", new THREE.BufferAttribute(hull, 3));
  g.setAttribute("aGold", new THREE.BufferAttribute(new Float32Array(count), 1));
  g.setAttribute("aShaft", new THREE.BufferAttribute(new Float32Array(count).fill(1), 1));
  return g;
}

export function pillarGeometries() {
  const { y1, r0, r1 } = SHAFT;
  const plinth = turn(
    [
      { pts: [[0, -3.3], [1.3, -3.3]], gold: 0 },
      { pts: [[1.3, -3.3], [1.3, -3.02]], gold: 0 },
      { pts: [[1.3, -3.02], [1.24, -2.98]], gold: 1 },
      { pts: [[1.24, -2.98], [1.1, -2.98]], gold: 0 },
      { pts: [[1.1, -2.98], [1.1, -2.84]], gold: 0 },
      { pts: [[1.1, -2.84], [1.05, -2.8], [0.9, -2.8]], gold: 0 },
    ],
    4,
  );
  const base = turn(
    [
      { pts: arc(0.92, -2.68, 0.13, -Math.PI / 2, Math.PI / 2, 14), gold: 1 },
      { pts: [[0.92, -2.55], [0.88, -2.55]], gold: 0 },
      { pts: arc(0.9, -2.47, 0.08, -Math.PI / 2, -Math.PI * 1.5, 10).map(([r, y]) => [r - 0.02, y] as [number, number]), gold: 0 },
      { pts: [[0.88, -2.39], [0.83, -2.39]], gold: 0 },
      { pts: arc(0.83, -2.33, 0.06, -Math.PI / 2, Math.PI / 2, 10), gold: 1 },
      { pts: [[0.83, -2.27], [r0 + 0.02, -2.27], [r0 + 0.02, -2.2]], gold: 0 },
    ],
    112,
  );
  const ring = (y: number, r: number) => arc(r, y, 0.025, -Math.PI / 2, Math.PI / 2, 6);
  const capital = turn(
    [
      { pts: [[r1, y1 - 0.02], [r1 + 0.015, y1], [r1 + 0.015, y1 + 0.03]], gold: 0 },
      { pts: ring(y1 + 0.055, r1 + 0.02), gold: 1 },
      { pts: ring(y1 + 0.105, r1 + 0.03), gold: 1 },
      { pts: ring(y1 + 0.155, r1 + 0.04), gold: 1 },
      {
        pts: Array.from({ length: 13 }, (_, i) => {
          const t = i / 12;
          return [r1 + 0.04 + 0.34 * Math.pow(t, 1.8), y1 + 0.18 + 0.28 * Math.sin((t * Math.PI) / 2)] as [number, number];
        }),
        gold: 0,
      },
      { pts: [[1.04, y1 + 0.46], [1.08, y1 + 0.47]], gold: 1 },
    ],
    112,
  );
  const abacus = turn(
    [
      { pts: [[0, y1 + 0.46], [1.12, y1 + 0.46]], gold: 0 },
      { pts: [[1.12, y1 + 0.46], [1.12, y1 + 0.6]], gold: 0 },
      { pts: [[1.12, y1 + 0.6], [1.1, y1 + 0.62], [1.1, y1 + 0.74]], gold: 1 },
      { pts: [[1.1, y1 + 0.74], [1.12, y1 + 0.76], [1.12, y1 + 0.8]], gold: 0 },
      { pts: [[1.12, y1 + 0.8], [1.05, y1 + 0.85], [0, y1 + 0.85]], gold: 0 },
    ],
    4,
  );
  return [plinth, base, shaft(), capital, abacus];
}
