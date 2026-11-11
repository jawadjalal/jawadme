/**
 * Seeded fields: any string becomes a GPU field with its own OKLCH palette,
 * shape and motion. The same seed always gives the same field.
 *
 * Two kinds:
 * - `ribbons`: folded bands of light, layered, with bright rims where a
 *   band turns edge-on.
 * - `nebula`: domain-warped gas with ridged filaments and a few stars.
 *
 * `seedParams` rolls the parameters, then a cheap CPU critic samples the
 * field at low resolution and re-rolls until coverage and brightness land
 * in range, so no seed comes out black or blown out. `seedField` turns the
 * result into `{ field, colorField, uniforms }` for `AsciiShader`.
 *
 * Pure TypeScript and GLSL strings: no React, no DOM.
 */

/** The field shapes a seed can roll. */
export const SEED_KINDS = ["ribbons", "nebula"] as const;
export type SeedKind = (typeof SEED_KINDS)[number];

/** An sRGB colour with channels in [0, 1]. */
export type SeedRgb = readonly [number, number, number];

/** Four colours from the deepest tone to the brightest. */
export type SeedStops = readonly [SeedRgb, SeedRgb, SeedRgb, SeedRgb];

/**
 * Two versions of one palette: `dark` for glyphs on a dark paper (deep to
 * bright), `light` for glyphs on a light paper (pale to deep), so the
 * densest glyphs always have the most contrast.
 */
export interface SeedPalette {
  readonly dark: SeedStops;
  readonly light: SeedStops;
  /** The hues the palette runs through, in degrees, first to last. */
  readonly hues: readonly [number, number];
}

interface SeedShared {
  readonly seed: string;
  readonly palette: SeedPalette;
  /** Noise offset, so two seeds never share a neighbourhood. */
  readonly offset: readonly [number, number];
  /** Drift speed in field units per second. */
  readonly drift: number;
  /** Exposure gain the critic settled on. */
  readonly gain: number;
}

/** Parameters for folded ribbons of light. */
export interface RibbonParams extends SeedShared {
  readonly kind: "ribbons";
  /** How many ribbons, 3 to 5. */
  readonly count: number;
  /** How far apart the ribbons sit, as a share of the box height. */
  readonly spread: number;
  /** Height of the main swing of each ribbon. */
  readonly amplitude: number;
  /** Swings across the box. */
  readonly frequency: number;
  /** How much slow noise bends each ribbon off its swing. */
  readonly fold: number;
  /** Half-width of a ribbon face-on, as a share of the box height. */
  readonly width: number;
  /** How often a ribbon turns edge-on along its length. */
  readonly twist: number;
  /** Strength of the halo around each ribbon, 0 to 1. */
  readonly glow: number;
  /** Tilt of the whole set, in radians. */
  readonly angle: number;
}

/** Parameters for domain-warped gas. */
export interface NebulaParams extends SeedShared {
  readonly kind: "nebula";
  /** Size of the clouds; higher makes more, smaller ones. */
  readonly scale: number;
  /** How far each noise layer bends the next. */
  readonly warp: number;
  /** Strength of the bright filaments, 0 to 1. */
  readonly ridge: number;
  /** The noise level where gas starts; lower fills more of the box. */
  readonly density: number;
  /** How much the gas turns around the centre. */
  readonly swirl: number;
  /** How many stars show through, 0 to 1. */
  readonly stars: number;
}

export type SeedParams = RibbonParams | NebulaParams;

/** A closed range `[min, max]`. */
export type SeedRange = readonly [number, number];

/**
 * Steers a seed without fixing it: presets pin a hue family or narrow a
 * parameter, and the seed rolls the rest.
 */
export interface SeedOptions {
  /** The first hue is drawn from this range, in degrees. Default: any clean hue. */
  readonly hue?: SeedRange;
  /** How far the palette turns from the first hue, in degrees (negative turns the other way). */
  readonly turn?: SeedRange;
  /** Chroma scale for the palette, 0.4 (muted) to 1.3 (vivid). Default 1. */
  readonly vividness?: number;
  /** Narrower ranges for the ribbon parameters. */
  readonly ribbons?: Partial<Record<RibbonKey, SeedRange>>;
  /** Narrower ranges for the nebula parameters. */
  readonly nebula?: Partial<Record<NebulaKey, SeedRange>>;
}

