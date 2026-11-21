import { ACCENT } from "@/lib/accent";
import * as THREE from "three";
import { BRAZIER, AMPHORA, Batch, COS, M, Q, RV, box, column, lathe, prep, rock, type Bag, type Fire, type Palette } from "@/components/world/kit";

// The sets each route stands on: one floating platform of the world apiece, built from the kit's pieces and lit by
// its own fires. Every set faces the iso camera (screen right runs along RV, the near corner is +x +z), returns the
// shot its stage frames, and may animate. The page's HTML (links, the picture itself) sits over the stage, so a set
// leaves room for it rather than drawing it.

export type SetCtx = { B: Batch; m: Palette; mk: (color: string, kind: { k: "stone"; rim?: number } | { k: "rock" }, extra?: THREE.MeshToonMaterialParameters) => THREE.MeshToonMaterial; scene: THREE.Scene; b: Bag; time: { value: number }; family: string };
export type Set = { fires: Fire[]; shot: { t: THREE.Vector3; h: number; w: number }; update?: (dt: number, t: number) => void };
export type SetName = "break3d" | "niche-ads" | "niche-web" | "niche-game" | "niche-view" | "gate" | "shaft" | "deadend" | "reading";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** A point along the screen's horizontal from p: positive is to the right. */
const along = (p: THREE.Vector3, d: number) => p.clone().addScaledVector(RV, d);

function kit(c: SetCtx) {
  const { B, m } = c;
  const fires: Fire[] = [];
  const platform = (half: number, depth = 9) => {
    const floor = c.mk("#47413d", { k: "stone" });
    B.add(m.stone, box(half * 2 + 0.4, 2.2, half * 2 + 0.4, 0.18), M(0, -2.2, 0), false);
    B.add(m.dark, box(half * 2 + 1.1, 0.55, half * 2 + 1.1, 0.16), M(0, -2.75, 0), false);
    B.add(floor, new THREE.PlaneGeometry(half * 2, half * 2).rotateX(-Math.PI / 2), M(0, 0.012, 0), false);
    B.add(m.rock, rock(half * 2 + 0.6, half * 2 + 0.6, depth, 4), M(0, -2.6, 0));
  };
  const brazier = (p: THREE.Vector3, big = false) => {
    B.add(m.dark, lathe(BRAZIER, 28), M(p.x, p.y, p.z, 0, big ? 1.2 : 0.95));
    fires.push({ p: p.clone().setY(p.y + (big ? 3.3 : 2.6)), r: big ? 11 : 9, soul: false, big });
  };
  const lamp = (p: THREE.Vector3, r = 7, soul = false) => fires.push({ p, r, soul, big: false, lamp: true });
  const col = (p: THREE.Vector3, h: number, r = 0.6, broken = 0, seed = 1) => B.add(m.pale, column(h, r, broken, seed), M(p.x, p.y, p.z, seed));
  /** A slab whose long side runs along the screen. */
  const beam = (p: THREE.Vector3, w: number, h: number, d: number, mat = m.stone) => B.add(mat, box(w, h, d, 0.12), M(p.x, p.y, p.z, Q));
  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
    c.b.geos.push(geo);
    const me = new THREE.Mesh(geo, mat);
    me.castShadow = me.receiveShadow = true;
    c.scene.add(me);
    return me;
  };
  /** Words set on a plate facing the viewer, stretched so they read flat through the camera's pitch. */
  const words = (text: string, p: THREE.Vector3, w: number, h: number, color = "#f1e6d2", size = 0.5) => {
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = Math.round((1024 * h) / w);
    const g = cv.getContext("2d")!;
    g.fillStyle = color;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "700 " + Math.round(cv.height * size) + "px " + c.family;
    g.fillText(text, cv.width / 2, cv.height / 2, cv.width * 0.92);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    c.b.texs.push(t);
    const mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false });
    c.b.mats.push(mat);
    const me = new THREE.Mesh(new THREE.PlaneGeometry(w, h / COS), mat);
    c.b.geos.push(me.geometry);
    me.position.copy(p);
    me.rotation.y = Q;
    c.scene.add(me);
    return me;
  };
  /** A soft light standing in a doorway or over a crystal, added on top of the paint. */
  const glow = (p: THREE.Vector3, w: number, h: number, color: string, a = 1) => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uC: { value: new THREE.Color(color) }, uA: { value: a }, uTime: c.time },
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "uniform vec3 uC; uniform float uA, uTime; varying vec2 vUv; void main() { vec2 q = vUv - 0.5; float d = length(q * vec2(1.6, 1.0)); float f = smoothstep(0.62, 0.0, d) * (0.85 + 0.15 * sin(uTime * 2.3 + vUv.y * 9.0)); gl_FragColor = vec4(uC * f * uA, f * uA); }",
    });
    c.b.mats.push(mat);
    const me = new THREE.Mesh(new THREE.PlaneGeometry(w, h / COS), mat);
    c.b.geos.push(me.geometry);
    me.position.copy(p);
    me.rotation.y = Q;
    c.scene.add(me);
    return mat;
  };
  const crystal = (p: THREE.Vector3, s: number, color: string, ry = 0, tilt = 0.2) => {
    const mat = c.mk(color, { k: "stone", rim: 1.6 }, { emissive: new THREE.Color(color), emissiveIntensity: 0.9 });
    B.add(mat, prep(new THREE.OctahedronGeometry(1, 0).scale(0.55, 1.4, 0.55).translate(0, 1.1, 0), false), M(p.x, p.y, p.z, ry, s, tilt, tilt * 0.6));
  };
  return { fires, platform, brazier, lamp, col, beam, mesh, words, glow, crystal };
}

