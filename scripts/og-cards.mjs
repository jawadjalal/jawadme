// Builds every share card on the site into public/og/: one for the home page, /call, /blog and each blog post, and one
// for every piece on the wall (/w/<file>). One clean system: white ground, Instrument Sans (the site's face, OFL,
// copied to scripts/fonts), ink type, the work itself as the only colour, and the same small footer on every card.
// No purple, no gradients, no wall of thumbnails: X shows a card about 500 wide, so one idea per card.
//
//   node scripts/og-cards.mjs            (all cards)
//   ONLY=home,call node scripts/og-cards.mjs
//
// Pieces are read from src/content/feed.ts (through sucrase), so a new piece on the wall needs only a rerun.

import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const require = createRequire(import.meta.url);
globalThis.React = require("react");
require("sucrase/register");
const { FEED, captionOf } = require(resolve(root, "src/content/feed.ts"));
const { POSTS } = require(resolve(root, "src/lib/posts.tsx"));

const OUT = resolve(root, "public/og");
mkdirSync(OUT, { recursive: true });

const b64 = (p) => readFileSync(resolve(root, p)).toString("base64");
const data = (p) => {
  const ext = p.split(".").pop();
  const type = ext === "svg" ? "image/svg+xml" : ext === "png" ? "image/png" : "image/webp";
  return `data:${type};base64,${b64(p)}`;
};
const FONT = b64("scripts/fonts/instrument-sans-latin.woff2");
const MEMOJI = data("public/design/jawad-die.webp");
const CAR = data("public/work/2026-11/sticker-car.svg");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const BASE = `
  @font-face{font-family:I;font-weight:400 700;src:url(data:font/woff2;base64,${FONT}) format("woff2");font-display:block}
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;overflow:hidden;background:#fff;color:#0a0a0a;font-family:I,system-ui,sans-serif;
    -webkit-font-smoothing:antialiased;position:relative}
  .foot{position:absolute;left:72px;right:72px;bottom:56px;display:flex;align-items:center;justify-content:space-between;
    font-size:24px;font-weight:500;letter-spacing:-.01em;color:#737373}
  .foot b{color:#0a0a0a;font-weight:600}
  .me{display:flex;align-items:center;gap:12px}
  .me img{width:44px;height:auto;transform:rotate(5deg)}
  .stk{display:inline-block;vertical-align:-.12em;height:.9em;width:auto;margin:0 .06em}
  .stk.car{transform:rotate(-4deg);height:.8em;vertical-align:-.06em;margin:0 .04em;filter:drop-shadow(0 1px 1px rgb(0 0 0/.2)) drop-shadow(0 4px 6px rgb(0 0 0/.12))}
  .stk.mj{transform:rotate(5deg);height:1.02em;vertical-align:-.18em}
  .pill{display:inline-flex;align-items:center;gap:14px;height:76px;padding:0 34px;border-radius:24px;background:#1a1a1a;color:#fff;
    font-size:30px;font-weight:500;letter-spacing:-.01em;box-shadow:inset 0 1px 0 rgb(255 255 255/.16),inset 0 -3px 0 rgb(0 0 0/.45),0 8px 20px -8px rgb(0 0 0/.35)}
  .pill svg{width:34px;height:34px;transform:rotate(-8deg)}
`;
const FOOT = `<div class="foot"><span><b>jawadjalal.com</b></span><span class="me"><img src="${MEMOJI}" alt="">@jawadmakes</span></div>`;
const PHONE = `<svg viewBox="0 0 24 24"><path d="M6.6 2.6c.8-.5 1.9-.3 2.4.5l1.6 2.6c.5.8.3 1.8-.4 2.4l-1.1.9c.9 2 2.5 3.6 4.5 4.5l.9-1.1c.6-.7 1.6-.9 2.4-.4l2.6 1.6c.8.5 1 1.6.5 2.4l-.9 1.5c-.7 1.1-2 1.7-3.3 1.4C9.6 18.9 5.1 14.4 3.5 8.2c-.3-1.3.3-2.6 1.4-3.3Z" fill="#2fc764" stroke="#fff" stroke-width="1.6" paint-order="stroke"/></svg>`;

