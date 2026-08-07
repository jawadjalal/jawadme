// Build the static favicon assets from Jawad's memoji portrait.
//
// Why a script and not `next/og`: a favicon is a static asset. Rendering it per
// request buys nothing, and next/og cannot read a local image without inlining
// the bytes anyway. So we pre-generate PNGs that Next's app-dir convention picks
// up automatically (src/app/icon.png -> /icon, src/app/apple-icon.png ->
// /apple-icon) and commit them.
//
// Usage:  npm i sharp --no-save && node scripts/build-icons.mjs
// `sharp` is deliberately NOT a dependency — this only runs by hand when the
// portrait changes, so it must not be added to package.json.
//
// Source: public/design/jawad.webp — the 3D/memoji head. Chosen over
// public/assets/portrait.png because it is already a head-and-shoulders crop on
// a clean near-white field, and its flat shapes + near-black hair survive the
// brutal downscale to 16x16 far better than a painted illustration does.

import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public/design/jawad.webp");
const OUT_ICON = path.join(ROOT, "src/app/icon.png");
const OUT_APPLE = path.join(ROOT, "src/app/apple-icon.png");

// jawadOS palette.
const GREEN = { r: 0x7a, g: 0xc2, b: 0x74 };
const INK = { r: 0x14, g: 0x13, b: 0x11 };

// Near-white, near-desaturated pixels are backdrop, not head. Ramp the alpha
// between these two so the silhouette keeps a soft edge instead of a jagged one.
const BG_SOLID = 234; // at/above this darkest-channel value: fully background
const BG_EDGE = 214; // at/below: fully head

/** Knock the near-white studio backdrop out to transparency. */
async function cutout(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lo = Math.min(r, g, b);
      const sat = Math.max(r, g, b) - lo;

      // Skin highlights are bright too, but they are warm; only kill greys.
      let alpha = 255;
      if (sat < 16 && lo > BG_EDGE) {
        const t = Math.min(1, (lo - BG_EDGE) / (BG_SOLID - BG_EDGE));
        alpha = Math.round(255 * (1 - t));
      }
      data[i + 3] = alpha;

      if (alpha > 40) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  return {
    image: sharp(data, { raw: { width, height, channels } }).png(),
    box: { minX, maxX, minY, maxY },
    width,
    height,
  };
}

/**
 * Tight square crop around the head, so the face still reads once a browser
 * squashes it into a 16px tab.
 *
 * 0.86x the head height, centred just below the middle: that trims the outer
 * curls and the air under the chin, which is what pushes the eyes and mouth up
 * to a size that survives the downscale. Anything looser (the full hair-to-chin
 * box) turns the tab into a hair blob with no features; anything tighter starts
 * clipping the chin.
 */
const CROP_SCALE = 0.86;
const CROP_CENTRE = 0.52; // fraction down the head box

async function headSquare() {
  const { image, box, width, height } = await cutout(SRC);
  const cx = (box.minX + box.maxX) / 2;
  const cy = box.minY + (box.maxY - box.minY) * CROP_CENTRE;
  const side = Math.round((box.maxY - box.minY) * CROP_SCALE);
  const left = Math.max(0, Math.min(width - side, Math.round(cx - side / 2)));
  const top = Math.max(0, Math.min(height - side, Math.round(cy - side / 2)));

  return sharp(await image.toBuffer())
    .extract({ left, top, width: Math.min(side, width), height: Math.min(side, height) })
    .png()
    .toBuffer();
}

/** Composite the head onto a solid brand ground so it can never vanish. */
async function badge({ size, faceScale, mask, background }) {
  const head = await sharp(await headSquare())
    .resize({
      width: Math.round(size * faceScale),
      height: Math.round(size * faceScale),
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  let out = sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: head, gravity: "center" }])
    .png();

  if (mask) {
    out = sharp(await out.toBuffer()).composite([
      { input: Buffer.from(mask), blend: "dest-in" },
    ]);
  }
  return out.png({ compressionLevel: 9 }).toBuffer();
}

const circle = (size) =>
  `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
  `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`;

async function main() {
  // Favicon: head inset on a green disc. A solid brand ground (rather than
  // transparency or the source's near-white) is what keeps it from dissolving
  // into a light tab bar.
  //
  // faceScale is deliberately well under 1: bled to the rim, the near-black hair
  // ran straight off the edge and at 16px the disc stopped reading as a disc —
  // the silhouette merged into whatever colour the tab bar happened to be, and
  // you were left with an ambiguous blob. Leaving a green ring gives the icon a
  // shape that survives the downscale even when the face inside it cannot.
  await sharp(
    await badge({
      size: 512,
      faceScale: 0.8,
      background: { ...GREEN, alpha: 1 },
      mask: circle(512),
    })
  ).toFile(OUT_ICON);

  // Apple touch icon: iOS applies its own rounding and dislikes transparency,
  // so keep it a full-bleed square on ink-tinted green.
  await sharp(
    await badge({
      size: 180,
      faceScale: 0.96,
      background: { ...GREEN, alpha: 1 },
    })
  )
    .flatten({ background: { ...INK, alpha: 1 } })
    .toFile(OUT_APPLE);

  console.log("wrote", path.relative(ROOT, OUT_ICON), "and", path.relative(ROOT, OUT_APPLE));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
