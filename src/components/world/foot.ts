import * as THREE from "three";
import type { Shot } from "./hall";
import { AMPHORA, BRAZIER, Batch, COS, DV, M, Q, RV, box, column, lathe, prep, rock, type Fire, type Kind, type Palette } from "./kit";

// The footer's chamber: the last room of the run, one object to play with, and the ways out. Three takes, chosen by
// ?footer: (a) exits, a portal for each destination with its glyph floating over the lintel, the call's portal square
// to the viewer and lit; (b) three relics on pedestals to choose between, the call's raised in the middle; (c) a die with
// Jawad on the face toward you and a destination on each of the others, which you roll or fling. Every target is a
// real link laid over the object (./scene projects their boxes); this file builds the geometry and moves it, given
// which link is hot, which was picked, and how far the pointer has dragged.

export type FootV = "a" | "b" | "c";
export type Glyph = "call" | "work" | "x" | "mail" | "ads" | "cube" | "roblox";
export type Exit = { key: string; label: string; sub: string; href: string; glyph: Glyph; main?: boolean };
/** A link's box: its centre in the world and its size on screen, in world units. */
export type Target = { key: string; at: THREE.Vector3; w: number; h: number };
export type FootState = { hot: string | null; pick: string | null; pickT: number; tilt: THREE.Vector2; drag: THREE.Vector2 | null };
export type Foot = {
  fires: Fire[];
  /** Fires that get a halo but no flame (a glowing coal). */
  halos?: Fire[];
  targets: Target[];
  shot: Shot;
  focus: (key: string) => THREE.Vector3;
  update: (dt: number, st: FootState) => void;
  roll?: (fx?: number, fy?: number) => void;
  face?: (on: (key: string) => void) => void;
};
type Ctx = { B: Batch; m: Palette; mk: (color: string, kind: Kind) => THREE.Material; floor: THREE.Material; scene: THREE.Scene; geos: THREE.BufferGeometry[]; mats: THREE.Material[]; texs: THREE.Texture[]; time: { value: number }; family: string; O: THREE.Vector3 };

const KEY = 32073823;
const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const FLAT_VS = "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";

export function drawGlyph(g: CanvasRenderingContext2D, k: Glyph, s: number) {
  g.save();
  g.lineCap = "round";
  g.lineJoin = "round";
  const stroke = (w: number) => ((g.lineWidth = s * w), g.stroke());
  g.beginPath();
  if (k === "call") {
    g.arc(0, 0, s * 0.82, 0, Math.PI * 2);
    stroke(0.13);
    g.beginPath();
    g.moveTo(0, 0);
    g.arc(0, 0, s * 0.56, -Math.PI / 2, 0);
    g.closePath();
    g.fill();
  } else if (k === "work") {
    for (const x of [-1, 1]) for (const y of [-1, 1]) g.rect(x * s * 0.42 - s * 0.32, y * s * 0.42 - s * 0.32, s * 0.64, s * 0.64);
    g.fill();
  } else if (k === "x") {
    g.moveTo(-s * 0.62, -s * 0.74);
    g.lineTo(s * 0.62, s * 0.74);
    stroke(0.26);
    g.beginPath();
    g.moveTo(s * 0.62, -s * 0.74);
    g.lineTo(-s * 0.62, s * 0.74);
    stroke(0.09);
  } else if (k === "mail") {
    g.rect(-s * 0.82, -s * 0.58, s * 1.64, s * 1.16);
    stroke(0.13);
    g.beginPath();
    g.moveTo(-s * 0.82, -s * 0.58);
    g.lineTo(0, s * 0.12);
    g.lineTo(s * 0.82, -s * 0.58);
    stroke(0.13);
  } else if (k === "ads") {
    g.rect(-s * 0.6, -s * 0.75, s * 1.2, s * 1.5);
    stroke(0.13);
    g.fillRect(-s * 0.6, s * 0.3, s * 1.2, s * 0.45);
  } else if (k === "cube") {
    const p = (a: number) => [Math.cos((a * Math.PI) / 180) * s * 0.84, Math.sin((a * Math.PI) / 180) * s * 0.84] as const;
    [-90, -30, 30, 90, 150, 210].forEach((a, i) => (i ? g.lineTo(...p(a)) : g.moveTo(...p(a))));
    g.closePath();
    for (const a of [90, 210, 330]) g.moveTo(0, 0), g.lineTo(...p(a));
    stroke(0.12);
  } else {
    g.rotate(0.26);
    g.rect(-s * 0.72, -s * 0.72, s * 1.44, s * 1.44);
    g.rect(s * 0.2, -s * 0.2, -s * 0.4, s * 0.4);
    g.fill("evenodd");
  }
  g.restore();
}

