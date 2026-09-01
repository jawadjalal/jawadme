// Builds public/jawad-jalal-cv.pdf from the site's own content.
//
// The CV and the page have to say the same thing. Typing it out twice is how
// they drift, so this reads src/lib/profile.ts and lays it out. Run it after
// changing any role or blurb:
//
//   npm run cv
//
// Playwright is the renderer, kept as an optional dev dependency: the site
// builds and deploys without it, and only this script needs it.

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

// The profile is TypeScript with no runtime imports, so Node's type
// stripping can load it directly. The first version of this scraped the file
// with a regex and quietly produced an empty CV: it turned every `word:` into
// a JSON key, which mangled every https: URL in the data. Importing the real
// module means the CV cannot disagree with the site.
const {
  NOW,
  ARCHIVE,
  ELSEWHERE,
  SKILLS_TABLE,
  IDENTITY,
} = await import(pathToFileURL(resolve(root, "src/lib/profile.ts")).href);

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

const role = (r) => `
  <li>
    <div class="row">
      <span class="name">${esc(r.name)}</span>
      <span class="lead"></span>
      <span class="meta">${esc(r.role)} · ${esc(r.period)}</span>
    </div>
    <p>${esc(r.blurb)}</p>
  </li>`;

const html = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&f[]=chillax@500,600&display=swap">
<style>
  @page { size: A4; margin: 14mm 15mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font: 9.6pt/1.5 Satoshi, system-ui, sans-serif;
    color: #1b1b19;
    -webkit-print-color-adjust: exact;
  }
  h1 { font-family: Chillax, Satoshi, sans-serif; font-size: 21pt; margin: 0; letter-spacing: -0.01em; }
  h2 {
    font-family: Chillax, Satoshi, sans-serif;
    font-size: 10.5pt; font-weight: 600; margin: 0 0 5pt;
    padding-bottom: 3pt; border-bottom: 0.7pt solid #e4e4e0;
  }
  header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4pt; }
  .tag { font-size: 9pt; color: #6b6b64; margin-top: 2pt; }
  .contact { text-align: right; font-size: 8.4pt; color: #6b6b64; line-height: 1.65; }
  .contact a { color: #1b1b19; text-decoration: none; }
  section { margin-top: 11pt; }
  ul { list-style: none; margin: 0; padding: 0; }
  li { margin-bottom: 6.5pt; }
  li:last-child { margin-bottom: 0; }
  .row { display: flex; align-items: baseline; gap: 5pt; }
  .name { font-weight: 700; font-size: 10pt; }
  .lead { flex: 1; border-bottom: 0.7pt dashed #d8d8d2; transform: translateY(-2pt); }
  .meta { font-size: 8.4pt; color: #6b6b64; white-space: nowrap; }
  li p { margin: 1.5pt 0 0; color: #4a4a45; font-size: 9pt; }
  .skills { display: grid; grid-template-columns: 1fr 1fr; gap: 4pt 16pt; }
  .skill-area { font-weight: 700; font-size: 9pt; }
  .skill-list { color: #4a4a45; font-size: 8.8pt; }
  .else { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5pt 16pt; font-size: 8.8pt; }
  .else b { font-weight: 600; }
  .else span { color: #6b6b64; }
  footer { margin-top: 12pt; padding-top: 5pt; border-top: 0.7pt solid #e4e4e0; font-size: 7.6pt; color: #8a8a82; }
</style>
<header>
  <div>
    <h1>Jawad Jalal</h1>
    <div class="tag">Designer &amp; founder · London, England</div>
  </div>
  <div class="contact">
    <a href="mailto:${IDENTITY.email}">${esc(IDENTITY.email)}</a><br>
    <a href="${IDENTITY.site}">${esc(IDENTITY.site.replace(/^https?:\/\//, ""))}</a><br>
    <a href="https://x.com/jawadmakes">x.com/jawadmakes</a>
  </div>
</header>

<section>
  <h2>Now</h2>
  <ul>${NOW.map(role).join("")}</ul>
</section>

<section>
  <h2>Also mine</h2>
  <ul>${ARCHIVE.map(role).join("")}</ul>
</section>

<section>
  <h2>Skills</h2>
  <div class="skills">
    ${SKILLS_TABLE.map(
      (g) => `<div>
        <div class="skill-area">${esc(g.area)}</div>
        <div class="skill-list">${g.tools.map((t) => esc(t.label)).join(", ")}</div>
      </div>`,
    ).join("")}
  </div>
</section>

<section>
  <h2>Elsewhere</h2>
  <div class="else">
    ${ELSEWHERE.map((e) => `<div><b>${esc(e.name)}</b> — <span>${esc(e.note)}</span></div>`).join("")}
  </div>
</section>

<footer>Generated from jawadjalal.com. Every role above links out from the site.</footer>`;

const out = resolve(root, "public/jawad-jalal-cv.pdf");
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: out, format: "A4", printBackground: true });
await browser.close();

const pages = (readFileSync(out).toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`cv → ${out} (${pages} page${pages === 1 ? "" : "s"})`);
