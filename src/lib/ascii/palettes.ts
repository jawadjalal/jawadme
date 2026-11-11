/**
 * Colour modes for the ASCII engine: phosphor presets, the ANSI 16-colour
 * tables, multi-stop ramps and the grading every renderer shares. Pure and
 * server-safe. The GPU shader mirrors `gradeTone`, `gradeRgb` and
 * `nearestIndex` in GLSL; keep the formulas in step.
 */

/** A colour as red, green and blue bytes, 0 to 255. */
export type Rgb8 = readonly [number, number, number];

/**
 * How glyphs are coloured.
 * - `mono`: one ink colour for every glyph (a phosphor, a theme colour).
 * - `truecolor`: each glyph takes the source colour under its cell, graded.
 * - `ansi16`: the source colour snapped to the nearest of 16 ANSI colours.
 * - `duotone`: the cell's tone read through a multi-stop ramp.
 * - `palette`: the field's own `palette` prop, paper to ink, by tone.
 */
export const COLOR_MODES = [
  "mono",
  "truecolor",
  "ansi16",
  "duotone",
  "palette",
] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

/** Monochrome CRT presets: an ink and the near-black glass behind it. */
export const PHOSPHORS = {
  blueprint: { ink: "#38bdf8", label: "Blueprint cyan", paper: "#020a12" },
  ibm: { ink: "#f4f4f5", label: "IBM white", paper: "#09090b" },
  p1: { ink: "#33ff66", label: "P1 green", paper: "#020a04" },
  p3: { ink: "#ffb000", label: "P3 amber", paper: "#0c0700" },
} as const satisfies Record<
  string,
  { ink: `#${string}`; label: string; paper: `#${string}` }
>;

export type PhosphorName = keyof typeof PHOSPHORS;
export const PHOSPHOR_NAMES = [
  "p1",
  "p3",
  "ibm",
  "blueprint",
] as const satisfies readonly PhosphorName[];

/**
 * The 16 ANSI colours in SGR order: black, red, green, yellow, blue,
 * magenta, cyan, white, then the bright eight. `vga` is the IBM PC text
 * mode palette, brown #aa5500 included; `xterm` is xterm's default.
 */
export const ANSI16 = {
  vga: [
    [0, 0, 0],
    [170, 0, 0],
    [0, 170, 0],
    [170, 85, 0],
    [0, 0, 170],
    [170, 0, 170],
    [0, 170, 170],
    [170, 170, 170],
    [85, 85, 85],
    [255, 85, 85],
    [85, 255, 85],
    [255, 255, 85],
    [85, 85, 255],
    [255, 85, 255],
    [85, 255, 255],
    [255, 255, 255],
  ],
  xterm: [
    [0, 0, 0],
    [205, 0, 0],
    [0, 205, 0],
    [205, 205, 0],
    [0, 0, 238],
    [205, 0, 205],
    [0, 205, 205],
    [229, 229, 229],
    [127, 127, 127],
    [255, 0, 0],
    [0, 255, 0],
    [255, 255, 0],
    [92, 92, 255],
    [255, 0, 255],
    [0, 255, 255],
    [255, 255, 255],
  ],
} as const satisfies Record<string, readonly Rgb8[]>;

export type Ansi16Name = keyof typeof ANSI16;

/** SGR foreground code for ANSI index 0-15: 30-37, then 90-97. */
export const ansiForeground = (index: number): number =>
  index < 8 ? 30 + index : 82 + index;

/** SGR background code for ANSI index 0-15: 40-47, then 100-107. */
export const ansiBackground = (index: number): number =>
  index < 8 ? 40 + index : 92 + index;

/**
 * Multi-stop ramps for `duotone`, dark to light. Each runs from a colour
 * that sits on near-black to one that holds up as the densest glyph.
 */
export const RAMPS = {
  ember: ["#0a0201", "#4a0b02", "#a82a04", "#f07b12", "#ffd35c", "#fff6d8"],
  glacier: ["#010a0d", "#06323d", "#0f6d7a", "#41b5b8", "#a7ece0", "#f0fffb"],
  heliograph: ["#04122e", "#0b3a7e", "#3f7fd8", "#a9cdf5", "#f3f8ff"],
  infrared: ["#0b0221", "#3d0a6b", "#b0124f", "#f25c05", "#ffd23f", "#fffbe6"],
  mainframe: ["#010c03", "#0b4d1c", "#1fa64a", "#7dffa1", "#e9ffef"],
  orchid: ["#12020f", "#4a0a3a", "#a01c6b", "#e65aa0", "#ffd1e8"],
  outrun: ["#12002b", "#4b0a6e", "#c2187a", "#ff6b3d", "#ffd36b"],
  sodium: ["#0d0600", "#5a2a00", "#c26a00", "#ffb000", "#fff1c7"],
  toxic: ["#030700", "#203d00", "#5f9e00", "#c4f000", "#f6ffc2"],
  vapor: ["#0c0420", "#3b2a7a", "#6f7fe0", "#ff8fd8", "#fff0fa"],
} as const satisfies Record<string, readonly `#${string}`[]>;

