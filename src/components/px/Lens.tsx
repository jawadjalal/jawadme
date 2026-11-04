"use client";

import { useEffect, useRef, useState } from "react";
import { Bit } from "./Bit";

// The hero sketch, drawn by the GPU as square cells. Far from the pointer the
// cells are 6px; inside a square lens they step down to 4, 3 and then 2px, so
// the pixel art resolves back towards the pen drawing it came from. The
// texture is the sketch's soft ink coverage (art/pixelate.py) with mipmaps,
// so each cell reads the average ink under it and a threshold decides it.
//
// The pencil tool paints orange cells onto a 6px grid that fade out through
// the same ordered dither; the eraser wipes them.

const VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_tex;
uniform sampler2D u_paint;
uniform vec2 u_res;
uniform vec2 u_tex_size;
uniform vec2 u_ptr;
uniform float u_rad;
uniform float u_dpr;
uniform float u_reveal;
uniform float u_lens;
uniform vec3 u_ink;
uniform vec3 u_pop;
out vec4 o;

float bayer8(vec2 p){
  ivec2 i = ivec2(mod(p, 8.));
  int m[64] = int[64](0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21);
  return (float(m[i.y * 8 + i.x]) + .5) / 64.;
}

void main(){
  vec2 fc = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 d = abs(fc - u_ptr);
  float q = max(d.x, d.y) / u_rad;
  float cs = 3.;
  if (u_lens > .5) cs = q < .55 ? 1. : q < 1. ? 2. : 3.;
  cs *= u_dpr;
  vec2 cell = floor(fc / cs);
  vec2 c = (cell + .5) * cs;
  vec2 uv = c / u_res;
  float lod = log2(max(cs * u_tex_size.x / u_res.x, 1.));
  float v = textureLod(u_tex, uv, lod).r;
  float thr = cs / u_dpr < 1.5 ? .5 : cs / u_dpr < 2.5 ? .32 : .25;
  bool inked = v > thr && bayer8(cell) < u_reveal;

  // the lens frame: a 1-cell square outline with gaps, in orange
  float edge = abs(q - 1.);
  bool frame = u_lens > .5 && edge * u_rad < cs * .9 && q > .98 && mod(floor((fc.x + fc.y) / (4. * u_dpr)), 3.) > .5;

  vec2 pc = floor(fc / (6. * u_dpr));
  float pv = texture(u_paint, (pc + .5) / (u_res / (6. * u_dpr))).r;
  bool painted = pv > bayer8(pc) * .98 + .01;

  if (painted) o = vec4(u_pop, 1.);
  else if (frame) o = vec4(u_pop, 1.);
  else if (inked) o = vec4(u_ink, 1.);
  else o = vec4(0.);
}`;

type Tool = "lens" | "pencil" | "eraser";

export function Lens({ src, still, alt }: { src: string; still: string; alt: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const toolRef = useRef<Tool>("lens");
  const [tool, setTool] = useState<Tool>("lens");
  const [gl2, setGl2] = useState(true);
  const [pos, setPos] = useState({ x: 0, y: 0, z: 6 });
  const wipe = useRef<() => void>(() => {});

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const gl = cv.getContext("webgl2", { premultipliedAlpha: false, antialias: false, preserveDrawingBuffer: true });
    if (!gl) {
      setGl2(false);
      return;
    }
    const sh = (type: number, s: string) => {
      const x = gl.createShader(type)!;
      gl.shaderSource(x, s);
      gl.compileShader(x);
      return x;
    };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      setGl2(false);
      return;
    }
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const u = (k: string) => gl.getUniformLocation(pr, k);

    const css = getComputedStyle(cv);
    const rgb = (v: string) => {
      const m = v.trim().match(/^#?([0-9a-f]{6})$/i);
      const n = m ? parseInt(m[1], 16) : 0;
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as const;
    };
    gl.uniform3f(u("u_ink"), ...rgb(css.getPropertyValue("--blue") || "#2e3bff"));
    gl.uniform3f(u("u_pop"), ...rgb(css.getPropertyValue("--pop") || "#fc6a01"));

    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 1, 1, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array([0]));
    gl.uniform1i(u("u_tex"), 0);
    let ready = false;
    let texW = 1024;
    const img = new Image();
    img.onload = () => {
      texW = img.naturalWidth;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ready = true;
      t0 = performance.now();
    };
    img.src = src;

    // the paint layer: one byte per 6px cell, uploaded each frame it changes
    const ptex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, ptex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(u("u_paint"), 1);
    let pw = 1, ph = 1;
    let paint = new Float32Array(1);
    let bytes = new Uint8Array(1);
    let dirty = true;

    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    const size = () => {
      const r = cv.getBoundingClientRect();
      W = Math.round(r.width * dpr);
      H = Math.round(r.height * dpr);
      cv.width = W;
      cv.height = H;
      gl.viewport(0, 0, W, H);
      pw = Math.ceil(r.width / 6);
      ph = Math.ceil(r.height / 6);
      paint = new Float32Array(pw * ph);
      bytes = new Uint8Array(pw * ph);
      dirty = true;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    wipe.current = () => {
      paint.fill(0);
      dirty = true;
    };

    const ptr = { x: 0.62, y: 0.38, tx: 0.62, ty: 0.38, inside: false, down: false, seen: -1e9 };
    let lastCell = -1;
    const stamp = (cx: number, cy: number, v: number) => {
      for (let oy = -1; oy <= 1; oy++)
        for (let ox = -1; ox <= 1; ox++) {
          const x = cx + ox, y = cy + oy;
          if (x < 0 || y < 0 || x >= pw || y >= ph) continue;
          const i = y * pw + x;
          paint[i] = v ? Math.max(paint[i], ox || oy ? 0.7 : 1) : 0;
        }
      dirty = true;
    };
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      ptr.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      if (!ptr.inside) return;
      ptr.tx = x;
      ptr.ty = y;
      ptr.seen = performance.now();
      const t = toolRef.current;
      if (t !== "lens" && (e.pointerType === "mouse" ? true : ptr.down)) {
        const cx = Math.floor((x * r.width) / 6), cy = Math.floor((y * r.height) / 6);
        const id = cy * pw + cx;
        if (id !== lastCell) stamp(cx, cy, t === "pencil" ? 1 : 0);
        lastCell = id;
      }
      setPos((p) => {
        const nx = Math.round(x * texW), ny = Math.round(y * texW * (r.height / r.width));
        return p.x === nx && p.y === ny ? p : { ...p, x: nx, y: ny };
      });
    };
    const onDown = (e: PointerEvent) => {
      ptr.down = true;
      onMove(e);
    };
    const onUp = () => (ptr.down = false);
    addEventListener("pointermove", onMove, { passive: true });
    cv.addEventListener("pointerdown", onDown);
    addEventListener("pointerup", onUp);

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t0 = performance.now();
    let raf = 0, on = true;
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting));
    io.observe(cv);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!on || !ready) return;
      // after a few idle seconds the lens wanders over the drawing by itself
      if (now - ptr.seen > 3000) {
        const k = now / 1000;
        ptr.tx = 0.5 + 0.28 * Math.sin(k * 0.5);
        ptr.ty = 0.45 + 0.26 * Math.sin(k * 0.37 + 0.8);
      }
      ptr.x += (ptr.tx - ptr.x) * 0.16;
      ptr.y += (ptr.ty - ptr.y) * 0.16;
      let any = false;
      for (let i = 0; i < paint.length; i++) {
        if (paint[i] > 0) {
          paint[i] = Math.max(0, paint[i] - 0.0045);
          bytes[i] = paint[i] * 255;
          any = true;
        } else bytes[i] = 0;
      }
      if (any || dirty) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, ptex);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, pw, ph, 0, gl.RED, gl.UNSIGNED_BYTE, bytes);
        dirty = false;
      }
      const reveal = still ? 1 : Math.min(1, (now - t0) / 1400);
      gl.uniform2f(u("u_res"), W, H);
      gl.uniform2f(u("u_tex_size"), texW, texW);
      gl.uniform2f(u("u_ptr"), ptr.x * W, ptr.y * H);
      gl.uniform1f(u("u_rad"), Math.min(W, H) * 0.2);
      gl.uniform1f(u("u_dpr"), dpr);
      gl.uniform1f(u("u_reveal"), reveal * reveal);
      gl.uniform1f(u("u_lens"), toolRef.current === "lens" ? 1 : 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
    };
  }, [src]);

  const tools: { k: Tool; label: string; bit: "lens" | "pencil" | "eraser" }[] = [
    { k: "lens", label: "Lens: sharpen the pixels under the pointer", bit: "lens" },
    { k: "pencil", label: "Pencil: draw on the sketch", bit: "pencil" },
    { k: "eraser", label: "Eraser: wipe what you drew", bit: "eraser" },
  ];

  return (
    <div className={`lens tool-${tool}`}>
      <div className="lens-tools" role="toolbar" aria-label="Sketch tools">
        {tools.map((t) => (
          <button
            key={t.k}
            type="button"
            aria-label={t.label}
            aria-pressed={tool === t.k}
            title={t.label}
            onClick={() => {
              if (t.k === "eraser" && tool === "eraser") wipe.current();
              setTool(t.k);
            }}
          >
            <Bit name={t.bit} cell={2} />
          </button>
        ))}
      </div>
      <div className="lens-stage">
        {gl2 ? (
          <canvas ref={ref} role="img" aria-label={alt} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={still} alt={alt} className="pxart" />
        )}
      </div>
      <div className="lens-status" aria-hidden="true">
        <span>x {String(pos.x).padStart(4, "0")}</span>
        <span>y {String(pos.y).padStart(4, "0")}</span>
        <span>{tool === "lens" ? "lens 3px to 1px" : tool === "pencil" ? "pencil, 6px cells" : "eraser, click again to clear"}</span>
      </div>
    </div>
  );
}
