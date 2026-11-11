"use client";

/*
 * The ground: a full-bleed field of glyphs drawn by the asciicn engine (src/lib/ascii/shader, MIT, vendored), in the
 * four felt colours turning slowly round the screen. Empty in the middle where the arc and its line sit, filling
 * towards the edges, breathing on a slow wave; the pointer pushes the glyphs aside as it passes. No blur, no glow:
 * glyphs only. The engine runs it in WebGL2, pauses it off screen and in hidden tabs, and draws one still frame under
 * reduced motion. Until it draws (or where there is no WebGL2) the still CSS print of the felt colours under it
 * (felt.css `fh-ground`) stays. Decorative. Styles: felt.css (`fh-edge`).
 */
import { AsciiShader } from "@/lib/ascii/shader";

const FIELD = /* glsl */ `
float field(vec2 uv, vec2 res, float t) {
  vec2 c = (uv - 0.5) * vec2(res.x / res.y, 1.0);
  float rad = length((uv - 0.5) * vec2(1.25, 1.0));
  float wave = 0.5 + 0.5 * sin(c.x * 4.0 + t * 0.35) * sin(c.y * 3.2 - t * 0.27);
  float grain = fbm(c * 3.0 + vec2(t * 0.04, -t * 0.03));
  float v = smoothstep(0.34, 0.92, rad) * (0.5 + 0.35 * wave + 0.3 * grain);
  return clamp(v, 0.0, 1.0);
}`;

const COLOR = /* glsl */ `
vec3 colorField(vec2 uv, vec2 res, float t) {
  vec2 c = (uv - 0.5) * vec2(res.x / res.y, 1.0);
  float a = atan(c.y, c.x) / 6.28318 + 0.5;
  vec3 c0 = vec3(0.604, 0.302, 0.918), c1 = vec3(0.941, 0.271, 0.31), c2 = vec3(0.961, 0.706, 0.0), c3 = vec3(0.122, 0.478, 0.878);
  float q = fract(a + t * 0.006) * 4.0;
  vec3 k = q < 1.0 ? mix(c0, c1, q) : q < 2.0 ? mix(c1, c2, q - 1.0) : q < 3.0 ? mix(c2, c3, q - 2.0) : mix(c3, c0, q - 3.0);
  float rad = length((uv - 0.5) * vec2(1.25, 1.0));
  return k * (0.42 + 0.5 * smoothstep(0.4, 1.0, rad));
}`;

export function Edge() {
  return (
    <AsciiShader
      className="fh-edge"
      field={FIELD}
      colorField={COLOR}
      colorMode="truecolor"
      chars=" .`·:;+*"
      cell={13}
      speed={1}
      fps={24}
      stillTime={6}
      interaction="repel"
      paper="#000000"
    />
  );
}
