"use client";

import { useEffect, useState } from "react";

import { resolveCharset } from "@/lib/ascii/charsets";
import type { Charset, CharsetName } from "@/lib/ascii/charsets";
import type { ToneField } from "@/lib/ascii/frame";
import { luma } from "@/lib/ascii/palettes";

/**
 * Turn images, video frames, canvases and webcam streams into tone fields
 * for `mapTones`. Browser only.
 *
 * Downscaling is area-averaged: the source is drawn at a whole multiple
 * of the sample grid (up to 4x) with high-quality smoothing, then every
 * block of pixels is averaged into one sample. A thin line or a fine
 * texture becomes a lighter tone instead of flickering between glyphs as
 * it moves, which is what plain nearest-pixel sampling does.
 */

/** A region of the source in [0, 1] of its width and height. */
export interface SampleCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SampleOptions {
  /** Glyph columns. */
  columns: number;
  /** Glyph rows. */
  rows: number;
  /** Sets the sample grid per cell (2x4 for Braille). Default `"standard"`. */
  charset?: CharsetName | Charset;
  /**
   * How the source fills the box: `cover` crops to fill, `contain` fits
   * inside (the bars are empty, alpha 0), `fill` stretches. Default `"cover"`.
   */
  fit?: "cover" | "contain" | "fill";
  /** Flip left to right, as a webcam preview should be. Default `false`. */
  mirror?: boolean;
  /** Use only this part of the source. Default: all of it. */
  crop?: SampleCrop;
  /**
   * The box's width over height in CSS pixels. Default: the grid of
   * monospace cells, `columns * 0.5 / rows`.
   */
  aspect?: number;
  /** A field to write into when its size matches, to avoid allocating per frame. */
  into?: ToneField;
}

interface Scratch {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
}

let scratch: Scratch | null = null;

// One scratch canvas for every sampler on the page.
const getScratch = (): Scratch | null => {
  if (scratch) {
    return scratch;
  }
  if (typeof OffscreenCanvas === "undefined") {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    scratch = context ? { canvas, context } : null;
  } else {
    const canvas = new OffscreenCanvas(1, 1);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    scratch = context ? { canvas, context } : null;
  }
  return scratch;
};

/** The intrinsic size of any canvas image source, 0 when not loaded yet. */
export const sourceSize = (
  source: CanvasImageSource
): { width: number; height: number } => {
  if ("videoWidth" in source) {
    return { height: source.videoHeight, width: source.videoWidth };
  }
  if ("naturalWidth" in source) {
    return { height: source.naturalHeight, width: source.naturalWidth };
  }
  if ("displayWidth" in source) {
    return { height: source.displayHeight, width: source.displayWidth };
  }
  const { width, height } = source;
  return {
    height: typeof height === "number" ? height : height.baseVal.value,
    width: typeof width === "number" ? width : width.baseVal.value,
  };
};

const MAX_SUPERSAMPLE = 4;

/** Where the source is read from (pixels) and where it lands in the box ([0, 1]). */
interface Placement {
  readonly sx: number;
  readonly sy: number;
  readonly sw: number;
  readonly sh: number;
  readonly dx: number;
  readonly dy: number;
  readonly dw: number;
  readonly dh: number;
}

/** The source rectangle after crop and fit, and its place in the box. */
const placeSource = (
  size: { width: number; height: number },
  crop: SampleCrop,
  fit: NonNullable<SampleOptions["fit"]>,
  boxAspect: number
): Placement => {
  const sx = crop.x * size.width;
  const sy = crop.y * size.height;
  const sw = crop.width * size.width;
  const sh = crop.height * size.height;
  const full = { dh: 1, dw: 1, dx: 0, dy: 0, sh, sw, sx, sy };
  const sourceAspect = sw / sh;
  if (fit === "fill") {
    return full;
  }
  const wider = sourceAspect > boxAspect;
  if (fit === "cover") {
    // Crop the long side to the box's shape, keeping the centre.
    return wider
      ? { ...full, sw: sh * boxAspect, sx: sx + (sw - sh * boxAspect) / 2 }
      : { ...full, sh: sw / boxAspect, sy: sy + (sh - sw / boxAspect) / 2 };
  }
  // Contain: shrink the image inside the box and centre it.
  const dw = wider ? 1 : sourceAspect / boxAspect;
  const dh = wider ? boxAspect / sourceAspect : 1;
  return { ...full, dh, dw, dx: (1 - dw) / 2, dy: (1 - dh) / 2 };
};

/**
 * Average every k x k block of `data` (pw pixels wide) into one sample.
 * Colour is averaged premultiplied, so transparent pixels don't darken
 * edges; the tone is the luma scaled by coverage.
 */