type RibbonKey =
  | "count"
  | "spread"
  | "amplitude"
  | "frequency"
  | "fold"
  | "width"
  | "twist"
  | "glow"
  | "angle"
  | "drift";

type NebulaKey =
  | "scale"
  | "warp"
  | "ridge"
  | "density"
  | "swirl"
  | "stars"
  | "drift";

const RIBBON_RANGES = {
  amplitude: [0.08, 0.22],
  angle: [-0.45, 0.45],
  count: [3, 5],
  drift: [0.05, 0.12],
  fold: [0.25, 0.9],
  frequency: [0.7, 1.7],
  glow: [0.35, 0.9],
  spread: [0.35, 0.7],
  twist: [0.9, 2.6],
  width: [0.035, 0.075],
} as const satisfies Record<RibbonKey, SeedRange>;

const NEBULA_RANGES = {
  density: [0.38, 0.55],
  drift: [0.025, 0.06],
  ridge: [0.35, 0.95],
  scale: [2, 3.4],
  stars: [0.2, 0.8],
  swirl: [0.1, 0.8],
  warp: [0.6, 1.3],
} as const satisfies Record<NebulaKey, SeedRange>;

// ---------------------------------------------------------------------------
// Random numbers

/** FNV-1a (offset 2166136261, prime 16777619) over the code points of `text`: a 32-bit starting state. */
const hashSeed = (text: string): number => {
  let hash = 2_166_136_261;
  for (const char of text) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619);
  }
  // oxlint-disable-next-line unicorn/prefer-math-trunc -- a 32-bit wrap, not rounding
  return hash >>> 0;
};

/**
 * A splitmix32 generator for `seed`: each call returns the next number in
 * [0, 1). Small, fast and well mixed, which is all parameter rolls need.
 */
export const seedRandom = (seed: string): (() => number) => {
  let state = hashSeed(seed);
  return () => {
    // oxlint-disable-next-line unicorn/prefer-math-trunc -- a 32-bit wrap, not rounding
    state = (state + 2_654_435_769) | 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 16), 2_246_822_507);
    z = Math.imul(z ^ (z >>> 13), 3_266_489_909);
    z ^= z >>> 16;
    // oxlint-disable-next-line unicorn/prefer-math-trunc -- a 32-bit wrap, not rounding
    return (z >>> 0) / 4_294_967_296;
  };
};

const between = (random: () => number, [min, max]: SeedRange) =>
  min + (max - min) * random();

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

// ---------------------------------------------------------------------------
// OKLCH palettes

const DEG = Math.PI / 180;

/** OKLCH to linear sRGB (Björn Ottosson's OKLab matrices). */
const oklchToLinear = (
  lightness: number,
  chroma: number,
  hue: number
): [number, number, number] => {
  const a = chroma * Math.cos(hue * DEG);
  const b = chroma * Math.sin(hue * DEG);
  const l = (lightness + 0.396_337_777_4 * a + 0.215_803_757_3 * b) ** 3;
  const m = (lightness - 0.105_561_345_8 * a - 0.063_854_172_8 * b) ** 3;
  const s = (lightness - 0.089_484_177_5 * a - 1.291_485_548 * b) ** 3;
  return [
    4.076_741_662_1 * l - 3.307_711_591_3 * m + 0.230_969_929_2 * s,
    -1.268_438_004_6 * l + 2.609_757_401_1 * m - 0.341_319_396_5 * s,
    -0.004_196_086_3 * l - 0.703_418_614_7 * m + 1.707_614_701 * s,
  ];
};

const inGamut = (rgb: readonly number[]) =>
  rgb.every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4);

const encodeSrgb = (linear: number) => {
  const value = clamp01(linear);
  return value <= 0.003_130_8
    ? value * 12.92
    : 1.055 * value ** (1 / 2.4) - 0.055;
};

/**
 * An OKLCH colour as sRGB. Out-of-gamut colours keep their lightness and
 * hue and lose chroma until they fit, so a vivid stop never shifts hue.
 */
export const oklchToRgb = (
  lightness: number,
  chroma: number,
  hue: number
): SeedRgb => {
  let low = 0;
  let high = chroma;
  let rgb = oklchToLinear(lightness, chroma, hue);
  if (!inGamut(rgb)) {
    for (let step = 0; step < 14; step += 1) {
      const mid = (low + high) / 2;
      if (inGamut(oklchToLinear(lightness, mid, hue))) {
        low = mid;
      } else {
        high = mid;
      }
    }
    rgb = oklchToLinear(lightness, low, hue);
  }
  return [encodeSrgb(rgb[0]), encodeSrgb(rgb[1]), encodeSrgb(rgb[2])];
};

