import * as THREE from "three";

// The pillar's paint. Colours are written in sRGB straight from the brand tokens (no colour-space pass), so what the
// shader says is what the page shows. One warm brazier key from below and in front, falling off with height; a cool
// crystal rim from behind; an ember rim that leans toward the cursor; cel bands and ink at the silhouette. The
// FRACTURE vein climbs the shaft: a hairline at rest, opening and brightening with uOpen (hero scroll 0..1).

export type PillarUniforms = {
  uTime: { value: number };
  uOpen: { value: number };
  uCursor: { value: THREE.Vector2 };
};

export const pillarUniforms = (): PillarUniforms => ({
  uTime: { value: 0 },
  uOpen: { value: 0 },
  uCursor: { value: new THREE.Vector2(0.4, -0.2) },
});

const common = /* glsl */ `
uniform float uTime;
uniform float uOpen;
uniform vec2 uCursor;
const vec3 VOID = vec3(0.027, 0.024, 0.043);
const vec3 SLATE = vec3(0.110, 0.102, 0.169);
const vec3 SLATE2 = vec3(0.227, 0.220, 0.322);
const vec3 SLATE3 = vec3(0.431, 0.416, 0.549);
const vec3 BONE = vec3(0.929, 0.894, 0.827);
const vec3 GOLD = vec3(1.0, 0.706, 0.227);
const vec3 BRAZIER = vec3(1.0, 0.541, 0.165);
const vec3 CRYSTAL = vec3(0.373, 0.890, 0.878);
float h1(float x) { return fract(sin(x * 127.1) * 43758.5453); }
float n1(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
float wrapA(float a) { return abs(mod(a + 3.14159265, 6.2831853) - 3.14159265); }
float spine(float y) {
  return 2.67 + 0.30 * y + 0.10 * sin(y * 2.1 + 0.6) + 0.10 * (n1(y * 6.0) - 0.5) + 0.05 * (n1(y * 21.0) - 0.5);
}
// signed distance (arc units on the shaft) to the nearest open crack edge; negative inside the crack
float crack(vec3 p) {
  float a = atan(p.z, p.x);
  float y = p.y;
  float open = clamp(uOpen, 0.0, 1.0);
  float jag = 0.6 + 0.4 * n1(y * 5.0 + 3.0);
  float L = mix(1.25, 2.35, open);
  float m0 = 1.0 - smoothstep(L * 0.6, L, abs(y + 0.15));
  float w0 = mix(0.01, 0.05, open) * jag * m0;
  float e = wrapA(a - spine(y)) * 0.72 - w0 + (1.0 - m0) * 0.6;
  float l1 = mix(0.25, 1.15, open);
  float t1 = (y - 0.45) / l1;
  float m1 = step(0.0, t1) * (1.0 - smoothstep(0.55, 1.0, t1));
  float c1 = spine(0.45) - (y - 0.45) * 0.95 + 0.06 * (n1(y * 14.0) - 0.5);
  float w1 = mix(0.003, 0.028, open) * (1.0 - t1) * m1;
  e = min(e, wrapA(a - c1) * 0.72 - w1 + (1.0 - m1) * 0.6);
  float l2 = mix(0.2, 0.95, open);
  float t2 = (-0.85 - y) / l2;
  float m2 = step(0.0, t2) * (1.0 - smoothstep(0.55, 1.0, t2));
  float c2 = spine(-0.85) + (-0.85 - y) * 1.1 + 0.06 * (n1(y * 17.0) - 0.5);
  float w2 = mix(0.003, 0.024, open) * (1.0 - t2) * m2;
  e = min(e, wrapA(a - c2) * 0.72 - w2 + (1.0 - m2) * 0.6);
  return e;
}
`;

const vert = /* glsl */ `
${common}
attribute float aGold;
attribute float aShaft;
varying vec3 vP;
varying vec3 vW;
varying vec3 vN;
varying float vGold;
varying float vShaft;
varying float vE;
void main() {
  vec3 p = position;
  float e = crack(p);
  vE = e;
  float inside = aShaft * (1.0 - smoothstep(-0.004, 0.006, e));
  p.xz -= p.xz / max(length(p.xz), 0.001) * inside * (0.012 + 0.11 * uOpen);
  vP = p;
  vGold = aGold;
  vShaft = aShaft;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const frag = /* glsl */ `
${common}
varying vec3 vP;
varying vec3 vW;
varying vec3 vN;
varying float vGold;
varying float vShaft;
varying float vE;
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { return noise(p) * 0.55 + noise(p * 2.1) * 0.3 + noise(p * 4.7) * 0.15; }
float band(float x, float a, float s) { return smoothstep(a - s, a + s, x); }

