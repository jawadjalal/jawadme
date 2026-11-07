"use client";

/*
 * The ground (v10.2, Jawad 6 Nov: "a large halftone, not plain black"): a full-bleed field of round dots on a 9px grid,
 * the slot colours (lilac, coral, yellow, blue) turning slowly round the screen, tiny in the middle where the dial and
 * its line sit, larger towards the edges, breathing on a slow wave. Dots only: no blur, no bloom, no glow. One small
 * WebGL pass at half resolution and 24 fps, started once the page is idle, paused while the tab is hidden, one still
 * frame under reduced motion. Decorative. Styles: felt.css (`fh-edge`, with a still CSS print of the same dots under it, `fh-ground`, for the first paint and for no WebGL). Ported from ignaru.com (components/home/Edge.tsx) unchanged.
 */
import { useEffect, useRef } from "react";

const FRAG = `precision mediump float;
uniform vec2 r; uniform float t; uniform float px;
void main(){
  float cell = 9.0 * px;
  vec2 id = floor(gl_FragCoord.xy / cell);
  vec2 f = fract(gl_FragCoord.xy / cell) - 0.5;
  vec2 u = (id + 0.5) * cell / r - 0.5;
  vec2 c = u * vec2(r.x / r.y, 1.0);
  float rad = length(u * vec2(1.2, 1.0));
  float wave = 0.5 + 0.5 * sin(c.x * 5.0 + t * 0.18) * sin(c.y * 4.0 - t * 0.14);
  float v = smoothstep(0.3, 0.85, rad) * (0.6 + 0.4 * wave);
  float dotR = 0.47 * v;
  float m = 1.0 - smoothstep(dotR - 0.07, dotR, length(f));
  float a = atan(c.y, c.x) / 6.28318 + 0.5;
  vec3 c0 = vec3(0.604, 0.302, 0.918), c1 = vec3(0.941, 0.271, 0.31), c2 = vec3(0.961, 0.706, 0.0), c3 = vec3(0.122, 0.478, 0.878);
  float q = fract(a + t * 0.004) * 4.0;
  vec3 k = q < 1.0 ? mix(c0, c1, q) : q < 2.0 ? mix(c1, c2, q - 1.0) : q < 3.0 ? mix(c2, c3, q - 2.0) : mix(c3, c0, q - 3.0);
  float alpha = m * (0.12 + 0.42 * v);
  gl_FragColor = vec4(k * alpha, alpha);
}`;
const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";

export function Edge() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    let raf = 0;
    let stop = false;
    const begin = () => {
      const gl = cv.getContext("webgl", { premultipliedAlpha: true, antialias: false, alpha: true });
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
      gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const uR = gl.getUniformLocation(pr, "r");
      const uT = gl.getUniformLocation(pr, "t");
      const uPx = gl.getUniformLocation(pr, "px");
      // half as many grains on a phone, where the band is a larger share of the screen
      const k = 0.5;
      const size = () => {
        cv.width = Math.round(cv.clientWidth * k);
        cv.height = Math.round(cv.clientHeight * k);
        gl.viewport(0, 0, cv.width, cv.height);
        gl.uniform2f(uR, cv.width, cv.height);
        gl.uniform1f(uPx, k);
      };
      size();
      window.addEventListener("resize", size);
      const draw = (ms: number) => {
        gl.uniform1f(uT, ms / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        draw(0);
        return;
      }
      let last = 0;
      const loop = (ms: number) => {
        if (stop) return;
        raf = requestAnimationFrame(loop);
        if (document.hidden || ms - last < 1000 / 24) return;
        last = ms;
        draw(ms);
      };
      raf = requestAnimationFrame(loop);
      cv.dataset.on = "1";
    };
    const idle = () => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(begin, { timeout: 3000 }) : setTimeout(begin, 1500));
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
    return () => {
      stop = true;
      cancelAnimationFrame(raf);
    };
  }, []);
  return <canvas ref={ref} className="fh-edge" aria-hidden="true" />;
}