/**
 * Hues that turn to mud at the lightness glyph palettes need: olive,
 * khaki and brown-yellow. Palettes never start in this band and never run
 * through it.
 */
const MUDDY: SeedRange = [68, 118];

const wrapHue = (hue: number) => ((hue % 360) + 360) % 360;

const isMuddy = (hue: number) => {
  const h = wrapHue(hue);
  return h >= MUDDY[0] && h <= MUDDY[1];
};

/** Whether the arc from `from`, turning by `turn` degrees, touches the muddy band. */
const crossesMud = (from: number, turn: number) => {
  const steps = Math.max(2, Math.ceil(Math.abs(turn) / 4));
  for (let step = 0; step <= steps; step += 1) {
    if (isMuddy(from + (turn * step) / steps)) {
      return true;
    }
  }
  return false;
};

// Lightness and chroma per stop. Glyph density already carries brightness,
// so the stops stay close in lightness and the colour carries hue: two
// ribbons a glyph apart can differ in colour without one going dark.
const DARK_PAPER = {
  chroma: [0.15, 0.17, 0.15, 0.1],
  lightness: [0.56, 0.66, 0.76, 0.88],
} as const;
const LIGHT_PAPER = {
  chroma: [0.13, 0.16, 0.17, 0.15],
  lightness: [0.58, 0.52, 0.46, 0.38],
} as const;

const buildStops = (
  hues: readonly [number, number],
  { chroma, lightness }: typeof DARK_PAPER | typeof LIGHT_PAPER,
  vividness: number
): SeedStops => {
  const at = (index: number): SeedRgb => {
    const hue = hues[0] + ((hues[1] - hues[0]) * index) / 3;
    return oklchToRgb(
      lightness[index] ?? 0.5,
      (chroma[index] ?? 0.1) * vividness,
      wrapHue(hue)
    );
  };
  return [at(0), at(1), at(2), at(3)];
};

/**
 * A palette from `random`: a clean starting hue, a turn of 30 to 120
 * degrees that avoids the muddy band, and lightness steps that keep
 * neighbouring glyph tones apart on both dark and light paper.
 */
export const seedPalette = (
  random: () => number,
  options: Pick<SeedOptions, "hue" | "turn" | "vividness"> = {}
): SeedPalette => {
  let first = between(random, options.hue ?? [0, 360]);
  // Free hues re-roll out of the mud; a preset's own range is trusted.
  for (let tries = 0; options.hue === undefined && isMuddy(first); tries += 1) {
    first = between(random, [0, 360]);
    if (tries > 8) {
      first = MUDDY[1] + 40;
    }
  }
  const magnitude = between(random, [30, 120]);
  let turn =
    options.turn === undefined
      ? magnitude * (random() < 0.5 ? -1 : 1)
      : between(random, options.turn);
  if (crossesMud(first, turn)) {
    turn = -turn;
  }
  if (crossesMud(first, turn)) {
    turn = 0;
  }
  const hues = [first, first + turn] as const;
  const vividness = Math.min(1.3, Math.max(0.4, options.vividness ?? 1));
  return {
    dark: buildStops(hues, DARK_PAPER, vividness),
    hues: [wrapHue(hues[0]), wrapHue(hues[1])],
    light: buildStops(hues, LIGHT_PAPER, vividness),
  };
};

// ---------------------------------------------------------------------------
// Noise, mirrored in GLSL below. Both sides use the same arithmetic, so the
// critic sees (almost exactly) what the GPU will draw.

const fract = (value: number) => value - Math.floor(value);

const hash2 = (x: number, y: number) => {
  let a = fract(x * 0.1031);
  let b = fract(y * 0.1031);
  let c = fract(x * 0.1031);
  const d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33);
  a += d;
  b += d;
  c += d;
  return fract((a + b) * c);
};

const noise2 = (x: number, y: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  const top = a + (b - a) * ux;
  const bottom = c + (d - c) * ux;
  return top + (bottom - top) * uy;
};

