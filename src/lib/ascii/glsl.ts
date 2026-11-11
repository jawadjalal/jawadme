/**
 * Source handling for the GLSL a `AsciiShader` compiles. No imports, so
 * it runs anywhere, including the tests next to it.
 */

const COMMENTS = /\/\*[\s\S]*?\*\/|\/\/[^\r\n]*/g;
const DIRECTIVE = /^[ \t]*#/m;
const STRUCT = /^\s*(?:(?:lowp|mediump|highp|const|uniform)\s+)*struct\b/;
const PRECISION = /^\s*precision\b/;
// GLSL tokens: numbers (with any exponent), names, the two-character
// operators, then any other single character, `.` included. So `p.x` and
// `p . x` match, while `a + ++b` and `a++ +b` stay different.
const TOKEN =
  /\d+\.\d*(?:[eE][-+]?\d+)?|\.\d+(?:[eE][-+]?\d+)?|\d+(?:[eE][-+]?\d+)?|[A-Za-z_]\w*|\+\+|--|<=|>=|==|!=|&&|\|\||\^\^|[-+*/]=|\S/g;

/**
 * GLSL without directives, split at the top level with comments dropped:
 * declarations ending in `;` and definitions ending in their `}`.
 */
const topLevelChunks = (source: string): string[] => {
  const code = source.replaceAll(COMMENTS, " ");
  const chunks: string[] = [];
  let depth = 0;
  let start = 0;
  const cut = (end: number) => {
    const chunk = code.slice(start, end).trim();
    start = end;
    if (chunk !== "") {
      chunks.push(chunk);
    }
  };
  for (let index = 0; index < code.length; index += 1) {
    const char = code[index];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      // A struct declaration runs on to its `;`, which may name variables.
      if (depth === 0 && !STRUCT.test(code.slice(start, index))) {
        cut(index + 1);
      }
    } else if (char === ";" && depth === 0) {
      cut(index + 1);
    }
  }
  cut(code.length);
  return chunks;
};

const tokens = (chunk: string) => chunk.match(TOKEN)?.join(" ") ?? "";

const hasDirective = (source: string) =>
  DIRECTIVE.test(source.replaceAll(COMMENTS, " "));

/**
 * `field` and `colorField` compile into one shader, where defining a helper
 * twice is an error. A common way to share one is to prepend the same
 * string to both, so drop any definition from `colorField` that `field`
 * already has, token for token. Two different definitions still fail.
 * Sources with preprocessor directives are left alone: a definition's
 * meaning can depend on `#if` and `#define` around it. `precision`
 * statements are always kept, since each sets the precision for the code
 * after it.
 */
export const withoutSharedHelpers = (
  field: string,
  colorField: string
): string => {
  if (hasDirective(field) || hasDirective(colorField)) {
    return colorField;
  }
  const defined = new Set(topLevelChunks(field).map(tokens));
  return topLevelChunks(colorField)
    .filter((chunk) => PRECISION.test(chunk) || !defined.has(tokens(chunk)))
    .join("\n");
};

/**
 * GLSL helpers available to every field (GLSL ES 1.00, the dialect fields
 * are written in). Names starting with `u_` are reserved for the engine's
 * uniforms and `ascii_` for its helpers.
 *
 * - `float hash21(vec2 p)`: a stable pseudo-random value in [0, 1).
 * - `float snoise(vec2 p)`: 2D simplex noise in [-1, 1].
 * - `float fbm(vec2 p)`: four octaves of simplex noise, in [0, 1].
 * - `vec3 spectrum(float h)`: a saturated rainbow. 0 is red, then yellow,
 *   green, cyan, blue and magenta, back to red at 1; it wraps.
 * - `vec4 paletteColor(float x)`: the palette's ink colours, every entry
 *   after the paper, as a smooth ramp from x = 0 to 1.
 * - `vec3 oklch(float L, float C, float h)`: an OKLCH colour (h in
 *   radians) as linear RGB. Pass it through `toSrgb` before returning it.
 * - `vec3 toSrgb(vec3 linear)`: linear RGB to sRGB, clamped.
 * - `vec3 aces(vec3 x)`: the ACES filmic tone map, for HDR-ish colour.
 */