/** /work, at the 3D break: Blade Ball's ball on a plinth and its pink blade driven into the floor beside it. */
function break3d(c: SetCtx): Set {
  const k = kit(c);
  const { B, m } = c;
  k.platform(6);
  B.add(m.pale, column(2.6, 1.25, 0, 2), M(0, 0, 0));
  const red = c.mk("#d3322b", { k: "stone", rim: 1.8 });
  const ball = k.mesh(prep(new THREE.SphereGeometry(1.55, 48, 32), false), red);
  ball.position.set(0, 2.6 + 1.55, 0);
  const pink = c.mk("#e0569c", { k: "stone", rim: 1.8 }, { emissive: new THREE.Color("#ff2f8e"), emissiveIntensity: 0.12 });
  const sword = new THREE.Group();
  const part = (geo: THREE.BufferGeometry, mat: THREE.Material, y: number) => {
    const me = new THREE.Mesh(prep(geo, false), mat);
    c.b.geos.push(me.geometry);
    me.position.y = y;
    me.castShadow = true;
    sword.add(me);
  };
  part(new THREE.BoxGeometry(0.5, 5.6, 0.12), pink, 2.2);
  part(new THREE.ConeGeometry(0.25, 0.8, 4).rotateY(Math.PI / 4).scale(1, 1, 0.24), pink, -0.9);
  part(new THREE.BoxGeometry(2.0, 0.3, 0.42), m.bronze, 5.1);
  part(new THREE.BoxGeometry(0.3, 1.5, 0.3), m.wood, 6.0);
  part(new THREE.SphereGeometry(0.32, 16, 12), m.bronze, 6.9);
  sword.position.copy(along(V(1.6, 0, 1.6), 1.2)).setY(0.6);
  sword.rotation.set(0.08, Q, -0.32);
  c.scene.add(sword);
  B.add(m.rock, rock(2.4, 2, 1, 7, true), M(-3.2, 0.5, 2.6, 0.4, [1, 0.6, 1]));
  B.add(m.pale, column(1.6, 0.7, 1, 4), M(-4.2, 0, -2.6));
  B.add(m.stone, box(1.4, 0.7, 1.4, 0.12), M(3.6, 0, -3.4, 0.5));
  k.brazier(V(-4.4, 0, 1.6));
  k.brazier(V(2.8, 0, -4.4));
  return { fires: k.fires, shot: { t: V(0, 2.6, 0), h: 15, w: 22 }, update: (_, t) => (ball.rotation.y = t * 0.4) };
}

