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
  float d = clamp(dot(n, L) * 0.7 + 0.42, 0.0, 1.0);
  vec2 g = gl_FragCoord.xy / (4.0 * uDpr);
  g = mat2(0.707, -0.707, 0.707, 0.707) * g;
  float r = sqrt(1.0 - d) * 0.66;
  float dotm = 1.0 - smoothstep(r - 0.07, r + 0.07, length(fract(g) - 0.5));
  vec3 col = mix(vec3(0.965, 0.953, 0.925), INK, dotm * 0.92);
  float chamfer = smoothstep(0.2, 0.35, vNo.z) * smoothstep(0.2, 0.35, length(vNo.xy));
  return mix(col, SIGNAL * (0.75 + 0.3 * d), chamfer);
}

vec3 felt(vec3 n) {
  float w = clamp((dot(n, L) + 0.55) / 1.55, 0.0, 1.0);
  float fib = noise(vO * 90.0) * 0.55 + noise(vO * 210.0) * 0.45;
  vec3 base = vec3(0.98, 0.72, 0.06);
  vec3 col = base * (0.42 + 0.68 * w) * (0.86 + 0.22 * fib);
  float fuzz = pow(1.0 - max(dot(n, vV), 0.0), 2.2);
  return col + vec3(1.0, 0.9, 0.62) * fuzz * 0.32;
}

vec3 voxel(vec3 n) {
  float k = 5.2;
  vec3 c = floor(vO * k + 0.5);
  vec3 lo = fract(vO * k + 0.5);
  vec3 m = min(lo, 1.0 - lo);
  vec3 an = abs(vNo);
  float e = an.z > 0.6 ? min(m.x, m.y) : (an.x > 0.6 ? min(m.y, m.z) : min(m.x, m.z));
  float h = hash(c + 3.1);
  vec3 col = h < 0.26 ? vec3(0.77, 0.16, 0.11) : h < 0.48 ? vec3(0.05, 0.41, 0.67) : h < 0.66 ? vec3(0.29, 0.59, 0.29) : h < 0.84 ? vec3(0.96, 0.8, 0.19) : vec3(0.94, 0.95, 0.95);
  float d = floor((dot(n, L) * 0.5 + 0.5) * 4.0) / 4.0;
  col *= 0.5 + 0.6 * d;
  return col * mix(0.55, 1.0, smoothstep(0.02, 0.08, e));
}

vec3 glass(vec3 n) {
  float f = pow(1.0 - max(dot(n, vV), 0.0), 3.0);
  vec3 milk = vec3(0.78, 0.83, 0.86);
  vec3 col = mix(vec3(0.42, 0.48, 0.53), milk, clamp(dot(n, L) * 0.5 + 0.55, 0.0, 1.0));
  float ui = step(0.86, fract(vO.y * 3.4)) * step(abs(vO.x + 0.1), 0.55) * step(0.6, abs(vNo.z));
  col = mix(col, vec3(0.96, 0.97, 0.98), ui * 0.55);
  vec3 h = normalize(L + vV);
  float spec = pow(max(dot(n, h), 0.0), 90.0);
  return mix(col, vec3(1.0), f * 0.7) + spec * 0.9;
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
