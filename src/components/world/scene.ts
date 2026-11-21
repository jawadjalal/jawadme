import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// The underworld behind the home page. Original work, modelled here in code: a gate under a broken pediment, a hall of
// fluted columns lit by braziers, a great arch over a stair that goes down to a river of souls, and a lit portal on the
// far bank. Toon shading on a four-step ramp, painted variation from world-space noise, an ink outline (inverted hull)
// and a hard rim light. The page's scroll walks the camera through four stops; the cursor sways it and carries a light.
// Texture slots (public/world/tex/manifest.json) take painted maps when they exist; until then everything is procedural.

export type WorldOpts = { progress: () => number; ready: () => void; small: boolean };

const INK = "#17120e";
const EMBER = new THREE.Color("#ff5314");
const SOUL = new THREE.Color("#5fe3ff");

const NOISE = `
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * n2(p); p = p * 2.03 + 1.7; a *= 0.5; } return s; }
`;

const TILES = `
vec2 tg = vWP.xz / vec2(2.4, 1.6);
tg.x += step(1.0, mod(floor(tg.y), 2.0)) * 0.5;
vec2 tf = fract(tg);
float te = min(min(tf.x, 1.0 - tf.x) * 2.4, min(tf.y, 1.0 - tf.y) * 1.6) + (n2(vWP.xz * 3.0) - 0.5) * 0.05;
diffuseColor.rgb *= (0.74 + 0.4 * h21(floor(tg))) * mix(0.25, 1.0, smoothstep(0.03, 0.07, te));
`;

// [camera, target] at each stop: the gate, the hall (the ring hangs here), the head of the stair, the river.
const KEYS: [number, number, number, number, number, number][] = [
  [0, 3.2, 23, 0, 5.6, -6],
  [0, 2.5, -3, 0, 3.1, -20],
  [0, 3.4, -24.5, 0, -6.5, -44],
  [0, -5.4, -41.5, 0, -5.2, -66],
];