/** Behind a picture: colonnades either side of the frame and a fire before each, the middle left for the page. */
function niche(c: SetCtx, lane: "ads" | "web" | "game" | "view"): Set {
  const k = kit(c);
  const { B, m } = c;
  k.platform(11, 11);
  const L = along(V(0, 0, 0), -9.6), R = along(V(0, 0, 0), 9.6);
  for (const s of [-1, 1]) {
    const base = s < 0 ? L : R;
    for (const d of [0, 2.6]) {
      const p = base.clone().addScaledVector(V(-1, 0, -1).normalize(), d);
      k.col(p, 9, 0.62, 0, d + s);
    }
    const top = base.clone().addScaledVector(V(-1, 0, -1).normalize(), 1.3).setY(9);
    B.add(m.trim, box(4.4, 0.9, 1.7, 0.1), M(top.x, top.y, top.z, -Q));
    k.brazier(along(base, -s * 2.4).add(V(1.4, 0, 1.4)), lane !== "view");
  }
  const back = V(-7.5, 0, -7.5);
  B.add(m.dark, box(14, 6, 1.1, 0.12), M(back.x, 0, back.z, Q));
  B.add(m.trim, box(14.6, 0.6, 1.5, 0.1), M(back.x, 6, back.z, Q));
  if (lane === "ads") {
    B.add(m.bronze, lathe(AMPHORA, 24), M(L.x + 2.6, 0, L.z + 3.4, 0, 1.6));
    B.add(m.bronze, lathe(AMPHORA, 24), M(R.x + 3.2, 0, R.z + 2.4, 0, 1.3));
  }
  if (lane === "web") {
    B.add(m.stone, box(3.2, 1.2, 2, 0.12), M(L.x + 2.8, 0, L.z + 3.2, 0.3));
    B.add(m.pale, box(2.4, 0.9, 1.6, 0.12), M(L.x + 2.8, 1.2, L.z + 3.2, 0.5));
    B.add(m.stone, box(2.6, 1.6, 2.6, 0.12), M(R.x + 3, 0, R.z + 2.6, 0.2));
  }
  if (lane === "game") {
    B.add(m.rock, rock(3.4, 3, 2.2, 3, true), M(L.x + 2.6, 1.1, L.z + 3.4, 0.3, [1, 0.8, 1]));
    for (const [dx, dz, s, col] of [[2, 3.4, 1, "#63e6ff"], [3.3, 2.8, 0.8, "#ffc043"], [1.8, 4.6, 0.7, "#63e6ff"]] as const) k.crystal(V(L.x + dx, 1.4, L.z + dz), s, col, dx, 0.3);
    k.lamp(V(L.x + 2.6, 3, L.z + 3.4), 6, true);
    B.add(m.wood, box(0.22, 4.4, 0.22, 0.05), M(R.x + 3, 0.1, R.z + 2.6, 0.4, 1, 0, 0.42));
    B.add(m.dark, box(2.6, 0.42, 0.5, 0.1), M(R.x + 1.95, 3.9, R.z + 2.6, 0.4, 1, 0, 0.42));
  }
  return { fires: k.fires, shot: { t: V(0, 3.4, 0), h: 17, w: 40 } };
}

/** /cal: a gate up three steps, accent light standing in it. */
function gate(c: SetCtx): Set {
  const k = kit(c);
  const { B, m } = c;
  k.platform(7);
  for (let i = 0; i < 3; i++) B.add(i ? m.stone : m.pale, box(7 - i * 1.4, 0.55, 7 - i * 1.4, 0.1), M(-1 - i * 0.5, i * 0.55, -1 - i * 0.5, Q));
  const P = V(-2.6, 1.65, -2.6);
  for (const s of [-1, 1]) k.col(along(P, s * 2.3), 7.2, 0.58, 0, s + 2);
  B.add(m.trim, box(6.2, 1, 1.5, 0.1), M(P.x, P.y + 7.2, P.z, Q));
  B.add(m.pale, box(6.8, 0.4, 1.9, 0.1), M(P.x, P.y + 8.2, P.z, Q));
  const g = k.glow(P.clone().setY(P.y + 3.6), 3.6, 7, ACCENT.glow, 1.1);
  k.lamp(P.clone().setY(P.y + 2.6).add(V(0.8, 0, 0.8)), 10);
  k.brazier(V(3.4, 0, 0.8));
  k.brazier(V(0.8, 0, 3.4));
  B.add(m.pale, column(2.2, 0.6, 1, 6), M(-5, 0, 2.4));
  return { fires: k.fires, shot: { t: V(-1, 4, -1), h: 17, w: 19 }, update: (_, t) => (g.uniforms.uA.value = 1 + 0.12 * Math.sin(t * 1.7)) };
}