const fbm2 = (x: number, y: number) => {
  let sum = 0;
  let amp = 0.5;
  let px = x;
  let py = y;
  for (let octave = 0; octave < 4; octave += 1) {
    sum += amp * noise2(px, py);
    const nx = 1.6 * px - 1.2 * py + 3.1;
    const ny = 1.2 * px + 1.6 * py + 1.7;
    px = nx;
    py = ny;
    amp *= 0.5;
  }
  return sum / 0.9375;
};

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

// ---------------------------------------------------------------------------
// GLSL

/** Noise shared by both kinds. The CPU copies above follow it line by line. */
const SEED_NOISE = `
float seedHash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float seedNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = seedHash(i);
  float b = seedHash(i + vec2(1.0, 0.0));
  float c = seedHash(i + vec2(0.0, 1.0));
  float d = seedHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float seedFbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * seedNoise(p);
    p = vec2(1.6 * p.x - 1.2 * p.y + 3.1, 1.2 * p.x + 1.6 * p.y + 1.7);
    amp *= 0.5;
  }
  return sum / 0.9375;
}

// The palette for this paper: dark-paper stops, or light-paper ones.
vec3 seedStop(int index) {
  vec3 dark = index == 0 ? seedDark0 : index == 1 ? seedDark1 : index == 2 ? seedDark2 : seedDark3;
  vec3 light = index == 0 ? seedLight0 : index == 1 ? seedLight1 : index == 2 ? seedLight2 : seedLight3;
  return mix(dark, light, seedOnLight);
}

// Bright glyphs on dark paper catch a little white, like light on glass.
vec3 seedSheen(vec3 color, float tone) {
  return mix(color, vec3(1.0), pow(tone, 6.0) * 0.3 * (1.0 - seedOnLight));
}

vec3 seedColor(float x) {
  float s = clamp(x, 0.0, 1.0) * 3.0;
  if (s < 1.0) return mix(seedStop(0), seedStop(1), s);
  if (s < 2.0) return mix(seedStop(1), seedStop(2), s - 1.0);
  return mix(seedStop(2), seedStop(3), s - 2.0);
}

// Faint light below a glyph's worth drops to paper, so the space between
// shapes stays clean instead of filling with the ramp's first glyph.
float seedFloor(float tone) {
  return clamp((tone - 0.05) / 0.95, 0.0, 1.0);
}

// Centred box coordinates: y from -0.5 to 0.5, x scaled to the true aspect.
vec2 seedCentred(vec2 uv, vec2 res) {
  return vec2((uv.x - 0.5) * res.x / res.y, uv.y - 0.5);
}
`;

/**
 * Folded ribbons. Each ribbon swings across the box, bent by slow noise,
 * and its width follows |cos| along its length: where the cosine crosses
 * zero the band is edge-on, a thin bright line, like a strip of film
 * twisting in the light. `seedRibbons` returns the tone in x and the
 * ribbon that dominates in y, for the colour.
 */
const RIBBONS_BODY = `
vec2 seedRibbons(vec2 uv, vec2 res, float t) {
  vec2 c = seedCentred(uv, res);
  float ca = cos(seedRibbonTilt);
  float sa = sin(seedRibbonTilt);
  vec2 p = vec2(ca * c.x - sa * c.y, sa * c.x + ca * c.y);
  float count = seedRibbonShape.x;
  float drift = seedMotion.x;
  float miss = 1.0;
  float best = 0.0;
  float which = 0.0;
  for (int n = 0; n < 5; n++) {
    float i = float(n);
    if (i < count) {
      float k = i / max(count - 1.0, 1.0);
      float phase = i * 2.399 + seedMotion.y;
      float bend = seedRibbonFold.x * (seedFbm(vec2(p.x * 0.8 + i * 3.1 + seedMotion.y, t * drift * 1.5 + i * 1.7 + seedMotion.z)) - 0.5);
      float centre = (k - 0.5) * seedRibbonShape.y
        + seedRibbonShape.z * sin(p.x * seedRibbonShape.w * 3.0 + phase + t * drift * (1.0 + 0.25 * i))
        + bend;
      float turn = cos(p.x * seedRibbonFold.z * 2.0 + phase * 1.7 - t * drift * 2.2);
      float w = seedRibbonFold.y * (0.2 + 0.8 * abs(turn));
      float d = abs(p.y - centre);
      float face = smoothstep(w, w * 0.35, d) * mix(0.35, 0.8, 0.5 + 0.5 * turn);
      float rimWidth = w * 0.22 + 0.006;
      float rim = exp(-pow((d - w) / rimWidth, 2.0)) * 0.75;
      float halo = seedRibbonFold.w * 0.22 * seedRibbonFold.y / (d + seedRibbonFold.y * 1.5);
      // Back ribbons sit a little dimmer, for depth.
      float depth = mix(1.0, 0.68, fract(i * 0.618 + seedMotion.y));
      float glow = clamp((face + rim + halo) * depth, 0.0, 1.0);
      miss *= 1.0 - glow;
      if (glow > best) {
        best = glow;
        which = k;
      }
    }
  }
  float haze = 0.06 * seedFbm(p * 2.2 + seedMotion.yz + vec2(t * drift * 0.4, 0.0));
  return vec2(seedFloor((1.0 - miss + haze) * seedMotion.w), which);
}
`;

