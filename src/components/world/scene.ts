import * as THREE from "three";
import { buildHall, type Shot, type Slot } from "./hall";
import { buildFoot, type Exit, type FootState, type FootV } from "./foot";
import { Batch } from "./kit";
import { COURT, DV, HALL, LAND, Q, RV, SIGN, THEATRE, buildMap, type Fire, type Mats } from "./map";
import { EMBER, INK, NL, NOISE, SOUL, paint, setMap, shared, type Kind } from "./kit";

// The underworld under the home page, seen the way an isometric action game sees its rooms: an orthographic camera
// at a fixed yaw of 45 degrees and a pitch of 34, panning across one hand-built map (./map) chamber by chamber as the
// page scrolls. One canvas does everything, the ads included (./hall). The frame is drawn to a target with its depth,
// then finished in one pass: an ink line wherever depth breaks or folds (the Laplacian of orthographic depth is zero
// on any flat face, so only real edges ink), bloom on fire and souls, smoke in the void, vignette and grain.

export type WorldAd = { id: string; campaign: string; alt: string; src: string };
/** The footer's chamber alone, on flat ink, in place of the world: which take, its exits, the link laid over each target, and what to do on a pick or a roll. */
export type FootOpts = { v: FootV; exits: Exit[]; el: (key: string) => HTMLElement | null; go: (href: string) => void; face: (key: string) => void };
export type WorldOpts = { progress: () => number; ads: WorldAd[]; small: boolean; still: boolean; dim: boolean; open: (id: string) => void; ready: () => void; foot?: FootOpts };

const PITCH = (34 * Math.PI) / 180;
const DIR = new THREE.Vector3(Math.sin(Q) * Math.cos(PITCH), Math.sin(PITCH), Math.cos(Q) * Math.cos(PITCH));
const UP = new THREE.Vector3(-Math.sin(PITCH) * Math.sin(Q), Math.cos(PITCH), -Math.sin(PITCH) * Math.cos(Q));
const NEAR = 1, FAR = 700;

