/**
 * The WebGL2 side of `AsciiShader`, free of React: programs, textures and
 * the four passes that turn a GLSL field into glyphs.
 *
 * 1. field: the field at every sample (columns * gx by rows * gy), tone
 *    in alpha and colour in RGB, into a float texture when the GPU can
 *    render to one.
 * 2. cell: one fragment per cell picks the glyph slot and colour, with
 *    the `mapTones` rules. `readCells` reads this back for capture.
 * 3. bloom (optional): a blur of bright glyphs at cell resolution.
 * 4. glyph: every device pixel draws its cell's glyph from the atlas,
 *    then scanlines, curvature, glitch, flicker and vignette.
 *
 * Nothing here allocates per frame: inputs are written into one reused
 * object and uniform arrays are preallocated.
 */

import type { GlyphAtlas } from "@/lib/ascii/atlas";
import {
  BLUR_SHADER,
  CELL_SHADER,
  describeCompileLog,
  fieldShader,
  GLYPH_SHADER,
  TRAIL_SHADER,
  VERTEX_SHADER,
  VERTEX_SHADER_100,
} from "@/lib/ascii/glsl";
import type { ThresholdMap } from "@/lib/ascii/matrices";
import type { Rgba } from "@/lib/ascii/tokens";

export type ShaderUniformValue =
  | number
  | readonly [number, number]
  | readonly [number, number, number]
  | readonly [number, number, number, number];

export type AsciiUniforms = Readonly<Record<string, ShaderUniformValue>>;

export interface UniformSpec {
  readonly name: string;
  readonly size: 1 | 2 | 3 | 4;
}

const IDENTIFIER = /^[A-Za-z][A-Za-z0-9_]*$/;
const GLSL_TYPES = { 1: "float", 2: "vec2", 3: "vec3", 4: "vec4" } as const;

const uniformSize = (value: ShaderUniformValue): UniformSpec["size"] =>
  typeof value === "number" ? 1 : value.length;

/** Declarable uniforms in a stable order; reserved or invalid names are skipped with an error. */
export const uniformSpecs = (uniforms: AsciiUniforms): UniformSpec[] =>
  Object.keys(uniforms)
    .toSorted()
    .flatMap((name) => {
      const value = uniforms[name];
      if (value === undefined) {
        return [];
      }
      if (
        !IDENTIFIER.test(name) ||
        name.startsWith("u_") ||
        name.startsWith("ascii_")
      ) {
        console.error(
          `[ascii-shader] uniform "${name}" skipped: names must be GLSL identifiers and not start with "u_" or "ascii_"`
        );
        return [];
      }
      return [{ name, size: uniformSize(value) }];
    });

/** Everything one frame reads. Mutated in place by the caller, never reallocated. */
export interface FrameInput {
  time: number;
  seed: number;
  uniforms: AsciiUniforms;
  /** Deprecated `levels`: tones snap to this many steps first; 0 is off. */
  levels: number;
  /** 0 none, 1 repel, 2 ripple, 3 trail. */
  interaction: number;
  readonly pointer: Float32Array;
  readonly pointerVelocity: Float32Array;
  readonly click: Float32Array;
  readonly audio: Float32Array;
  /** brightness, contrast, gamma, saturation. */
  readonly grade: Float32Array;
  invert: boolean;
  threshold: number;
  edgeThreshold: number;
  colorMode: number;
  readonly ink: Float32Array;
  /** Paper as premultiplied RGBA; alpha 0 for a transparent background. */
  readonly paper: Float32Array;
  readonly stops: Float32Array;
  stopCount: number;
  readonly ansi: Float32Array;
  readonly ansiLab: Float32Array;
  scanlines: number;
  bloom: number;
  curvature: number;
  glitch: number;
  flicker: number;
  vignette: number;
  /** Seconds since the last frame, for the trail's decay. */
  delta: number;
  frame: number;
}