const RIBBONS_FIELD = `${SEED_NOISE}${RIBBONS_BODY}
float field(vec2 uv, vec2 res, float t) {
  return seedRibbons(uv, res, t).x;
}
`;

const RIBBONS_COLOR = `${SEED_NOISE}${RIBBONS_BODY}
vec3 colorField(vec2 uv, vec2 res, float t) {
  vec2 r = seedRibbons(uv, res, t);
  // Each ribbon takes its own hue along the palette, so a prism of violet
  // and teal shows both; tone only nudges it.
  return seedSheen(seedColor(r.y * 0.9 + 0.05 + (r.x - 0.5) * 0.15), r.x);
}
`;

/**
 * Domain-warped gas: three fbm layers, each bending the next. The ridge of
 * the middle layer (where it crosses 0.5) draws thin bright filaments
 * through the thicker parts. Sparse stars sit behind it, one per lucky
 * sample cell, so they stay sharp in every charset.
 */
const NEBULA_BODY = `
vec3 seedNebula(vec2 uv, vec2 res, float t) {
  vec2 c = seedCentred(uv, res);
  float drift = seedMotion.x;
  float r = length(c);
  float spin = seedGasShape.x * (0.6 - r) + t * drift * 0.4 * seedGasShape.x;
  float cs = cos(spin);
  float sn = sin(spin);
  vec2 q = vec2(cs * c.x - sn * c.y, sn * c.x + cs * c.y) * seedGas.x + seedMotion.yz + vec2(t * drift, t * drift * 0.3);
  float a = seedFbm(q);
  float b = seedFbm(q * 1.7 + seedGas.y * 2.0 * vec2(a - 0.5, 0.5 - a) + vec2(1.7, 9.2) + vec2(0.0, t * drift * 0.5));
  float g = seedFbm(q + seedGas.y * 3.0 * vec2(b - 0.5, a - 0.5) + vec2(8.3, 2.8));
  // The cloud: a broad soft edge, squared so the core is dense and the
  // rim runs down through the middle of the glyph ramp.
  float gas = smoothstep(seedGas.w - 0.18, seedGas.w + 0.42, g);
  gas *= gas;
  // Filaments where the middle layer crosses its midpoint, reaching a
  // little past the cloud's edge.
  float ridge = pow(1.0 - abs(2.0 * b - 1.0), 5.0) * seedGas.z;
  float reach = smoothstep(seedGas.w - 0.35, seedGas.w + 0.05, g);
  // Dark dust lanes cutting through the brightest parts.
  float dust = smoothstep(0.55, 0.75, seedFbm(q * 2.3 + vec2(b * 1.5, 4.1)));
  float tone = seedFloor((gas * (1.0 - dust * 0.6) + ridge * reach * 0.7) * seedMotion.w);
  return vec3(tone, g, ridge * reach);
}

float seedStars(vec2 uv, vec2 res, float t) {
  vec2 cell = floor(uv * res);
  float h = seedHash(cell + seedMotion.yz * 13.0);
  float lit = step(1.0 - 0.012 * seedGasShape.y, h);
  float pulse = 0.65 + 0.35 * sin(t * (0.6 + 2.0 * fract(h * 37.0)) + h * 50.0);
  return lit * pulse * mix(0.55, 1.0, fract(h * 91.0));
}
`;