/** /about: a desk with a book open on it, and his three places of work cut into standing tablets behind. */
function shaft(c: SetCtx): Set {
  const k = kit(c);
  const { B, m } = c;
  k.platform(9, 13);
  const back = V(-5, 0, -5);
  B.add(m.rock, rock(7, 6, 4.6, 9, true), M(back.x, 4.6, back.z, 0.2, [1.2, 1.1, 1]));
  B.add(m.rock, rock(5, 4, 3.4, 5, true), M(back.x + 5.2, 3.4, back.z - 1.4, 0.8));
  B.add(m.rock, rock(4, 4, 2.6, 2, true), M(back.x - 1.2, 2.6, back.z + 5, 1.4));
  const ores: [number, number, number, number, string][] = [[-4.2, 1.6, -2.6, 1, "#63e6ff"], [-2.6, 2.4, -4.4, 0.8, "#ffc043"], [-5.8, 2.8, -1.2, 0.7, "#63e6ff"], [0.6, 1.4, -6.2, 0.9, ACCENT.accent], [-6.4, 0.2, 0.8, 0.8, "#ffc043"]];
  for (const [x, y, z, s, col] of ores) k.crystal(V(x, y, z), s, col, x + z, 0.4);
  k.lamp(V(-4, 2.6, -3), 7, true);
  for (const s of [-0.7, 0.7]) B.add(m.bronze, box(16, 0.16, 0.18, 0.04), M(1.6 + s * 0.7, 0.12, 1.6 - s * 0.7, Q + Math.PI / 2));
  for (let i = -6; i <= 6; i += 1.5) B.add(m.wood, box(0.4, 0.14, 2.2, 0.04), M(1.6 + i * 0.7, 0, 1.6 + i * 0.7, Q + Math.PI / 2));
  const cart = V(3.6, 0.4, 3.6);
  B.add(m.dark, box(2.8, 1.6, 2, 0.12), M(cart.x, cart.y + 0.35, cart.z, Q + Math.PI / 2));
  B.add(m.bronze, box(3, 0.22, 2.2, 0.06), M(cart.x, cart.y + 1.95, cart.z, Q + Math.PI / 2));
  for (const [a, b] of [[-0.9, -0.85], [0.9, -0.85], [-0.9, 0.85], [0.9, 0.85]]) {
    const p = cart.clone().addScaledVector(V(1, 0, 1).normalize(), a).addScaledVector(RV, b);
    B.add(m.dark, prep(new THREE.CylinderGeometry(0.42, 0.42, 0.22, 18).rotateX(Math.PI / 2)), M(p.x, 0.42, p.z, Q));
  }
  k.crystal(cart.clone().setY(1.7), 0.6, "#ffc043", 1, 0.5);
  k.crystal(cart.clone().setY(1.7).addScaledVector(RV, 0.6), 0.5, "#63e6ff", 2, 0.3);
  const post = V(6.4, 0, -1.6);
  B.add(m.wood, box(0.3, 5.2, 0.3, 0.06), M(post.x, 0, post.z));
  B.add(m.wood, box(1.4, 0.24, 0.24, 0.06), M(post.x - 0.4, 5, post.z + 0.4, Q));
  B.add(m.bronze, box(0.6, 0.8, 0.6, 0.12), M(post.x - 0.9, 4.1, post.z + 0.9));
  k.fires.push({ p: V(post.x - 0.9, 4.5, post.z + 0.9), r: 8, soul: false, big: false });
  B.add(m.wood, box(0.2, 3.6, 0.2, 0.05), M(-1.6, 0.2, 4.6, 0.3, 1, 0.35, 0.2));
  B.add(m.dark, box(2.2, 0.36, 0.42, 0.1), M(-1.2, 3.3, 5.6, 0.3, 1, 0.35, 0.2));
  return { fires: k.fires, shot: { t: V(0, 2.4, 0), h: 17, w: 30 } };
}

