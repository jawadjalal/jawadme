// Builds public/og.png, the card that shows when the site is shared.
//
// The card (12 Nov) shows the work instead of describing it: his name and one line on the site's black ground, and a
// wall of his best ads beside them, the same pictures the drawers open on. X and iMessage show it about 500 wide, so
// the name is set large enough to read there and the ads are kept big enough to tell apart.
//
// Two layouts: "wall" (the default, the one in use) sets the ads in three staggered columns that run off the top and
// bottom on the right; "strip" sets five in a row across the top with the name under them.
//
// The face is Geist, the site's, from the geist package (OFL). Every picture is a local file, inlined, so the renderer
// needs no origin.
//
//   npm run og                    (OG=strip npm run og for the other layout; OUT=<path> to write elsewhere)
//   CHROMIUM_PATH=<a Chromium binary> if Playwright's own is missing

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const b64 = (p) => readFileSync(resolve(root, p)).toString("base64");
const geist = (w) => b64(`node_modules/geist/dist/fonts/geist-sans/Geist-${w}.woff2`);
const img = (p) => `data:image/webp;base64,${b64(`public/${p}`)}`;

// his best ads: the two he scored highest, then the newest he likes most
const AD = {
  corners: "ads/best/outpace-corners.webp",
  told: "ads/best/shown-told.webp",
  income: "ads/best/whop-income.webp",
  jam: "ads/more/jam-880.webp",
  simular: "ads/more/simular-walk-880.webp",
  click: "ads/more/click-land-880.webp",
  offense: "ads/more/offense-880.webp",
  hyperspell: "ads/more/hyperspell-880.webp",
};

const NAME = "Jawad Jalal";
const LINE = "I design ads, brands and sites for startups.";

const base = `
  @font-face{font-family:G;font-weight:500;src:url(data:font/woff2;base64,${geist("Medium")}) format("woff2");font-display:block}
  @font-face{font-family:G;font-weight:700;src:url(data:font/woff2;base64,${geist("Bold")}) format("woff2");font-display:block}
  *{box-sizing:border-box;margin:0}
  body{position:relative;width:1200px;height:630px;overflow:hidden;background:#000;color:#f3eee7;font-family:G,system-ui,sans-serif}
  .ad{display:block;width:100%;height:auto;border-radius:3px}
`;

const layouts = {
  // three columns of ads at the right, staggered, running off the card; the name and the line at the left
  wall: () => {
    const col = (x, y, ads) => `<div class="col" style="left:${x}px;top:${y}px">${ads.map((a) => `<img class="ad" src="${img(AD[a])}" alt="">`).join("")}</div>`;
    return `<style>${base}
      .col{position:absolute;width:212px;display:grid;gap:10px}
      h1{position:absolute;left:64px;top:206px;font-size:112px;font-weight:700;line-height:.92;letter-spacing:-.05em}
      p{position:absolute;left:68px;top:440px;width:440px;font-size:34px;font-weight:500;line-height:1.18;letter-spacing:-.02em;color:#b8b2aa}
    </style>
    <h1>Jawad<br>Jalal</h1>
    <p>${LINE}</p>
    ${col(546, -118, ["jam", "corners", "hyperspell"])}
    ${col(768, -268, ["click", "told", "simular"])}
    ${col(990, -40, ["income", "offense"])}`;
  },
  // five ads in a row across the top, the name and the line on the black under them
  strip: () => `<style>${base}
      .row{position:absolute;left:-20px;top:-12px;display:grid;grid-template-columns:repeat(5,240px);gap:10px}
      h1{position:absolute;left:56px;top:338px;font-size:132px;font-weight:700;line-height:.94;letter-spacing:-.052em}
      p{position:absolute;left:60px;top:494px;font-size:38px;font-weight:500;line-height:1.2;letter-spacing:-.02em;color:#b8b2aa}
    </style>
    <div class="row">${["corners", "jam", "told", "simular", "income"].map((a) => `<img class="ad" src="${img(AD[a])}" alt="">`).join("")}</div>
    <h1>${NAME}</h1>
    <p>${LINE}</p>`,
};

const which = process.env.OG ?? "wall";
const html = `<!doctype html><meta charset="utf-8">${layouts[which]()}`;
const out = resolve(root, process.env.OUT ?? "public/og.png");

const exe = process.env.CHROMIUM_PATH;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle" });
// everything is inlined, so this waits on decode rather than on a download
await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode())]));
await page.waitForTimeout(300);
await page.screenshot({ path: out });
await browser.close();
console.log(`og (${which}) → ${out}`);