const NEBULA_FIELD = `${SEED_NOISE}${NEBULA_BODY}
float field(vec2 uv, vec2 res, float t) {
  vec3 n = seedNebula(uv, res, t);
  // Stars only show where the gas is thin.
  return max(n.x, seedStars(uv, res, t) * (1.0 - smoothstep(0.15, 0.45, n.x)));
}
`;

const NEBULA_COLOR = `${SEED_NOISE}${NEBULA_BODY}
vec3 colorField(vec2 uv, vec2 res, float t) {
  vec3 n = seedNebula(uv, res, t);
  float star = seedStars(uv, res, t) * (1.0 - smoothstep(0.15, 0.45, n.x));
  // Hue follows the gas layers, so clouds of different depth differ in
  // colour; filaments climb to the far end of the palette.
  vec3 gas = seedSheen(seedColor(clamp((n.y - 0.3) * 1.6 + n.z * 0.6, 0.0, 1.0)), n.x);
  return mix(gas, seedSheen(seedStop(3), 1.0), clamp(star * 1.4, 0.0, 1.0));
}
`;

/** The GLSL for each kind: a `field` and a matching `colorField`. */
export const SEED_GLSL = {
  nebula: { colorField: NEBULA_COLOR, field: NEBULA_FIELD },
  ribbons: { colorField: RIBBONS_COLOR, field: RIBBONS_FIELD },
} as const satisfies Record<SeedKind, { field: string; colorField: string }>;

// ---------------------------------------------------------------------------
// CPU mirrors of the tone, for the critic. Stars and haze are left out: they
// add a little light everywhere and don't change whether a seed works.

const ribbonTone = (
  params: RibbonParams,
  x: number,
  y: number,
  t: number
): number => {
  const ca = Math.cos(params.angle);
  const sa = Math.sin(params.angle);
  const px = ca * x - sa * y;
  const py = sa * x + ca * y;
  const [ox, oy] = params.offset;
  let miss = 1;
  for (let n = 0; n < params.count; n += 1) {
    const k = n / Math.max(params.count - 1, 1);
    const phase = n * 2.399 + ox;
    const bend =
      params.fold *
      (fbm2(px * 0.8 + n * 3.1 + ox, t * params.drift * 1.5 + n * 1.7 + oy) -
        0.5);
    const centre =
      (k - 0.5) * params.spread +
      params.amplitude *
        Math.sin(
          px * params.frequency * 3 + phase + t * params.drift * (1 + 0.25 * n)
        ) +
      bend;
    const turn = Math.cos(
      px * params.twist * 2 + phase * 1.7 - t * params.drift * 2.2
    );
    const w = params.width * (0.2 + 0.8 * Math.abs(turn));
    const d = Math.abs(py - centre);
    const face =
      smoothstep(w, w * 0.35, d) * (0.35 + 0.45 * (0.5 + 0.5 * turn));
    const rimWidth = w * 0.22 + 0.006;
    const rim = Math.exp(-(((d - w) / rimWidth) ** 2)) * 0.75;
    const halo = (params.glow * 0.22 * params.width) / (d + params.width * 1.5);
    const depth = 1 - 0.32 * fract(n * 0.618 + ox);
    miss *= 1 - clamp01((face + rim + halo) * depth);
  }
  return 1 - miss;
};

const nebulaTone = (
  params: NebulaParams,
  x: number,
  y: number,
  t: number
): number => {
  const [ox, oy] = params.offset;
  const r = Math.hypot(x, y);
  const spin = params.swirl * (0.6 - r) + t * params.drift * 0.4 * params.swirl;
  const cs = Math.cos(spin);
  const sn = Math.sin(spin);
  const qx = (cs * x - sn * y) * params.scale + ox + t * params.drift;
  const qy = (sn * x + cs * y) * params.scale + oy + t * params.drift * 0.3;
  const a = fbm2(qx, qy);
  const b = fbm2(
    qx * 1.7 + params.warp * 2 * (a - 0.5) + 1.7,
    qy * 1.7 + params.warp * 2 * (0.5 - a) + 9.2 + t * params.drift * 0.5
  );
  const g = fbm2(
    qx + params.warp * 3 * (b - 0.5) + 8.3,
    qy + params.warp * 3 * (a - 0.5) + 2.8
  );
  const gas = smoothstep(params.density - 0.18, params.density + 0.42, g) ** 2;
  const ridge = (1 - Math.abs(2 * b - 1)) ** 5 * params.ridge;
  const reach = smoothstep(params.density - 0.35, params.density + 0.05, g);
  const dust = smoothstep(0.55, 0.75, fbm2(qx * 2.3 + b * 1.5, qy * 2.3 + 4.1));
  return gas * (1 - dust * 0.6) + ridge * reach * 0.7;
};

