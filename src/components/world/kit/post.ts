import * as THREE from "three";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import type { Bag } from "./bag";
import { FAR, NEAR } from "./iso";
import { INK, NOISE, type Shared } from "./paint";

// The finish every stage shares, painted world and baked PBR rooms alike: the scene is drawn to a linear half-float
// target (MSAA, so no SMAA pass is needed) with its depth, then one pass inks an outline wherever depth breaks or folds
// (the Laplacian of orthographic depth is zero on any flat face, so only real edges ink), adds bloom from a
// quarter-size blur of what emits (only light above `bloom` blooms, so lit stone never does), and fills the sky:
// painted smoke in the world, flat ink on a page (`flat`). `u.uFade` fades the frame to ink (0 to 1).
// A PBR room (`pbr`) drops the ink and the world's warm grade; with `agx` (a linear exposure) it tone-maps with AgX
// Punchy, the look the bakes are graded in, and without it the bake is taken as display-ready (a lightmap pre-scaled
// to match its Cycles still); `ao` adds GTAO
// before the composite, for rooms whose lightmap is too coarse to hold contact shadow (it draws the scene a second
// time for normals, so it is off unless asked for).

export function post(renderer: THREE.WebGLRenderer, S: Shared, b: Bag, o: { small: boolean; still: boolean; flat: boolean; bloom?: number; pbr?: { agx?: number; ao?: boolean } }) {
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
  const bright = new THREE.ShaderMaterial({ uniforms: { t: { value: rt.texture }, th: { value: o.bloom ?? 0.8 } }, vertexShader: VS, fragmentShader: "uniform sampler2D t; uniform float th; varying vec2 vUv; void main() { vec3 c = texture2D(t, vUv).rgb; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(th, th * 1.8, l), 1.0); }" });
  const blur = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, d: { value: new THREE.Vector2() } }, vertexShader: VS, fragmentShader: "uniform sampler2D t; uniform vec2 d; varying vec2 vUv; void main() { vec3 c = texture2D(t, vUv).rgb * 0.227; c += (texture2D(t, vUv + d * 1.385).rgb + texture2D(t, vUv - d * 1.385).rgb) * 0.316; c += (texture2D(t, vUv + d * 3.23).rgb + texture2D(t, vUv - d * 3.23).rgb) * 0.07; gl_FragColor = vec4(c, 1.0); }" });
  const fin = new THREE.ShaderMaterial({
    uniforms: { tC: { value: rt.texture }, tD: { value: rt.depthTexture }, tB: { value: bA.texture }, uRes: { value: new THREE.Vector2() }, uPx: { value: 0.02 }, uTh: { value: 1 }, uTime: S.time, uOff: { value: new THREE.Vector2() }, uInk: { value: INK }, uGrain: { value: o.still || o.flat ? 0 : 0.018 }, uFlat: { value: o.flat ? 1 : 0 }, uFade: { value: 0 }, uPbr: { value: o.pbr ? 1 : 0 }, uExp: { value: o.pbr?.agx ?? 0 } },
    vertexShader: VS,
    fragmentShader: `
      uniform sampler2D tC, tD, tB; uniform vec2 uRes, uOff; uniform float uPx, uTh, uTime, uGrain, uFlat, uFade, uPbr, uExp; uniform vec3 uInk; varying vec2 vUv;
      ${NOISE}
      #include <tonemapping_pars_fragment>
      // three's AgX with Blender's Punchy look (power 1.35, saturation 1.4), as the bakes are graded
      vec3 agxPunchy(vec3 c) {
        const mat3 inset = mat3(vec3(0.856627153315983, 0.137318972929847, 0.11189821299995), vec3(0.0951212405381588, 0.761241990602591, 0.0767994186031903), vec3(0.0482516061458583, 0.101439036467562, 0.811302368396859));
        const mat3 outset = mat3(vec3(1.1271005818144368, -0.1413297634984383, -0.14132976349843826), vec3(-0.11060664309660323, 1.157823702216272, -0.11060664309660294), vec3(-0.016493938717834573, -0.016493938717834257, 1.2519364065950405));
        c = inset * (LINEAR_SRGB_TO_LINEAR_REC2020 * c);
        c = agxDefaultContrastApprox(clamp((log2(max(c, 1e-10)) + 12.47393) / 16.499999, 0.0, 1.0));
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = l + 1.4 * (pow(c, vec3(1.35)) - l);
        c = pow(max(outset * c, 0.0), vec3(2.2));
        return clamp(LINEAR_REC2020_TO_LINEAR_SRGB * c, 0.0, 1.0);
      }
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
        col = mix(col, vec3(0.02, 0.013, 0.01), ink * 0.92 * (1.0 - uPbr) * smoothstep(0.012, 0.05, dot(col, vec3(0.3, 0.5, 0.2))));
        col += texture2D(tB, vUv).rgb * 0.9;
        if (uPbr > 0.5) col = sky || uExp == 0.0 ? col : agxPunchy(col * uExp);
        else if (!sky || uFlat < 0.5) col *= vec3(1.04, 1.0, 0.95);
        float v = smoothstep(1.25, 0.35, length((vUv - 0.5) * vec2(1.1, 1.3)));
        col *= mix(mix(0.5, 1.0, v), 1.0, uFlat);
        col = mix(col, uInk, uFade);
        col += (h21(vUv * uRes + fract(uTime) * 91.0) - 0.5) * uGrain;
        gl_FragColor = vec4(max(col, 0.0), 1.0);
        #include <colorspace_fragment>
      }`,
  });
  b.mats.push(bright, blur, fin);
  const aoRt = o.pbr?.ao ? new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }) : null;
  if (aoRt) b.rts.push(aoRt);
  let gtao: GTAOPass | null = null;
  const size = new THREE.Vector2();
  let w = 0, h = 0;
  return {
    u: fin.uniforms,
    /** Draw `scene` through `camera` at the renderer's current size, with the camera framing `vh` world units tall; `off` shifts the sky's smoke with the camera. */
    render(scene: THREE.Scene, camera: THREE.Camera, vh: number, off?: THREE.Vector2) {
      const s = renderer.getDrawingBufferSize(size);
      if (s.x !== w || s.y !== h) {
        w = s.x;
        h = s.y;
        rt.setSize(w, h);
        bA.setSize(w >> 2, h >> 2);
        bB.setSize(w >> 2, h >> 2);
        fin.uniforms.uRes.value.set(w, h);
        fin.uniforms.uTh.value = Math.max(1, renderer.getPixelRatio() * 0.95);
        aoRt?.setSize(w, h);
        gtao?.setSize(w, h);
      }
      fin.uniforms.uPx.value = vh / h;
      if (off) fin.uniforms.uOff.value.copy(off);
      renderer.setRenderTarget(rt);
      renderer.render(scene, camera);
      if (aoRt) {
        if (!gtao) {
          gtao = new GTAOPass(scene, camera, w, h);
          gtao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 2, thickness: 1, scale: 1, samples: 12 });
          gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
          gtao.blendIntensity = 0.85;
        }
        gtao.render(renderer, aoRt, rt, 0, false);
      }
      const src = aoRt ?? rt;
      bright.uniforms.t.value = fin.uniforms.tC.value = src.texture;
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
    /** Free what the bag does not hold (GTAO's own targets). */
    dispose() {
      gtao?.dispose();
    },
  };
}