export const createFrameInput = (): FrameInput => ({
  ansi: new Float32Array(48),
  ansiLab: new Float32Array(48),
  audio: new Float32Array(4),
  bloom: 0,
  click: new Float32Array([0.5, 0.5, 1e3]),
  colorMode: 0,
  curvature: 0,
  delta: 0,
  edgeThreshold: 0.22,
  flicker: 0,
  frame: 0,
  glitch: 0,
  grade: new Float32Array([0, 1, 1, 1]),
  ink: new Float32Array([1, 1, 1]),
  interaction: 0,
  invert: false,
  levels: 0,
  paper: new Float32Array([0, 0, 0, 1]),
  pointer: new Float32Array([0.5, 0.5, 0]),
  pointerVelocity: new Float32Array(2),
  scanlines: 0,
  seed: 0,
  stopCount: 1,
  stops: new Float32Array(24),
  threshold: 0.5,
  time: 0,
  uniforms: {},
  vignette: 0,
});

/** The charset layout the cell pass needs. */
export interface GlyphLayout {
  /** 0 ramp, 1 braille, 2 quadrants, 3 edge. */
  readonly kind: number;
  /** Ramp glyphs (or masks) before the edge glyphs. */
  readonly count: number;
  readonly grid: readonly [number, number];
  /** Calibrated ramp positions, or null for even spacing. */
  readonly positions: Float32Array | null;
}

export interface CellReadback {
  readonly columns: number;
  readonly rows: number;
  /** Atlas slot per cell, row-major, row 0 at the top. */
  readonly slots: Uint16Array;
  /** RGBA per cell, row-major, row 0 at the top. */
  readonly colors: Uint8Array;
}

export interface AsciiRenderer {
  /** Compile a field. False (with the error logged) when it doesn't compile. */
  setField(input: {
    field: string;
    colorField: string | undefined;
    specs: readonly UniformSpec[];
  }): boolean;
  setAtlas(atlas: GlyphAtlas, layout: GlyphLayout): void;
  setMatrix(map: ThresholdMap | null): void;
  setPalette(colors: readonly Rgba[]): void;
  resize(size: {
    columns: number;
    rows: number;
    canvasWidth: number;
    canvasHeight: number;
    dpr: number;
  }): void;
  draw(input: FrameInput): void;
  readCells(): CellReadback | null;
  dispose(): void;
}

type GL = WebGL2RenderingContext;

const logCompileError = (message: string) => {
  console.error(`[ascii-shader] ${message}`);
};

const compile = (gl: GL, type: GLenum, source: string): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

const link = (
  gl: GL,
  vertexSource: string,
  fragmentSource: string,
  describe: (log: string) => string = (log) => log
): WebGLProgram | null => {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!(vertex && fragment && program)) {
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, "a_position");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (!gl.isContextLost()) {
      const log =
        gl.getShaderInfoLog(fragment) ||
        gl.getShaderInfoLog(vertex) ||
        gl.getProgramInfoLog(program) ||
        "";
      logCompileError(`shader failed to compile\n${describe(log)}`);
      if (log.includes("already has a body") || log.includes("redefinition")) {
        logCompileError(
          "a function is defined twice. `field` and `colorField` compile into one shader: give helpers different names, or define a shared helper once, in `field`, and call it from both."
        );
      }
    }
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    gl.deleteProgram(program);
    return null;
  }
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  return program;
};

type Locations<Names extends string> = Record<
  Names,
  WebGLUniformLocation | null
>;

const locate = <const Names extends string>(
  gl: GL,
  program: WebGLProgram,
  names: readonly Names[]
): Locations<Names> => {
  const out: Partial<Locations<Names>> = {};
  for (const name of names) {
    out[name] = gl.getUniformLocation(program, name);
  }
  return out as Locations<Names>;
};

const createTexture = (gl: GL, filter: GLenum): WebGLTexture => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
};

const CELL_UNIFORMS = [
  "u_field",
  "u_positions",
  "u_thresholds",
  "u_coverage",
  "u_cells",
  "u_grid",
  "u_kind",
  "u_count",
  "u_calibrated",
  "u_dither",
  "u_matrixSize",
  "u_steps",
  "u_grade",
  "u_invert",
  "u_threshold",
  "u_edgeThreshold",
  "u_colorMode",
  "u_hasColor",
  "u_ink",
  "u_ansi",
  "u_ansiLab",
  "u_stops",
  "u_stopCount",
  "u_glitch",
  "u_glitchSeed",
] as const;

