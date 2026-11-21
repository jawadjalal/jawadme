// Renders the chamber posters (first paint and the fallback for phones, reduced motion and weak GPUs) from the live
// scene itself: every chamber at its camera stop, desktop and phone, to public/world/poster/<room>-<d|m>.webp.
// Run against a running site: node src/components/world/posters.mjs [http://localhost:3000]
// CHROME=<path> picks the browser; software WebGL (SwiftShader) is slow but draws the same frame.
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import sharp from "sharp";

const [base = "http://localhost:3000"] = process.argv.slice(2);
const out = new URL("../../../public/world/poster/", import.meta.url);
mkdirSync(out, { recursive: true });
const ROOMS = [["gate", "0&dim"], ["gate-lit", 0], ["hall", 1], ["theatre", 3], ["river", 4]];
const SIZES = [
  { tag: "d", viewport: { width: 1440, height: 900 }, dpr: 1.25, width: 1600, quality: 70 },
  { tag: "m", viewport: { width: 390, height: 844 }, dpr: 2, width: 780, quality: 64 },
];
const browser = await chromium.launch({
  executablePath: process.env.CHROME || undefined,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
for (const s of SIZES) {
  const page = await browser.newPage({ viewport: s.viewport, deviceScaleFactor: s.dpr });
  for (const [room, k] of ROOMS) {
    await page.goto(base + "/?world=live&shot=" + k, { waitUntil: "load" });
    await page.waitForSelector(".world-stage.live", { timeout: 120000 });
    await page.addStyleTag({ content: "body * { visibility: hidden !important; } .world-stage, .world-stage * { visibility: visible !important; } .world-poster { display: none !important; }" });
    await page.waitForTimeout(9000);
    const png = await page.locator(".world-stage").screenshot({ animations: "disabled" });
    const file = new URL(room + "-" + s.tag + ".webp", out);
    const info = await sharp(png).resize({ width: s.width }).webp({ quality: s.quality, effort: 6 }).toFile(file.pathname);
    console.log(room + "-" + s.tag, info.width + "x" + info.height, Math.round(info.size / 1024) + " KB");
  }
  await page.close();
}
await browser.close();
