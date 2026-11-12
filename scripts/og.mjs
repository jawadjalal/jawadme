// Builds public/og.png, the card that shows when the site is shared.
//
// The card (11 Nov), kept very clean: the black ground, one felt petal (the Ignaru door on the home ring), the name, and
// the home hero's own words under it ("building Ignaru" from the title, then the line under it). A share card is read at
// a glance, so it carries one thing to read and a lot of calm space. The petal is the site's own felt render
// (public/felt), inlined so the renderer needs no origin.
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
const html = `<!doctype html><meta charset="utf-8">
<style>
  @font-face{font-family:G;font-weight:500;src:url(data:font/woff2;base64,${geist("Medium")}) format("woff2");font-display:block}
  @font-face{font-family:G;font-weight:700;src:url(data:font/woff2;base64,${geist("Bold")}) format("woff2");font-display:block}
  *{box-sizing:border-box;margin:0}
  body{position:relative;width:1200px;height:630px;overflow:hidden;background:#000;color:#f3eee7;font-family:G,system-ui,sans-serif}
  img{position:absolute;left:88px;top:92px;width:132px;height:132px;rotate:-10deg}
  h1{position:absolute;left:92px;top:300px;font-size:136px;font-weight:700;line-height:.94;letter-spacing:-.052em}
  p{position:absolute;left:96px;top:452px;font-size:38px;font-weight:500;line-height:1.25;letter-spacing:-.02em;color:#b8b2aa}
  p b{font-weight:500;color:#f3eee7}
</style>
<img src="data:image/webp;base64,${b64("public/felt/petal.webp")}" alt="">
<h1>Jawad Jalal</h1>
<p><b>Building Ignaru.</b> And designing sites and ads for startups.</p>`;

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
