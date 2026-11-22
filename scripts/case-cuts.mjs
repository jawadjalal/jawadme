// Cuts the ignaru case shots out of the source screenshots at their own pixels: whole UI regions, never scaled up.
// node scripts/case-cuts.mjs  (rerun after a source screenshot changes)
import sharp from "sharp";

const CUTS = [
  ["case/ignaru-live-1.webp", "ignaru-lead", [520, 92, 1346, 722]],
  ["case/ignaru-live-5.webp", "ignaru-board", [520, 338, 1346, 432]],
  ["2026-11/ignaru-app-composer.webp", "ignaru-composer", [0, 0, 742, 685]],
  ["2026-11/ignaru-app-palette.webp", "ignaru-palette", [0, 0, 748, 690]],
  ["2026-11/ignaru-app-changes.webp", "ignaru-changes", [64, 64, 666, 512]],
  ["2026-11/ignaru-app-share.webp", "ignaru-share", [60, 40, 596, 463]],
  ["2026-11/ignaru-canvas-zoom.webp", "ignaru-table", [430, 160, 744, 495]],
];

for (const [src, out, [left, top, width, height]] of CUTS) {
  const info = await sharp("public/work/" + src).extract({ left, top, width, height }).webp({ quality: 88, effort: 6 }).toFile(`public/work/case/cut/${out}.webp`);
  console.log(out, info.width, info.height, info.size);
}