export const GLSL_HELPERS = `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 ascii_permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = ascii_permute(ascii_permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  mat2 rotate = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    sum += amp * snoise(p);
    p = rotate * p * 2.02 + vec2(11.3, 4.7);
    amp *= 0.5;
  }
  return clamp(0.5 + 0.5 * sum / 0.9375, 0.0, 1.0);
}

vec3 spectrum(float h) {
  vec3 rgb = clamp(abs(mod(fract(h) * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return rgb * rgb * (3.0 - 2.0 * rgb);
}

vec4 ascii_paletteEntry(float index) {
  return texture2D(u_palette, vec2((index + 0.5) / u_paletteSize, 0.5));
}

vec4 paletteColor(float x) {
  float last = u_paletteSize - 1.0;
  float scaled = clamp(x, 0.0, 1.0) * max(last - 1.0, 0.0);
  float index = floor(scaled);
  vec4 from = ascii_paletteEntry(min(1.0 + index, last));
  vec4 to = ascii_paletteEntry(min(2.0 + index, last));
  return mix(from, to, scaled - index);
}

vec3 oklch(float L, float C, float h) {
  vec3 lab = vec3(L, C * cos(h), C * sin(h));
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 toSrgb(vec3 linear) {
  vec3 c = clamp(linear, 0.0, 1.0);
  vec3 low = c * 12.92;
  vec3 high = 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055;
  return mix(low, high, step(vec3(0.0031308), c));
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

vec4 ascii_rgba(vec3 color) {
  return vec4(color, 1.0);
}

vec4 ascii_rgba(vec4 color) {
  return color;
}
`;

/** Uniforms every field can read, declared before the helpers. */
const FIELD_UNIFORMS = `
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_seed;
uniform vec3 u_pointer;
uniform vec2 u_pointerVelocity;
uniform vec3 u_click;
uniform vec4 u_audio;
uniform sampler2D u_palette;
uniform float u_paletteSize;
uniform vec2 ascii_samples;
uniform float ascii_levels;
uniform float ascii_interaction;
uniform sampler2D ascii_trail;
`;

/**
 * Pointer interaction, applied to the sample position before the field
 * runs. Distances are in sample rows (`1.0 / res.y`), so a radius looks
 * the same in a wide box and a tall one.
 */
const INTERACTION = `
vec2 ascii_interact(vec2 uv, out float keep, out float boost) {
  keep = 1.0;
  boost = 0.0;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  if (ascii_interaction > 0.5 && ascii_interaction < 1.5) {
    // Repel: glyphs bulge away from the pointer and its core clears.
    vec2 d = (uv - u_pointer.xy) * aspect;
    float dist = length(d);
    float radius = 0.24;
    float fall = smoothstep(radius, 0.0, dist) * u_pointer.z;
    vec2 dir = dist > 1e-4 ? d / dist : vec2(0.0);
    uv -= dir * fall * radius * 0.55 / aspect;
    keep = 1.0 - 0.9 * smoothstep(radius * 0.42, 0.0, dist) * u_pointer.z;
  } else if (ascii_interaction > 1.5 && ascii_interaction < 2.5) {
    // Ripple: a ring leaves each click, displacing and lighting glyphs.
    float age = u_click.z;
    if (age < 4.0) {
      vec2 d = (uv - u_click.xy) * aspect;
      float dist = length(d);
      float front = dist - age * 0.55;
      float fade = exp(-age * 1.1);
      float wave = sin(front * 46.0) * exp(-front * front * 90.0) * fade;
      vec2 dir = dist > 1e-4 ? d / dist : vec2(0.0);
      uv += dir * wave * 0.018 / aspect;
      boost = max(wave, 0.0) * 0.55;
    }
  }
  return uv;
}
`;

/**
 * The field pass: one fragment per sample, writing the colour in RGB and
 * the tone in alpha. GLSL ES 1.00 so fields written for WebGL1 compile
 * unchanged (ES 3.00 reserves words like `sample` and `input`).
 */
