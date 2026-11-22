// Renders the hero pillar posters: ?still=0 (whole) and ?still=1 (cracked open) on a transparent ground, cropped
// around the pillar and written as webp to public/three. Needs the dev server: node scripts/pillar-poster.mjs [url]
import { chromium } from "playwright";
import sharp from "sharp";

const base = process.argv[2] ?? "http://localhost:3100";
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 2400, height: 1500 }, deviceScaleFactor: 1.5 });
for (const [still, name] of [[0, "pillar-poster"], [1, "pillar-poster-open"]]) {
  await page.goto(`${base}/?gl=1&still=${still}`, { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector('html[data-gl="live"]', { timeout: 60000 });
  await page.addStyleTag({ content: "html,body{background:transparent!important} body *{visibility:hidden!important} .gl-stage,.gl-stage *{visibility:visible!important}" });
  await page.waitForTimeout(6000);
  const r = await page.evaluate(() => {
    const b = document.querySelector('[data-view="mark"],[data-view="pillar"]').getBoundingClientRect();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  });
  const w = Math.min(r.width, r.height * 1.05);
  const clip = { x: r.x + (r.width - w) / 2, y: r.y, width: w, height: r.height };
  const png = await page.screenshot({ clip, omitBackground: true });
  const out = `public/three/${name}.webp`;
  const info = await sharp(png).resize({ width: 1600 }).webp({ quality: 86, alphaQuality: 90 }).toFile(out);
  console.log(out, info.width, info.height, info.size);
}
await browser.close();