const averageBlocks = (
  data: Uint8ClampedArray,
  pw: number,
  k: number,
  { width, height, tones, colors }: ToneField & { colors: Uint8ClampedArray }
): void => {
  const area = k * k;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let by = 0; by < k; by += 1) {
        let at = ((y * k + by) * pw + x * k) * 4;
        for (let bx = 0; bx < k; bx += 1) {
          const alpha = data[at + 3] ?? 0;
          r += (data[at] ?? 0) * alpha;
          g += (data[at + 1] ?? 0) * alpha;
          b += (data[at + 2] ?? 0) * alpha;
          a += alpha;
          at += 4;
        }
      }
      const index = y * width + x;
      const out = index * 4;
      const weight = a === 0 ? 0 : 1 / a;
      const red = r * weight;
      const green = g * weight;
      const blue = b * weight;
      colors[out] = red;
      colors[out + 1] = green;
      colors[out + 2] = blue;
      colors[out + 3] = a / area;
      tones[index] = luma(red, green, blue) * (a / area / 255);
    }
  }
};

const FULL_CROP: SampleCrop = { height: 1, width: 1, x: 0, y: 0 };

/**
 * Sample a source into a tone field for `columns` x `rows` cells of
 * `charset`: luma as tone (scaled by alpha, so transparent pixels are
 * empty) and the averaged colour of every sample.
 *
 * ```ts
 * const field = sampleToField(video, { columns: 120, rows: 40, charset: "braille" });
 * mapTones(field, 120, 40, { charset: "braille", colorMode: "truecolor" }, frame);
 * ```
 */
export const sampleToField = (
  source: CanvasImageSource,
  {
    columns,
    rows,
    charset = "standard",
    fit = "cover",
    mirror = false,
    crop = FULL_CROP,
    aspect,
    into,
  }: SampleOptions
): ToneField => {
  const [gx, gy] = resolveCharset(charset).grid;
  const width = Math.max(0, Math.floor(columns)) * gx;
  const height = Math.max(0, Math.floor(rows)) * gy;
  const colors =
    into?.width === width && into.height === height && into.colors
      ? into.colors
      : new Uint8ClampedArray(width * height * 4);
  const field =
    into?.colors === colors
      ? { ...into, colors }
      : { colors, height, tones: new Float32Array(width * height), width };
  const size = sourceSize(source);
  const pad = getScratch();
  if (!pad || width * height === 0 || size.width * size.height === 0) {
    field.tones.fill(0);
    colors.fill(0);
    return field;
  }

  const place = placeSource(
    size,
    crop,
    fit,
    aspect ?? (columns * 0.5) / Math.max(1, rows)
  );
  // Supersample at a whole multiple so each sample averages a k x k block.
  const k = Math.max(
    1,
    Math.min(
      MAX_SUPERSAMPLE,
      Math.floor(
        Math.min(place.sw / (width * place.dw), place.sh / (height * place.dh))
      )
    )
  );
  const pw = width * k;
  const ph = height * k;
  const { canvas, context } = pad;
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, pw, ph);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  if (mirror) {
    context.setTransform(-1, 0, 0, 1, pw, 0);
  }
  context.drawImage(
    source,
    place.sx,
    place.sy,
    place.sw,
    place.sh,
    place.dx * pw,
    place.dy * ph,
    place.dw * pw,
    place.dh * ph
  );
  averageBlocks(context.getImageData(0, 0, pw, ph).data, pw, k, field);
  return field;
};

/**
 * Stretch a field's tones so the darkest `clipPercent` of samples maps to
 * 0 and the brightest to 1, like a photo editor's auto levels. Flat or
 * low-contrast sources then use the whole glyph ramp. Works in place and
 * returns the field. Transparent samples are left out of the histogram.
 */
export const autoLevels = (field: ToneField, clipPercent = 0.5): ToneField => {
  const { tones, colors } = field;
  const bins = new Uint32Array(256);
  let counted = 0;
  for (let index = 0; index < tones.length; index += 1) {
    if (colors && (colors[index * 4 + 3] ?? 0) === 0) {
      continue;
    }
    const tone = tones[index] ?? 0;
    bins[Math.min(255, Math.max(0, Math.round(tone * 255)))] += 1;
    counted += 1;
  }
  if (counted === 0) {
    return field;
  }
  const clip = Math.floor(
    (counted * Math.max(0, Math.min(49, clipPercent))) / 100
  );
  let low = 0;
  for (let seen = 0; low < 255; low += 1) {
    seen += bins[low] ?? 0;
    if (seen > clip) {
      break;
    }
  }
  let high = 255;
  for (let seen = 0; high > 0; high -= 1) {
    seen += bins[high] ?? 0;
    if (seen > clip) {
      break;
    }
  }
  if (high <= low) {
    return field;
  }
  const from = low / 255;
  const scale = 255 / (high - low);
  for (let index = 0; index < tones.length; index += 1) {
    const stretched = ((tones[index] ?? 0) - from) * scale;
    tones[index] = stretched > 0 ? Math.min(stretched, 1) : 0;
  }
  return field;
};

/** Anything `useMediaElement` can load. */
export type MediaSource = string | Blob | MediaStream | null;

