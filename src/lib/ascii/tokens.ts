/** A colour as red, green, blue and alpha, each in [0, 1]. */
export type Rgba = readonly [number, number, number, number];

/**
 * The named colours of the asciicn palette. `ink` is the theme's own
 * `--ascii-ink`; the others are `--ascii-color-<name>` from the
 * `ascii-tokens` stylesheet, tuned separately for light and dark.
 */
export const ASCII_COLOR_NAMES = [
  "ink",
  "blue",
  "purple",
  "green",
  "pink",
  "orange",
  "red",
  "grey",
] as const;

export type AsciiColorName = (typeof ASCII_COLOR_NAMES)[number];

/**
 * Used when a named colour's variable is missing, as in a stylesheet from
 * before the palette existed. Mid lightness, so it reads on black and white.
 */
const FALLBACKS = {
  blue: "oklch(0.64 0.16 245)",
  green: "oklch(0.68 0.16 152)",
  grey: "oklch(0.6 0 0)",
  ink: "oklch(0.6 0.2 270)",
  orange: "oklch(0.72 0.16 58)",
  pink: "oklch(0.66 0.19 352)",
  purple: "oklch(0.62 0.2 302)",
  red: "oklch(0.62 0.21 26)",
} as const satisfies Record<AsciiColorName, string>;

/** The CSS variable behind each named colour. */
export const ASCII_COLORS = {
  blue: "--ascii-color-blue",
  green: "--ascii-color-green",
  grey: "--ascii-color-grey",
  ink: "--ascii-ink",
  orange: "--ascii-color-orange",
  pink: "--ascii-color-pink",
  purple: "--ascii-color-purple",
  red: "--ascii-color-red",
} as const satisfies Record<AsciiColorName, `--${string}`>;

/**
 * A colour asciicn components accept: a palette name such as
 * `"green"`, a CSS variable name such as `"--ascii-ink"`, or any CSS
 * colour such as `"var(--chart-1)"`, `"oklch(0.7 0.15 272)"` or `"#fff"`.
 * Palette names win over the CSS keywords they share (`"red"` is the
 * asciicn red, not `#f00`).
 */
// oxlint-disable-next-line typescript/ban-types -- `string & {}` keeps editor autocomplete for the names.
export type AsciiColor = AsciiColorName | (string & {});

/** Colours from tone 0 (paper) to tone 1 (ink). At least two. */
export type AsciiPalette = readonly [AsciiColor, AsciiColor, ...AsciiColor[]];

/** Paper to ink, from the `ascii-tokens` CSS variables. */
export const DEFAULT_PALETTE = [
  "--ascii-paper",
  "--ascii-ink",
] as const satisfies AsciiPalette;

const isColorName = (value: string): value is AsciiColorName =>
  Object.hasOwn(ASCII_COLORS, value);

/**
 * A CSS colour for any `AsciiColor`: `"green"` becomes
 * `"var(--ascii-color-green, <fallback>)"`, `"--chart-1"` becomes `"var(--chart-1)"`,
 * and anything else passes through.
 */
export const cssColor = (value: AsciiColor): string => {
  if (isColorName(value)) {
    return `var(${ASCII_COLORS[value]}, ${FALLBACKS[value]})`;
  }
  return value.startsWith("--") ? `var(${value})` : value;
};

/**
 * Motion tokens shared by every component: one ease-out curve and three
 * durations in milliseconds. `ease` matches the site's `--ease-out`.
 */
export const MOTION = {
  base: 240,
  ease: "cubic-bezier(0.23, 1, 0.32, 1)",
  fast: 150,
  slow: 600,
} as const;
