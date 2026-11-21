// Renders posters of a stage from the live scene itself, headless, on a machine with no GPU (SwiftShader draws the
// same frame, slowly). Each job loads a page with ?world=live&snap (plus its own query), waits for its stage to go
// live, hides everything else on the page, screenshots the stage and writes <out>/<name>-<d|m>.webp.
//
//   import { posters } from "./kit/posters.mjs";
//   await posters({ base: "http://localhost:3000", out: "public/world/poster", jobs: [{ name: "pillar", path: "/about", stage: ".pl-stage", scroll: true }] });
//
// A stage that finds ?bare in its URL draws its flames as CSS instead (./Flames) and leaves their place in data-marks;
// given `marks` (a JSON file path), every job's marks are merged into it as { [name]: { d, m } }.
//
// CHROME=<path> picks the browser (default: Playwright's). A job may set `scroll: true` to bring the stage into view
// first (stages below the fold load only near the screen; plain scrolling, since smooth-scroll libraries never settle), `wait` in ms after it goes live, and `sizes` to override.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

export const SIZES = [
  { tag: "d", viewport: { width: 1440, height: 900 }, dpr: 1.25, width: 1600, quality: 70 },
  { tag: "m", viewport: { width: 390, height: 844 }, dpr: 2, width: 780, quality: 64 },
];

export async function posters({ base, out, jobs, sizes = SIZES, marks }) {
  mkdirSync(out, { recursive: true });
  const found = marks && existsSync(marks) ? JSON.parse(readFileSync(marks, "utf8")) : {};
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
        const bring = () => page.evaluate((q) => document.querySelector(q)?.scrollIntoView({ block: "start" }), j.stage);
        for (let i = 0; j.scroll && i < 6; i++) await bring().then(() => page.waitForTimeout(1000));
        await page.waitForSelector(j.stage + "[data-live], " + j.stage + ".live", { timeout: 240000 });
        if (j.scroll) await bring();
        await page.addStyleTag({ content: `body * { visibility: hidden !important; } ${j.stage}, ${j.stage} canvas { visibility: visible !important; }` });
        await page.waitForTimeout(j.wait ?? 9000);
        const png = await page.locator(j.stage).screenshot({ animations: "disabled" });
        const file = path.join(out, j.name + "-" + s.tag + ".webp");
        const info = await sharp(png).resize({ width: s.width }).webp({ quality: s.quality, effort: 6 }).toFile(file);
        console.log(j.name + "-" + s.tag, info.width + "x" + info.height, Math.round(info.size / 1024) + " KB");
        const m = await page.evaluate((q) => document.querySelector(q + " [data-marks]")?.dataset.marks ?? null, j.stage);
        if (m) (found[j.name] ??= {})[s.tag] = JSON.parse(m);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
  if (marks) writeFileSync(marks, JSON.stringify(found) + "\n");
}
