import * as THREE from "three";
import type { Bag } from "./bag";

// The world's materials. Every lit surface is a toon material with four things written into its shader: painted
// variation from world-space noise and brush strokes, fire light from up to 16 braziers (pools that fall off in soft
// bands), a two-colour rim on the edges that turn away from the eye (soul cyan on the left, ember on the right), and a
// fade to ink with depth for rock. Floors and trims draw their carving (flagstones, the running key) in the same
// shader. A painted map from public/world/tex takes over the colour where one exists.

export const NL = 16;
export const INK = new THREE.Color("#100b09");
export const EMBER = new THREE.Color("#ff5a1c");
export const SOUL = new THREE.Color("#63e6ff");

export const NOISE = /* glsl */ `
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * n2(p); p = p * 2.03 + 1.7; a *= 0.5; } return s; }
`;

// One period of the running key on a 5 by 5 grid: bit (row * 5 + column), row 0 at the bottom.
const MEANDER = /* glsl */ `
float meander(vec2 q) {
  vec2 c = vec2(fract(q.x) * 5.0, q.y * 5.0);
  if (c.y < 0.0 || c.y >= 5.0) return 0.0;
  int b = int(floor(c.y)) * 5 + int(floor(c.x));
  return float((32073823 >> b) & 1);
}
`;

export type Shared = {
  time: { value: number };
  fl: { value: THREE.Vector4[] };
  fc: { value: THREE.Vector3[] };
};

export const shared = (): Shared => ({
  time: { value: 0 },
  fl: { value: Array.from({ length: NL }, () => new THREE.Vector4(0, -999, 0, 1)) },
  fc: { value: Array.from({ length: NL }, () => new THREE.Vector3()) },
});

export type Kind =
  | { k: "stone"; rim?: number }
  | { k: "rock" }
  | { k: "trim"; y0: number; band: number }
  | { k: "floor"; rect: [number, number, number, number]; border: number; tile: number }
  | { k: "ring"; c: [number, number]; r: number; border: number; tile: number };

const PATTERN: Record<Kind["k"], string> = {
  stone: "",
  rock: "",
  floor: `
    vec2 lp = vWP.xz - uA.xy, sz = uA.zw - uA.xy;
    float e = min(min(lp.x, lp.y), min(sz.x - lp.x, sz.y - lp.y));
    float B = uB.x;
    if (e < B) {
      float along = (e == lp.x || e == sz.x - lp.x) ? lp.y : lp.x;
      float v = e / B;
      float key = meander(vec2(along / (B * 0.62), (v - 0.19) / 0.62));
      float lip = step(v, 0.08) + step(0.93, v);
      diffuseColor.rgb *= mix(0.5, 1.0, key) * (1.0 - 0.3 * lip);
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.3, 1.02, 0.72), key * 0.7);
    } else {
      vec2 tg = (lp - B) / uB.y;
      tg.x += step(1.0, mod(floor(tg.y), 2.0)) * 0.5;
      vec2 tf = fract(tg);
      float te = min(min(tf.x, 1.0 - tf.x), min(tf.y, 1.0 - tf.y)) * uB.y + (n2(vWP.xz * 2.0) - 0.5) * 0.06;
      float id = h21(floor(tg));
      diffuseColor.rgb *= (0.76 + 0.34 * id) * mix(0.3, 1.0, smoothstep(0.03, 0.09, te));
      diffuseColor.rgb *= 1.0 + 0.12 * smoothstep(0.09, 0.22, te) * (tf.y - tf.x);
    }`,
  ring: `
    vec2 d = vWP.xz - uA.xy;
    float r = length(d);
    float a = atan(d.y, d.x);
    float edge = uA.z - r;
    if (edge < uB.x) {
      float v = edge / uB.x;
      float key = meander(vec2(a * uA.z / (uB.x * 0.62), (v - 0.19) / 0.62));
      diffuseColor.rgb *= mix(0.75, 2.1, key);
    } else {
      float ring = floor(r / uB.y);
      float n = max(6.0, floor(ring * 6.2832 * 0.55));
      float sf = fract(a / 6.2832 * n + ring * 0.37);
      float id = h21(vec2(ring, floor(a / 6.2832 * n + ring * 0.37)));
      float rf = fract(r / uB.y);
      float g = min(min(rf, 1.0 - rf) * uB.y, min(sf, 1.0 - sf) * r * 6.2832 / n);
      diffuseColor.rgb *= (0.86 + 0.24 * id) * mix(0.45, 1.0, smoothstep(0.02, 0.08, g));
    }`,
  trim: `
    float v = fract((vWP.y - uB.x) / uB.y + 0.001);
    if (abs(vWN.y) < 0.5) {
      float along = abs(vWN.z) > abs(vWN.x) ? vWP.x : -vWP.z;
      float key = meander(vec2(along / (uB.y * 0.7), (v - 0.18) / 0.64));
      diffuseColor.rgb *= mix(0.5, 1.1, key);
    }`,
};