/** The 404: a corridor that caved in, one fire still lit, and a post whose boards point the way back. */
function deadend(c: SetCtx): Set {
  const k = kit(c);
  const { B, m } = c;
  k.platform(8);
  const back = V(-4, 0, -4);
  [[-6, 5.4, 1, 1], [-2.4, 7.6, 0.6, 2], [2.4, 3.2, 1, 3], [6, 6.4, 0.8, 4]].forEach(([d, h, br, s]) => k.col(along(back, d), h, 0.62, br, s));
  B.add(m.pale, box(5.2, 1, 1.6, 0.1), M(...(along(back, -4.2).toArray() as [number, number, number]), Q + 0.12, 1, 0, 0.1));
  B.add(m.pale, prep(new THREE.CylinderGeometry(0.62, 0.62, 3.2, 40).rotateZ(Math.PI / 2)), M(1.8, 0.62, 3.2, 0.7));
  B.add(m.pale, prep(new THREE.CylinderGeometry(0.62, 0.62, 2, 40).rotateZ(Math.PI / 2)), M(-1.4, 0.62, 5, 2.1));
  for (const [x, z, s, r] of [[3.6, 0.6, 1, 0.4], [4.4, 1.8, 0.7, 1.2], [-3.4, 3, 0.8, 0.9], [0.4, -1.4, 0.9, 2.2]]) B.add(m.stone, box(1.3 * s, 0.9 * s, 1.1 * s, 0.1), M(x, 0, z, r));
  B.add(m.rock, rock(3, 3, 1.2, 8, true), M(-5.4, 1.2, -0.6, 0.5, [1, 0.8, 1]));
  const post = V(4.2, 0, 4.2);
  B.add(m.wood, box(0.34, 6, 0.34, 0.06), M(post.x, 0, post.z));
  [[5.1, 0.25, "#efe4d0"], [4.1, -0.35, "#efe4d0"], [3.1, 0.15, ACCENT.accent]].forEach(([y, a, col]) => {
    const mat = col === ACCENT.accent ? c.mk(ACCENT.accent, { k: "stone", rim: 1.4 }) : m.pale;
    B.add(mat, box(2.8, 0.62, 0.16, 0.06), M(post.x + Math.cos(Q + (a as number)) * 1.2, y as number, post.z - Math.sin(Q + (a as number)) * 1.2, Q + (a as number)));
  });
  k.brazier(V(-1.2, 0, 1.2), true);
  return { fires: k.fires, shot: { t: V(0, 2.8, 0), h: 16, w: 24 } };
}

/** /blog: a lectern with a book open on it, a candle beside it and a fire behind. */
function reading(c: SetCtx): Set {
  const k = kit(c);
  const { B, m } = c;
  k.platform(5.5);
  B.add(m.wood, box(0.7, 3, 0.7, 0.08), M(0, 0, 0));
  B.add(m.wood, box(2.6, 0.24, 1.9, 0.06), M(0, 3.1, 0, Q, 1, 0.42, 0));
  for (const s of [-1, 1]) B.add(m.pale, box(1.2, 0.1, 1.6, 0.04), M(0.42 * s * 0.7, 3.38 + 0.08, -0.42 * s * 0.7 + 0.05, Q, 1, 0.42, s * 0.14));
  B.add(m.pale, box(1.6, 0.3, 1.6, 0.08), M(0, 0, 0, Q));
  B.add(m.pale, box(0.22, 0.9, 0.22, 0.05), M(1.9, 0, -0.6));
  k.lamp(V(1.9, 1.3, -0.6), 5);
  B.add(m.bronze, lathe(AMPHORA, 24), M(-2.8, 0, 2, 0, 1.2));
  k.brazier(V(-2.4, 0, -2.8));
  B.add(m.pale, column(3.4, 0.55, 1, 5), M(2.6, 0, -2.6));
  return { fires: k.fires, shot: { t: V(0, 2.4, 0), h: 12, w: 15 } };
}

export const SETS: Record<SetName, (c: SetCtx) => Set> = {
  break3d,
  "niche-ads": (c) => niche(c, "ads"),
  "niche-web": (c) => niche(c, "web"),
  "niche-game": (c) => niche(c, "game"),
  "niche-view": (c) => niche(c, "view"),
  gate,
  shaft,
  deadend,
  reading,
};