export interface MediaElementState {
  /** The loaded image or video, or `null` while loading (or with no source). */
  element: HTMLImageElement | HTMLVideoElement | null;
  /** What the element is. */
  kind: "image" | "video" | null;
  /** Set when the source failed to load. */
  error: Error | null;
}

export interface MediaElementOptions {
  /** Treat a URL as this kind instead of guessing from its extension. */
  kind?: "image" | "video";
  /** Video: loop. Default `true`. */
  loop?: boolean;
  /** CORS mode for URLs. Default `"anonymous"`, so frames can be read back. */
  crossOrigin?: "anonymous" | "use-credentials";
}

const VIDEO_EXTENSION = /\.(mp4|webm|mov|m4v|ogv|ogg)(\?|#|$)/iu;

const isStream = (value: MediaSource): value is MediaStream =>
  typeof MediaStream !== "undefined" && value instanceof MediaStream;

interface ResolvedSource {
  /** The URL to load, or null for a stream. */
  readonly url: string | null;
  /** An object URL this hook made and must revoke. */
  readonly objectUrl: string | null;
  readonly video: boolean;
}

const resolveSource = (
  source: Exclude<MediaSource, null>,
  kind: MediaElementOptions["kind"]
): ResolvedSource => {
  if (isStream(source)) {
    return { objectUrl: null, url: null, video: true };
  }
  if (typeof source === "string") {
    return {
      objectUrl: null,
      url: source,
      video:
        kind === "video" ||
        (kind === undefined && VIDEO_EXTENSION.test(source)),
    };
  }
  const objectUrl = URL.createObjectURL(source);
  return {
    objectUrl,
    url: objectUrl,
    video:
      kind === "video" ||
      (kind === undefined && source.type.startsWith("video/")),
  };
};

/** A muted, inline, autoplaying video for a stream or URL. */
const createVideo = (
  source: Exclude<MediaSource, null>,
  { url, objectUrl }: ResolvedSource,
  { loop, crossOrigin }: Required<Omit<MediaElementOptions, "kind">>
): HTMLVideoElement => {
  const element = document.createElement("video");
  element.muted = true;
  element.playsInline = true;
  element.loop = loop;
  element.autoplay = true;
  if (isStream(source)) {
    element.srcObject = source;
  } else if (url !== null) {
    // Object URLs are same-origin; only remote URLs need CORS.
    if (objectUrl === null) {
      element.crossOrigin = crossOrigin;
    }
    element.src = url;
  }
  return element;
};

/** Stop a video and let the browser drop its buffers. */
const releaseVideo = (video: HTMLVideoElement) => {
  video.pause();
  video.srcObject = null;
  video.removeAttribute("src");
  video.load();
};

/**
 * Load an image URL, a video URL, a dropped `File` or a webcam
 * `MediaStream` into an element ready for `sampleToField`. Videos play
 * muted, inline and looping. Object URLs are revoked and videos stopped on
 * change and unmount; a stream's tracks stay yours to stop.
 *
 * ```ts
 * const { element } = useMediaElement(file ?? "/examples/portrait.jpg");
 * ```
 */
export const useMediaElement = (
  source: MediaSource,
  { kind, loop = true, crossOrigin = "anonymous" }: MediaElementOptions = {}
): MediaElementState => {
  const [state, setState] = useState<MediaElementState>({
    element: null,
    error: null,
    kind: null,
  });

  useEffect(() => {
    if (source === null) {
      setState({ element: null, error: null, kind: null });
      return;
    }
    let cancelled = false;
    const resolved = resolveSource(source, kind);
    const fail = (error: unknown) => {
      if (!cancelled) {
        setState({
          element: null,
          error:
            error instanceof Error
              ? error
              : new Error("ascii: media failed to load"),
          kind: null,
        });
      }
    };

    let video: HTMLVideoElement | null = null;
    let image: HTMLImageElement | null = null;
    if (resolved.video) {
      const element = createVideo(source, resolved, { crossOrigin, loop });
      video = element;
      element.addEventListener(
        "loadeddata",
        async () => {
          if (!cancelled) {
            setState({ element, error: null, kind: "video" });
          }
          try {
            await element.play();
          } catch {
            // Autoplay can be refused; the first frame still samples.
          }
        },
        { once: true }
      );
      element.addEventListener("error", () => fail(element.error), {
        once: true,
      });
    } else if (resolved.url !== null) {
      const element = new Image();
      image = element;
      if (resolved.objectUrl === null) {
        element.crossOrigin = crossOrigin;
      }
      element.decoding = "async";
      element.src = resolved.url;
      const load = async () => {
        try {
          await element.decode();
          if (!cancelled) {
            setState({ element, error: null, kind: "image" });
          }
        } catch (error) {
          fail(error);
        }
      };
      load();
    }

    return () => {
      cancelled = true;
      if (video) {
        releaseVideo(video);
      }
      if (image) {
        image.src = "";
      }
      if (resolved.objectUrl !== null) {
        URL.revokeObjectURL(resolved.objectUrl);
      }
    };
  }, [source, kind, loop, crossOrigin]);

  return state;
};