export function paint(S: Shared, ramp: THREE.Texture, color: string, kind: Kind, extra: THREE.MeshToonMaterialParameters = {}) {
  const m = new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...extra });
  const a = kind.k === "floor" ? kind.rect : kind.k === "ring" ? [kind.c[0], kind.c[1], kind.r, 0] : [0, 0, 0, 0];
  const b = kind.k === "floor" || kind.k === "ring" ? [kind.border, kind.tile] : kind.k === "trim" ? [kind.y0, kind.band] : [0, 1];
  const u = {
    uTime: S.time,
    uFL: S.fl,
    uFC: S.fc,
    uRim: { value: kind.k === "stone" ? (kind.rim ?? 1) : kind.k === "rock" ? 0.5 : 0.7 },
    uA: { value: new THREE.Vector4(a[0], a[1], a[2], a[3]) },
    uB: { value: new THREE.Vector4(b[0], b[1], 0, 0) },
    uTex: { value: null as THREE.Texture | null },
    uHasTex: { value: 0 },
  };
  m.userData.u = u;
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    s.vertexShader =
      "attribute float aH;\nvarying vec3 vWP;\nvarying vec3 vWN;\nvarying float vH;\n" +
      s.vertexShader.replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 wp4 = vec4(transformed, 1.0);
        vec3 wn = objectNormal;
        #ifdef USE_INSTANCING
          wp4 = instanceMatrix * wp4;
          wn = mat3(instanceMatrix) * wn;
        #endif
        vH = aH;
        wp4 = modelMatrix * wp4;
        vWP = wp4.xyz;
        vWN = normalize(mat3(modelMatrix) * wn);`,
      );
    s.fragmentShader =
      `varying vec3 vWP;\nvarying vec3 vWN;\nvarying float vH;\nuniform float uTime, uRim, uHasTex;\nuniform vec4 uFL[${NL}];\nuniform vec3 uFC[${NL}];\nuniform vec4 uA, uB;\nuniform sampler2D uTex;\n` +
      NOISE +
      MEANDER +
      s.fragmentShader
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          vec3 an = abs(normalize(vWN));
          if (uHasTex > 0.5) {
            vec3 tx = texture2D(uTex, vWP.zy * 0.12).rgb * an.x + texture2D(uTex, vWP.xz * 0.12).rgb * an.y + texture2D(uTex, vWP.xy * 0.12).rgb * an.z;
            diffuseColor.rgb *= tx / max(an.x + an.y + an.z, 1e-3) * 1.6;
          }
          vec2 bp = an.y > 0.6 ? vWP.xz : vec2(vWP.x - vWP.z, vWP.y);
          float big = fbm(bp * 0.16);
          float brush = n2(vec2(bp.x * 0.9 + bp.y * 0.3, bp.y * 5.0 - bp.x * 0.4)) * 0.6 + n2(bp * vec2(3.0, 0.7)) * 0.4;
          diffuseColor.rgb *= mix(0.74, 1.22, big) * mix(0.86, 1.1, brush);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.84, 0.94, 1.14), smoothstep(0.55, 0.78, big) * 0.6);
          ${kind.k === "stone" ? "diffuseColor.rgb *= mix(0.5, 1.0, smoothstep(0.0, 1.8, vH));" : ""}
          ${PATTERN[kind.k]}`,
        )
        .replace(
          "#include <opaque_fragment>",
          `vec3 fwn = normalize(vWN);
          vec3 fire = vec3(0.0);
          for (int i = 0; i < ${NL}; i++) {
            vec3 d = uFL[i].xyz - vWP;
            float r = length(d);
            float fa = clamp(1.0 - r / uFL[i].w, 0.0, 1.0);
            fa = fa * fa * (3.0 - 2.0 * fa);
            float nd = dot(fwn, d / max(r, 1e-3));
            fire += uFC[i] * fa * smoothstep(-0.35, 0.55, nd);
          }
          float fi = max(fire.r, max(fire.g, fire.b));
          float fq = (floor(fi * 3.0) + smoothstep(0.3, 0.7, fract(fi * 3.0))) / 3.0;
          fire *= fi > 1e-4 ? mix(fi, fq, 0.5) / fi : 0.0;
          outgoingLight += diffuseColor.rgb * fire;
          float rimv = 1.0 - clamp(abs(normal.z), 0.0, 1.0);
          float rm = smoothstep(0.72, 0.88, rimv) * uRim;
          vec3 rc = mix(vec3(0.39, 0.9, 1.0) * 0.6, vec3(1.0, 0.48, 0.18) * 0.75, smoothstep(-0.25, 0.25, normal.x));
          outgoingLight += rc * rm * (0.3 + 0.7 * smoothstep(-0.2, 0.5, normal.y)) + diffuseColor.rgb * fire * rm * 1.4;
          ${kind.k === "rock" ? "outgoingLight = mix(outgoingLight, vec3(0.012, 0.008, 0.007), smoothstep(-0.5, -9.0, vH));" : ""}
          #include <opaque_fragment>`,
        );
  };
  m.customProgramCacheKey = () => "paint-" + kind.k;
  return m;
}

