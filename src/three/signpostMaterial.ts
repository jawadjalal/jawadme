import * as THREE from "three";

// The signpost's painted look in one small shader, no scene lights: a warm key from the upper left in two soft
// painted steps, a cool slate rim on the shadow side, and grain by kind (0 carved stone, 1 painted wood, 2 dull
// bronze, 3 gold leaf). uEmber pushes the brazier into the rim and edges for the one live arm; uCrack draws the
// glowing crystal fracture up the front of the stone post. inkMaterial draws the ink edge as a pushed back-face hull.

const vert = /* glsl */ `
varying vec3 vN;
varying vec3 vW;
varying vec3 vO;
varying vec3 vNo;
void main() {
  vO = position;
  vNo = normal;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const frag = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uDark;
uniform vec3 uRim;
uniform float uKind;
uniform float uEmber;
uniform float uCrack;
uniform float uTime;
varying vec3 vN;
varying vec3 vW;
varying vec3 vO;
varying vec3 vNo;

const vec3 KEY = vec3(1.0, 0.82, 0.62);
const vec3 EMBER = vec3(1.0, 0.25, 0.022);
const vec3 CRYSTAL = vec3(0.11, 0.77, 0.74);

float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}

void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vW);
  vec3 L = normalize(vec3(-0.6, 0.75, 0.55));
  float ndl = dot(n, L);
  float lit = smoothstep(-0.12, 0.08, ndl) * 0.55 + smoothstep(0.42, 0.62, ndl) * 0.45;
  float g;
  if (uKind < 0.5) {
    g = noise(vO * 2.4) * 0.55 + noise(vO * 9.0) * 0.3 + noise(vO * 34.0) * 0.15;
    lit *= 0.82 + 0.18 * smoothstep(0.35, 0.7, noise(vO * 5.0 + 3.0));
  } else if (uKind < 1.5) {
    g = noise(vec3(vO.x * 1.4, vO.y * 30.0, vO.z * 30.0)) * 0.65 + noise(vec3(vO.x * 6.0, vO.y * 90.0, vO.z * 6.0)) * 0.35;
  } else {
    g = noise(vO * 14.0) * 0.6 + noise(vO * 50.0) * 0.4;
  }
  vec3 col = mix(uDark, uBase, lit) * (0.82 + 0.36 * g);
  if (uKind > 1.5) {
    vec3 h = normalize(L + v);
    float sp = pow(max(dot(n, h), 0.0), uKind > 2.5 ? 26.0 : 10.0);
    col += KEY * sp * (uKind > 2.5 ? 0.9 : 0.22) * (0.6 + 0.4 * g);
  }
  float fr = pow(1.0 - max(dot(n, v), 0.0), 2.6);
  float shade = smoothstep(0.5, -0.3, ndl);
  col += uRim * fr * (0.35 + 0.65 * shade);
  col = mix(col, col * 0.4 + EMBER * (0.55 + 0.9 * fr), uEmber * 0.85);
  col += vec3(1.0, 0.55, 0.12) * uEmber * pow(max(dot(n, normalize(L + v)), 0.0), 6.0) * 0.35;
  if (uCrack > 0.0 && vNo.z > 0.5) {
    float y = vO.y;
    float xc = (noise(vec3(y * 2.6, 0.0, 0.0)) - 0.5) * 0.22 + (noise(vec3(y * 11.0, 4.0, 0.0)) - 0.5) * 0.06;
    float d = abs(vO.x - xc);
    float mask = smoothstep(-2.3, -1.6, y) * (1.0 - smoothstep(1.3, 2.1, y));
    float pulse = 0.8 + 0.2 * sin(uTime * 1.6 + y * 1.4);
    col = mix(col, col * 0.35, smoothstep(0.05, 0.012, d) * mask);
    col += CRYSTAL * (smoothstep(0.016, 0.0, d) * 1.6 + smoothstep(0.1, 0.0, d) * 0.25) * mask * pulse * uCrack;
  }
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export type Paint = { base: string; dark: string; rim?: string; kind: number; ember?: number; crack?: number };

export function paintMaterial(p: Paint) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBase: { value: new THREE.Color(p.base) },
      uDark: { value: new THREE.Color(p.dark) },
      uRim: { value: new THREE.Color(p.rim ?? "#4a4f8a") },
      uKind: { value: p.kind },
      uEmber: { value: p.ember ?? 0 },
      uCrack: { value: p.crack ?? 0 },
      uTime: { value: 0 },
    },
    vertexShader: vert,
    fragmentShader: frag,
  });
}

export function inkMaterial(width: number) {
  return new THREE.ShaderMaterial({
    uniforms: { uInk: { value: width } },
    vertexShader: /* glsl */ `
uniform float uInk;
void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position + normal * uInk, 1.0);
}`,
    fragmentShader: /* glsl */ `void main() { gl_FragColor = vec4(0.027, 0.024, 0.043, 1.0); }`,
    side: THREE.BackSide,
  });
}
