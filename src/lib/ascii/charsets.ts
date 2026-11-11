/**
 * Glyph sets for the ASCII engine. Pure data and helpers, server-safe.
 *
 * A ramp runs from empty (index 0, tone 0) to dense (the last index,
 * tone 1). Braille and quadrant sets are not ramps: they pack a grid of
 * sub-samples into every cell (2x4 dots, 2x2 quadrants), one bit per
 * sample, so they carry more spatial detail than any ramp. The edge set
 * draws `- / | \` along strong Sobel gradients and a ramp everywhere else.
 */

export type CharsetKind = "ramp" | "braille" | "quadrants" | "edge";

export interface Charset {
  /** The id components and the Studio take, such as `"braille"`. */
  readonly id: string;
  /** A short display name. */
  readonly label: string;
  readonly kind: CharsetKind;
  /**
   * Ramps: glyphs from empty to dense. Braille: 256 glyphs indexed by dot
   * mask. Quadrants: 16 glyphs indexed by quadrant mask. Edge: the interior
   * ramp; the directional glyphs are `EDGE_GLYPHS`.
   */
  readonly glyphs: readonly string[];
  /** Sub-samples per cell as [columns, rows]: [1, 1] for ramps. */
  readonly grid: readonly [number, number];
}

const split = (ramp: string): readonly string[] => [...ramp];

/** Code point of the empty braille pattern; a mask is added to it. */
export const BRAILLE_BASE = 0x28_00;

/**
 * The bit each braille dot sets, indexed `[row][column]` with row 0 at the
 * top. Dots 1-3 run down the left column, 4-6 down the right, and 7-8 sit
 * on the bottom row, as Unicode numbers them.
 */
export const BRAILLE_DOT_BITS = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
] as const;

/** The braille glyph for a dot mask, 0 to 255. */
export const brailleChar = (mask: number): string =>
  String.fromCodePoint(BRAILLE_BASE + (mask & 255));

/**
 * Quadrant glyphs indexed by mask: top-left 1, top-right 2, bottom-left 4,
 * bottom-right 8. Index 0 is a space and 15 a full block.
 */
export const QUADRANT_GLYPHS = split(" ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█");

/** The bit each quadrant sets, indexed `[row][column]`, row 0 at the top. */
export const QUADRANT_BITS = [
  [1, 2],
  [4, 8],
] as const;

/** The quadrant glyph for a mask, 0 to 15. */
export const quadrantChar = (mask: number): string =>
  QUADRANT_GLYPHS[mask & 15] ?? " ";

/**
 * Directional glyphs for the edge set, indexed by the edge's direction in
 * 45 degree steps: 0 horizontal, 1 rising, 2 vertical, 3 falling.
 */
export const EDGE_GLYPHS = split("-/|\\");

/**
 * The glyph for an edge whose tone gradient is (gx, gy), with y pointing
 * down as in an image. The edge runs across the gradient, so a gradient
 * pointing right draws `|` and one pointing down-right draws `/`.
 */
export const edgeChar = (gx: number, gy: number): string => {
  // Fold the gradient angle into [0, pi), then snap to the nearest 45 degrees.
  let angle = Math.atan2(gy, gx);
  if (angle < 0) {
    angle += Math.PI;
  }
  const step = Math.round(angle / (Math.PI / 4)) % 4;
  // Gradient 0 (right) is a vertical edge, pi/4 (down-right) rising,
  // pi/2 (down) horizontal and 3pi/4 (down-left) falling.
  return EDGE_GLYPHS[[2, 1, 0, 3][step] ?? 0] ?? "|";
};

/** Eighth blocks filling a cell from the bottom, empty to full: bar charts, sparklines. */
export const EIGHTHS_UP = split(" ▁▂▃▄▅▆▇█");

/** Eighth blocks filling a cell from the left, empty to full: progress bars, gauges. */
export const EIGHTHS_RIGHT = split(" ▏▎▍▌▋▊▉█");

/** Shade glyphs, empty to full. */
export const SHADES = split(" ░▒▓█");

/** Box-drawing sets for frames, tables and dividers. */
export const BOX = {
  ascii: { bl: "+", br: "+", h: "-", tl: "+", tr: "+", v: "|", x: "+" },
  double: { bl: "╚", br: "╝", h: "═", tl: "╔", tr: "╗", v: "║", x: "╬" },
  heavy: { bl: "┗", br: "┛", h: "━", tl: "┏", tr: "┓", v: "┃", x: "╋" },
  light: { bl: "└", br: "┘", h: "─", tl: "┌", tr: "┐", v: "│", x: "┼" },
  rounded: { bl: "╰", br: "╯", h: "─", tl: "╭", tr: "╮", v: "│", x: "┼" },
} as const satisfies Record<
  string,
  Record<"tl" | "tr" | "bl" | "br" | "h" | "v" | "x", string>
>;

export type BoxStyle = keyof typeof BOX;

/** Frame sequences for spinners and loaders. */
export const SPINNERS = {
  arc: split("◜◠◝◞◡◟"),
  bar: split("▁▂▃▄▅▆▇█▇▆▅▄▃▂"),
  braille: split("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"),
  orbit: split("⣾⣽⣻⢿⡿⣟⣯⣷"),
  quadrant: split("▖▘▝▗"),
  tick: split("-\\|/"),
} as const;

export type SpinnerName = keyof typeof SPINNERS;