void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vW);
  float ndv = clamp(dot(n, v), 0.0, 1.0);
  float open = clamp(uOpen, 0.0, 1.0);

  vec3 bz = vec3(-2.4 + uCursor.x * 0.8, -3.0, 2.6);
  vec3 L = normalize(bz - vW);
  float dist = length(bz - vW);
  float att = 2.4 / (1.0 + 0.08 * dist * dist);
  float ndl = max(dot(n, L), 0.0) * att;
  float b1 = band(ndl, 0.10, 0.015);
  float b2 = band(ndl, 0.4, 0.015);
  float b3 = band(ndl, 0.78, 0.02);

  float grain = fbm(vP * vec3(2.2, 0.9, 2.2));
  float tone = floor(fbm(vP * 1.3 + 4.0) * 4.0) / 4.0;
  float vein = 1.0 - smoothstep(0.0, 0.05, abs(sin((vP.y * 0.8 + vP.x * 0.6 + fbm(vP * 1.7) * 3.2) * 2.6)));
  vec3 albedo = mix(SLATE, SLATE2, 0.35 + 0.4 * tone) * (0.88 + 0.24 * grain);
  albedo = mix(albedo, SLATE3, vein * 0.35);
  float pits = smoothstep(0.7, 0.8, noise(vP * vec3(14.0, 3.0, 14.0))) * 0.12;

  float top = max(n.y, 0.0) * 0.5 + 0.5 * smoothstep(-1.0, 3.0, vW.y);
  vec3 shade = mix(VOID, albedo * 0.65, 0.4 + 0.4 * top);
  vec3 mid = albedo * vec3(1.15, 1.0, 0.98);
  vec3 lit = mix(albedo * 1.3, BRAZIER, 0.2);
  vec3 hot = mix(SLATE3, BRAZIER, 0.5);
  vec3 stone = mix(mix(mix(shade, mid, b1), lit, b2), hot, b3);
  stone *= 1.0 - pits;

  if (vShaft > 0.5) {
    float u = fract(atan(vP.z, vP.x) / 6.2831853 * 20.0);
    float x = abs(u - 0.5) / 0.42;
    float channel = step(x, 1.0);
    stone *= mix(1.0, 1.0 - 0.38 * smoothstep(0.45, 1.0, x), channel);
    float fillet = 1.0 - channel;
    stone = mix(stone, mix(stone, BONE * 0.8, 0.22), fillet * b2);
  }

  vec3 h = normalize(L + v);
  float spec = pow(max(dot(n, h), 0.0), 48.0) * att;
  float wear = smoothstep(0.2, 0.28, fbm(vP * 6.0 + 2.0));
  vec3 gDark = vec3(0.24, 0.12, 0.05);
  vec3 gold = mix(mix(mix(gDark, GOLD * 0.62, b1), GOLD, b2), mix(GOLD, BONE, 0.45), b3);
  float sky = smoothstep(-0.1, 0.5, reflect(-v, n).y);
  gold += GOLD * 0.18 * sky;
  gold += vec3(1.0, 0.93, 0.72) * smoothstep(0.35, 0.5, spec) * 1.2;
  float isGold = vGold * wear;
  vec3 col = mix(stone, gold, isGold);

  float fr = 1.0 - ndv;
  vec3 Lc = normalize(vec3(0.9, 0.35, -1.0));
  float crys = smoothstep(0.42, 0.62, fr) * smoothstep(0.0, 0.35, dot(n, Lc));
  col = mix(col, CRYSTAL * (0.75 + 0.3 * open), crys * mix(0.4, 0.8, vShaft));
  vec3 Le = normalize(vec3(uCursor.x * 1.3, -uCursor.y * 0.9 + 0.1, 0.15));
  float ember = smoothstep(0.5, 0.7, fr) * smoothstep(0.1, 0.6, dot(n, Le));
  col += BRAZIER * ember * (0.55 + 0.35 * isGold);

  col = mix(col, VOID * 0.6, smoothstep(0.8, 0.95, fr));
  float crease = smoothstep(0.45, 0.9, length(fwidth(n)));
  col = mix(col, VOID * 0.5, crease * 0.75);

  float pulse = 0.82 + 0.18 * sin(uTime * 1.6 - vP.y * 2.4);
  float e = vE;
  float reach = 0.04 + 0.1 * open;
  float halo = exp(-max(e, 0.0) / reach) * (0.45 + 0.8 * open) * pulse;
  col *= 1.0 - (1.0 - smoothstep(0.0, 0.014 + 0.01 * open, e)) * step(0.0, e) * 0.8 * vShaft;
  halo *= smoothstep(-2.75, -2.2, vP.y) * (1.0 - smoothstep(2.1, 2.5, vP.y));
  col += CRYSTAL * halo * mix(0.6, 1.0, b1);
  float core = 1.0 - smoothstep(-0.002, 0.008, e);
  core *= vShaft;
  vec3 inner = mix(CRYSTAL, vec3(0.92, 1.0, 1.0), (1.0 - smoothstep(-0.03, 0.0, e)) * (0.4 + 0.6 * open));
  col = mix(col, inner * (1.1 + 0.6 * open) * pulse, core);

  col *= mix(0.25, 1.0, smoothstep(-3.45, -2.6, vW.y));
  gl_FragColor = vec4(col, 1.0);
}`;

export function pillarMaterial(u: PillarUniforms) {
  return new THREE.ShaderMaterial({ uniforms: u, vertexShader: vert, fragmentShader: frag });
}

export function inkMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: /* glsl */ `
      attribute vec3 aHull;
      void main() {
        vec4 w = modelMatrix * vec4(position + aHull * 0.028, 1.0);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `void main() { gl_FragColor = vec4(0.016, 0.012, 0.027, 1.0); }`,
  });
}

