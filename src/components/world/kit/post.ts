import * as THREE from "three";
import type { Bag } from "./bag";
import { FAR, NEAR } from "./iso";
import { INK, NOISE, type Shared } from "./paint";

// The finish every stage shares: the scene is drawn to a target with its depth, then one pass inks an outline wherever
// depth breaks or folds (the Laplacian of orthographic depth is zero on any flat face, so only real edges ink), adds
// bloom from a quarter-size blur of what is brighter than paper, and fills the sky: painted smoke in the world, flat
// ink on a page (`flat`). `u.uFade` fades the frame to ink (0 to 1). Call `frame(vh)` with the camera's framed height.

export function post(renderer: THREE.WebGLRenderer, S: Shared, b: Bag, o: { small: boolean; still: boolean; flat: boolean }) {
  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: o.small ? 0 : 4, depthTexture: new THREE.DepthTexture(1, 1) });
  const bA = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  const bB = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  b.rts.push(rt, bA, bB);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  b.geos.push(quad.geometry);
  const flat = new THREE.Scene();
  flat.add(quad);
  const qcam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const VS = "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const bright = new THREE.ShaderMaterial({ uniforms: { t: { value: rt.texture } }, vertexShader: VS, fragmentShader: "uniform sampler2D t; varying vec2 vUv; void main() { vec3 c = texture2D(t, vUv).rgb; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(0.62, 1.4, l), 1.0); }" });
  const blur = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, d: { value: new THREE.Vector2() } }, vertexShader: VS, fragmentShader: "uniform sampler2D t; uniform vec2 d; varying vec2 vUv; void main() { vec3 c = texture2D(t, vUv).rgb * 0.227; c += (texture2D(t, vUv + d * 1.385).rgb + texture2D(t, vUv - d * 1.385).rgb) * 0.316; c += (texture2D(t, vUv + d * 3.23).rgb + texture2D(t, vUv - d * 3.23).rgb) * 0.07; gl_FragColor = vec4(c, 1.0); }" });
  const fin = new THREE.ShaderMaterial({
    uniforms: { tC: { value: rt.texture }, tD: { value: rt.depthTexture }, tB: { value: bA.texture }, uRes: { value: new THREE.Vector2() }, uPx: { value: 0.02 }, uTh: { value: 1 }, uTime: S.time, uOff: { value: new THREE.Vector2() }, uInk: { value: INK }, uGrain: { value: o.still || o.flat ? 0 : 0.018 }, uFlat: { value: o.flat ? 1 : 0 }, uFade: { value: 0 } },
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
  b.mats.push(bright, blur, fin);
  let w = 0, h = 0;
  return {
    u: fin.uniforms,
    /** Draw `scene` through `camera` at the renderer's current size, with the camera framing `vh` world units tall; `off` shifts the sky's smoke with the camera. */
    render(scene: THREE.Scene, camera: THREE.Camera, vh: number, off?: THREE.Vector2) {
      const s = renderer.getDrawingBufferSize(new THREE.Vector2());
      if (s.x !== w || s.y !== h) {
        w = s.x;
        h = s.y;
        rt.setSize(w, h);
        bA.setSize(w >> 2, h >> 2);
        bB.setSize(w >> 2, h >> 2);
        fin.uniforms.uRes.value.set(w, h);
        fin.uniforms.uTh.value = Math.max(1, renderer.getPixelRatio() * 0.95);
      }
      fin.uniforms.uPx.value = vh / h;
      if (off) fin.uniforms.uOff.value.copy(off);
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
    },
  };
}
