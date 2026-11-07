// Builds public/og.png, the card that shows when the site is shared.
//
// The card is the home page at a glance: the black ground, the four felt objects the home opens with (one per kind of
// work, in their slot colours), and the name with one line under it. A share card is read at a glance and at a
// distance, so it carries one thing to read; the felt does the rest. Nothing here is drawn: the objects are the site's
// own felt renders (public/felt), inlined so the renderer needs no origin.
//
// The face is Geist, the site's, from the geist package (OFL), inlined the same way.
//
//   npm run og            (CHROMIUM_PATH=<a Chromium binary> if Playwright's own is missing)

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const b64 = (p) => readFileSync(resolve(root, p)).toString("base64");
const geist = (w) => b64(`node_modules/geist/dist/fonts/geist-sans/Geist-${w}.woff2`);
// the four slots' first shapes, in the home's order and tilts (src/components/felt/copy.ts)
const FELT = [
  ["petal", -7],
  ["canvas-dashboard", 5],
  ["browser", -3],
  ["code", 8],
];

const html = `<!doctype html><meta charset="utf-8">
<style>
  @font-face{font-family:G;font-weight:500;src:url(data:font/woff2;base64,${geist("Medium")}) format("woff2");font-display:block}
  @font-face{font-family:G;font-weight:600;src:url(data:font/woff2;base64,${geist("SemiBold")}) format("woff2");font-display:block}
  *{box-sizing:border-box;margin:0}
  body{width:1200px;height:630px;overflow:hidden;background:#050505;color:#f4f1ec;font-family:G,system-ui,sans-serif;
    display:grid;align-content:center;justify-items:center;gap:34px}
  .row{display:flex;align-items:center;gap:6px}
  .row img{width:236px;height:236px;filter:drop-shadow(0 18px 20px rgba(0,0,0,.6))}
  .row img:nth-child(even){translate:0 12px}
  .name{font-size:76px;font-weight:600;letter-spacing:-.04em;line-height:1}
  .role{margin-top:14px;font-size:30px;font-weight:500;letter-spacing:-.015em;color:#b4afa8;text-align:center}
</style>
<div class="row">${FELT.map(([n, t]) => `<img src="data:image/webp;base64,${b64(`public/felt/${n}.webp`)}" style="rotate:${t}deg">`).join("")}</div>
<div><div class="name">Jawad Jalal</div><div class="role">Design engineer, London</div></div>`;

const exe = process.env.CHROMIUM_PATH;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle" });
// everything is inlined, so this waits on decode rather than on a download
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.screenshot({ path: resolve(root, "public/og.png") });
await browser.close();
console.log("og → public/og.png");
