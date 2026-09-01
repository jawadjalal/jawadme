// Builds public/og.png, the card that shows when the site is shared.
//
// Rendered rather than hand-drawn so it reads as the site: the same warm
// ground, the same dot field, the same faces. His portrait sits in the middle
// with real screenshots of the work fanned behind it, which says what he does
// before a single word is read.
//
//   npm run og

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const { IDENTITY } = await import(pathToFileURL(resolve(root, "src/lib/profile.ts")).href);

const b64 = (p) => {
  const ext = p.split(".").pop();
  const mime = ext === "svg" ? "image/svg+xml" : ext === "webp" ? "image/webp" : "image/png";
  return `data:${mime};base64,${readFileSync(resolve(root, "public", p)).toString("base64")}`;
};

// Four shots, fanned. Angles alternate so the stack reads as something set
// down by hand rather than as a grid that failed to line up.
const CARDS = [
  { src: "design/wayari.png", x: -430, y: -120, rot: -9 },
  { src: "design/okara-poster.webp", x: 430, y: -120, rot: 9 },
  { src: "design/bevel-team.webp", x: -430, y: 150, rot: 7 },
  { src: "design/bidframe.webp", x: 430, y: 150, rot: -7 },
];

const html = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=chillax@400,500,600,700&display=swap">
<style>
  *{box-sizing:border-box;margin:0}
  body{
    width:1200px;height:630px;overflow:hidden;position:relative;
    background:#fdfdfc;
    font-family:Chillax,system-ui,sans-serif;color:#1b1b19;
    display:flex;align-items:center;justify-content:center;
  }
  /* The page's own dot field, same pitch. */
  .dots{
    position:absolute;inset:0;
    background-image:radial-gradient(circle at center, rgba(27,27,25,.13) 1.2px, transparent 1.3px);
    background-size:22px 22px;
  }
  /* Pulls the eye to the middle and stops the fanned cards competing with
     the face for attention at the edges. */
  .vig{
    position:absolute;inset:0;
    background:radial-gradient(ellipse 58% 62% at 50% 50%, rgba(253,253,252,.94) 38%, rgba(253,253,252,.55) 70%, rgba(253,253,252,0) 100%);
  }
  .card{
    position:absolute;left:50%;top:50%;
    width:420px;height:262px;border-radius:16px;overflow:hidden;
    border:1px solid rgba(27,27,25,.10);
    box-shadow:0 18px 44px -18px rgba(27,27,25,.30), 0 2px 6px rgba(27,27,25,.06);
    background:#fff;
  }
  .card img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
  .mid{position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;text-align:center}
  .face{
    width:180px;height:180px;border-radius:999px;object-fit:cover;
    border:6px solid #fdfdfc;
    box-shadow:0 20px 50px -18px rgba(27,27,25,.38);
    background:#fdfdfc;
  }
  h1{margin-top:26px;font-size:62px;font-weight:600;letter-spacing:-.02em;line-height:1}
  p{margin-top:12px;font-size:25px;color:rgba(27,27,25,.55)}
  .dom{
    margin-top:22px;display:inline-flex;align-items:center;gap:9px;
    padding:9px 18px;border-radius:999px;
    border:1px solid rgba(27,27,25,.12);background:rgba(27,27,25,.03);
    font-size:19px;font-weight:600;
  }
  .dot{width:9px;height:9px;border-radius:999px;background:oklch(72% .19 149)}
</style>
<div class="dots"></div>
${CARDS.map(
  (c) => `<div class="card" style="transform:translate(-50%,-50%) translate(${c.x}px,${c.y}px) rotate(${c.rot}deg)">
    <img src="${b64(c.src)}">
  </div>`,
).join("")}
<div class="vig"></div>
<div class="mid">
  <img class="face" src="${b64(IDENTITY.avatar.replace(/^\//, ""))}">
  <h1>${IDENTITY.properName}</h1>
  <p>designer &amp; founder &middot; london</p>
  <span class="dom"><span class="dot"></span>jawadjalal.com</span>
</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.screenshot({ path: resolve(root, "public/og.png") });
await browser.close();
console.log("og → public/og.png");