export function setMap(m: THREE.Material, t: THREE.Texture) {
  const u = m.userData.u as { uTex: { value: THREE.Texture | null }; uHasTex: { value: number } };
  u.uTex.value = t;
  u.uHasTex.value = 1;
}

export type Palette = Record<"stone" | "pale" | "dark" | "rock" | "bronze" | "wood" | "trim", THREE.MeshToonMaterial>;

/** The house materials on one shared toon ramp: `mk(color, kind)` makes more (floors take their rect in world x/z), and
 *  `palette` is the world's stone, pale marble, dark stone, rock, bronze, wood and running-key trim. */
export function painter(S: Shared, b: Bag) {
  const ramp = new THREE.DataTexture(new Uint8Array([26, 72, 150, 240]), 4, 1, THREE.RedFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  b.texs.push(ramp);
  const mk = (color: string, kind: Kind, extra?: THREE.MeshToonMaterialParameters) => {
    const m = paint(S, ramp, color, kind, extra);
    b.mats.push(m);
    return m;
  };
  const palette: Palette = {
    stone: mk("#7a7068", { k: "stone" }),
    pale: mk("#a69d90", { k: "stone", rim: 1.2 }),
    dark: mk("#302a29", { k: "stone", rim: 0.8 }),
    rock: mk("#2d2725", { k: "rock" }),
    bronze: mk("#8a5f33", { k: "stone", rim: 1.4 }),
    wood: mk("#5e3e27", { k: "stone", rim: 0.8 }),
    trim: mk("#90867a", { k: "trim", y0: 14, band: 1.2 }),
  };
  return { mk, palette };
}