const GLYPH_UNIFORMS = [
  "u_cellGlyph",
  "u_cellColor",
  "u_atlas",
  "u_bloom",
  "u_cells",
  "u_cellSize",
  "u_canvas",
  "u_atlasColumns",
  "u_paper",
  "u_fx",
  "u_fx2",
  "u_glitchRows",
] as const;

const BLUR_UNIFORMS = [
  "u_source",
  "u_glyph",
  "u_step",
  "u_fromCells",
  "u_size",
] as const;

const TRAIL_UNIFORMS = [
  "u_previous",
  "u_size",
  "u_pointer",
  "u_decay",
  "u_strength",
] as const;

const FIELD_UNIFORMS = [
  "u_resolution",
  "u_time",
  "u_seed",
  "u_pointer",
  "u_pointerVelocity",
  "u_click",
  "u_audio",
  "u_palette",
  "u_paletteSize",
  "ascii_samples",
  "ascii_levels",
  "ascii_interaction",
  "ascii_trail",
] as const;

interface FieldProgram {
  readonly program: WebGLProgram;
  readonly at: Locations<(typeof FIELD_UNIFORMS)[number]>;
  readonly custom: readonly (UniformSpec & {
    readonly location: WebGLUniformLocation | null;
  })[];
}

// Small deterministic noise for per-frame effects, so nothing allocates.
const frameNoise = (frame: number, salt: number) => {
  const x = Math.sin(frame * 12.9898 + salt * 78.233) * 43_758.5453;
  return x - Math.floor(x);
};