const BRAILLE_GLYPHS = Array.from({ length: 256 }, (_, mask) =>
  brailleChar(mask)
);

/**
 * Every charset the engine draws, keyed by id. Ramps are hand-ordered by
 * ink coverage in a typical monospace font, so they read correctly even
 * where coverage can't be measured (on the server, in a `<pre>`). The
 * renderers measure the real font and space the tones to match.
 */
export const CHARSETS = {
  blocks: {
    glyphs: SHADES,
    grid: [1, 1],
    id: "blocks",
    kind: "ramp",
    label: "ANSI blocks",
  },
  braille: {
    glyphs: BRAILLE_GLYPHS,
    grid: [2, 4],
    id: "braille",
    kind: "braille",
    label: "Braille 2×4",
  },
  cp437: {
    glyphs: split(" ·∙•∟↔○◘♪♫☼↕‼§¶♂♀♠♣♥♦▬►◄▲▼☺☻◙░▒▓█"),
    grid: [1, 1],
    id: "cp437",
    kind: "ramp",
    label: "CP437",
  },
  dense: {
    glyphs: split(
      " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"
    ),
    grid: [1, 1],
    id: "dense",
    kind: "ramp",
    label: "Dense 70",
  },
  dots: {
    // Five dot sizes, so mid-tones step evenly from a speck to a full dot.
    glyphs: split(" ·∙•⦁●"),
    grid: [1, 1],
    id: "dots",
    kind: "ramp",
    label: "Halftone",
  },
  edge: {
    glyphs: split(" .:-=+*#%@"),
    grid: [1, 1],
    id: "edge",
    kind: "edge",
    label: "Sobel edges",
  },
  katakana: {
    glyphs: split(" ·:=+ｰｼﾂｿﾝﾐﾊﾑﾒﾓﾔﾕﾗﾘﾜｦｱｳｴｵｶｷｹｺｻｽｾﾀﾃﾅﾆﾇﾈﾋﾎﾏ01234789Z"),
    grid: [1, 1],
    id: "katakana",
    kind: "ramp",
    label: "Katakana",
  },
  petscii: {
    glyphs: split(" ▁╱╲─│╭╮╰╯▂┼○◇▃♠♣♥♦●◆▄▌▅▆▊▇█"),
    grid: [1, 1],
    id: "petscii",
    kind: "ramp",
    label: "PETSCII",
  },
  quadrants: {
    glyphs: QUADRANT_GLYPHS,
    grid: [2, 2],
    id: "quadrants",
    kind: "quadrants",
    label: "Quadrants 2×2",
  },
  standard: {
    glyphs: split(" .:-=+*#%@"),
    grid: [1, 1],
    id: "standard",
    kind: "ramp",
    label: "Classic",
  },
} as const satisfies Record<string, Charset>;

export type CharsetName = keyof typeof CHARSETS;

/** Charset ids in display order, for pickers. */
export const CHARSET_NAMES = [
  "standard",
  "dense",
  "blocks",
  "quadrants",
  "braille",
  "cp437",
  "petscii",
  "katakana",
  "dots",
  "edge",
] as const satisfies readonly CharsetName[];

const isCharsetName = (value: string): value is CharsetName =>
  Object.hasOwn(CHARSETS, value);

/**
 * The charset to draw with. `chars`, a custom ramp from empty to dense such
 * as `" .oO@"`, wins over `charset`. A ramp needs at least two glyphs; an
 * unknown id or a too-short ramp falls back to `standard`.
 */
export const resolveCharset = (
  charset: CharsetName | Charset = "standard",
  chars?: string
): Charset => {
  if (chars !== undefined) {
    const glyphs = split(chars);
    if (glyphs.length >= 2) {
      return {
        glyphs,
        grid: [1, 1],
        id: "custom",
        kind: "ramp",
        label: "Custom",
      };
    }
  }
  if (typeof charset !== "string") {
    return charset;
  }
  return isCharsetName(charset) ? CHARSETS[charset] : CHARSETS.standard;
};

/** A stable key for caching anything built from a charset (atlases, LUTs). */
export const charsetKey = (charset: Charset): string =>
  `${charset.kind}:${charset.glyphs.join("")}`;

/**
 * The ramp glyph for a tone in [0, 1], rounded to the nearest level.
 * Only for ramp and edge sets; braille and quadrants need sub-samples.
 */
export const rampChar = (charset: Charset, tone: number): string => {
  const { glyphs } = charset;
  const last = glyphs.length - 1;
  const clamped = tone > 0 ? Math.min(tone, 1) : 0;
  return glyphs[Math.round(clamped * last)] ?? " ";
};

/**
 * A row of eighth blocks showing `value` in [0, 1] across `width` cells,
 * with the partial cell at the end: `bar(0.55, 6)` is `"███▎  "`.
 */
export const eighthsBar = (
  value: number,
  width: number,
  glyphs: readonly string[] = EIGHTHS_RIGHT
): string => {
  const cells = Math.max(0, Math.floor(width));
  const clamped = value > 0 ? Math.min(value, 1) : 0;
  const eighths = Math.round(clamped * cells * 8);
  const full = Math.floor(eighths / 8);
  const rest = eighths % 8;
  const solid = glyphs[8] ?? "█";
  let out = solid.repeat(full);
  if (full < cells) {
    out += glyphs[rest] ?? " ";
    out += " ".repeat(cells - full - 1);
  }
  return out;
};
