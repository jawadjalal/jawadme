// Builds public/og.png, the card that shows when the site is shared.
//
// Deliberately almost empty. The first version fanned four screenshots behind
// a portrait with a domain pill under it, which at the size a card actually
// appears (a few hundred pixels wide in a timeline) collapsed into visual
// noise: nothing was legible except the face. A share card is read at a
// glance and at a distance, so it gets one thing to read.
//
// The wordmark is set in Excalifont, Excalidraw's hand-drawn face. It is the
// one place on the site that is not the Chillax and Satoshi pairing, which is
// the point: it looks written rather than typeset.
//
//   npm run og

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const { IDENTITY } = await import(pathToFileURL(resolve(root, "src/lib/profile.ts")).href);

// Inlined rather than linked: the renderer loads this page from a string, so
// there is no origin for a relative font URL to resolve against.
const excalifont = readFileSync(
  resolve(root, "public/fonts/Excalifont-Regular.woff2"),
).toString("base64");

const html = `<!doctype html><meta charset="utf-8">
<style>
  @font-face{
    font-family:Excalifont;
    src:url(data:font/woff2;base64,${excalifont}) format("woff2");
    font-display:block;
  }
  *{box-sizing:border-box;margin:0}
  body{
    width:1200px;height:630px;overflow:hidden;position:relative;
    background:#fdfdfc;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    font-family:Excalifont,system-ui,sans-serif;color:#1b1b19;
  }
  /* The page's own dot field, at the page's own pitch, scaled up so it still
     reads as a field rather than as grain when the card is shown small. */
  .dots{
    position:absolute;inset:0;
    background-image:radial-gradient(circle at center, rgba(27,27,25,.10) 1.6px, transparent 1.7px);
    background-size:34px 34px;
  }
  .mark{position:relative;font-size:184px;line-height:1;letter-spacing:.01em}
  .role{position:relative;margin-top:34px;font-size:34px;color:rgba(27,27,25,.5)}
</style>
<div class="dots"></div>
<div class="mark">${IDENTITY.wordmark.toLowerCase()}</div>
<div class="role">${IDENTITY.role} &middot; ${IDENTITY.location}</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle" });
// The face is inlined, so this waits on decode rather than on a download.
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.screenshot({ path: resolve(root, "public/og.png") });
await browser.close();
console.log("og → public/og.png");