export const fieldShader = ({
  field,
  colorField,
  uniforms,
}: {
  field: string;
  colorField: string | undefined;
  uniforms: string;
}): { source: string; fieldLine: number; colorLine: number } => {
  const head = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
${FIELD_UNIFORMS}
${uniforms}
${GLSL_HELPERS}
${INTERACTION}
`;
  let color = "";
  if (colorField !== undefined) {
    const kept = withoutSharedHelpers(field, colorField);
    // Nothing shared: keep the source as written, so error lines match it.
    const dropped =
      topLevelChunks(kept).length < topLevelChunks(colorField).length;
    color = dropped ? kept : colorField;
  }
  // Line numbers before each source starts, for compile error messages.
  const fieldLine = head.split("\n").length - 1;
  const colorLine = fieldLine + field.split("\n").length;
  const source = `${head}${field}
${color}
void main() {
  vec2 base = gl_FragCoord.xy / ascii_samples;
  float keep;
  float boost;
  vec2 uv = ascii_interact(base, keep, boost);
  float tone = field(uv, u_resolution, u_time);
  // NaN and infinities from a field become paper, not noise.
  tone = (tone == tone && abs(tone) < 1e6) ? clamp(tone, 0.0, 1.0) : 0.0;
  tone = clamp(tone * keep + boost, 0.0, 1.0);
  if (ascii_interaction > 2.5) {
    tone = clamp(tone + texture2D(ascii_trail, base).r, 0.0, 1.0);
  }
  if (ascii_levels > 1.5) {
    tone = floor(tone * (ascii_levels - 1.0) + 0.5) / (ascii_levels - 1.0);
  }
  vec3 rgb = ${colorField === undefined ? "vec3(0.0)" : "clamp(ascii_rgba(colorField(uv, u_resolution, u_time)).rgb, 0.0, 1.0)"};
  gl_FragColor = vec4(rgb, tone);
}
`;
  return { colorLine, fieldLine, source };
};

/** A full-screen triangle, shared by every pass. */
export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/** The same triangle for the GLSL ES 1.00 field pass. */
export const VERTEX_SHADER_100 = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/** Charset kinds as the cell pass numbers them. */
export const KIND_CODES = {
  braille: 1,
  edge: 3,
  quadrants: 2,
  ramp: 0,
} as const;

/** Colour modes as the cell pass numbers them; duotone and palette share a ramp. */
export const COLOR_CODES = {
  ansi16: 2,
  duotone: 3,
  mono: 0,
  palette: 3,
  truecolor: 1,
} as const;

/**
 * The cell pass: one fragment per glyph cell. It reads the cell's samples,
 * picks the glyph and its colour with the same rules as `mapTones` in
 * `frame.ts`, and writes the glyph's atlas slot (attachment 0) and colour
 * (attachment 1). `capture()` reads these back, so exported text is what
 * the screen shows. Row 0 of the output is the top row of cells.
 */
export const CELL_SHADER = `#version 300 es
precision highp float;
precision highp int;

uniform sampler2D u_field;
uniform sampler2D u_positions;
uniform sampler2D u_thresholds;
uniform sampler2D u_coverage;
uniform ivec2 u_cells;
uniform ivec2 u_grid;
uniform int u_kind;
uniform int u_count;
uniform int u_calibrated;
uniform int u_dither;
uniform int u_matrixSize;
uniform float u_steps;
uniform vec4 u_grade;
uniform int u_invert;
uniform float u_threshold;
uniform float u_edgeThreshold;
uniform int u_colorMode;
uniform int u_hasColor;
uniform vec3 u_ink;
uniform vec3 u_ansi[16];
uniform vec3 u_ansiLab[16];
uniform vec3 u_stops[8];
uniform int u_stopCount;
uniform float u_glitch;
uniform float u_glitchSeed;

layout(location = 0) out vec4 o_glyph;
layout(location = 1) out vec4 o_color;

ivec2 fieldSize;

float grade(float t) {
  float shaped = clamp((t - 0.5) * u_grade.y + 0.5 + u_grade.x, 0.0, 1.0);
  return u_grade.z == 1.0 ? shaped : pow(shaped, 1.0 / max(0.01, u_grade.z));
}

// A sample by its top-left based coordinate; the texture's row 0 is the bottom.
vec4 fieldAt(ivec2 p) {
  return texelFetch(u_field, ivec2(p.x, fieldSize.y - 1 - p.y), 0);
}

float toneAt(ivec2 p) {
  float graded = grade(fieldAt(p).a);
  return u_invert == 1 ? 1.0 - graded : graded;
}

float cutAt(ivec2 p) {
  if (u_dither == 0) {
    return 0.5;
  }
  float rank = floor(texelFetch(u_thresholds, p % u_matrixSize, 0).r * 255.0 + 0.5);
  return (rank + 0.5) / u_steps;
}

float positionAt(int index) {
  return texelFetch(u_positions, ivec2(index, 0), 0).r;
}

int rampLevel(float tone, float cut) {
  float last = float(u_count - 1);
  float level;
  if (u_calibrated == 0) {
    level = tone * last;
  } else {
    int low = 0;
    int high = u_count - 1;
    for (int i = 0; i < 12; i++) {
      if (high - low <= 1) {
        break;
      }
      int mid = (low + high) / 2;
      if (positionAt(mid) <= tone) {
        low = mid;
      } else {
        high = mid;
      }
    }
    float from = positionAt(low);
    float to = positionAt(high);
    level = float(low) + (to > from ? (tone - from) / (to - from) : 0.0);
  }
  return int(clamp(floor(level + cut), 0.0, last));
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 linearOf(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
}

vec3 oklab(vec3 srgb) {
  vec3 c = linearOf(srgb);
  float l = pow(0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b, 1.0 / 3.0);
  float m = pow(0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b, 1.0 / 3.0);
  float s = pow(0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b, 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  );
}

vec3 sampleStops(float t) {
  if (u_stopCount <= 1) {
    return u_stops[0];
  }
  float scaled = clamp(t, 0.0, 1.0) * float(u_stopCount - 1);
  int index = min(u_stopCount - 2, int(floor(scaled)));
  return mix(u_stops[index], u_stops[index + 1], scaled - float(index));
}

vec3 gradeRgb(vec3 rgb) {
  vec3 curved = vec3(grade(rgb.r), grade(rgb.g), grade(rgb.b));
  if (u_grade.w == 1.0) {
    return curved;
  }
  float grey = dot(curved, vec3(0.2126, 0.7152, 0.0722));
  return clamp(grey + (curved - grey) * u_grade.w, 0.0, 1.0);
}

void main() {
  fieldSize = u_cells * u_grid;
  ivec2 cell = ivec2(int(gl_FragCoord.x), u_cells.y - 1 - int(gl_FragCoord.y));
  int slot = 0;
  float tone = 0.0;
  vec3 rgb = vec3(0.0);

  if (u_kind == 1 || u_kind == 2) {
    int mask = 0;
    float sum = 0.0;
    for (int dy = 0; dy < 4; dy++) {
      if (dy >= u_grid.y) {
        break;
      }
      for (int dx = 0; dx < 2; dx++) {
        if (dx >= u_grid.x) {
          break;
        }
        ivec2 p = cell * u_grid + ivec2(dx, dy);
        vec4 s = fieldAt(p);
        float t = toneAt(p);
        sum += t;
        rgb += s.rgb;
        if (t > (u_dither == 1 ? cutAt(p) : u_threshold)) {
          if (u_kind == 1) {
            // Braille dot bits: 1-3 down the left, 4-6 down the right, 7-8 on the bottom row.
            int bit = dy == 3 ? (dx == 0 ? 64 : 128) : (dx == 0 ? (1 << dy) : (8 << dy));
            mask |= bit;
          } else {
            mask |= 1 << (dy * 2 + dx);
          }
        }
      }
    }
    float count = float(u_grid.x * u_grid.y);
    tone = sum / count;
    rgb /= count;
    slot = mask;
  } else {
    tone = toneAt(cell);
    rgb = fieldAt(cell).rgb;
    slot = rampLevel(tone, cutAt(cell));
    if (u_kind == 3) {
      ivec2 hi = u_cells - 1;
      #define T(x, y) toneAt(clamp(cell + ivec2(x, y), ivec2(0), hi))
      float sx = T(1, -1) + 2.0 * T(1, 0) + T(1, 1) - T(-1, -1) - 2.0 * T(-1, 0) - T(-1, 1);
      float sy = T(-1, 1) + 2.0 * T(0, 1) + T(1, 1) - T(-1, -1) - 2.0 * T(0, -1) - T(1, -1);
      #undef T
      if (length(vec2(sx, sy)) / 4.0 > u_edgeThreshold) {
        // y points down here, as in edgeChar: fold the angle into [0, pi).
        float angle = atan(sy, sx);
        if (angle < 0.0) {
          angle += 3.14159265;
        }
        int octant = int(floor(angle / 0.785398163 + 0.5)) % 4;
        int glyph = octant == 0 ? 2 : octant == 1 ? 1 : octant == 2 ? 0 : 3;
        slot = u_count + glyph;
      }
    }
  }

  // Glitch: a few cells flip to a random glyph on glitch frames.
  if (u_glitch > 0.0 && hash(vec2(cell) + u_glitchSeed) < u_glitch * 0.06) {
    float pick = hash(vec2(cell) * 1.7 + u_glitchSeed + 3.1);
    slot = u_kind == 1 ? int(pick * 255.0) + 1 : u_kind == 2 ? int(pick * 15.0) + 1 : int(pick * float(u_count - 1)) + 1;
  }

  vec3 color;
  if (u_colorMode == 0) {
    color = u_ink;
  } else if (u_colorMode == 3) {
    color = sampleStops(tone);
  } else {
    color = u_hasColor == 1 ? gradeRgb(rgb) : vec3(clamp(tone, 0.0, 1.0));
    if (u_colorMode == 2) {
      vec3 lab = oklab(color);
      float best = 1e9;
      vec3 pick = u_ansi[0];
      for (int i = 0; i < 16; i++) {
        vec3 d = lab - u_ansiLab[i];
        float distance = dot(d, d);
        if (distance < best) {
          best = distance;
          pick = u_ansi[i];
        }
      }
      color = pick;
    }
  }

  float coverage = texelFetch(u_coverage, ivec2(slot, 0), 0).r;
  o_glyph = vec4(float(slot & 255) / 255.0, float(slot >> 8) / 255.0, coverage, 1.0);
  o_color = vec4(color, 1.0);
}
`;

/**
 * The glyph pass: one fragment per device pixel. Finds the pixel's cell,
 * reads the cell's slot and colour, and draws the glyph from the atlas
 * over the paper, then the post effects. Output is premultiplied alpha.
 */
export const GLYPH_SHADER = `#version 300 es
precision highp float;
precision highp int;

uniform sampler2D u_cellGlyph;
uniform sampler2D u_cellColor;
uniform sampler2D u_atlas;
uniform sampler2D u_bloom;
uniform ivec2 u_cells;
uniform ivec2 u_cellSize;
uniform vec2 u_canvas;
uniform int u_atlasColumns;
uniform vec4 u_paper;
uniform vec4 u_fx;
uniform vec4 u_fx2;
uniform vec4 u_glitchRows;

out vec4 o_color;

float coverageAt(int slot, ivec2 local) {
  ivec2 origin = ivec2(slot % u_atlasColumns, slot / u_atlasColumns) * u_cellSize;
  return texelFetch(u_atlas, origin + clamp(local, ivec2(0), u_cellSize - 1), 0).a;
}

void main() {
  float scanlines = u_fx.x;
  float bloom = u_fx.y;
  float curvature = u_fx.z;
  float split = u_fx.w;
  float flicker = u_fx2.x;
  float vignette = u_fx2.y;
  float dpr = u_fx2.z;

  // Top-left based position in [0, 1].
  vec2 p = vec2(gl_FragCoord.x, u_canvas.y - gl_FragCoord.y) / u_canvas;
  float outside = 0.0;
  if (curvature > 0.0) {
    vec2 c = p * 2.0 - 1.0;
    c *= 1.0 + curvature * 0.18 * dot(c, c);
    c /= 1.0 + curvature * 0.18;
    p = c * 0.5 + 0.5;
    vec2 edge = smoothstep(vec2(0.0), vec2(2.0) / u_canvas, p) * smoothstep(vec2(0.0), vec2(2.0) / u_canvas, 1.0 - p);
    outside = 1.0 - edge.x * edge.y;
  }

  ivec2 px = ivec2(floor(p * u_canvas));
  ivec2 cell = px / u_cellSize;
  ivec2 local = px - cell * u_cellSize;
  // Glitch: a band of rows jumps sideways for a frame.
  if (cell.y >= int(u_glitchRows.x) && cell.y < int(u_glitchRows.y)) {
    cell.x += int(u_glitchRows.z);
  }

  vec3 rgb = u_paper.rgb;
  float alpha = u_paper.a;
  if (cell.x >= 0 && cell.y >= 0 && cell.x < u_cells.x && cell.y < u_cells.y) {
    ivec2 at = ivec2(cell.x, u_cells.y - 1 - cell.y);
    vec4 g = texelFetch(u_cellGlyph, at, 0);
    int slot = int(g.r * 255.0 + 0.5) + 256 * int(g.g * 255.0 + 0.5);
    vec3 ink = texelFetch(u_cellColor, at, 0).rgb;
    float cov = coverageAt(slot, local);
    vec3 covs = vec3(cov);
    if (split > 0.0) {
      int shift = max(1, int(dpr + 0.5));
      covs.r = coverageAt(slot, local - ivec2(shift, 0));
      covs.b = coverageAt(slot, local + ivec2(shift, 0));
    }
    // Premultiplied: glyph over paper, channel by channel for the RGB split.
    rgb = ink * covs + rgb * (1.0 - covs);
    alpha = max(cov, max(covs.r, covs.b)) + alpha * (1.0 - max(cov, max(covs.r, covs.b)));
  }

  if (bloom > 0.0) {
    vec2 grid = vec2(u_cells * u_cellSize);
    vec2 uv = vec2(p.x * u_canvas.x / grid.x, 1.0 - p.y * u_canvas.y / grid.y);
    vec3 glow = texture(u_bloom, uv).rgb * bloom;
    rgb += glow;
    alpha = min(1.0, alpha + dot(glow, vec3(0.3333)));
  }

  float shade = 1.0;
  if (scanlines > 0.0) {
    float y = gl_FragCoord.y / max(dpr, 1.0);
    shade *= 1.0 - scanlines * 0.42 * (0.5 + 0.5 * cos(y * 2.0943951));
  }
  if (vignette > 0.0) {
    vec2 c = p * 2.0 - 1.0;
    shade *= 1.0 - vignette * 0.75 * smoothstep(0.35, 1.45, dot(c, c));
  }
  shade *= flicker;
  rgb *= shade;
  if (u_paper.a < 1.0) {
    alpha *= shade;
  }

  // Curved glass leaves black corners (transparent without paper).
  rgb *= 1.0 - outside;
  alpha = mix(alpha, u_paper.a, outside);
  o_color = vec4(rgb, alpha);
}
`;

/**
 * Bloom: a separable blur at cell resolution. The first pass reads the
 * cells (colour times glyph coverage), the second the first's output.
 */
export const BLUR_SHADER = `#version 300 es
precision highp float;

uniform sampler2D u_source;
uniform sampler2D u_glyph;
uniform vec2 u_step;
uniform int u_fromCells;
uniform vec2 u_size;

out vec4 o_color;

vec3 read(vec2 uv) {
  vec3 c = texture(u_source, uv).rgb;
  if (u_fromCells == 1) {
    c *= texture(u_glyph, uv).b * 2.2;
  }
  return c;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_size;
  vec3 sum = read(uv) * 0.227027;
  sum += (read(uv + u_step * 1.3846) + read(uv - u_step * 1.3846)) * 0.316216;
  sum += (read(uv + u_step * 3.2308) + read(uv - u_step * 3.2308)) * 0.070270;
  o_color = vec4(sum, 1.0);
}
`;

/** The pointer trail: last frame's wake, decayed, plus a soft stamp at the pointer. */
export const TRAIL_SHADER = `#version 300 es
precision highp float;

uniform sampler2D u_previous;
uniform vec2 u_size;
uniform vec3 u_pointer;
uniform float u_decay;
uniform float u_strength;

out vec4 o_color;

void main() {
  vec2 uv = gl_FragCoord.xy / u_size;
  float previous = texture(u_previous, uv).r * u_decay;
  vec2 d = (uv - u_pointer.xy) * vec2(u_size.x / u_size.y, 1.0);
  float stamp = exp(-dot(d, d) / 0.0035) * u_strength * u_pointer.z;
  o_color = vec4(min(1.0, previous + stamp), 0.0, 0.0, 1.0);
}
`;

const LOG_LINE = /ERROR:\s*\d+:(\d+):\s*(.*)/g;

/**
 * A compile log with each error pointed at the line of `field` or
 * `colorField` it came from, so the message names the caller's code.
 */
export const describeCompileLog = ({
  log,
  field,
  colorField,
  fieldLine,
  colorLine,
}: {
  log: string;
  field: string;
  colorField: string | undefined;
  fieldLine: number;
  colorLine: number;
}): string => {
  const lines: string[] = [];
  for (const match of log.matchAll(LOG_LINE)) {
    const line = Number(match[1]);
    const message = match[2] ?? "";
    if (colorField !== undefined && line > colorLine) {
      const at = line - colorLine;
      lines.push(
        `colorField line ${at}: ${message}\n  > ${(colorField.split("\n")[at - 1] ?? "").trim()}`
      );
    } else if (line > fieldLine) {
      const at = line - fieldLine;
      lines.push(
        `field line ${at}: ${message}\n  > ${(field.split("\n")[at - 1] ?? "").trim()}`
      );
    } else {
      lines.push(`engine line ${line}: ${message}`);
    }
  }
  return lines.length > 0 ? lines.join("\n") : log;
};