/** A band of the running key, one period every `cell` pixels: the key the world's floors and friezes carve. */
export function drawKey(g: CanvasRenderingContext2D, x: number, y: number, w: number, cell: number) {
  const u = cell / 5;
  for (let i = 0; i < Math.floor(w / cell); i++) for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if ((KEY >> (r * 5 + c)) & 1) g.fillRect(x + i * cell + c * u, y + (4 - r) * u, u + 0.6, u + 0.6);
}

export function buildFoot(ctx: Ctx, v: FootV, exits: Exit[]): Foot {
  const { B, m, O } = ctx;
  const fires: Fire[] = [];
  const W = (x: number, y: number, z: number) => new THREE.Vector3(O.x + x, O.y + y, O.z + z);
  const fire = (p: THREE.Vector3, big = false) => {
    B.add(m.dark, lathe(BRAZIER, 28), M(p.x, p.y, p.z, 0, big ? 1.25 : 1));
    fires.push({ p: p.clone().setY(p.y + (big ? 3.4 : 2.75)), r: big ? 12 : 9.5, soul: false, big });
  };
  const platform = (half: number, depth: number) => {
    B.add(m.stone, box(half * 2 + 0.4, 2.2, half * 2 + 0.4, 0.18), M(O.x, O.y - 2.2, O.z), false);
    B.add(m.dark, box(half * 2 + 1.1, 0.55, half * 2 + 1.1, 0.16), M(O.x, O.y - 2.75, O.z), false);
    B.add(ctx.floor, new THREE.PlaneGeometry(half * 2, half * 2).rotateX(-Math.PI / 2), M(O.x, O.y + 0.012, O.z), false);
    B.add(m.rock, rock(half * 2 + 0.6, half * 2 + 0.6, depth, 4), M(O.x, O.y - 2.6, O.z));
  };
  const tex = (cv: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    ctx.texs.push(t);
    return t;
  };
  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
    ctx.geos.push(geo);
    const me = new THREE.Mesh(geo, mat);
    me.castShadow = me.receiveShadow = true;
    return me;
  };
  const glowMat = (color: string, a: number, fs: string) => {
    const g = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uC: { value: new THREE.Color(color) }, uA: { value: a }, uTime: ctx.time }, vertexShader: FLAT_VS, fragmentShader: "uniform vec3 uC; uniform float uA, uTime; varying vec2 vUv; void main() { " + fs + " }" });
    ctx.mats.push(g);
    return g;
  };

  if (v === "a") return portals();
  if (v === "b") return relics();
  return die();

  // ---------- (a) the exits: the call's portal square to the viewer in the back corner, the rest in the side walls
  function portals(): Foot {
    platform(15, 14);
    const parapet = (x0: number, z0: number, x1: number, z1: number, gap: [number, number]) => {
      const len = Math.hypot(x1 - x0, z1 - z0), ry = -Math.atan2(z1 - z0, x1 - x0);
      for (let s = 0; s < len - 0.01; s += 3) {
        if (s + 1.5 > gap[0] && s + 1.5 < gap[1]) continue;
        const at = (d: number) => [O.x + x0 + ((x1 - x0) * d) / len, O.z + z0 + ((z1 - z0) * d) / len];
        const [x, z] = at(s + 1.5), [px, pz] = at(s);
        B.add(m.stone, box(2.5, 0.9, 0.55, 0.1), M(x, O.y, z, ry));
        B.add(m.pale, box(2.8, 0.22, 0.8, 0.08), M(x, O.y + 0.9, z, ry));
        B.add(m.pale, box(0.75, 1.35, 0.75, 0.1), M(px, O.y, pz, ry));
      }
    };
    parapet(-14.6, 14.6, 14.6, 14.6, [12, 18]);
    parapet(14.6, 14.6, 14.6, -14.6, [99, 99]);
    const wallAt = -15.7;
    const run = (dir: 0 | 1, from: number, to: number, holes: number[]) => {
      const cuts = [from, ...holes.flatMap((h) => [h - 3.1, h + 3.1]), to];
      for (let i = 0; i < cuts.length; i += 2) {
        const a = cuts[i], b = cuts[i + 1], len = b - a, c = (a + b) / 2;
        if (len < 0.2) continue;
        const [x, z] = dir === 0 ? [c, wallAt] : [wallAt, c];
        const ry = dir === 0 ? 0 : Math.PI / 2;
        B.add(m.stone, box(len, 11, 1.4, 0.12), M(O.x + x, O.y, O.z + z, ry));
        B.add(m.dark, box(len + 0.04, 1.1, 1.8, 0.1), M(O.x + x, O.y, O.z + z, ry));
        B.add(m.trim, box(len + 0.04, 1.2, 1.6, 0.06), M(O.x + x, O.y + 8.6, O.z + z, ry));
        B.add(m.stone, box(len + 0.06, 0.55, 2.1, 0.12), M(O.x + x, O.y + 11, O.z + z, ry));
      }
    };
    const side = exits.filter((e) => !e.main);
    const left = side.slice(0, 1), right = side.slice(1);
    const spots = [{ e: exits.find((e) => e.main)!, F: M(O.x - 10.4, O.y, O.z - 10.4, Q), big: true, facing: 1 }];
    left.forEach((e, i) => spots.push({ e, F: M(O.x + wallAt, O.y, O.z + 3 + i * 8, Math.PI / 2), big: false, facing: Math.SQRT1_2 }));
    right.forEach((e, i) => spots.push({ e, F: M(O.x - 1 + i * 9, O.y, O.z + wallAt, 0), big: false, facing: Math.SQRT1_2 }));
    run(1, -6.4, 15, left.map((_, i) => 3 + i * 8));
    run(0, -6.4, 15, right.map((_, i) => -1 + i * 9));

    const targets: Target[] = [];
    const doors = spots.map(({ e, F, big, facing }, i) => {
      const s = big ? 1.4 : 1;
      const ow = 4 * s, oh = 7 * s;
      const add = (mat: THREE.Material, g: THREE.BufferGeometry, l: THREE.Matrix4, ao = true) => B.add(mat, g, F.clone().multiply(l), ao);
      [[ow + 6, 0.45, 5], [ow + 4.4, 0.9, 3.8]].forEach(([w, h, d], k) => add(m.pale, box(w, h, d, 0.08), M(0, 0, 1.2 - k * 0.3), false));
      for (const sx of [-1, 1]) {
        add(m.stone, box(1.6 * s, oh + 1.6, 2.2, 0.12), M(sx * (ow / 2 + 0.8 * s), 0.9, 0));
        add(m.dark, box(1.9 * s, 0.8, 2.5, 0.1), M(sx * (ow / 2 + 0.8 * s), 0.9, 0));
        if (big) add(m.pale, column(oh + 4.6, 0.6), M(sx * (ow / 2 + 3.4), 0, 1.2));
      }
      add(m.stone, box(ow + 3.6 * s, 1.5 * s, 2.5, 0.12), M(0, oh + 0.9, 0));
      add(m.trim, box(ow + 3.8 * s, 1.0, 2.7, 0.04), M(0, oh + 0.9 + 1.5 * s, 0));
      add(m.pale, box(ow + 4.4 * s, 0.5, 3.0, 0.1), M(0, oh + 1.9 + 1.5 * s, 0));
      if (big) {
        const ped = new THREE.Shape();
        [[-6.6, 0], [6.6, 0], [0, 3.0]].forEach(([x, y], k) => (k ? ped.lineTo(x, y) : ped.moveTo(x, y)));
        add(m.stone, new THREE.ExtrudeGeometry(ped, { depth: 2.6, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 1 }).translate(0, 0, -1.3), M(0, oh + 2.4 + 1.5 * s, 0));
      }
      const glow = glowMat(e.main ? "#ff6a24" : "#63e6ff", 0.6, "vec2 d = (vUv - vec2(0.5, 0.3)) * vec2(1.3, 0.8); float f = smoothstep(0.7, 0.0, length(d)); gl_FragColor = vec4(uC * (f * f * 1.6 + 0.2) * uA * (0.94 + 0.06 * sin(uTime * 2.1)), 1.0);");
      const gm = new THREE.Mesh(new THREE.PlaneGeometry(ow, oh), glow);
      ctx.geos.push(gm.geometry);
      gm.matrixAutoUpdate = false;
      gm.matrix.copy(F.clone().multiply(M(0, oh / 2 + 0.9, -1.0)));
      ctx.scene.add(gm);
      const ry = Math.atan2(F.elements[8], F.elements[10]);
      const leaves = [-1, 1].map((sx) => {
        const leaf = mesh(prep(box(ow / 2 - 0.05, oh, 0.28, 0.06)).translate((-sx * (ow / 2 - 0.05)) / 2, 0, 0), m.bronze);
        leaf.position.copy(new THREE.Vector3(sx * (ow / 2), 0.9, 0).applyMatrix4(F));
        leaf.rotation.y = ry;
        ctx.scene.add(leaf);
        return { leaf, sx };
      });
      const cv = document.createElement("canvas");
      cv.width = cv.height = 256;
      const g = cv.getContext("2d")!;
      g.translate(128, 128);
      g.fillStyle = "#130d0a";
      g.beginPath();
      g.arc(0, 0, 124, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = g.strokeStyle = e.main ? "#ffb27a" : "#f8e3c2";
      drawGlyph(g, e.glyph, 70);
      const face = new THREE.MeshBasicMaterial({ map: tex(cv), transparent: true });
      ctx.mats.push(face);
      const glyph = new THREE.Group();
      const front = new THREE.Mesh(new THREE.CircleGeometry(1.8, 48), face);
      ctx.geos.push(front.geometry);
      front.position.z = 0.21;
      glyph.add(mesh(prep(new THREE.CylinderGeometry(2.1, 2.1, 0.4, 48).rotateX(Math.PI / 2)), m.bronze), front);
      glyph.scale.setScalar(s);
      const base = new THREE.Vector3(0, oh + 5.6 * s + (big ? 2.4 : 0), 0.4).applyMatrix4(F);
      ctx.scene.add(glyph);
      const lamp: Fire = { p: new THREE.Vector3(0, oh * 0.45, -1.2).applyMatrix4(F), r: 6, soul: !e.main, big: false, lamp: true };
      fires.push(lamp);
      if (big) for (const sx of [-1, 1]) fire(new THREE.Vector3(sx * (ow / 2 + 6.2), 0, 3.6).applyMatrix4(F), true);
      const top = base.y + 2.2 * s;
      targets.push({ key: e.key, at: new THREE.Vector3(0, 0, 0.4).applyMatrix4(F).setY((top + O.y) / 2), w: (ow + 2.6 * s) * (0.35 + 0.65 * facing), h: (top - O.y) * COS });
      return { key: e.key, leaves, ry, glyph, face, glow, lamp, base, open: 0, big, i, focus: new THREE.Vector3(0, oh / 2 + 0.9, -2).applyMatrix4(F) };
    });
    fire(W(-12, 0, 10));
    fire(W(12.5, 0, -8));

    return {
      fires,
      targets,
      shot: { t: W(-3.5, 6.5, -3.5), h: 40, w: 50, floor: O.y },
      focus: (k) => doors.find((d) => d.key === k)!.focus,
      update(dt, st) {
        const t = ctx.time.value;
        for (const d of doors) {
          const picked = st.pick === d.key;
          const want = picked ? 1.25 : st.hot === d.key ? 0.42 : d.big ? 0.12 : 0;
          d.open += (want - d.open) * (1 - Math.exp(-dt * (picked ? 4 : 7)));
          for (const { leaf, sx } of d.leaves) leaf.rotation.y = d.ry - sx * d.open;
          d.glow.uniforms.uA.value = 0.35 + d.open * 2.2;
          d.lamp.r = 5 + d.open * 14;
          d.glyph.position.copy(d.base).setY(d.base.y + Math.sin(t * 1.6 + d.i * 1.3) * 0.3 + d.open * 0.8);
          d.glyph.rotation.y = Q + Math.sin(t * 0.9 + d.i) * 0.22 + (picked ? ease(st.pickT / 0.5) * Math.PI * 2 : 0);
          d.face.color.setScalar(d.big ? 1.6 + d.open * 1.4 : 0.85 + d.open * 2.6);
        }
      },
    };
  }

  // ---------- (b) the choice: three relics on pedestals, one per way out, each lit from within or by its own lamp.
  // The call's is an astrolabe of bronze rings turning around a coal (a quarter of its dial burns: fifteen minutes);
  // the work's a terracotta amphora banded with the running key; hello's a scroll with a wax seal.
  function relics(): Foot {
    platform(13, 12);
    B.add(m.stone, new THREE.CylinderGeometry(12, 12.4, 1.1, 64), M(O.x, O.y, O.z), false);
    B.add(m.pale, new THREE.CylinderGeometry(11.2, 11.4, 0.4, 64), M(O.x, O.y + 1.1, O.z), false);
    const L = M(O.x, O.y + 1.5, O.z, Q);
    const at = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyMatrix4(L);
    for (const sx of [-1, 1]) {
      B.add(m.pale, column(14, 0.6), M(O.x, O.y, O.z, Q).multiply(M(sx * 13.8, 0, -7)));
      fire(at(sx * 12.2, -1.5, 4.5), true);
    }
    const terra = ctx.mk("#a8512b", { k: "stone", rim: 1.1 });
    const ivory = ctx.mk("#e4d6bb", { k: "stone", rim: 1.2 });
    const wax = ctx.mk("#a3241b", { k: "stone", rim: 1.6 });
    const halos: Fire[] = [];
    const list = [exits[1], exits[0], exits[2]];
    const targets: Target[] = [];
    const items = list.map((e, i) => {
      const main = !!e.main;
      const x = (i - 1) * 9.4, z = main ? 1.2 : -0.8, ph = main ? 4.4 : 3.0;
      const P = L.clone().multiply(M(x, 0, z));
      const add = (mat: THREE.Material, g: THREE.BufferGeometry, l: THREE.Matrix4) => B.add(mat, g, P.clone().multiply(l));
      add(m.pale, box(4.6, 0.5, 4.6, 0.08), M(0, 0, 0));
      add(m.stone, box(3.6, ph - 1.0, 3.6, 0.12), M(0, 0.5, 0));
      add(m.trim, box(3.8, 0.7, 3.8, 0.05), M(0, ph - 1.2, 0));
      add(m.pale, box(4.4, 0.5, 4.4, 0.08), M(0, ph - 0.5, 0));
      const top = at(x, ph, z);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(2.1, 48).rotateX(-Math.PI / 2), glowMat(main ? "#ff6a24" : "#f2c48a", 0.4, "float f = smoothstep(0.5, 0.0, length(vUv - 0.5)); gl_FragColor = vec4(uC * f * f * uA, 1.0);"));
      ctx.geos.push(disc.geometry);
      disc.position.copy(top).setY(top.y + 0.03);
      ctx.scene.add(disc);
      const g = new THREE.Group();
      const spin: THREE.Object3D[] = [];
      if (e.glyph === "call") {
        const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95, 3), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff7a30").multiplyScalar(2.4) }));
        ctx.geos.push(core.geometry);
        ctx.mats.push(core.material as THREE.Material);
        g.add(core);
        [2.5, 2.05, 1.6].forEach((r, k) => {
          const ring = mesh(prep(new THREE.TorusGeometry(r, 0.15 - k * 0.02, 10, 72)), m.bronze);
          const pivot = new THREE.Group();
          pivot.add(ring);
          pivot.rotation.set(k === 1 ? Math.PI / 2 : 0.35 * k, k === 2 ? Math.PI / 2 : 0, 0.2 * k);
          g.add(pivot);
          spin.push(ring);
        });
        for (let t = 0; t < 12; t++) {
          const a = (t / 12) * Math.PI * 2;
          const tick = mesh(prep(box(0.16, t % 3 ? 0.35 : 0.6, 0.16, 0.03)).translate(0, -0.15, 0), m.bronze);
          tick.position.set(Math.cos(a) * 2.85, Math.sin(a) * 2.85, 0);
          tick.rotation.z = a - Math.PI / 2;
          spin[0].add(tick);
        }
        const arc = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.95, 32, 1, Math.PI / 2 - Math.PI / 2, Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff6a24").multiplyScalar(1.8), side: THREE.DoubleSide }));
        ctx.geos.push(arc.geometry);
        ctx.mats.push(arc.material as THREE.Material);
        spin[0].add(arc);
      } else if (e.glyph === "work") {
        const s = 2.5;
        g.add(mesh(prep(lathe(AMPHORA.map(([r, y]) => [r * s, y * s] as [number, number]), 40)).translate(0, (-1.8 * s) / 2, 0), terra));
        const band = lathe([[0.55 * s, 0.62 * s], [0.565 * s, 0.8 * s], [0.53 * s, 1.0 * s]], 40).translate(0, (-1.8 * s) / 2, 0);
        g.add(mesh(prep(band), m.trim));
        for (const sx of [-1, 1]) {
          const h = mesh(prep(new THREE.TorusGeometry(0.42 * s * 0.6, 0.09 * s, 8, 24, Math.PI)), terra);
          h.position.set(sx * 0.38 * s, 0.45 * s, 0);
          h.rotation.set(0, 0, sx > 0 ? -Math.PI / 2 : Math.PI / 2);
          g.add(h);
        }
      } else {
        const roll = new THREE.Group();
        roll.add(mesh(prep(new THREE.CylinderGeometry(0.62, 0.62, 4.2, 36).rotateZ(Math.PI / 2)), ivory));
        for (const sx of [-1, 1]) {
          const knob = mesh(prep(lathe([[0, 0], [0.28, 0], [0.3, 0.25], [0.2, 0.55], [0.32, 0.8], [0, 0.95]], 20).rotateZ((-sx * Math.PI) / 2)), m.wood);
          knob.position.x = sx * 2.1;
          roll.add(knob);
        }
        const sheet = new THREE.PlaneGeometry(3.7, 3.4, 1, 16);
        const sp = sheet.attributes.position;
        for (let k = 0; k < sp.count; k++) {
          const yy = sp.getY(k);
          const t = (1.7 - yy) / 3.4;
          sp.setXYZ(k, sp.getX(k), 0.1 - t * 3.0, 0.62 + Math.sin(t * Math.PI) * 0.35 - t * 0.2);
        }
        sheet.computeVertexNormals();
        const sh = mesh(prep(sheet), ivory);
        roll.add(sh);
        const seal = mesh(prep(new THREE.CylinderGeometry(0.42, 0.46, 0.14, 24).rotateX(Math.PI / 2)), wax);
        seal.position.set(0.6, -2.3, 1.2);
        roll.add(seal);
        roll.rotation.set(0.25, 0, -0.12);
        roll.position.y = 0.8;
        g.add(roll);
      }
      const base = top.clone().setY(top.y + (e.glyph === "work" ? 2.6 : 3.2));
      g.position.copy(base);
      g.rotation.y = Q;
      ctx.scene.add(g);
      const lamp: Fire = { p: base.clone().add(new THREE.Vector3(0, e.glyph === "call" ? 0 : 1.5, 0)).addScaledVector(DV, e.glyph === "call" ? 0 : 3), r: main ? 9 : 7, soul: false, big: false, lamp: true };
      fires.push(lamp);
      if (main) halos.push({ ...lamp, p: base.clone() });
      const lo = O.y + 1.5, hi = base.y + 3.4;
      targets.push({ key: e.key, at: new THREE.Vector3(base.x, (lo + hi) / 2, base.z), w: 6.6, h: (hi - lo) * COS });
      return { key: e.key, g, base, spin, lamp, disc, main, lift: 0, i, r0: lamp.r };
    });

    return {
      fires,
      halos,
      targets,
      shot: { t: W(0, 7.5, 0), h: 30, w: 44, floor: O.y },
      focus: (key) => items.find((c) => c.key === key)!.base,
      update(dt, st) {
        const t = ctx.time.value;
        for (const c of items) {
          const on = st.hot === c.key || st.pick === c.key ? 1 : 0;
          c.lift += (on - c.lift) * (1 - Math.exp(-dt * 7));
          const pk = st.pick === c.key ? ease(st.pickT / 0.7) : 0;
          const dim = (st.hot || st.pick) && !on ? 1 : 0;
          c.g.position.copy(c.base).setY(c.base.y + Math.sin(t * 1.2 + c.i * 2.1) * 0.25 + c.lift * 0.8 + pk * 1.2);
          c.g.rotation.y = Q + Math.sin(t * 0.5 + c.i) * 0.35 + c.lift * st.tilt.x * 0.4 + pk * Math.PI * 2;
          c.g.rotation.x = -st.tilt.y * 0.15 * c.lift;
          c.g.scale.setScalar(1 + c.lift * 0.08 + pk * 0.1);
          c.spin.forEach((s, k) => (s.rotation.z += dt * (0.25 + k * 0.18) * (1 + c.lift * 3) * (k % 2 ? -1 : 1)));
          c.lamp.r = c.r0 * (1 + c.lift * 0.6 + pk * 0.8) * (1 - 0.35 * dim);
          (c.disc.material as THREE.ShaderMaterial).uniforms.uA.value = (c.main ? 0.55 : 0.3) + c.lift * 0.9 + pk;
        }
      },
    };
  }

  // ---------- (c) the die: Jawad on the face toward you, a destination on each of the others; roll it or fling it
  function die(): Foot {
    platform(11, 12);
    const L = M(O.x, O.y, O.z, Q);
    B.add(m.pale, box(10, 0.7, 10, 0.1), L, false);
    B.add(m.stone, box(8, 3.2, 8, 0.14), L.clone().multiply(M(0, 0.7, 0)));
    B.add(m.trim, box(8.2, 1.0, 8.2, 0.05), L.clone().multiply(M(0, 2.4, 0)));
    B.add(m.pale, box(9, 0.6, 9, 0.1), L.clone().multiply(M(0, 3.9, 0)));
    for (const sx of [-1, 1]) fire(new THREE.Vector3(sx * 9.5, 0, 2.5).applyMatrix4(L), true);
    B.add(m.pale, column(9, 0.6, 1.8, 2), L.clone().multiply(M(-8.5, 0, -7)));
    B.add(m.pale, column(12, 0.6), L.clone().multiply(M(8, 0, -8)));

    const S = 6.4;
    const N = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)];
    const U = [N[2], N[2], N[5], N[4], N[2], N[2]];
    const order = [4, 2, 0, 1, 3, 5];
    const faceOf = (j: number) => exits[order.indexOf(j)];
    const cv = document.createElement("canvas");
    cv.width = 1536;
    cv.height = 1024;
    const g = cv.getContext("2d")!;
    const atlas = tex(cv);
    let portrait: HTMLImageElement | null = null;
    const paintAtlas = () => {
      for (let j = 0; j < 6; j++) {
        const e = faceOf(j);
        g.save();
        g.translate((j % 3) * 512, Math.floor(j / 3) * 512);
        g.fillStyle = "#ece1cd";
        g.fillRect(0, 0, 512, 512);
        g.fillStyle = "rgba(90,60,30,0.07)";
        for (let n = 0; n < 220; n++) g.fillRect((n * 977) % 512, (n * 613) % 512, 3 + (n % 5), 2);
        g.strokeStyle = e.main ? "#ff5a1c" : "#1a120d";
        g.lineWidth = 10;
        g.strokeRect(34, 34, 444, 444);
        if (e.main && portrait) {
          g.save();
          g.beginPath();
          g.arc(256, 206, 136, 0, Math.PI * 2);
          g.clip();
          g.drawImage(portrait, 120, 70, 272, 272);
          g.restore();
        } else {
          g.save();
          g.translate(256, 210);
          g.fillStyle = g.strokeStyle = e.main ? "#ff5a1c" : "#1a120d";
          drawGlyph(g, e.glyph, 108);
          g.restore();
        }
        g.fillStyle = e.main ? "#c8400f" : "#1a120d";
        g.textAlign = "center";
        g.font = "700 62px " + ctx.family;
        g.fillText(e.label, 256, 432, 400);
        g.restore();
      }
      atlas.needsUpdate = true;
    };
    paintAtlas();
    const img = new Image();
    img.onload = () => ((portrait = img), paintAtlas());
    img.src = "/design/jawad-ink-320.webp";
    const mat = new THREE.ShaderMaterial({
      uniforms: { tA: { value: atlas }, uHot: { value: 0 }, uL: { value: new THREE.Vector3(-0.5, 1, 0.12).normalize() }, uS: { value: S } },
      vertexShader: "varying vec3 vLP, vLN, vWN, vVN; void main() { vLP = position; vLN = normal; vWN = normalize(mat3(modelMatrix) * normal); vVN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `
        uniform sampler2D tA; uniform float uHot, uS; uniform vec3 uL; varying vec3 vLP, vLN, vWN, vVN;
        void main() {
          vec3 a = abs(vLN);
          int f = a.x > a.y && a.x > a.z ? (vLN.x > 0.0 ? 0 : 1) : a.y > a.z ? (vLN.y > 0.0 ? 2 : 3) : (vLN.z > 0.0 ? 4 : 5);
          vec3 Nf = f == 0 ? vec3(1.0, 0.0, 0.0) : f == 1 ? vec3(-1.0, 0.0, 0.0) : f == 2 ? vec3(0.0, 1.0, 0.0) : f == 3 ? vec3(0.0, -1.0, 0.0) : f == 4 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 0.0, -1.0);
          vec3 Uf = f == 2 ? vec3(0.0, 0.0, -1.0) : f == 3 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
          vec2 uv = clamp(vec2(dot(vLP, cross(Uf, Nf)), dot(vLP, Uf)) / uS + 0.5, 0.0, 1.0);
          vec2 cell = vec2(mod(float(f), 3.0), 1.0 - floor(float(f) / 3.0));
          vec3 c = texture2D(tA, (uv + cell) / vec2(3.0, 2.0)).rgb;
          float fl = smoothstep(0.9, 0.98, max(a.x, max(a.y, a.z)));
          c = mix(c * 0.8, c, fl);
          float lit = 0.5 + 0.5 * smoothstep(-0.05, 0.25, dot(normalize(vWN), uL));
          vec3 col = c * lit * vec3(1.02, 0.96, 0.88);
          float rim = 1.0 - clamp(abs(vVN.z), 0.0, 1.0);
          col += mix(vec3(0.39, 0.9, 1.0) * 0.5, vec3(1.0, 0.48, 0.18) * 0.7, smoothstep(-0.25, 0.25, vVN.x)) * smoothstep(0.6, 0.9, rim);
          col += vec3(1.0, 0.36, 0.1) * (1.0 - fl) * uHot * 1.6;
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    ctx.mats.push(mat);
    const body = mesh(box(S, S, S, 0.85).translate(0, -S / 2, 0), mat);
    const rest = new THREE.Vector3(0, 4.5 + 1.6 + S / 2, 0).applyMatrix4(L);
    body.position.copy(rest);
    body.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Q);
    ctx.scene.add(body);
    fires.push({ p: rest.clone().setY(rest.y - S / 2 - 0.6), r: 9, soul: true, big: false, lamp: true });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.2).rotateX(-Math.PI / 2), glowMat("#63e6ff", 0.5, "float f = smoothstep(0.5, 0.0, length((vUv - 0.5) * vec2(1.0, 4.0))); gl_FragColor = vec4(uC * f * (uA + 0.1 * sin(uTime * 2.0)), 1.0);"));
    ctx.geos.push(halo.geometry);
    halo.position.copy(rest).setY(O.y + 4.55);
    halo.rotation.y = Q;
    ctx.scene.add(halo);

    const up = new THREE.Vector3(0, 1, 0);
    const w = new THREE.Vector3(), tv = new THREE.Vector3();
    const dq = new THREE.Quaternion(), qT = new THREE.Quaternion().copy(body.quaternion), mA = new THREE.Matrix4(), mB = new THREE.Matrix4();
    let spin = false, settled = true, hop = 0, hv = 0, hot = 0, shown = 4;
    let onFace: (k: string) => void = () => {};
    const settleTo = () => {
      let best = 0, bd = -2;
      for (let j = 0; j < 6; j++) {
        const d = tv.copy(N[j]).applyQuaternion(body.quaternion).dot(DV);
        if (d > bd) (bd = d), (best = j);
      }
      mA.makeBasis(U[best].clone().cross(N[best]), U[best], N[best]);
      mB.makeBasis(up.clone().cross(DV), up, DV);
      qT.setFromRotationMatrix(mB.multiply(mA.transpose()));
      return best;
    };
    return {
      fires,
      targets: [
        { key: "die", at: rest.clone(), w: S * 1.5, h: S * 1.55 },
        { key: "pick", at: rest.clone().addScaledVector(RV, S * 1.05).setY(rest.y + 0.6), w: 0, h: 0 },
      ],
      shot: { t: rest.clone().addScaledVector(RV, 5.5).setY(O.y + 6.4), h: 27, w: 44, floor: O.y },
      focus: () => rest,
      roll(fx = 0, fy = 0) {
        const r = () => Math.random() - 0.5;
        if (fx || fy) w.copy(up).multiplyScalar(fx * 0.02).addScaledVector(RV, fy * 0.02);
        else w.set(r(), r(), r()).normalize().multiplyScalar(13 + Math.random() * 5);
        hv = fx || fy ? 6 : 13;
        spin = true;
        settled = false;
      },
      face(on) {
        onFace = on;
        on(faceOf(shown).key);
      },
      update(dt, st) {
        const t = ctx.time.value;
        hot += ((st.hot === "die" || st.drag ? 1 : 0) - hot) * (1 - Math.exp(-dt * 8));
        mat.uniforms.uHot.value = hot;
        if (st.drag && (st.drag.x || st.drag.y)) {
          const k = 0.012 / Math.max(dt, 0.008);
          dq.setFromAxisAngle(up, st.drag.x * 0.012);
          body.quaternion.premultiply(dq);
          dq.setFromAxisAngle(RV, st.drag.y * 0.012);
          body.quaternion.premultiply(dq);
          w.copy(up).multiplyScalar(st.drag.x * k).addScaledVector(RV, st.drag.y * k);
          st.drag.set(0, 0);
          settled = false;
          spin = true;
        } else if (spin && !st.drag) {
          const s = w.length();
          if (s > 2.6) {
            dq.setFromAxisAngle(tv.copy(w).divideScalar(s), s * dt);
            body.quaternion.premultiply(dq).normalize();
            w.multiplyScalar(Math.exp(-dt * 1.9));
          } else {
            const j = settleTo();
            if (j !== shown) (shown = j), onFace(faceOf(j).key);
            spin = false;
          }
        } else if (!settled && !st.drag) {
          body.quaternion.slerp(qT, 1 - Math.exp(-dt * 11));
          if (body.quaternion.angleTo(qT) < 0.002) settled = true;
        }
        hv -= 32 * dt;
        hop = Math.max(0, hop + hv * dt);
        if (hop === 0) hv = 0;
        body.position.copy(rest).setY(rest.y + hop + (settled ? Math.sin(t * 1.4) * 0.28 : 0) + hot * 0.6);
      },
    };
  }
}
