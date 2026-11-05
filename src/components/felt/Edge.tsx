"use client";

/*
 * The screen's edge, after ignaru.com: a band of moving grain in the four slot colours, lilac round to blue, an ink-bleed
 * wobble on its inner edge, nothing in the middle. Grain only: no blur, no bloom, no glow (Jawad). One small WebGL
 * pass at half resolution and 24 fps, started once the page is idle, paused while the tab is hidden, one still frame
 * under reduced motion. Decorative. Styles: felt.css (`fh-edge`).
 */
import { useEffect, useRef } from "react";

const FRAG = `precision mediump float;
uniform vec2 r; uniform float t; uniform float px;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 uv = gl_FragCoord.xy / r;
  float d = min(min(gl_FragCoord.x, r.x - gl_FragCoord.x), min(gl_FragCoord.y, r.y - gl_FragCoord.y)) / px;
  float a = atan(uv.y - 0.5, uv.x - 0.5) / 6.28318 + 0.5;
  float w = 60.0 + 16.0 * sin(a * 37.0 + t * 0.35) + 9.0 * sin(a * 91.0 - t * 0.5);
  float band = 1.0 - smoothstep(0.0, w, d);
  vec3 c0 = vec3(0.604, 0.302, 0.918), c1 = vec3(0.941, 0.271, 0.31), c2 = vec3(0.961, 0.706, 0.0), c3 = vec3(0.122, 0.478, 0.878);
  float q = fract(a + t * 0.006) * 4.0;
  vec3 c = q < 1.0 ? mix(c0, c1, q) : q < 2.0 ? mix(c1, c2, q - 1.0) : q < 3.0 ? mix(c2, c3, q - 2.0) : mix(c3, c0, q - 3.0);
  float g = h(floor(gl_FragCoord.xy) + floor(t * 24.0) * 7.31);
  float alpha = band * band * smoothstep(0.56, 1.0, g) * 0.72;
  gl_FragColor = vec4(c * alpha, alpha);
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