export function mount(host: HTMLElement, o: WorldOpts) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
  const dpr = Math.min(window.devicePixelRatio || 1, o.still ? 2 : o.small ? 1.25 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  host.appendChild(renderer.domElement);
  const canvas = renderer.domElement;
  const scene = new THREE.Scene();
  scene.background = INK;
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, NEAR, FAR);
  const S = shared();
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const texs: THREE.Texture[] = [];

  const ramp = new THREE.DataTexture(new Uint8Array([26, 72, 150, 240]), 4, 1, THREE.RedFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  texs.push(ramp);
  const mk = (color: string, kind: Kind) => {
    const mm = paint(S, ramp, color, kind);
    mats.push(mm);
    return mm;
  };
  const m: Mats = {
    stone: mk("#7a7068", { k: "stone" }),
    pale: mk("#a69d90", { k: "stone", rim: 1.2 }),
    dark: mk("#302a29", { k: "stone", rim: 0.8 }),
    rock: mk("#2d2725", { k: "rock" }),
    bronze: mk("#8a5f33", { k: "stone", rim: 1.4 }),
    wood: mk("#5e3e27", { k: "stone", rim: 0.8 }),
    trim: mk("#90867a", { k: "trim", y0: 14, band: 1.2 }),
    court: mk("#504a46", { k: "floor", rect: [COURT.x0, COURT.z0, COURT.x1, COURT.z1], border: 2.4, tile: 2.6 }),
    hall: mk("#4b4541", { k: "floor", rect: [HALL.x0, HALL.z0, HALL.x1 + 22, HALL.z1], border: 2.2, tile: 2.4 }),
    orch: mk("#1c1817", { k: "ring", c: [THEATRE.c.x, THEATRE.c.z], r: THEATRE.r, border: 2.4, tile: 2.6 }),
    land: mk("#47413d", { k: "floor", rect: [LAND.c.x - LAND.half, LAND.c.z - LAND.half, LAND.c.x + LAND.half, LAND.c.z + LAND.half], border: 1.8, tile: 2.2 }),
  };

  const B = new Batch();
  const world = o.foot ? null : buildMap(B, m);
  const hall = o.foot ? null : buildHall({ B, m, scene, geos, mats, time: S.time, n: o.ads.length, pitch: PITCH });
  const floor = mk("#47413d", { k: "floor", rect: [-15, -15, 15, 15], border: 2, tile: 2.4 });
  const foot = o.foot ? buildFoot({ B, m, floor, scene, geos, mats, texs, time: S.time, family: getComputedStyle(host).fontFamily, O: new THREE.Vector3() }, o.foot.v, o.foot.exits) : null;
  B.build(scene, geos);
  const fires: Fire[] = [...(world?.fires ?? []), ...(hall?.fires ?? []), ...(foot?.fires ?? [])];
  const door = world?.door ?? new THREE.Vector3();

  // light: a cool sky and warm ground for the shadows, one warm key that casts, and the fires (in the shader)
  scene.add(new THREE.HemisphereLight("#6660a6", "#140c0a", 1.15));
  const key = new THREE.DirectionalLight("#ffcf9e", 1.1);
  const LDIR = new THREE.Vector3(-0.5, 1, 0.12).normalize();
  key.castShadow = true;
  key.shadow.mapSize.set(o.small ? 1024 : 2048, o.small ? 1024 : 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.05;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 260;
  scene.add(key, key.target);

  // the river of souls, the glow in the gate, and the fire, ember, soul and halo particles
  const riverMat = new THREE.ShaderMaterial({
    uniforms: { uTime: S.time, uSoul: { value: SOUL } },
    vertexShader: "varying vec3 vWP; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
    fragmentShader: `
      uniform float uTime; uniform vec3 uSoul; varying vec3 vWP;
      ${NOISE}
      void main() {
        float al = dot(vWP.xz, vec2(0.7071, -0.7071)), ac = dot(vWP.xz, vec2(0.7071, 0.7071)) - ${(LAND.c.x + LAND.c.z) * 0.7071 + 15};
        vec2 p = vec2(al * 0.035 - uTime * 0.09, ac * 0.42);
        float n = fbm(p + vec2(0.0, fbm(p * 1.7 + uTime * 0.03) * 0.8));
        float s = fbm(vec2(al * 0.11 - uTime * 0.32, ac * 1.3) + n);
        float lanes = smoothstep(0.62, 0.7, s) * smoothstep(0.35, 0.6, n);
        float bank = smoothstep(13.0, 8.5, abs(ac));
        vec3 c = mix(vec3(0.006, 0.02, 0.03), vec3(0.02, 0.09, 0.12), smoothstep(0.3, 0.8, n));
        c += uSoul * (lanes * 1.1 + smoothstep(0.78, 0.95, s) * 0.6);
        c += uSoul * 0.25 * smoothstep(0.5, 0.0, abs(abs(ac) - 10.5)) * (0.5 + 0.5 * s);
        c *= mix(0.15, 1.0, bank);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  mats.push(riverMat);
  const riverGeo = new THREE.PlaneGeometry(520, 26).rotateX(-Math.PI / 2).rotateY(Q);
  geos.push(riverGeo);
  const river = new THREE.Mesh(riverGeo, riverMat);
  river.position.copy(LAND.c).addScaledVector(DV, 15).setY(LAND.c.y - 1.7);
  if (!foot) scene.add(river);

  const glowMat = (c: THREE.Color, a: number) => {
    const g = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uC: { value: c }, uA: { value: a }, uTime: S.time },
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "uniform vec3 uC; uniform float uA, uTime; varying vec2 vUv; void main() { vec2 d = (vUv - vec2(0.5, 0.32)) * vec2(1.0, 0.7); float f = smoothstep(0.62, 0.0, length(d)); gl_FragColor = vec4(uC * (f * f * 1.4 + 0.25) * uA * (0.92 + 0.08 * sin(uTime * 1.7)), 1.0); }",
    });
    mats.push(g);
    return g;
  };
  for (const gl of world?.glows ?? []) {
    const geo = new THREE.PlaneGeometry(gl.w, gl.h);
    geos.push(geo);
    const mesh = new THREE.Mesh(geo, glowMat(gl.soul ? SOUL : EMBER, 1.2));
    mesh.matrixAutoUpdate = false;
    mesh.matrix.copy(gl.m);
    scene.add(mesh);
  }

  const ign = { value: foot ? 99 : o.still ? (o.dim ? -99 : 99) : -0.5 };
  const doorU = { value: door };
  const center = { value: new THREE.Vector3() };
  const ppu = { value: 60 };
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const points = (n: number, at: (i: number) => [number, number, number], u: Record<string, THREE.IUniform>, vs: string, fs: string) => {
    const pos = new Float32Array(n * 3);
    const sd = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos.set(at(i), i * 3);
      sd.set([rnd(), rnd(), rnd()], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(sd, 3));
    geos.push(g);
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: S.time, uC: center, uPx: ppu, uIgn: ign, uDoor: doorU, ...u }, vertexShader: "uniform float uTime, uPx, uIgn; uniform vec3 uC, uDoor; attribute vec3 aSeed; varying float vT; varying vec3 vS;\n" + vs, fragmentShader: "varying float vT; varying vec3 vS;\n" + fs });
    mats.push(mat);
    const p = new THREE.Points(g, mat);
    p.frustumCulled = false;
    scene.add(p);
  };
  const flameVS = `
    void main() {
      vS = aSeed;
      float t = fract(uTime * (0.8 + aSeed.x * 0.6) + aSeed.y * 7.13);
      float an = aSeed.z * 40.0, rd = (1.0 - t) * 0.55 * fract(aSeed.x * 13.7);
      vec3 p = position + vec3(cos(an) * rd + sin(uTime * 3.0 + aSeed.y * 20.0) * 0.12 * t, t * 2.1, sin(an) * rd);
      vT = t;
      float ig = clamp((uIgn - 0.15 - length(position - uDoor) / 26.0) / 0.45, 0.0, 1.0);
      gl_PointSize = uPx * 0.62 * (1.0 - t * 0.7) * (0.7 + aSeed.z * 0.6) * ig;
      gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
    }`;
  const flameFS = (hot: string, cold: string) => `
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      float e = 1.0 - smoothstep(0.3, 0.5, d);
      vec3 c = mix(vec3(${hot}), vec3(${cold}), smoothstep(0.0, 0.7, vT));
      gl_FragColor = vec4(c * e * (1.0 - vT) * 1.6, 1.0);
    }`;
  const warm = fires.filter((f) => !f.soul && !f.lamp), cold = fires.filter((f) => f.soul && !f.lamp);
  const per = o.small ? 14 : 24;
  points(warm.length * per, (i) => warm[i % warm.length].p.toArray() as [number, number, number], {}, flameVS, flameFS("1.0, 0.85, 0.45", "1.0, 0.24, 0.05"));
  points(cold.length * per, (i) => cold[i % cold.length].p.toArray() as [number, number, number], {}, flameVS, flameFS("0.8, 1.0, 1.0", "0.1, 0.55, 0.9"));
  const halo = (list: Fire[], col: string) =>
    points(list.length, (i) => list[i].p.toArray() as [number, number, number], { uCol: { value: new THREE.Color(col) } }, `
      void main() {
        vS = aSeed; vT = 0.0;
        float ig = clamp((uIgn - 0.15 - length(position - uDoor) / 26.0) / 0.45, 0.0, 1.0);
        gl_PointSize = uPx * 6.5 * ig * (1.0 + 0.6 * exp(-max(0.0, uIgn - 0.6 - length(position - uDoor) / 26.0) * 3.0));
        gl_Position = projectionMatrix * viewMatrix * vec4(position + vec3(0.0, 0.6, 0.0), 1.0);
      }`, `
      uniform vec3 uCol;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float f = pow(max(0.0, 1.0 - d * 2.0), 2.2);
        gl_FragColor = vec4(uCol * f * 0.3, 1.0);
      }`);
  halo(warm, "#ff6a24");
  halo(cold, "#4fd8ff");
  const drift = (n: number, box: [number, number, number], size: number, up: number, color: string, alpha: number, soft: number) =>
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
  drift(o.small ? 160 : 320, [70, 26, 70], 0.11, 1.1, "#ff6a24", 1.4, 0);
  drift(o.small ? 60 : 120, [70, 20, 70], 0.42, 0.35, "#63e6ff", 0.42, 1);
  drift(o.small ? 90 : 180, [60, 16, 60], 0.06, 0.08, "#b49a80", 0.35, 1);

  // the frame: scene to a target with depth, bloom at a quarter, one finishing pass
  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: o.small ? 0 : 4, depthTexture: new THREE.DepthTexture(1, 1) });
  const bA = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  const bB = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  geos.push(quad.geometry);
  const flat = new THREE.Scene();
  flat.add(quad);
  const qcam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const VS = "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const bright = new THREE.ShaderMaterial({ uniforms: { t: { value: rt.texture } }, vertexShader: VS, fragmentShader: "uniform sampler2D t; varying vec2 vUv; void main() { vec3 c = texture2D(t, vUv).rgb; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(0.62, 1.4, l), 1.0); }" });
  const blur = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, d: { value: new THREE.Vector2() } }, vertexShader: VS, fragmentShader: "uniform sampler2D t; uniform vec2 d; varying vec2 vUv; void main() { vec3 c = texture2D(t, vUv).rgb * 0.227; c += (texture2D(t, vUv + d * 1.385).rgb + texture2D(t, vUv - d * 1.385).rgb) * 0.316; c += (texture2D(t, vUv + d * 3.23).rgb + texture2D(t, vUv - d * 3.23).rgb) * 0.07; gl_FragColor = vec4(c, 1.0); }" });
  const fin = new THREE.ShaderMaterial({
    uniforms: { tC: { value: rt.texture }, tD: { value: rt.depthTexture }, tB: { value: bA.texture }, uRes: { value: new THREE.Vector2() }, uPx: { value: 0.02 }, uTh: { value: 1 }, uTime: S.time, uOff: { value: new THREE.Vector2() }, uInk: { value: INK }, uGrain: { value: o.still || foot ? 0 : 0.018 }, uFlat: { value: foot ? 1 : 0 }, uFade: { value: 0 } },
    vertexShader: VS,
    fragmentShader: `
      uniform sampler2D tC, tD, tB; uniform vec2 uRes, uOff; uniform float uPx, uTh, uTime, uGrain, uFlat, uFade; uniform vec3 uInk; varying vec2 vUv;
      ${NOISE}
      float D(vec2 o) { return texture2D(tD, vUv + o / uRes).x * ${FAR - NEAR}.0; }
      void main() {
        float d0 = D(vec2(0.0));
        float a = D(vec2(uTh, 0.0)), b = D(vec2(-uTh, 0.0)), c = D(vec2(0.0, uTh)), e = D(vec2(0.0, -uTh));
        float a2 = D(vec2(uTh, uTh)), b2 = D(vec2(-uTh, -uTh)), c2 = D(vec2(-uTh, uTh)), e2 = D(vec2(uTh, -uTh));
        float lap = max(abs(a + b + c + e - 4.0 * d0), abs(a2 + b2 + c2 + e2 - 4.0 * d0) * 0.5);
        float jump = max(max(abs(a - d0), abs(b - d0)), max(abs(c - d0), abs(e - d0)));
        float px = uPx * uTh;
        float ink = max(smoothstep(px * 0.7, px * 1.8, lap), smoothstep(px * 2.5, px * 6.0, jump));
        vec3 col = texture2D(tC, vUv).rgb;
        bool sky = d0 > ${FAR - NEAR - 1}.0;
        vec2 sp = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0) + uOff;
        if (sky) {
          float s = fbm(sp * 2.2 + vec2(uTime * 0.012, -uTime * 0.02));
          float s2 = fbm(sp * 5.0 - vec2(uTime * 0.02, uTime * 0.01));
          col = uFlat > 0.5 ? uInk : uInk * (0.8 + 0.4 * s) + vec3(0.02, 0.008, 0.003) * smoothstep(0.6, 0.85, s2);
        }
        col = mix(col, vec3(0.02, 0.013, 0.01), ink * 0.92 * smoothstep(0.012, 0.05, dot(col, vec3(0.3, 0.5, 0.2))));
        col += texture2D(tB, vUv).rgb * 0.9;
        if (!sky || uFlat < 0.5) col *= vec3(1.04, 1.0, 0.95);
        float v = smoothstep(1.25, 0.35, length((vUv - 0.5) * vec2(1.1, 1.3)));
        col *= mix(mix(0.5, 1.0, v), 1.0, uFlat);
        col = mix(col, uInk, uFade);
        col += (h21(vUv * uRes + fract(uTime) * 91.0) - 0.5) * uGrain;
        gl_FragColor = vec4(max(col, 0.0), 1.0);
        #include <colorspace_fragment>
      }`,
  });
  mats.push(bright, blur, fin);

  // camera: the five shots (gate, hall in, hall out, theatre, landing), eased between, with a pull back mid-move
  const shots: Shot[] = hall
    ? [
        { t: new THREE.Vector3(0, COURT.y + 3, 0).addScaledVector(UP, -9), h: 52, w: 70, floor: COURT.y },
        hall.shots[0],
        hall.shots[1],
        { t: THEATRE.c.clone().add(new THREE.Vector3(-1, 1.5, -1)), h: 56, w: 74, floor: THEATRE.c.y },
        { t: SIGN.clone().add(new THREE.Vector3(0, 5.3, 0)).addScaledVector(UP, -3), h: 28, w: 40, floor: LAND.c.y },
      ]
    : Array(5).fill(foot!.shot);
  const want = new THREE.Vector3(), cur = shots[0].t.clone();
  let wantH = shots[0].h, curH = shots[0].h, wantW = shots[0].w, curW = shots[0].w, floorY = COURT.y;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, moved: false, cx: -1, cy: -1, over: false };
  let W = 1, H = 1;
  const size = () => {
    W = host.clientWidth || 1;
    H = host.clientHeight || 1;
    renderer.setSize(W, H, false);
    const w = Math.floor(W * dpr), h = Math.floor(H * dpr);
    rt.setSize(w, h);
    bA.setSize(w >> 2, h >> 2);
    bB.setSize(w >> 2, h >> 2);
    fin.uniforms.uRes.value.set(w, h);
    fin.uniforms.uTh.value = Math.max(1, dpr * 0.95);
  };
  size();
  const ro = new ResizeObserver(size);
  ro.observe(host);

  // ad textures and captions, loaded after first paint, nearest the hall's start first
  const family = getComputedStyle(host).fontFamily;
  let gone = false;
  const caption = (a: WorldAd) => {
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 200;
    const g = cv.getContext("2d")!;
    g.fillStyle = "#17110d";
    g.fillRect(0, 0, 1024, 200);
    g.fillStyle = "#f4eadb";
    g.font = "700 96px " + family;
    g.fillText(a.campaign, 40, 112, 944);
    const line = a.alt.split(". ")[0].replace(/\.$/, "");
    g.fillStyle = "#cdb89c";
    g.font = "600 42px " + family;
    g.fillText(line.length > 40 ? line.slice(0, 39) + "…" : line, 42, 172, 940);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    texs.push(t);
    return t;
  };
  const loader = new THREE.TextureLoader();
  const queue = [...(hall?.slots ?? [])];
  const pump = () => {
    const s = queue.shift();
    if (!s || gone) return;
    const a = o.ads[s.i];
    loader.load(
      "/_next/image?url=" + encodeURIComponent(a.src) + "&w=750&q=75",
      (t) => {
        if (gone) return t.dispose();
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        texs.push(t);
        s.ad(t);
        pump();
      },
      undefined,
      () => pump(),
    );
  };
  document.fonts.ready.then(() => !gone && hall?.slots.forEach((s) => s.cap(caption(o.ads[s.i]))));
  for (let i = 0; i < 4; i++) pump();

  // painted texture slots (public/world/tex/manifest.json), triplanar, multiplying the procedural colour
  const slotMats: Record<string, THREE.Material[]> = { stone: [m.stone, m.pale, m.trim], floor: [m.court, m.hall, m.land], rock: [m.rock], wood: [m.wood] };
  fetch("/world/tex/manifest.json")
    .then((r) => (r.ok ? r.json() : {}))
    .then((j: Record<string, string | null>) => {
      for (const [k, file] of Object.entries(j)) {
        if (!file || !slotMats[k] || gone) continue;
        new THREE.TextureLoader().load("/world/tex/" + file, (t) => {
          if (gone) return t.dispose();
          t.colorSpace = THREE.SRGBColorSpace;
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          texs.push(t);
          slotMats[k].forEach((mm) => setMap(mm, t));
        });
      }
    })
    .catch(() => {});

  // pointer: a sway of the camera, a hand-held light on the floor, hover and click on the ads
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const picks = hall?.slots.map((s) => s.pick) ?? [];
  let hot = -1;
  const move = (e: PointerEvent) => {
    ptr.tx = (e.clientX / innerWidth) * 2 - 1;
    ptr.ty = -((e.clientY / innerHeight) * 2 - 1);
    const b = canvas.getBoundingClientRect();
    ptr.cx = e.clientX - b.left;
    ptr.cy = e.clientY - b.top;
    ptr.over = e.target === canvas;
    ptr.moved = true;
  };
  const click = (e: MouseEvent) => {
    if (e.target !== canvas || hot < 0) return;
    if (hall) o.open(o.ads[hall.slots[hot].i].id);
  };

  // the footer's links: hover and focus make a target hot, a click picks it (the camera walks in, the frame goes to
  // ink, then the page navigates), and the die rolls on a click or follows a drag
  const LEAVE = 0.9;
  const fst: FootState = { hot: null, pick: null, pickT: 0, tilt: new THREE.Vector2(), drag: null };
  const fels = foot && o.foot ? foot.targets.map((t) => o.foot!.el(t.key)) : [];
  const offs: (() => void)[] = [];
  let leaveTo = "", dragged = 0, dx = 0, dy = 0;
  if (foot && o.foot) {
    const fo = o.foot;
    foot.face?.(fo.face);
    fels.forEach((el, i) => {
      if (!el) return;
      const k = foot.targets[i].key;
      const on = <E extends Event>(type: string, fn: (e: E) => void) => {
        el.addEventListener(type, fn as EventListener);
        offs.push(() => el.removeEventListener(type, fn as EventListener));
      };
      const cool = () => void (fst.hot === k && (fst.hot = null));
      on("pointerenter", () => (fst.hot = k));
      on("pointerleave", cool);
      on("focus", () => (fst.hot = k));
      on("blur", cool);
      on<PointerEvent>("pointermove", (e) => {
        const b = el.getBoundingClientRect();
        fst.tilt.set(((e.clientX - b.left) / b.width) * 2 - 1, -(((e.clientY - b.top) / b.height) * 2 - 1));
        if (!fst.drag) return;
        fst.drag.x += e.clientX - dx;
        fst.drag.y += e.clientY - dy;
        dragged += Math.abs(e.clientX - dx) + Math.abs(e.clientY - dy);
        dx = e.clientX;
        dy = e.clientY;
      });
      if (k === "die") {
        on<PointerEvent>("pointerdown", (e) => {
          fst.drag = new THREE.Vector2();
          dragged = 0;
          dx = e.clientX;
          dy = e.clientY;
          el.setPointerCapture(e.pointerId);
        });
        on("pointerup", () => (fst.drag = null));
        on("pointercancel", () => (fst.drag = null));
        on<MouseEvent>("click", (e) => {
          e.preventDefault();
          if (dragged < 6) foot.roll?.();
        });
        return;
      }
      on<MouseEvent>("click", (e) => {
        const href = (el as HTMLAnchorElement).getAttribute("href");
        if (!href || (el as HTMLAnchorElement).target === "_blank" || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || fst.pick) return;
        e.preventDefault();
        fst.pick = k;
        fst.pickT = 0;
        leaveTo = href;
      });
    });
    const back = () => ((fst.pick = null), (fin.uniforms.uFade.value = 0));
    addEventListener("pageshow", back);
    offs.push(() => removeEventListener("pageshow", back));
  }
  const placed: string[] = [];
  addEventListener("pointermove", move, { passive: true });
  addEventListener("click", click);

  // the fires nearest the view get the 15 light slots; slot 16 is the hand
  const order = fires.map((_, i) => i);
  const lit = (f: Fire) => {
    if (f.lamp) return 1;
    const d = 0.15 + f.p.distanceTo(door) / 26;
    const v = Math.min(1, Math.max(0, (ign.value - d) / 0.45));
    return 0.08 + 0.92 * v * (1 + 0.7 * Math.exp(-Math.max(0, ign.value - d - 0.45) * 3));
  };
  const pickLights = (t: number, c: THREE.Vector3) => {
    order.sort((a, b) => fires[a].p.distanceToSquared(c) - fires[b].p.distanceToSquared(c));
    for (let j = 0; j < NL - 1; j++) {
      const f = fires[order[j]];
      if (!f) continue;
      const fl = (0.84 + 0.16 * Math.sin(t * 11 + j * 1.7) * Math.sin(t * 6.3 + j)) * lit(f);
      S.fl.value[j].set(f.p.x, f.p.y + 0.4, f.p.z, f.r * (f.big ? 1.15 : 1));
      if (f.soul) S.fc.value[j].set(0.35 * fl * 2.0, 0.9 * fl * 2.0, 1.0 * fl * 2.0);
      else S.fc.value[j].set(1.0 * fl * 3.0, 0.42 * fl * 3.0, 0.12 * fl * 3.0);
    }
  };

  const unroll: number[] = [];
  let last = performance.now(), shown = false, shadowAt = new THREE.Vector3(1e9, 0, 0), shadowH = 0;
  const p0 = new THREE.Vector3(), tmp = new THREE.Vector3();
  const smoother = (f: number) => f * f * f * (f * (f * 6 - 15) + 10);
  const tick = () => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    S.time.value += dt;
    if (!o.still) ign.value += dt;
    const p = Math.min(4, Math.max(0, o.progress()));
    const i = Math.min(3, Math.floor(p));
    const f = i === 1 ? p - i : smoother(p - i);
    const A = shots[i], Z = shots[i + 1];
    want.lerpVectors(A.t, Z.t, f);
    wantH = A.h + (Z.h - A.h) * f + (i === 1 ? 0 : Math.sin(Math.PI * f) * 10);
    wantW = A.w + (Z.w - A.w) * f;
    const intro = Math.min(1, Math.max(0, (ign.value - 0.3) / 3.2));
    wantH -= (1 - Math.pow(1 - intro, 3)) * 3 * Math.max(0, 1 - p * 2);
    floorY = A.floor + (Z.floor - A.floor) * f;
    if (foot && fst.pick) {
      fst.pickT += dt;
      const u = Math.min(1, fst.pickT / LEAVE);
      want.lerp(foot.focus(fst.pick), u * u * 0.8);
      wantH *= 1 - 0.62 * u * u;
      wantW *= 1 - 0.62 * u * u;
      fin.uniforms.uFade.value = Math.max(0, (u - 0.55) / 0.45);
      if (u >= 1 && leaveTo) {
        o.foot!.go(leaveTo);
        leaveTo = "";
        setTimeout(() => ((fst.pick = null), (fin.uniforms.uFade.value = 0)), 1500);
      }
    }
    if (!o.still) {
      ptr.x += (ptr.tx - ptr.x) * (1 - Math.exp(-dt * 2.5));
      ptr.y += (ptr.ty - ptr.y) * (1 - Math.exp(-dt * 2.5));
      want.addScaledVector(RV, ptr.x * 0.5).addScaledVector(UP, ptr.y * 0.3);
    }
    const k = o.still ? 1 : 1 - Math.exp(-dt * (fst.pick ? 3 : 6));
    cur.lerp(want, k);
    curH += (wantH - curH) * k;
    curW += (wantW - curW) * k;
    const asp = W / H;
    const vh = Math.max(curH, curW / asp);
    camera.top = vh / 2;
    camera.bottom = -vh / 2;
    camera.left = (-vh * asp) / 2;
    camera.right = (vh * asp) / 2;
    camera.position.copy(cur).addScaledVector(DIR, 300);
    camera.up.copy(UP);
    camera.lookAt(cur);
    camera.updateProjectionMatrix();
    ppu.value = (H * dpr) / vh;
    fin.uniforms.uPx.value = vh / (H * dpr);
    fin.uniforms.uOff.value.set(cur.dot(RV) / vh, cur.dot(UP) / vh);
    center.value.copy(cur);
    pickLights(S.time.value, cur);

    if (ptr.moved && ptr.cx >= 0) {
      ptr.moved = false;
      ndc.set((ptr.cx / W) * 2 - 1, -(ptr.cy / H) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const h = ptr.over ? ray.intersectObjects(picks, false)[0] : undefined;
      hot = h ? picks.indexOf(h.object) : -1;
      canvas.style.cursor = hot >= 0 ? "pointer" : "";
      const t = (floorY + 1.6 - ray.ray.origin.y) / ray.ray.direction.y;
      p0.copy(ray.ray.origin).addScaledVector(ray.ray.direction, t);
    }
    const focus = Number((document.activeElement as HTMLElement | null)?.dataset?.ad ?? -1);
    if (foot) {
      foot.update(dt, fst);
      const px = H / vh;
      fels.forEach((el, j) => {
        if (!el) return;
        const t = foot.targets[j];
        tmp.copy(t.at).project(camera);
        const css = "translate(" + (((tmp.x + 1) / 2) * W).toFixed(1) + "px," + (((1 - tmp.y) / 2) * H).toFixed(1) + "px)|" + (t.w * px).toFixed(1) + "|" + (t.h * px).toFixed(1);
        if (placed[j] === css) return;
        placed[j] = css;
        const [tr, w, h] = css.split("|");
        el.style.transform = tr;
        if (!t.w) return;
        el.style.width = w + "px";
        el.style.height = h + "px";
      });
    }
    hall?.slots.forEach((s: Slot, j) => {
      s.hot(j === hot || s.i === focus ? 1 : 0);
      if (o.still) return s.drop(1);
      if (!unroll[j] && s.pos.distanceTo(cur) < 30) unroll[j] = S.time.value + 0.12 * (j % 4);
      const u = unroll[j] ? Math.min(1, Math.max(0, (S.time.value - unroll[j]) / 0.9)) : 0;
      s.drop(1 - Math.pow(1 - u, 3));
    });
    S.fl.value[NL - 1].set(p0.x, p0.y, p0.z, ptr.over && !o.still ? 8 : 0.001);
    S.fc.value[NL - 1].set(1.1, 0.62, 0.32);

    if (shadowAt.distanceTo(cur) > 1.5 || Math.abs(shadowH - vh) > vh * 0.08) {
      shadowAt.copy(cur);
      shadowH = vh;
      const ext = vh * 1.25 + 8;
      const sc = key.shadow.camera;
      sc.left = -ext;
      sc.right = ext;
      sc.top = ext;
      sc.bottom = -ext;
      sc.updateProjectionMatrix();
      key.target.position.copy(cur);
      key.position.copy(cur).addScaledVector(LDIR, 120);
      key.target.updateMatrixWorld();
      key.updateMatrixWorld();
      renderer.shadowMap.needsUpdate = true;
    }

    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    quad.material = bright;
    renderer.setRenderTarget(bA);
    renderer.render(flat, qcam);
    quad.material = blur;
    for (let r = 0; r < 2; r++) {
      blur.uniforms.t.value = bA.texture;
      blur.uniforms.d.value.set((1 + r) / bA.width, 0);
      renderer.setRenderTarget(bB);
      renderer.render(flat, qcam);
      blur.uniforms.t.value = bB.texture;
      blur.uniforms.d.value.set(0, (1 + r) / bA.height);
      renderer.setRenderTarget(bA);
      renderer.render(flat, qcam);
    }
    quad.material = fin;
    renderer.setRenderTarget(null);
    renderer.render(flat, qcam);
    if (!shown) {
      shown = true;
      o.ready();
    }
  };

  let seen = true;
  const run = () => renderer.setAnimationLoop(seen && !document.hidden ? tick : null);
  const io = new IntersectionObserver(([en]) => {
    seen = en.isIntersecting;
    last = performance.now();
    run();
  });
  io.observe(host);
  document.addEventListener("visibilitychange", run);
  scene.updateMatrixWorld(true);
  tmp.set(0, 0, 0);
  run();

  return () => {
    gone = true;
    renderer.setAnimationLoop(null);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", run);
    removeEventListener("pointermove", move);
    removeEventListener("click", click);
    offs.forEach((f) => f());
    geos.forEach((g) => g.dispose());
    mats.forEach((mm) => mm.dispose());
    texs.forEach((t) => t.dispose());
    [rt, bA, bB].forEach((r) => r.dispose());
    renderer.dispose();
    canvas.remove();
  };
}