const rawTone = (params: SeedParams, x: number, y: number, t: number) =>
  params.kind === "ribbons"
    ? ribbonTone(params, x, y, t)
    : nebulaTone(params, x, y, t);

// ---------------------------------------------------------------------------
// The exposure critic

/** What the critic measured, before gain. */
export interface SeedExposure {
  /** Mean tone, 0 to 1. */
  readonly mean: number;
  /** Share of samples above a faint glyph (tone 0.18). */
  readonly coverage: number;
  /** The 96th percentile tone: what the brightest few glyphs reach. */
  readonly peak: number;
}

// A 16:9 box at low resolution, at three moments, so a seed that only
// looks right at t = 0 still gets caught.
const CRITIC_COLUMNS = 40;
const CRITIC_ROWS = 22;
const CRITIC_TIMES = [0, 9, 23] as const;
const CRITIC_ASPECT = 16 / 9;

/** Sample the field and measure it. */
export const measureExposure = (params: SeedParams): SeedExposure => {
  const tones: number[] = [];
  for (const t of CRITIC_TIMES) {
    for (let row = 0; row < CRITIC_ROWS; row += 1) {
      const y = (row + 0.5) / CRITIC_ROWS - 0.5;
      for (let column = 0; column < CRITIC_COLUMNS; column += 1) {
        const x = ((column + 0.5) / CRITIC_COLUMNS - 0.5) * CRITIC_ASPECT;
        tones.push(clamp01(rawTone(params, x, y, t)));
      }
    }
  }
  tones.sort((a, b) => a - b);
  const total = tones.reduce((sum, tone) => sum + tone, 0);
  const lit = tones.filter((tone) => tone > 0.18).length;
  return {
    coverage: lit / tones.length,
    mean: total / tones.length,
    peak: tones[Math.floor(tones.length * 0.96)] ?? 0,
  };
};

// Coverage that reads as a full background and still leaves paper between
// the shapes: a quarter to three fifths of the box carries a glyph.
const COVERAGE: SeedRange = [0.26, 0.62];

/** How far an exposure sits from the good range; 0 is inside it. */
const exposurePenalty = ({ coverage, peak }: SeedExposure) =>
  Math.max(0, COVERAGE[0] - coverage) +
  Math.max(0, coverage - COVERAGE[1]) +
  Math.max(0, 0.35 - peak);

/** The gain that lifts the brightest glyphs to near-full tone. */
const exposureGain = ({ peak }: SeedExposure) =>
  Math.min(2.2, Math.max(0.75, 0.96 / Math.max(peak, 0.05)));

const MAX_ROLLS = 8;

const rollRibbons = (
  random: () => number,
  shared: Omit<SeedShared, "gain">,
  ranges: SeedOptions["ribbons"] = {}
): RibbonParams => {
  const range = (key: RibbonKey) => ranges[key] ?? RIBBON_RANGES[key];
  return {
    ...shared,
    amplitude: between(random, range("amplitude")),
    angle: between(random, range("angle")),
    count: Math.round(between(random, range("count"))),
    drift: between(random, range("drift")),
    fold: between(random, range("fold")),
    frequency: between(random, range("frequency")),
    gain: 1,
    glow: between(random, range("glow")),
    kind: "ribbons",
    spread: between(random, range("spread")),
    twist: between(random, range("twist")),
    width: between(random, range("width")),
  };
};

const rollNebula = (
  random: () => number,
  shared: Omit<SeedShared, "gain">,
  ranges: SeedOptions["nebula"] = {}
): NebulaParams => {
  const range = (key: NebulaKey) => ranges[key] ?? NEBULA_RANGES[key];
  return {
    ...shared,
    density: between(random, range("density")),
    drift: between(random, range("drift")),
    gain: 1,
    kind: "nebula",
    ridge: between(random, range("ridge")),
    scale: between(random, range("scale")),
    stars: between(random, range("stars")),
    swirl: between(random, range("swirl")),
    warp: between(random, range("warp")),
  };
};

