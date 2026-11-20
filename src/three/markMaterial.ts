import * as THREE from "three";

// The Mark's four material sets in one small shader, crossfaded by uMix (0 printed paper, 1 felt, 2 voxel bricks,
// 3 frosted glass). Between two sets the surface dissolves along a noise field with a thin ink seam, so a change
// reads as one material turning into the next rather than a fade.

const vert = /* glsl */ `
varying vec3 vN;
varying vec3 vNo;
varying vec3 vO;
varying vec3 vV;
void main() {
  vO = position;
  vNo = normal;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - w.xyz);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const frag = /* glsl */ `
uniform float uMix;
uniform float uTime;
uniform float uDpr;
varying vec3 vN;
varying vec3 vNo;
varying vec3 vO;
varying vec3 vV;

const vec3 INK = vec3(0.059, 0.055, 0.047);
const vec3 SIGNAL = vec3(1.0, 0.29, 0.07);

float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}

vec3 L = normalize(vec3(-0.5, 0.75, 0.7));

vec3 paper(vec3 n) {
  float d = clamp(dot(n, L) * 0.5 + 0.5, 0.0, 1.0);
  vec3 h = normalize(L + vV);
  float sheen = pow(max(dot(n, h), 0.0), 18.0) * 0.06;
  float grain = noise(vO * 220.0) * 0.03 + noise(vO * 18.0) * 0.025;
  float occ = 0.82 + 0.18 * smoothstep(-1.6, 1.4, vO.y);
  vec3 col = mix(vec3(0.6, 0.58, 0.55), vec3(0.965, 0.955, 0.935), pow(d, 1.3)) * occ;
  return col + sheen - grain;
}

vec3 felt(vec3 n) {
  float w = clamp((dot(n, L) + 0.4) / 1.4, 0.0, 1.0);
  float fib = noise(vO * 70.0) * 0.5 + noise(vO * 190.0) * 0.5;
  vec3 base = vec3(0.16, 0.15, 0.14);
  vec3 col = base * (0.3 + 0.82 * w) * (0.8 + 0.32 * fib);
  float fuzz = pow(1.0 - max(dot(n, vV), 0.0), 2.0);
  return col * 2.2 + vec3(0.62, 0.6, 0.57) * fuzz * 0.32;
}

vec3 voxel(vec3 n) {
  float k = 2.7;
  vec3 q = vO * k + vec3(0.5, 0.5, 0.25);
  vec3 c = floor(q);
  vec3 lo = fract(q);
  vec3 m = min(lo, 1.0 - lo);
  vec3 an = abs(vNo);
  float e = an.z > 0.6 ? min(m.x, m.y) : (an.x > 0.6 ? min(m.y, m.z) : min(m.x, m.z));
  float h = hash(c + 7.3);
  vec3 col = SIGNAL * (0.86 + 0.14 * h);
  float d = clamp(dot(n, L) * 0.6 + 0.5, 0.0, 1.0);
  col *= 0.45 + 0.65 * d;
  float groove = smoothstep(0.015, 0.05, e);
  float lip = smoothstep(0.05, 0.12, e);
  col *= mix(0.35, 1.0, groove);
  col += (1.0 - lip) * groove * 0.12;
  return col;
}

vec3 glass(vec3 n) {
  float f = pow(1.0 - max(dot(n, vV), 0.0), 2.0);
  float d = clamp(dot(n, L) * 0.5 + 0.5, 0.0, 1.0);
  float depth = smoothstep(-1.5, 1.5, vO.y + vO.x * 0.4);
  vec3 col = mix(vec3(0.33, 0.47, 0.56), vec3(0.72, 0.84, 0.9), depth * 0.6 + d * 0.4);
  col += noise(vO * 34.0) * 0.025;
  vec3 h = normalize(L + vV);
  float spec = pow(max(dot(n, h), 0.0), 140.0);
  float band = smoothstep(0.14, 0.0, abs(vO.x + vO.y * 0.5 - 0.25)) * step(0.6, abs(vNo.z));
  return mix(col, vec3(0.97, 0.99, 1.0), f * 0.8) + spec * 1.2 + band * 0.12;
}

vec3 look(float i, vec3 n) {
  if (i < 0.5) return paper(n);
  if (i < 1.5) return felt(n);
  if (i < 2.5) return voxel(n);
  return glass(n);
}

void main() {
  vec3 n = normalize(vN);
  float m = clamp(uMix, 0.0, 3.0);
  float i0 = min(floor(m), 2.0);
  float f = m - i0;
  float nz = noise(vO * 2.3) * 0.82 + noise(vO * 9.0) * 0.18;
  nz = nz * 0.9 + 0.05;
  vec3 a = look(i0, n);
  vec3 b = look(i0 + 1.0, n);
  float t = smoothstep(nz - 0.012, nz + 0.012, f);
  vec3 col = mix(a, b, t);
  float seam = (1.0 - smoothstep(0.0, 0.035, abs(f - nz))) * step(0.002, f) * step(f, 0.998);
  col = mix(col, INK, seam);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export function markMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uMix: { value: 0 }, uTime: { value: 0 }, uDpr: { value: 1 } },
    vertexShader: vert,
    fragmentShader: frag,
  });
}