const page = (css, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}${css}</style></head><body>${body}${FOOT}</body></html>`;

// the text cards: a big line (or two) set left, as on the site
const textCard = ({ eyebrow, lead, main, sub, button }) =>
  page(
    `
    .t{position:absolute;left:72px;right:72px;top:64px}
    .eb{font-size:26px;font-weight:500;color:#737373;letter-spacing:-.01em;margin-bottom:28px}
    h1{font-size:${main.length > 34 ? 70 : 86}px;font-weight:600;line-height:1.02;letter-spacing:-.045em}
    h1 .lead{display:block;color:#a3a3a3;font-weight:500}
    .sub{margin-top:30px;font-size:30px;line-height:1.3;color:#5e5e5e;letter-spacing:-.015em;max-width:900px}
    .btn{margin-top:40px}
    `,
    `<div class="t">${eyebrow ? `<p class="eb">${eyebrow}</p>` : ""}<h1>${lead ? `<span class="lead">${lead}</span>` : ""}${main}</h1>${
      sub ? `<p class="sub">${sub}</p>` : ""
    }${button ? `<div class="btn"><span class="pill">${PHONE}${button}</span></div>` : ""}</div>`,
  );

// a piece card: the piece large on the right, whose it is and what it is on the left
const pieceCard = (p) => {
  const r = p.w / p.h;
  const H = 630 - 2 * 56;
  let h = H;
  let w = Math.round(h * r);
  if (w > 700) {
    w = 700;
    h = Math.round(w / r);
  }
  const textW = 1200 - 72 - 56 - w - 48;
  const name = esc(p.brand);
  const what = esc(p.what);
  // the name stays on one line: about 0.55em a character in this face
  const big = Math.min(64, Math.floor(textW / (p.brand.length * 0.55)));
  return page(
    `
    .pic{position:absolute;right:56px;top:${Math.round((630 - h) / 2)}px;width:${w}px;height:${h}px;border-radius:14px;overflow:hidden;
      background:#f4f4f3;box-shadow:0 30px 60px -30px rgb(0 0 0/.35),0 0 0 1px rgb(0 0 0/.06)}
    .pic img{display:block;width:100%;height:100%;object-fit:cover}
    .t{position:absolute;left:72px;top:72px;width:${textW}px}
    h1{font-size:${big}px;font-weight:600;line-height:1;letter-spacing:-.045em;white-space:nowrap}
    .w{margin-top:14px;font-size:${textW < 360 ? 28 : 34}px;font-weight:500;line-height:1.15;letter-spacing:-.02em;color:#737373}
    .tag{display:inline-block;margin-top:22px;padding:7px 14px;border-radius:999px;background:#f2f2f1;color:#5e5e5e;font-size:20px;font-weight:500}
    .foot{right:auto;width:${textW}px;flex-direction:column;align-items:flex-start;gap:14px}
    `,
    `<div class="t"><h1>${name}</h1><p class="w">${what}</p>${p.slides ? `<span class="tag">${p.slides.length + 1} slides</span> ` : ""}${
      p.unsolicited ? `<span class="tag">unsolicited</span>` : ""
    }</div><div class="pic"><img src="${data(`public/work/2026-11/${p.file}.webp`)}" alt=""></div>`,
  );
};

const HEADLINE = `<span class="lead">Too young <img class="stk car" src="${CAR}" alt=""> to drive, <img class="stk mj" src="${MEMOJI}" alt=""></span>but I'm a design mastermind.`;

const cards = [
  {
    name: "home",
    html: page(
      `
      .t{position:absolute;left:72px;right:72px;top:150px}
      h1{font-size:84px;font-weight:600;line-height:1.04;letter-spacing:-.05em}
      h1 .lead{display:block;color:#a3a3a3;font-weight:500}
      .sub{margin-top:34px;font-size:30px;color:#5e5e5e;letter-spacing:-.015em}
      .sub i{font-style:normal;color:#c4c4c4;margin:0 12px}
      `,
      `<div class="t"><h1>${HEADLINE}</h1><p class="sub">Brand design<i>·</i>Ads<i>·</i>Design engineering</p></div>`,
    ),
  },
  { name: "call", html: textCard({ eyebrow: "Jawad Jalal", main: "Let's make yours.", sub: "Book a short video call about ads, brands and design for your startup.", button: "call me" }) },
  { name: "blog", html: textCard({ eyebrow: "Blog", main: "Notes on design, products and launching apps.", sub: "By Jawad Jalal, founder of Ignura and Ignaru." }) },
  ...POSTS.map((p) => ({ name: `blog-${p.slug}`, html: textCard({ eyebrow: "Blog", main: esc(p.title), sub: esc(p.description) }) })),
  ...FEED.filter((e) => "file" in e).map((p) => ({ name: `w-${p.file}`, html: pieceCard(p), alt: captionOf(p) })),
];

const only = process.env.ONLY?.split(",");
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const pg = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
let n = 0;
for (const c of cards) {
  if (only && !only.some((o) => c.name === o || c.name.startsWith(o))) continue;
  await pg.setContent(c.html, { waitUntil: "load" });
  await pg.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode().catch(() => {}))]));
  // text cards are flat colour and stay sharp as png; piece cards are photographs, so jpeg keeps them small
  const piece = c.name.startsWith("w-");
  await pg.screenshot({ path: `${OUT}/${c.name}.${piece ? "jpg" : "png"}`, type: piece ? "jpeg" : "png", ...(piece ? { quality: 86 } : {}) });
  n++;
}
await browser.close();
console.log(`og-cards: wrote ${n} cards to public/og`);