/** Build the renderer on a WebGL2 context, or null when the GPU can't run it. */
export const createAsciiRenderer = (gl: GL): AsciiRenderer | null => {
  const floatTargets = gl.getExtension("EXT_color_buffer_float") !== null;

  const cellProgram = link(gl, VERTEX_SHADER, CELL_SHADER);
  const glyphProgram = link(gl, VERTEX_SHADER, GLYPH_SHADER);
  const blurProgram = link(gl, VERTEX_SHADER, BLUR_SHADER);
  const trailProgram = link(gl, VERTEX_SHADER, TRAIL_SHADER);
  if (!(cellProgram && glyphProgram && blurProgram && trailProgram)) {
    return null;
  }
  const cellAt = locate(gl, cellProgram, CELL_UNIFORMS);
  const glyphAt = locate(gl, glyphProgram, GLYPH_UNIFORMS);
  const blurAt = locate(gl, blurProgram, BLUR_UNIFORMS);
  const trailAt = locate(gl, trailProgram, TRAIL_UNIFORMS);

  // One triangle that covers the viewport, at attribute 0 in every program.
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  const fieldTexture = createTexture(gl, gl.NEAREST);
  const cellGlyph = createTexture(gl, gl.LINEAR);
  const cellColor = createTexture(gl, gl.LINEAR);
  const bloomA = createTexture(gl, gl.LINEAR);
  const bloomB = createTexture(gl, gl.LINEAR);
  const trails = [createTexture(gl, gl.LINEAR), createTexture(gl, gl.LINEAR)];
  const palette = createTexture(gl, gl.NEAREST);
  const thresholds = createTexture(gl, gl.NEAREST);
  const positions = createTexture(gl, gl.NEAREST);
  const coverage = createTexture(gl, gl.NEAREST);
  const atlasTexture = createTexture(gl, gl.NEAREST);

  const fieldFbo = gl.createFramebuffer();
  const cellFbo = gl.createFramebuffer();
  const bloomFboA = gl.createFramebuffer();
  const bloomFboB = gl.createFramebuffer();
  const trailFbos = [gl.createFramebuffer(), gl.createFramebuffer()];

  const attach = (fbo: WebGLFramebuffer | null, texture: WebGLTexture) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );
  };

  let fieldProgram: FieldProgram | null = null;
  let paletteSize = 2;
  let matrixSize = 1;
  let matrixSteps = 1;
  let dithered = false;
  let layout: GlyphLayout = {
    count: 2,
    grid: [1, 1],
    kind: 0,
    positions: null,
  };
  let atlasColumns = 32;
  let atlasVersion = -1;
  let atlasRef: GlyphAtlas | null = null;
  let columns = 0;
  let rows = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let dpr = 1;
  let trailIndex = 0;
  let hasColor = false;
  let readback: {
    slots: Uint16Array;
    colors: Uint8Array;
    raw: Uint8Array;
  } | null = null;

  const allocate = (
    texture: WebGLTexture,
    width: number,
    height: number,
    internal: GLenum,
    format: GLenum,
    type: GLenum
  ) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      internal,
      width,
      height,
      0,
      format,
      type,
      null
    );
  };

  const uploadAtlas = (atlas: GlyphAtlas) => {
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      atlas.canvas
    );
    const covers = new Float32Array(Math.max(1, atlas.glyphs.length));
    for (let slot = 0; slot < atlas.glyphs.length; slot += 1) {
      covers[slot] = atlas.slotCoverage(slot);
    }
    gl.bindTexture(gl.TEXTURE_2D, coverage);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R32F,
      covers.length,
      1,
      0,
      gl.RED,
      gl.FLOAT,
      covers
    );
    atlasColumns = atlas.columns;
    atlasVersion = atlas.version;
  };

  const bindTexture = (unit: number, texture: WebGLTexture) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  };

  const setCustom = (
    program: FieldProgram,
    uniforms: FrameInput["uniforms"]
  ) => {
    for (const spec of program.custom) {
      const value = uniforms[spec.name];
      if (value === undefined) {
        continue;
      }
      if (typeof value === "number") {
        gl.uniform1f(spec.location, value);
      } else if (value.length === 2) {
        gl.uniform2f(spec.location, value[0], value[1]);
      } else if (value.length === 3) {
        gl.uniform3f(spec.location, value[0], value[1], value[2]);
      } else {
        gl.uniform4f(spec.location, value[0], value[1], value[2], value[3]);
      }
    }
  };
  // Trail: decay last frame's wake and stamp the pointer.
  const drawTrail = (input: FrameInput) => {
    const previous = trails[trailIndex];
    trailIndex = 1 - trailIndex;
    const next = trails[trailIndex];
    if (previous && next) {
      gl.useProgram(trailProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, trailFbos[trailIndex] ?? null);
      gl.viewport(0, 0, columns, rows);
      bindTexture(0, previous);
      gl.uniform1i(trailAt.u_previous, 0);
      gl.uniform2f(trailAt.u_size, columns, rows);
      gl.uniform3fv(trailAt.u_pointer, input.pointer);
      gl.uniform1f(trailAt.u_decay, Math.exp(-input.delta * 2.2));
      const speed = Math.hypot(
        input.pointerVelocity[0] ?? 0,
        input.pointerVelocity[1] ?? 0
      );
      gl.uniform1f(
        trailAt.u_strength,
        Math.min(0.9, 0.08 + speed * 1.6) * Math.min(1, input.delta * 30)
      );
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };

  const drawField = (
    field: FieldProgram,
    input: FrameInput,
    samplesX: number,
    samplesY: number
  ) => {
    gl.useProgram(field.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fieldFbo);
    gl.viewport(0, 0, samplesX, samplesY);
    bindTexture(0, palette);
    gl.uniform1i(field.at.u_palette, 0);
    bindTexture(1, trails[trailIndex] ?? trails[0] ?? palette);
    gl.uniform1i(field.at.ascii_trail, 1);
    gl.uniform1f(field.at.u_paletteSize, paletteSize);
    // res.y counts sample rows; res.x keeps the box's true aspect ratio.
    gl.uniform2f(
      field.at.u_resolution,
      (samplesY * canvasWidth) / Math.max(1, canvasHeight),
      samplesY
    );
    gl.uniform2f(field.at.ascii_samples, samplesX, samplesY);
    gl.uniform1f(field.at.u_time, input.time);
    gl.uniform1f(field.at.u_seed, input.seed);
    gl.uniform3fv(field.at.u_pointer, input.pointer);
    gl.uniform2fv(field.at.u_pointerVelocity, input.pointerVelocity);
    gl.uniform3fv(field.at.u_click, input.click);
    gl.uniform4fv(field.at.u_audio, input.audio);
    gl.uniform1f(field.at.ascii_levels, input.levels);
    gl.uniform1f(field.at.ascii_interaction, input.interaction);
    setCustom(field, input.uniforms);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const drawCells = (input: FrameInput, glitch: number) => {
    const [gx, gy] = layout.grid;
    gl.useProgram(cellProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, cellFbo);
    gl.viewport(0, 0, columns, rows);
    bindTexture(0, fieldTexture);
    gl.uniform1i(cellAt.u_field, 0);
    bindTexture(1, positions);
    gl.uniform1i(cellAt.u_positions, 1);
    bindTexture(2, thresholds);
    gl.uniform1i(cellAt.u_thresholds, 2);
    bindTexture(3, coverage);
    gl.uniform1i(cellAt.u_coverage, 3);
    gl.uniform2i(cellAt.u_cells, columns, rows);
    gl.uniform2i(cellAt.u_grid, gx, gy);
    gl.uniform1i(cellAt.u_kind, layout.kind);
    gl.uniform1i(cellAt.u_count, layout.count);
    gl.uniform1i(cellAt.u_calibrated, layout.positions ? 1 : 0);
    gl.uniform1i(cellAt.u_dither, dithered ? 1 : 0);
    gl.uniform1i(cellAt.u_matrixSize, matrixSize);
    gl.uniform1f(cellAt.u_steps, matrixSteps);
    gl.uniform4fv(cellAt.u_grade, input.grade);
    gl.uniform1i(cellAt.u_invert, input.invert ? 1 : 0);
    gl.uniform1f(cellAt.u_threshold, input.threshold);
    gl.uniform1f(cellAt.u_edgeThreshold, input.edgeThreshold);
    gl.uniform1i(cellAt.u_colorMode, input.colorMode);
    gl.uniform1i(cellAt.u_hasColor, hasColor ? 1 : 0);
    gl.uniform3fv(cellAt.u_ink, input.ink);
    gl.uniform3fv(cellAt.u_ansi, input.ansi);
    gl.uniform3fv(cellAt.u_ansiLab, input.ansiLab);
    gl.uniform3fv(cellAt.u_stops, input.stops);
    gl.uniform1i(cellAt.u_stopCount, input.stopCount);
    gl.uniform1f(cellAt.u_glitch, glitch);
    gl.uniform1f(cellAt.u_glitchSeed, frameNoise(input.frame, 2) * 100);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // Bloom: blur bright glyphs at cell resolution.
  const drawBloom = () => {
    gl.useProgram(blurProgram);
    gl.uniform2f(blurAt.u_size, columns, rows);
    gl.bindFramebuffer(gl.FRAMEBUFFER, bloomFboA);
    bindTexture(0, cellColor);
    gl.uniform1i(blurAt.u_source, 0);
    bindTexture(1, cellGlyph);
    gl.uniform1i(blurAt.u_glyph, 1);
    gl.uniform1i(blurAt.u_fromCells, 1);
    gl.uniform2f(blurAt.u_step, 1 / columns, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, bloomFboB);
    bindTexture(0, bloomA);
    gl.uniform1i(blurAt.u_fromCells, 0);
    gl.uniform2f(blurAt.u_step, 0, 0.6 / rows);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const drawGlyphs = (
    input: FrameInput,
    glitch: number,
    metrics: GlyphAtlas["metrics"]
  ) => {
    gl.useProgram(glyphProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvasWidth, canvasHeight);
    bindTexture(0, cellGlyph);
    gl.uniform1i(glyphAt.u_cellGlyph, 0);
    bindTexture(1, cellColor);
    gl.uniform1i(glyphAt.u_cellColor, 1);
    bindTexture(2, atlasTexture);
    gl.uniform1i(glyphAt.u_atlas, 2);
    bindTexture(3, bloomB);
    gl.uniform1i(glyphAt.u_bloom, 3);
    gl.uniform2i(glyphAt.u_cells, columns, rows);
    gl.uniform2i(glyphAt.u_cellSize, metrics.deviceWidth, metrics.deviceHeight);
    gl.uniform2f(glyphAt.u_canvas, canvasWidth, canvasHeight);
    gl.uniform1i(glyphAt.u_atlasColumns, atlasColumns);
    gl.uniform4fv(glyphAt.u_paper, input.paper);
    gl.uniform4f(
      glyphAt.u_fx,
      input.scanlines,
      input.bloom,
      input.curvature,
      glitch
    );
    const flicker =
      input.flicker > 0
        ? 1 - input.flicker * 0.22 * frameNoise(input.frame, 3)
        : 1;
    gl.uniform4f(glyphAt.u_fx2, flicker, input.vignette, dpr, input.time);
    if (glitch > 0) {
      const start = Math.floor(frameNoise(input.frame, 4) * rows);
      const height =
        1 + Math.floor(frameNoise(input.frame, 5) * 3 * input.glitch);
      const shift = Math.round(
        (frameNoise(input.frame, 6) - 0.5) * 8 * input.glitch
      );
      gl.uniform4f(glyphAt.u_glitchRows, start, start + height, shift, 0);
    } else {
      gl.uniform4f(glyphAt.u_glitchRows, -1, -1, 0, 0);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const renderer: AsciiRenderer = {
    dispose: () => {
      for (const texture of [
        fieldTexture,
        cellGlyph,
        cellColor,
        bloomA,
        bloomB,
        ...trails,
        palette,
        thresholds,
        positions,
        coverage,
        atlasTexture,
      ]) {
        gl.deleteTexture(texture);
      }
      for (const fbo of [
        fieldFbo,
        cellFbo,
        bloomFboA,
        bloomFboB,
        ...trailFbos,
      ]) {
        gl.deleteFramebuffer(fbo);
      }
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      for (const program of [
        cellProgram,
        glyphProgram,
        blurProgram,
        trailProgram,
      ]) {
        gl.deleteProgram(program);
      }
      if (fieldProgram) {
        gl.deleteProgram(fieldProgram.program);
      }
    },

    draw: (input) => {
      if (!fieldProgram || columns === 0 || rows === 0 || !atlasRef) {
        return;
      }
      if (atlasRef.version !== atlasVersion) {
        uploadAtlas(atlasRef);
      }
      const [gx, gy] = layout.grid;
      gl.bindVertexArray(vao);
      gl.disable(gl.BLEND);
      if (input.interaction === 3) {
        drawTrail(input);
      }
      drawField(fieldProgram, input, columns * gx, rows * gy);
      // Glitch frames: a random share of frames, more with a stronger glitch.
      const glitch =
        input.glitch > 0 &&
        frameNoise(Math.floor(input.frame / 3), 1) < input.glitch * 0.3
          ? input.glitch
          : 0;
      drawCells(input, glitch);
      if (input.bloom > 0) {
        drawBloom();
      }
      drawGlyphs(input, glitch, atlasRef.metrics);
    },

    readCells: () => {
      if (columns === 0 || rows === 0) {
        return null;
      }
      const count = columns * rows;
      if (readback?.slots.length !== count) {
        readback = {
          colors: new Uint8Array(count * 4),
          raw: new Uint8Array(count * 4),
          slots: new Uint16Array(count),
        };
      }
      const { raw, slots, colors } = readback;
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, cellFbo);
      gl.readBuffer(gl.COLOR_ATTACHMENT0);
      gl.readPixels(0, 0, columns, rows, gl.RGBA, gl.UNSIGNED_BYTE, raw);
      // The texture's row 0 is the bottom row of cells: flip while unpacking.
      for (let y = 0; y < rows; y += 1) {
        const from = (rows - 1 - y) * columns;
        for (let x = 0; x < columns; x += 1) {
          const at = (from + x) * 4;
          slots[y * columns + x] = (raw[at] ?? 0) + 256 * (raw[at + 1] ?? 0);
        }
      }
      gl.readBuffer(gl.COLOR_ATTACHMENT1);
      gl.readPixels(0, 0, columns, rows, gl.RGBA, gl.UNSIGNED_BYTE, raw);
      for (let y = 0; y < rows; y += 1) {
        colors.set(
          raw.subarray((rows - 1 - y) * columns * 4, (rows - y) * columns * 4),
          y * columns * 4
        );
      }
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
      return { colors, columns, rows, slots };
    },

    resize: (size) => {
      ({ columns, rows, canvasWidth, canvasHeight, dpr } = size);
      const [gx, gy] = layout.grid;
      if (floatTargets) {
        allocate(
          fieldTexture,
          columns * gx,
          rows * gy,
          gl.RGBA16F,
          gl.RGBA,
          gl.HALF_FLOAT
        );
      } else {
        allocate(
          fieldTexture,
          columns * gx,
          rows * gy,
          gl.RGBA8,
          gl.RGBA,
          gl.UNSIGNED_BYTE
        );
      }
      attach(fieldFbo, fieldTexture);
      for (const texture of [cellGlyph, cellColor, bloomA, bloomB, ...trails]) {
        allocate(texture, columns, rows, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, cellFbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        cellGlyph,
        0
      );
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT1,
        gl.TEXTURE_2D,
        cellColor,
        0
      );
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
      attach(bloomFboA, bloomA);
      attach(bloomFboB, bloomB);
      for (const [index, fbo] of trailFbos.entries()) {
        const texture = trails[index];
        if (texture) {
          attach(fbo, texture);
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },

    setAtlas: (atlas, next) => {
      const gridChanged =
        next.grid[0] !== layout.grid[0] || next.grid[1] !== layout.grid[1];
      layout = next;
      atlasRef = atlas;
      uploadAtlas(atlas);
      const data = next.positions ?? new Float32Array([0]);
      gl.bindTexture(gl.TEXTURE_2D, positions);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.R32F,
        data.length,
        1,
        0,
        gl.RED,
        gl.FLOAT,
        data
      );
      if (gridChanged && columns > 0) {
        renderer.resize({ canvasHeight, canvasWidth, columns, dpr, rows });
      }
    },

    setField: ({ field, colorField, specs }) => {
      const declarations = specs
        .map(({ name, size }) => `uniform ${GLSL_TYPES[size]} ${name};`)
        .join("\n");
      const built = fieldShader({ colorField, field, uniforms: declarations });
      const program = link(gl, VERTEX_SHADER_100, built.source, (log) =>
        describeCompileLog({
          colorField,
          colorLine: built.colorLine,
          field,
          fieldLine: built.fieldLine,
          log,
        })
      );
      if (!program) {
        return false;
      }
      if (fieldProgram) {
        gl.deleteProgram(fieldProgram.program);
      }
      fieldProgram = {
        at: locate(gl, program, FIELD_UNIFORMS),
        custom: specs.map((spec) => ({
          ...spec,
          location: gl.getUniformLocation(program, spec.name),
        })),
        program,
      };
      hasColor = colorField !== undefined;
      return true;
    },

    setMatrix: (map) => {
      dithered = map !== null;
      if (!map) {
        return;
      }
      gl.bindTexture(gl.TEXTURE_2D, thresholds);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.R8,
        map.size,
        map.size,
        0,
        gl.RED,
        gl.UNSIGNED_BYTE,
        map.ranks
      );
      matrixSize = map.size;
      matrixSteps = map.steps;
    },

    setPalette: (colors) => {
      const bytes = new Uint8Array(colors.length * 4);
      for (const [index, color] of colors.entries()) {
        bytes.set(
          color.map((channel) => Math.round(channel * 255)),
          index * 4
        );
      }
      gl.bindTexture(gl.TEXTURE_2D, palette);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        colors.length,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        bytes
      );
      paletteSize = colors.length;
    },
  };
  return renderer;
};