export function mount(host: HTMLElement, o: WorldOpts) {
  const renderer = new THREE.WebGLRenderer({ antialias: !o.small, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, o.small ? 1.25 : 1.75));
  renderer.setClearColor(INK);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(INK);
  scene.fog = new THREE.Fog(INK, 16, 62);
  const camera = new THREE.PerspectiveCamera(55, 1.6, 0.1, 160);
  const time = { value: 0 };
  const px = { value: 600 };

  const ramp = new THREE.DataTexture(new Uint8Array([26, 74, 150, 236]), 4, 1, THREE.RedFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;

  const mats: THREE.Material[] = [];
  const geos: THREE.BufferGeometry[] = [];
  const toon = (color: string, rim: THREE.Color = EMBER, tiles = false) => {
    const m = new THREE.MeshToonMaterial({ color, gradientMap: ramp });
    const uRim = { value: rim.clone().multiplyScalar(tiles ? 0 : 0.5) };
    m.onBeforeCompile = (s) => {
      s.uniforms.uRim = uRim;
      s.vertexShader = "varying vec3 vWP;\nvarying vec3 vWN;\n" + s.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vec3 n0 = objectNormal;
        #ifdef USE_INSTANCING
          vWP = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
          n0 = mat3(instanceMatrix) * n0;
        #else
          vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;
        #endif
        vWN = normalize(mat3(modelMatrix) * n0);`,
      );
      s.fragmentShader = "varying vec3 vWP;\nvarying vec3 vWN;\nuniform vec3 uRim;\n" + NOISE + s.fragmentShader
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          float pb = fbm(vec2(vWP.x * 0.9 + vWP.z * 0.9, vWP.y * 3.2));
          float pc = fbm(vWP.xz * 0.35 + vWP.y * 0.4);
          diffuseColor.rgb *= mix(0.68, 1.25, pb * 0.6 + pc * 0.5);
          ${tiles ? TILES : ""}`,
        )
        .replace(
          "#include <dithering_fragment>",
          `#include <dithering_fragment>
          float rr = 1.0 - max(dot(normal, normalize(vViewPosition)), 0.0);
          gl_FragColor.rgb += uRim * smoothstep(0.58, 0.64, rr) * (1.0 - 0.75 * fogFactor) * smoothstep(0.6, 0.2, abs(vWN.y));`,
        );
    };
    mats.push(m);
    return m;
  };
  const outline = new THREE.MeshBasicMaterial({ color: 0x050302, side: THREE.BackSide });
  outline.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed += normal * 0.045;");
  };
  mats.push(outline);

  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const at = (x: number, y: number, z: number, sx = 1, sy = sx, sz = sx, ry = 0, rx = 0, rz = 0) =>
    new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), q.setFromEuler(e.set(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
  const place = (geo: THREE.BufferGeometry, mat: THREE.Material, list: THREE.Matrix4[], ink = true) => {
    geos.push(geo);
    const m = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((x, i) => m.setMatrixAt(i, x));
    scene.add(m);
    if (ink) {
      const l = new THREE.InstancedMesh(geo, outline, list.length);
      l.instanceMatrix = m.instanceMatrix;
      scene.add(l);
    }
    return m;
  };

  const flute = (g: THREE.BufferGeometry, top: (a: number) => number = () => 0) => {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), y = p.getY(i);
      const a = Math.atan2(z, x);
      const r = Math.hypot(x, z);
      const f = r > 0.2 ? 1 - 0.07 * Math.pow(0.5 + 0.5 * Math.cos(a * 16), 2) : 1;
      p.setXYZ(i, x * f, y > 0 ? y - top(a) : y, z * f);
    }
    g.computeVertexNormals();
    return g;
  };
  const column = (h: number, broken = false) => {
    const shaft = flute(new THREE.CylinderGeometry(0.42, 0.5, h, 48, 4), broken ? (a) => 0.9 * Math.abs(Math.sin(a * 2.5 + 1.3)) + 0.25 * Math.abs(Math.sin(a * 9)) : undefined);
    shaft.translate(0, h / 2 + 0.5, 0);
    const parts = [
      new THREE.BoxGeometry(1.4, 0.3, 1.4).translate(0, 0.15, 0),
      new THREE.CylinderGeometry(0.6, 0.66, 0.2, 32).translate(0, 0.4, 0),
      shaft,
    ];
    if (!broken) {
      parts.push(new THREE.CylinderGeometry(0.74, 0.46, 0.36, 32).translate(0, h + 0.68, 0));
      parts.push(new THREE.BoxGeometry(1.62, 0.28, 1.62).translate(0, h + 1.0, 0));
    }
    return mergeGeometries(parts)!;
  };
  const arch = (w: number, h: number, iw: number, spring: number, d: number) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0).lineTo(w / 2, 0).lineTo(w / 2, h).lineTo(-w / 2, h).lineTo(-w / 2, 0);
    const hole = new THREE.Path();
    hole.moveTo(-iw / 2, 0).lineTo(-iw / 2, spring).absarc(0, spring, iw / 2, Math.PI, 0, true).lineTo(iw / 2, 0).lineTo(-iw / 2, 0);
    s.holes.push(hole);
    return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 28 }).translate(0, 0, -d / 2);
  };

  const stone = toon("#7d6b5b");
  const pale = toon("#9a8673");
  const floor = toon("#3e332b", EMBER, true);
  const far = toon("#3d4b52", SOUL);
  const dark = toon("#2d241e", new THREE.Color(0));
  const block = toon("#7d6b5b", new THREE.Color(0));

  // floors, the landing and the far bank
  const plane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  place(plane, floor, [at(0, 0, 3, 90, 1, 60), at(0, -8, -43.2, 60, 1, 3.6), at(0, -8, -78, 120, 1, 30)], false);
  place(new THREE.BoxGeometry(1, 1, 1), dark, [at(0, -8.6, -43.2, 40, 1.2, 3.6), at(14.1, -4.25, -34.5, 20, 8.5, 15), at(-14.1, -4.25, -34.5, 20, 8.5, 15), at(13.5, 1.6, -10, 1.2, 3.2, 34), at(-13.5, 1.6, -10, 1.2, 3.2, 34)]);

  // the stair down, and its balustrades
  const steps: THREE.Matrix4[] = [];
  for (let i = 0; i < 16; i++) {
    const top = -0.5 * (i + 1);
    steps.push(at(0, (top - 8.6) / 2, -27 - 0.9 * i - 0.45, 7, top + 8.6, 0.9));
  }
  place(new THREE.BoxGeometry(1, 1, 1), pale, steps);
  const slope = Math.atan2(8, 14.4);
  place(new THREE.BoxGeometry(1, 1, 1), block, [at(3.8, -3.4, -34.2, 0.6, 1.3, 16.6, 0, -slope), at(-3.8, -3.4, -34.2, 0.6, 1.3, 16.6, 0, -slope)]);

  // the colonnade: the gate's two, two rows down the hall, a ruined outer row
  const hallZ = [-4, -8, -12, -16, -20, -24];
  const whole: THREE.Matrix4[] = [];
  const ruin: THREE.Matrix4[] = [];
  for (const z of hallZ) {
    for (const x of [-6.5, 6.5]) ((x > 0 && z === -12) || (x < 0 && z === -20) ? ruin : whole).push(at(x, 0, z, 1, 1, 1, z * 0.7));
    for (const x of [-10.5, 10.5]) (Math.abs(z + x) % 3 < 1.5 ? ruin : whole).push(at(x, 0, z - 2, 0.95, 0.95, 0.95, z));
  }
  place(column(7), pale, whole);
  place(column(9), pale, [at(-3.4, 0, 0, 1.15), at(3.4, 0, 0, 1.15)]);
  place(column(2.6, true), pale, ruin);
  const drum = flute(new THREE.CylinderGeometry(0.46, 0.46, 1.1, 40, 1));
  place(drum, pale, [at(7.6, 0.46, -11, 1, 1, 1, 0.4, 0, Math.PI / 2), at(9.1, 0.46, -12.6, 1, 1, 1, -0.9, 0, Math.PI / 2), at(-7.8, 0.46, -21.2, 1, 1, 1, 1.2, 0, Math.PI / 2), at(-5.2, 0.55, 5, 1, 1, 1, 0.2, 0.3, Math.PI / 2)]);
  const beam = new THREE.BoxGeometry(1, 1, 1);
  place(beam, block, [at(-6.5, 8.62, -5.6, 1.7, 0.7, 8), at(-6.5, 8.62, -15.2, 1.7, 0.7, 7.2), at(6.5, 8.62, -6.2, 1.7, 0.7, 6.8), at(6.5, 8.62, -19.8, 1.7, 0.7, 10.4), at(0, 11.7, 0, 9.6, 0.95, 1.9), at(-6.5, 0.5, -8.4, 1.6, 0.6, 2.2, 0.5, 0, 0.12)]);

  // the broken pediment over the gate, and the piece that fell
  const ped = new THREE.Shape();
  [[-5, 0], [2.9, 0], [2.4, 0.35], [2.75, 0.62], [1.9, 0.95], [1.4, 1.5], [0.7, 1.7], [0, 2.4]].forEach(([x, y], i) => (i ? ped.lineTo(x, y) : ped.moveTo(x, y)));
  const pedGeo = new THREE.ExtrudeGeometry(ped, { depth: 1.5, bevelEnabled: false }).translate(0, 0, -0.75);
  place(pedGeo, stone, [at(0, 12.17, 0)]);
  const chip = new THREE.Shape();
  [[0, 0], [2.4, 0], [0.4, 1.3]].forEach(([x, y], i) => (i ? chip.lineTo(x, y) : chip.moveTo(x, y)));
  place(new THREE.ExtrudeGeometry(chip, { depth: 1.4, bevelEnabled: false }), stone, [at(4.6, 0, 6, 1, 1, 1, 0.9, -Math.PI / 2 + 0.25)]);

  // the great arch over the stair, the portal on the far bank, and the far ruins
  place(arch(13, 13.5, 7.6, 6.6, 1.8), stone, [at(0, 0, -26.4)]);
  place(arch(20, 21, 9.5, 8, 2.4), far, [at(0, -8, -70)]);
  const farCols: THREE.Matrix4[] = [];
  for (const x of [-15, -11.5, 11.5, 15]) farCols.push(at(x, -8, -67, 1.25, 1.25, 1.25, x));
  place(column(9), far, farCols);
  place(column(3.4, true), far, [at(-19, -8, -64, 1.2), at(18.5, -8, -65, 1.1, 1.1, 1.1, 2)]);

  // rubble
  const rubble: THREE.Matrix4[] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 34; i++) {
    const side = rnd() < 0.5 ? -1 : 1;
    const z = 8 - rnd() * 34;
    rubble.push(at(side * (4.8 + rnd() * 7), 0.12, z, 0.25 + rnd() * 0.5, 0.2 + rnd() * 0.35, 0.25 + rnd() * 0.5, rnd() * 6, rnd(), rnd()));
  }
  place(new THREE.DodecahedronGeometry(1, 0), stone, rubble);

  // braziers: four of fire on this side, two of souls on the far bank
  const pans: [number, number, number, number][] = [[-5.4, 0, 4, 0], [5.4, 0, 4, 0], [-5.2, 0, -11.5, 0], [5.2, 0, -11.5, 0], [-6.6, -8, -63.5, 1], [6.6, -8, -63.5, 1]];
  const bowl = new THREE.LatheGeometry([0.05, 0.3, 0.68, 0.92, 1.0, 0.94, 0.7, 0.05].map((x, i) => new THREE.Vector2(x, [0, 0.04, 0.2, 0.42, 0.62, 0.68, 0.5, 0.42][i])), 28);
  const stand = mergeGeometries([new THREE.CylinderGeometry(0.55, 0.62, 0.18, 24).translate(0, 0.09, 0), new THREE.CylinderGeometry(0.07, 0.13, 2.1, 12).translate(0, 1.15, 0), bowl.clone().translate(0, 2.1, 0)])!;
  geos.push(bowl);
  place(stand, dark, pans.map(([x, y, z]) => at(x, y, z)));

  // light
  scene.add(new THREE.HemisphereLight("#4a3a2e", "#0c0807", 1.1));
  const moon = new THREE.DirectionalLight("#8fd6ff", 1.4);
  moon.position.set(-8, 16, -60);
  scene.add(moon);
  const key = new THREE.DirectionalLight("#ffb27a", 0.55);
  key.position.set(10, 18, 20);
  scene.add(key);
  const fires = pans.map(([x, y, z, soul]) => {
    const l = new THREE.PointLight(soul ? "#5fe3ff" : "#ff8a3a", soul ? 60 : 30, 22, 1.6);
    l.position.set(x, y + 3.1, z);
    scene.add(l);
    return l;
  });
  const hand = new THREE.PointLight("#ffc08a", 16, 16, 1.6);
  scene.add(hand);

  // fire, embers, dust and souls: one points material, each system with its own box, speed and colour
  const pts = (n: number, min: number[], size: number[], o: { color: THREE.Color; hot?: THREE.Color; r: number; up: number; sway: number; soft: number; a: number; fire?: number[][] }) => {
    const pos = new Float32Array(n * 3);
    const sd = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      if (o.fire) {
        const f = o.fire[i % o.fire.length];
        pos.set([f[0], f[1], f[2]], i * 3);
      } else pos.set([min[0] + rnd() * size[0], min[1] + rnd() * size[1], min[2] + rnd() * size[2]], i * 3);
      sd[i] = rnd();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
    geos.push(g);
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: time, uPx: px, uC: { value: o.color }, uH: { value: o.hot ?? o.color }, uMin: { value: new THREE.Vector3(...min) }, uSize: { value: new THREE.Vector3(...size) }, uR: { value: o.r }, uUp: { value: o.up }, uSway: { value: o.sway }, uSoft: { value: o.soft }, uA: { value: o.a }, uFire: { value: o.fire ? 1 : 0 } },
      vertexShader: `
        uniform float uTime, uPx, uR, uUp, uSway, uFire; uniform vec3 uMin, uSize;
        attribute float aSeed; varying float vT;
        void main() {
          vec3 p = position;
          float t;
          if (uFire > 0.5) {
            t = fract(uTime * (0.7 + aSeed * 0.5) + aSeed * 7.13);
            float an = aSeed * 40.0, rd = (1.0 - t) * 0.5 * fract(aSeed * 13.7);
            p += vec3(cos(an) * rd + sin(uTime * 3.0 + aSeed * 20.0) * 0.1 * t, 2.45 + t * 1.7, sin(an) * rd);
          } else {
            p.y = uMin.y + mod(p.y - uMin.y + uTime * uUp * (0.6 + aSeed * 0.8), uSize.y);
            p.x += sin(uTime * 0.5 + aSeed * 31.0) * uSway;
            p.z += cos(uTime * 0.37 + aSeed * 17.0) * uSway;
            t = (p.y - uMin.y) / uSize.y;
          }
          vT = t;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float s = uFire > 0.5 ? (1.0 - t * 0.75) : (0.5 + fract(aSeed * 5.1));
          gl_PointSize = -mv.z < 2.0 ? 0.0 : clamp(uR * s * uPx / -mv.z, 1.5, 40.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uC, uH; uniform float uSoft, uA, uFire; varying float vT;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float edge = mix(1.0 - smoothstep(0.34, 0.4, d), pow(1.0 - d * 2.0, 2.0), uSoft);
          float life = uFire > 0.5 ? (1.0 - vT) : smoothstep(0.0, 0.12, vT) * smoothstep(1.0, 0.7, vT);
          vec3 c = uFire > 0.5 ? mix(uH, uC, vT) : uC;
          gl_FragColor = vec4(c * edge * life * uA, 1.0);
        }`,
    });
    mats.push(m);
    const p = new THREE.Points(g, m);
    p.frustumCulled = false;
    scene.add(p);
  };
  const warm = pans.filter((p) => !p[3]);
  const cold = pans.filter((p) => p[3]);
  pts(o.small ? 160 : 320, [0, 0, 0], [1, 1, 1], { color: new THREE.Color("#ff4a12"), hot: new THREE.Color("#ffd27a"), r: 0.42, up: 0, sway: 0, soft: 0, a: 1.3, fire: warm.map(([x, y, z]) => [x, y, z]) });
  pts(o.small ? 80 : 150, [0, 0, 0], [1, 1, 1], { color: new THREE.Color("#1d8fbf"), hot: new THREE.Color("#c8fbff"), r: 0.5, up: 0, sway: 0, soft: 0, a: 1.3, fire: cold.map(([x, y, z]) => [x, y, z]) });
  pts(o.small ? 140 : 300, [-14, -1, -30], [28, 15, 42], { color: EMBER, r: 0.07, up: 0.55, sway: 0.5, soft: 0, a: 1.2 });
  pts(o.small ? 120 : 260, [-12, 0, -28], [24, 11, 36], { color: new THREE.Color("#8a7a68"), r: 0.05, up: 0.04, sway: 0.6, soft: 1, a: 0.5 });
  pts(o.small ? 90 : 170, [-22, -8.4, -64], [44, 10, 20], { color: SOUL, r: 0.34, up: 0.3, sway: 0.8, soft: 1, a: 0.55 });
  pts(o.small ? 24 : 48, [-3, -8, -42], [6, 14, 8], { color: SOUL, r: 0.22, up: 0.45, sway: 0.4, soft: 1, a: 0.45 });

  // shafts of light into the hall, and the glow in the portal
  const glowMat = (c: THREE.Color, a: number, round: boolean) => {
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uC: { value: c }, uA: { value: a }, uTime: time },
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: round
        ? "uniform vec3 uC; uniform float uA, uTime; varying vec2 vUv; void main() { float d = length((vUv - 0.5) * vec2(1.0, 1.7)); float f = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(uC * f * f * uA * (0.9 + 0.1 * sin(uTime * 1.3)), 1.0); }"
        : "uniform vec3 uC; uniform float uA; varying vec2 vUv; void main() { float f = sin(vUv.x * 3.14159) * pow(vUv.y, 1.6); gl_FragColor = vec4(uC * f * uA, 1.0); }",
    });
    mats.push(m);
    return m;
  };
  const shaft = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
  geos.push(shaft);
  const shafts: [number, number, number, number][] = [[-2.2, -9, 0.35, 0.5], [2.6, -17, -0.3, 0.42], [-1.2, -22, 0.2, 0.3]];
  for (const [x, z, tilt, a] of shafts) {
    for (const ry of [0, Math.PI / 2]) {
      const m = new THREE.Mesh(shaft, glowMat(new THREE.Color("#ffcf9a"), a * 0.32, false));
      m.position.set(x, 0, z);
      m.scale.set(3.4, 16, 1);
      m.rotation.set(0, ry + 0.4, tilt);
      scene.add(m);
    }
  }
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(16, 22), glowMat(SOUL, 1.1, true));
  geos.push(portal.geometry);
  portal.position.set(0, 0.5, -70.8);
  scene.add(portal);

  // the river
  const riverMat = new THREE.ShaderMaterial({
    uniforms: { uTime: time, uFog: { value: new THREE.Color(INK) }, uSoul: { value: SOUL } },
    vertexShader: "varying vec3 vWP; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
    fragmentShader: `
      uniform float uTime; uniform vec3 uFog, uSoul; varying vec3 vWP;
      ${NOISE}
      void main() {
        vec2 p = vWP.xz * vec2(0.16, 0.42);
        p.x -= uTime * 0.22;
        float n = fbm(p);
        float s = fbm(p * 2.4 + vec2(-uTime * 0.35, n));
        float streak = smoothstep(0.6, 0.64, n * 0.55 + s * 0.5);
        vec3 c = vec3(0.025, 0.06, 0.07) + uSoul * (streak * 0.55 + smoothstep(0.45, 0.85, n) * 0.12);
        c += uSoul * 0.35 * smoothstep(9.0, 0.0, abs(vWP.x)) * smoothstep(-58.0, -70.0, vWP.z) * (0.6 + 0.4 * s);
        float fd = smoothstep(16.0, 62.0, length(vWP - cameraPosition));
        gl_FragColor = vec4(mix(c, uFog, fd * 0.85), 1.0);
      }`,
  });
  mats.push(riverMat);
  const river = new THREE.Mesh(new THREE.PlaneGeometry(140, 19).rotateX(-Math.PI / 2), riverMat);
  geos.push(river.geometry);
  river.position.set(0, -8.35, -54.5);
  scene.add(river);

  // painted texture slots
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(260, 110), new THREE.MeshBasicMaterial({ color: INK, fog: false }));
  geos.push(sky.geometry);
  mats.push(sky.material);
  sky.position.set(0, 20, -110);
  scene.add(sky);
  const loader = new THREE.TextureLoader();
  const slots: Record<string, (t: THREE.Texture) => void> = {
    stone: (t) => [stone, pale, dark].forEach((m) => ((m.map = t), (m.needsUpdate = true))),
    floor: (t) => ((t.repeat.set(24, 16), (floor.map = t)), (floor.needsUpdate = true)),
    far: (t) => ((far.map = t), (far.needsUpdate = true)),
    sky: (t) => ((sky.material.map = t), (sky.material.color.set("#ffffff")), (sky.material.needsUpdate = true)),
  };
  let gone = false;
  fetch("/world/tex/manifest.json")
    .then((r) => (r.ok ? r.json() : {}))
    .then((j: Record<string, string | null>) => {
      for (const [k, file] of Object.entries(j)) {
        if (!file || !slots[k] || gone) continue;
        loader.load("/world/tex/" + file, (t) => {
          if (gone) return t.dispose();
          t.colorSpace = THREE.SRGBColorSpace;
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          slots[k](t);
        });
      }
    })
    .catch(() => {});

  // camera, cursor and loop
  const K = KEYS.map((k) => [new THREE.Vector3(k[0], k[1], k[2]), new THREE.Vector3(k[3], k[4], k[5])]);
  const want = new THREE.Vector3();
  const look = new THREE.Vector3();
  const cur = new THREE.Vector3().copy(K[0][0]);
  const curLook = new THREE.Vector3().copy(K[0][1]);
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const move = (ev: PointerEvent) => {
    ptr.tx = (ev.clientX / window.innerWidth) * 2 - 1;
    ptr.ty = -((ev.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener("pointermove", move, { passive: true });

  const size = () => {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 72 : 55;
    camera.updateProjectionMatrix();
    px.value = (h * renderer.getPixelRatio()) / (2 * Math.tan((camera.fov * Math.PI) / 360));
  };
  size();
  const ro = new ResizeObserver(size);
  ro.observe(host);

  const clock = new THREE.Clock();
  let shown = false;
  const tick = () => {
    const dt = Math.min(clock.getDelta(), 0.1);
    time.value += dt;
    const p = Math.min(3, Math.max(0, o.progress()));
    const i = Math.min(2, Math.floor(p));
    let f = p - i;
    f = f * f * (3 - 2 * f);
    want.lerpVectors(K[i][0], K[i + 1][0], f);
    look.lerpVectors(K[i][1], K[i + 1][1], f);
    ptr.x += (ptr.tx - ptr.x) * (1 - Math.exp(-dt * 3));
    ptr.y += (ptr.ty - ptr.y) * (1 - Math.exp(-dt * 3));
    want.x += ptr.x * 0.6;
    want.y += ptr.y * 0.3;
    const k = 1 - Math.exp(-dt * 5);
    cur.lerp(want, k);
    curLook.lerp(look, k);
    camera.position.copy(cur);
    camera.lookAt(curLook);
    hand.position.set(curLook.x + ptr.x * 7, curLook.y + 1 + ptr.y * 4, curLook.z + 5);
    fires.forEach((l, j) => (l.intensity = (pans[j][3] ? 60 : 30) * (0.86 + 0.14 * Math.sin(time.value * 11 + j * 1.7) * Math.sin(time.value * 6.3 + j))));
    renderer.render(scene, camera);
    if (!shown) {
      shown = true;
      o.ready();
    }
  };

  let seen = true;
  const run = () => renderer.setAnimationLoop(seen && !document.hidden ? tick : null);
  const io = new IntersectionObserver(([en]) => {
    seen = en.isIntersecting;
    run();
  });
  io.observe(host);
  document.addEventListener("visibilitychange", run);
  renderer.compile(scene, camera);
  run();

  return () => {
    gone = true;
    renderer.setAnimationLoop(null);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", run);
    window.removeEventListener("pointermove", move);
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    ramp.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}