export type RampName = keyof typeof RAMPS;
export const RAMP_NAMES = [
  "mainframe",
  "sodium",
  "heliograph",
  "infrared",
  "outrun",
  "orchid",
  "glacier",
  "ember",
  "toxic",
  "vapor",
] as const satisfies readonly RampName[];

/** `#rrggbb` (or `#rgb`) as bytes; anything else is black. */
export const hexToRgb = (hex: string): Rgb8 => {
  const value = hex.trim().replace(/^#/u, "");
  const full =
    value.length === 3
      ? Array.from(value, (digit) => digit + digit).join("")
      : value;
  const parsed = Number.parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(parsed)) {
    return [0, 0, 0];
  }
  return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255];
};

export const rgbToHex = ([r, g, b]: Rgb8): string =>
  `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;

/** The colour at `t` in [0, 1] along evenly spaced stops, as bytes. */
export const sampleRamp = (stops: readonly Rgb8[], t: number): Rgb8 => {
  if (stops.length === 0) {
    return [0, 0, 0];
  }
  const clamped = t > 0 ? Math.min(t, 1) : 0;
  const scaled = clamped * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  const from = stops[Math.max(0, index)] ?? stops[0] ?? [0, 0, 0];
  const to = stops[Math.max(0, index) + 1] ?? from;
  const mix = stops.length === 1 ? 0 : scaled - Math.max(0, index);
  return [
    from[0] + (to[0] - from[0]) * mix,
    from[1] + (to[1] - from[1]) * mix,
    from[2] + (to[2] - from[2]) * mix,
  ];
};

/** Tone grading, applied before a tone picks its glyph. */
export interface Grade {
  /** Added after contrast, -1 to 1. Default 0. */
  brightness?: number;
  /** Multiplier around mid grey; 1 leaves tones alone. Default 1. */
  contrast?: number;
  /** Above 1 lifts the midtones, below 1 sinks them. Default 1. */
  gamma?: number;
  /** Colour saturation for `truecolor`: 0 is grey, 1 unchanged. Default 1. */
  saturation?: number;
}

const clamp01 = (value: number) => (value > 0 ? Math.min(value, 1) : 0);

/**
 * A tone through `grade`: contrast around 0.5, then brightness, then
 * gamma, clamped to [0, 1]. NaN becomes 0.
 */
export const gradeTone = (
  tone: number,
  { brightness = 0, contrast = 1, gamma = 1 }: Grade = {}
): number => {
  const shaped = clamp01((tone - 0.5) * contrast + 0.5 + brightness);
  return gamma === 1 ? shaped : shaped ** (1 / Math.max(0.01, gamma));
};

/** Rec. 709 luma of sRGB bytes, 0 to 1. */
export const luma = (r: number, g: number, b: number): number =>
  (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

/**
 * A colour through `grade`: the same tone curve on each channel, then
 * saturation around its luma. Returns bytes.
 */
export const gradeRgb = (rgb: Rgb8, grade: Grade = {}): Rgb8 => {
  const { saturation = 1 } = grade;
  const curved = rgb.map(
    (channel) => gradeTone(channel / 255, grade) * 255
  ) as unknown as Rgb8;
  if (saturation === 1) {
    return curved;
  }
  const grey = luma(curved[0], curved[1], curved[2]) * 255;
  return curved.map((channel) =>
    Math.min(255, Math.max(0, grey + (channel - grey) * saturation))
  ) as unknown as Rgb8;
};

const toLinear = (channel: number) => {
  const c = channel / 255;
  return c <= 0.040_45 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** sRGB bytes to OKLab [L, a, b]. */
export const rgbToOklab = ([r, g, b]: Rgb8): readonly [
  number,
  number,
  number,
] => {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(
    0.412_221_470_8 * lr + 0.536_332_536_3 * lg + 0.051_445_992_9 * lb
  );
  const m = Math.cbrt(
    0.211_903_498_2 * lr + 0.680_699_545_1 * lg + 0.107_396_956_6 * lb
  );
  const s = Math.cbrt(
    0.088_302_461_9 * lr + 0.281_718_837_6 * lg + 0.629_978_700_5 * lb
  );
  return [
    0.210_454_255_3 * l + 0.793_617_785 * m - 0.004_072_046_8 * s,
    1.977_998_495_1 * l - 2.428_592_205 * m + 0.450_593_709_9 * s,
    0.025_904_037_1 * l + 0.782_771_766_2 * m - 0.808_675_766 * s,
  ];
};

const labCache = new WeakMap<
  readonly Rgb8[],
  readonly (readonly [number, number, number])[]
>();

/**
 * The index of the palette colour nearest `rgb`, measured in OKLab so the
 * match follows what the eye sees rather than raw channel distance.
 */
export const nearestIndex = (rgb: Rgb8, palette: readonly Rgb8[]): number => {
  let labs = labCache.get(palette);
  if (!labs) {
    labs = palette.map(rgbToOklab);
    labCache.set(palette, labs);
  }
  const [l, a, b] = rgbToOklab(rgb);
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const [index, [pl, pa, pb]] of labs.entries()) {
    const distance = (l - pl) ** 2 + (a - pa) ** 2 + (b - pb) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  return best;
};
