// Renders posters of a stage from the live scene itself, headless, on a machine with no GPU (SwiftShader draws the
// same frame, slowly). Each job loads a page with ?world=live&snap (plus its own query), waits for its stage to go
// live, hides everything else on the page, screenshots the stage and writes <out>/<name>-<d|m>.webp.
//
//   import { posters } from "./kit/posters.mjs";
//   await posters({ base: "http://localhost:3000", out: "public/world/poster", jobs: [{ name: "foot-a", path: "/ads?footer=a", stage: ".foot-stage" }] });
//
// CHROME=<path> picks the browser (default: Playwright's). A job may set `scroll: true` to bring the stage into view
// first (stages below the fold load only near the screen), `wait` in ms after it goes live, and `sizes` to override.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

export const SIZES = [
  { tag: "d", viewport: { width: 1440, height: 900 }, dpr: 1.25, width: 1600, quality: 70 },
  { tag: "m", viewport: { width: 390, height: 844 }, dpr: 2, width: 780, quality: 64 },
];

export async function posters({ base, out, jobs, sizes = SIZES }) {
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROME || undefined,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  });
  try {
    for (const s of sizes) {
      const page = await browser.newPage({ viewport: s.viewport, deviceScaleFactor: s.dpr });
      for (const j of jobs) {
        const url = new URL(j.path, base);
        url.searchParams.set("world", "live");
        url.searchParams.set("snap", "");
        await page.goto(url.href, { waitUntil: "load", timeout: 180000 });
        if (j.scroll) await page.locator(j.stage).scrollIntoViewIfNeeded();
        await page.waitForSelector(j.stage + "[data-live], " + j.stage + ".live", { timeout: 240000 });
        await page.addStyleTag({ content: `body * { visibility: hidden !important; } ${j.stage}, ${j.stage} canvas { visibility: visible !important; }` });
        await page.waitForTimeout(j.wait ?? 9000);
        const png = await page.locator(j.stage).screenshot({ animations: "disabled" });
        const file = path.join(out, j.name + "-" + s.tag + ".webp");
        const info = await sharp(png).resize({ width: s.width }).webp({ quality: s.quality, effort: 6 }).toFile(file);
        console.log(j.name + "-" + s.tag, info.width + "x" + info.height, Math.round(info.size / 1024) + " KB");
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
