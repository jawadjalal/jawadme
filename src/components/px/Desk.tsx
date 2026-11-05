"use client";

import { later } from "./later";
import { useEffect, useRef } from "react";

// The desk everything sits on: slow value noise, ordered-dithered into two
// near-black inks, with the pointer lifting a patch of blue cells. The canvas
// is drawn at a quarter of the screen's size and scaled up with
// `image-rendering: pixelated`, so every fragment is one 4px square cell and
// the whole field costs almost nothing.

const CELL = 4;

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `
precision mediump float;
uniform vec2 r;
uniform float t;
uniform vec2 m;
uniform float s;
uniform float v;

float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p){ float a = .5, o = 0.; for (int k = 0; k < 4; k++){ o += a * n(p); p *= 2.03; a *= .5; } return o; }

float bayer(vec2 p){
  vec2 q = mod(floor(p), 4.);
  float x = q.x, y = q.y;
  // 4x4 Bayer matrix, unrolled for GLSL ES 1.0
  float b = 0.;
  if (y < .5) b = x < .5 ? 0. : x < 1.5 ? 8. : x < 2.5 ? 2. : 10.;
  else if (y < 1.5) b = x < .5 ? 12. : x < 1.5 ? 4. : x < 2.5 ? 14. : 6.;
  else if (y < 2.5) b = x < .5 ? 3. : x < 1.5 ? 11. : x < 2.5 ? 1. : 9.;
  else b = x < .5 ? 15. : x < 1.5 ? 7. : x < 2.5 ? 13. : 5.;
  return (b + .5) / 16.;
}

void main(){
  vec2 p = gl_FragCoord.xy;
  vec2 uv = p / r.y;
  float f = fbm(uv * 2.6 + vec2(t * .018, s * .00035));
  f = smoothstep(.38, .78, f);
  vec2 d = (p - m) / r.y;
  float g = smoothstep(.28, 0., length(d)) * (.55 + .45 * v);
  float b = bayer(p);
  vec3 c = vec3(.051, .051, .059);
  if (f * .42 > b) c = vec3(.085, .085, .1);
  if (g * .78 > b) c = vec3(.12, .14, .5);
  if (g * g * .5 > b) c = vec3(.18, .23, 1.);
  gl_FragColor = vec4(c, 1.);
}`;

export function Desk() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // WebGL setup is a long task, so it waits until the page has painted
    // and the browser is idle: the headline is never kept waiting by it.
    let stop: (() => void) | undefined;
    const run = () => {
      stop = init();
    };
    const cancel = later(run);
    return () => {
      cancel();
      stop?.();
    };
    function init(): (() => void) | undefined {
      const cv = ref.current;
      if (!cv) return;
      const gl = cv.getContext("webgl", { antialias: false, preserveDrawingBuffer: true });
      if (!gl) return;
      const sh = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      const pr = gl.createProgram()!;
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
      gl.useProgram(pr);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const u = (k: string) => gl.getUniformLocation(pr, k);
      const uR = u("r"), uT = u("t"), uM = u("m"), uS = u("s"), uV = u("v");

      let w = 0, h = 0;
      const size = () => {
        w = Math.ceil(innerWidth / CELL);
        h = Math.ceil(innerHeight / CELL);
        cv.width = w;
        cv.height = h;
        gl.viewport(0, 0, w, h);
      };
      size();
      addEventListener("resize", size);

      // The pointer is eased so the blue patch trails it like wet ink; on touch
      // screens it idles in a slow loop so the desk still breathes.
      const ptr = { x: innerWidth * 0.7, y: innerHeight * 0.4, tx: innerWidth * 0.7, ty: innerHeight * 0.4, seen: 0 };
      const move = (e: PointerEvent) => {
        ptr.tx = e.clientX;
        ptr.ty = e.clientY;
        ptr.seen = performance.now();
      };
      addEventListener("pointermove", move, { passive: true });

      let vel = 0, lastY = scrollY;
      const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      let raf = 0, last = 0, on = true;
      const t0 = performance.now();
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!on || now - last < 100) return; // 10 steps a second: the desk moves like a sprite, and costs little
        last = now;
        if (now - ptr.seen > 2500) {
          const k = (now - t0) / 1000;
          ptr.tx = innerWidth * (0.5 + 0.32 * Math.sin(k * 0.21));
          ptr.ty = innerHeight * (0.5 + 0.3 * Math.sin(k * 0.13 + 1));
        }
        ptr.x += (ptr.tx - ptr.x) * 0.12;
        ptr.y += (ptr.ty - ptr.y) * 0.12;
        const dy = scrollY - lastY;
        lastY = scrollY;
        vel += (Math.min(Math.abs(dy) / 40, 1) - vel) * 0.1;
        gl.uniform2f(uR, w, h);
        gl.uniform1f(uT, still ? 0 : (now - t0) / 1000);
        gl.uniform2f(uM, ptr.x / CELL, h - ptr.y / CELL);
        gl.uniform1f(uS, scrollY / CELL);
        gl.uniform1f(uV, vel);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      raf = requestAnimationFrame(frame);
      const vis = () => (on = document.visibilityState === "visible");
      document.addEventListener("visibilitychange", vis);
      return () => {
        cancelAnimationFrame(raf);
        removeEventListener("resize", size);
        removeEventListener("pointermove", move);
        document.removeEventListener("visibilitychange", vis);
      };

    }
  }, []);

  return <canvas ref={ref} className="desk" aria-hidden="true" />;
}