const glow = { transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor };

export function emberMaterial(u: PillarUniforms) {
  return new THREE.ShaderMaterial({
    ...glow,
    uniforms: { ...u, uDpr: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uDpr;
      attribute vec4 aSeed;
      varying float vLife;
      varying float vHeat;
      void main() {
        float t = fract(uTime * (0.05 + 0.05 * aSeed.w) + aSeed.z);
        float a = aSeed.x * 6.2831853 + t * 1.4 * (aSeed.y - 0.5);
        float r = 0.95 + 1.1 * aSeed.y + t * 0.5;
        vec3 p = vec3(cos(a) * r, -3.25 + t * (4.6 + 2.0 * aSeed.w), sin(a) * r * 0.7 + 0.5);
        p.x += sin(t * 9.0 + aSeed.z * 20.0) * 0.12;
        vLife = t;
        vHeat = aSeed.w;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (70.0 + 90.0 * aSeed.w) * (1.0 - t * 0.6) * uDpr / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vLife;
      varying float vHeat;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        float core = 1.0 - smoothstep(0.0, 0.5, d);
        float fade = smoothstep(0.0, 0.08, vLife) * (1.0 - smoothstep(0.55, 1.0, vLife));
        vec3 col = mix(vec3(1.0, 0.541, 0.165), vec3(1.0, 0.85, 0.5), core * core * vHeat);
        float a = core * core * fade;
        gl_FragColor = vec4(col * a * 1.4, a * 0.6);
      }`,
  });
}

export function emberGeometry(count = 56) {
  const g = new THREE.BufferGeometry();
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const seed = new Float32Array(count * 4).map(rnd);
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8);
  return g;
}

export function hazeMaterial(u: PillarUniforms) {
  return new THREE.ShaderMaterial({
    ...glow,
    uniforms: u,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uOpen;
      varying vec2 vUv;
      void main() {
        vec2 q = vUv * vec2(1.6, 1.0);
        float r = length(q - vec2(0.0, 0.05));
        vec3 col = vec3(0.227, 0.220, 0.322) * exp(-r * r * 2.6) * 0.55;
        col += vec3(0.373, 0.890, 0.878) * exp(-r * r * 9.0) * (0.05 + 0.12 * uOpen);
        col += vec3(1.0, 0.541, 0.165) * exp(-dot(vUv - vec2(0.0, -0.95), vUv - vec2(0.0, -0.95)) * 6.0) * 0.18;
        col *= 1.0 - smoothstep(0.6, 1.0, max(abs(vUv.x), abs(vUv.y)));
        float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
        gl_FragColor = vec4(col, a);
      }`,
  });
}

export function poolMaterial(u: PillarUniforms) {
  return new THREE.ShaderMaterial({
    ...glow,
    uniforms: u,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uOpen;
      varying vec2 vUv;
      void main() {
        float r = length(vUv - vec2(0.0, -0.18));
        float warm = exp(-r * r * 5.0) * 0.5;
        vec3 col = vec3(1.0, 0.541, 0.165) * warm + vec3(0.373, 0.890, 0.878) * exp(-r * r * 14.0) * 0.12 * uOpen;
        float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0) * 0.55;
        gl_FragColor = vec4(col * 0.8, a);
      }`,
  });
}
