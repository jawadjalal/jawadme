"use client";

/*
 * The ground, ported from ignaru.com (components/home/Edge.tsx): a full-bleed field of round dots on a 9px grid, the
 * four felt colours turning slowly round the screen, tiny in the middle where the ring and its line sit, larger towards
 * the edges, breathing on a slow wave. Dots only: no blur, no bloom, no glow. One small WebGL pass at half resolution and
 * 24 fps, started once the page is idle, paused while the tab is hidden, one still frame under reduced motion (redrawn
 * on resize). The canvas marks itself `data-on` once it has drawn, and the still CSS print of the same dots under it
 * (felt.css `fh-ground`) steps out; if the shader fails to compile or link, or the context is lost, the mark comes off
 * and the CSS dots come back. Decorative. Styles: felt.css (`fh-edge`).
 */
import { useEffect, useRef } from "react";

const FRAG = (p: "highp" | "mediump") => `precision ${p} float;
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
    let gone = false;
    let idleId = 0;
    let size: (() => void) | null = null;
    const off = () => {
      cancelAnimationFrame(raf);
      delete cv.dataset.on;
    };
    const lost = (e: Event) => {
      e.preventDefault();
      off();
    };
    const begin = () => {
      if (gone) return;
      const gl = cv.getContext("webgl", { premultipliedAlpha: true, antialias: false, alpha: true });
      if (!gl) return;
      const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      const sh = (type: number, src: string) => {
        const s = gl.createShader(type);
        if (!s) return null;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
      };
      const vs = sh(gl.VERTEX_SHADER, VERT);
      const fs = sh(gl.FRAGMENT_SHADER, FRAG(hp && hp.precision > 0 ? "highp" : "mediump"));
      const pr = gl.createProgram();
      if (!vs || !fs || !pr) return;
      gl.attachShader(pr, vs);
      gl.attachShader(pr, fs);
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
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
      let t = 0;
      const draw = (ms: number) => {
        t = ms;
        gl.uniform1f(uT, ms / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      size = () => {
        cv.width = Math.round(cv.clientWidth * k);
        cv.height = Math.round(cv.clientHeight * k);
        gl.viewport(0, 0, cv.width, cv.height);
        gl.uniform2f(uR, cv.width, cv.height);
        gl.uniform1f(uPx, k);
        // resizing clears the canvas: draw the current frame again at once (the still one under reduced motion)
        draw(t);
      };
      size();
      window.addEventListener("resize", size);
      cv.addEventListener("webglcontextlost", lost);
      cv.dataset.on = "1";
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      let last = 0;
      const loop = (ms: number) => {
        if (gone) return;
        raf = requestAnimationFrame(loop);
        // nothing moves behind an open drawer (Drawer.tsx marks the page html.fh-locked while one is open)
        if (document.hidden || document.documentElement.classList.contains("fh-locked") || ms - last < 1000 / 24) return;
        last = ms;
        draw(ms);
      };
      raf = requestAnimationFrame(loop);
    };
    const idle = () => {
      idleId = typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(begin, { timeout: 3000 }) : window.setTimeout(begin, 1500);
    };
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
    return () => {
      gone = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("load", idle);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      window.clearTimeout(idleId);
      if (size) window.removeEventListener("resize", size);
      cv.removeEventListener("webglcontextlost", lost);
    };
  }, []);
  return <canvas ref={ref} className="fh-edge" aria-hidden="true" />;
}