/**
 * Deterministic parameters for `seed`. The palette is rolled once; the
 * shape is rolled up to eight times until the critic is happy, keeping the
 * best roll if none is, and its gain is set so the brightest glyphs land
 * near full tone.
 */
export const seedParams = (
  seed: string,
  kind: SeedKind,
  options: SeedOptions = {}
): SeedParams => {
  const random = seedRandom(`${kind}:${seed}`);
  const palette = seedPalette(random, options);
  const roll = (): SeedParams => {
    const shared = {
      drift: 0,
      offset: [between(random, [0, 97]), between(random, [0, 97])] as const,
      palette,
      seed,
    };
    return kind === "ribbons"
      ? rollRibbons(random, shared, options.ribbons)
      : rollNebula(random, shared, options.nebula);
  };
  let best = roll();
  let bestExposure = measureExposure(best);
  for (
    let tries = 1;
    tries < MAX_ROLLS && exposurePenalty(bestExposure) > 0;
    tries += 1
  ) {
    const params = roll();
    const exposure = measureExposure(params);
    if (exposurePenalty(exposure) < exposurePenalty(bestExposure)) {
      best = params;
      bestExposure = exposure;
    }
  }
  return { ...best, gain: exposureGain(bestExposure) };
};

// ---------------------------------------------------------------------------
// Shader inputs

type Vec3 = readonly [number, number, number];
type Vec4 = readonly [number, number, number, number];

/** Uniforms for a seeded field. `seedOnLight` is 0 on dark paper, 1 on light. */
export type SeedUniforms = Readonly<Record<string, number | Vec3 | Vec4>>;

/** What `AsciiShader` needs to draw a seeded field. */
export interface SeedFieldInput {
  readonly field: string;
  readonly colorField: string;
  readonly uniforms: SeedUniforms;
  readonly params: SeedParams;
}

const paletteUniforms = ({ dark, light }: SeedPalette, onLight: boolean) => ({
  seedDark0: dark[0],
  seedDark1: dark[1],
  seedDark2: dark[2],
  seedDark3: dark[3],
  seedLight0: light[0],
  seedLight1: light[1],
  seedLight2: light[2],
  seedLight3: light[3],
  seedOnLight: onLight ? 1 : 0,
});

const kindUniforms = (params: SeedParams): SeedUniforms => {
  if (params.kind === "ribbons") {
    return {
      seedRibbonFold: [params.fold, params.width, params.twist, params.glow],
      seedRibbonShape: [
        params.count,
        params.spread,
        params.amplitude,
        params.frequency,
      ],
      seedRibbonTilt: params.angle,
    };
  }
  return {
    seedGas: [params.scale, params.warp, params.ridge, params.density],
    seedGasShape: [params.swirl, params.stars, 0, 0],
  };
};

/** How a seeded field is drawn, separate from what the seed rolled. */
export interface SeedDrawOptions {
  /** `true` on light paper: the palette runs pale to deep. Default `false`. */
  readonly onLight?: boolean;
  /** Scales the critic's exposure, 0 to 1.5. Lower it to sit text on top. Default 1. */
  readonly intensity?: number;
}

/**
 * The uniforms for `params`. Cheap: call it again when the paper flips
 * between dark and light, without re-rolling the seed.
 */
export const seedUniforms = (
  params: SeedParams,
  { onLight = false, intensity = 1 }: SeedDrawOptions = {}
): SeedUniforms => ({
  ...paletteUniforms(params.palette, onLight),
  ...kindUniforms(params),
  seedMotion: [
    params.drift,
    params.offset[0],
    params.offset[1],
    params.gain * Math.min(1.5, Math.max(0, intensity)),
  ],
});

/**
 * Everything `AsciiShader` needs for `seed`:
 *
 * ```tsx
 * const { field, colorField, uniforms } = seedField("orbit", "nebula");
 * <AsciiShader field={field} colorField={colorField} uniforms={uniforms} />
 * ```
 */
export const seedField = (
  seed: string,
  kind: SeedKind,
  options: SeedOptions & SeedDrawOptions = {}
): SeedFieldInput => {
  const params = seedParams(seed, kind, options);
  return {
    ...SEED_GLSL[kind],
    params,
    uniforms: seedUniforms(params, options),
  };
};

/** A palette stop as a CSS colour, for fallbacks and swatches. */
export const seedCss = ([r, g, b]: SeedRgb): string =>
  `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;
