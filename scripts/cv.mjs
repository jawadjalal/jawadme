// Builds public/jawad-jalal-cv.pdf: one packed A4 page.
//
// Contact details come from src/lib/profile.ts, so the CV and the site agree.
// Everything else is written here, for the reader the page is not written
// for: a hiring manager with thirty seconds. So it leads with the numbers,
// every line starts with a verb and carries an outcome, and nothing is
// claimed that the site or the work does not already show.
//
// The look is the site's: Satoshi alone, black on white, one orange accent.
// The fonts are embedded from public/fonts, so the PDF never depends on a CDN.
//
//   npm run cv            (CHROMIUM_PATH=<a Chromium binary> if Playwright's own is missing)

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const { IDENTITY } = await import(pathToFileURL(resolve(root, "src/lib/profile.ts")).href);

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
// **bold** inside a line, for the number or the outcome a reader should land on
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const font = (w) =>
  `@font-face{font-family:Satoshi;font-weight:${w};src:url(data:font/woff2;base64,${readFileSync(
    resolve(root, `public/fonts/satoshi-${w}.woff2`),
  ).toString("base64")}) format("woff2")}`;

const SITE = IDENTITY.site.replace(/^https?:\/\//, "");

const SUMMARY =
  "Product designer and founder, fifteen, based in London. I design consumer apps used by millions, run two companies at " +
  "six figure ARR, and build what I design: brand, interface and the production code behind it. Fast, hands on, and " +
  "happiest owning a product end to end.";

const NUMBERS = [
  ["2M", "users on the app I design"],
  ["7 fig", "ARR at MenuFit"],
  ["2", "companies I run at 6 figure ARR"],
  ["14M", "views on Okara's launch, day one"],
  ["13", "age I started selling my work"],
];

const ROLES = [
  {
    name: "Ignura",
    url: "ignura.com",
    title: "Founder",
    when: "2026 to now",
    line: "Growth agency for startups, pre-seed to Series A",
    points: [
      "Founded and run an agency that finds a startup's growth problem, builds the engine that fixes it and runs it; grew it to **six figure ARR**.",
      "Designed the offer clients buy: a free 15 minute Growth Check, a **free first version of the fix**, then a four week build with a **minimum result written into the contract**.",
      "Delivered launch, design and growth work for **Higgsfield, Okara, Splitting Point, Yummers and hypjam**.",
      "Designed and built ignura.com end to end (Astro, Vercel), including an AI assistant and client growth boards; took mobile Lighthouse from **35 to 90**.",
    ],
  },
  {
    name: "MenuFit",
    url: "menufit.com",
    title: "Product Designer",
    when: "2026 to now",
    line: "The app for eating out healthy · iOS and Android",
    points: [
      "Design the core product for an app with **2 million users** and **seven figure ARR**: a healthy menu for every restaurant, with macros and a fit score on each dish.",
      "Own screens across iOS and Android, light and dark, and the components they share.",
    ],
  },
  {
    name: "Okara",
    url: "okara.ai",
    title: "Product Designer",
    when: "2026 to now",
    line: "AI CMO serving 120,000+ businesses · internship",
    points: [
      "Won the role with an unsolicited product teardown: a week on the free tier, then a deployed site with **three redesigns built as live React mockups**.",
      "Design the dashboard and agent surfaces, in Figma and in code (Next.js, Tailwind), on a team that ships six or seven times a day.",
    ],
  },
  {
    name: "Bevel",
    url: "bevel.team",
    title: "Founder",
    when: "2026 to now",
    line: "3D art team for hire · Blender, ZBrush, Substance",
    points: [
      "Built a 3D art studio that game studios hire by the job at **published rates**; reached **six figure ARR**.",
      "Run the full pipeline from sculpt to textured, game ready asset, plus the brand, site and client relationships.",
    ],
  },
  {
    name: "Ignaru",
    url: "ignaru.com",
    title: "Founder",
    when: "2026 to now",
    line: "Product for teams that build their own growth systems",
    points: [
      "Designed and built a full SaaS product: Next.js, Supabase, WorkOS auth, usage based credits, an AI agent on Vercel AI Gateway, and a **Tauri desktop app** for Mac, Windows and Linux.",
    ],
  },
  {
    name: "Nooli",
    title: "Head of Product",
    when: "2026",
    line: "Adaptive lessons for ages three to five · iOS",
    points: [
      "**First hire.** Owned product and the design system (SwiftUI) for lessons that adapt to each child; left to start Ignura.",
    ],
  },
];

const BUILDS = [
  ["Clicky Graph", "an interactive product demo for heyclicky.com, on a hand rolled renderer of 3,000 elements"],
  ["claude-code-spend", "open source tool that prices every token class in local Claude Code transcripts"],
  ["Client sites", "Splitting Point, Vizzbees, KleoKlaw: design and build, brief to launch"],
  ["Weld, Bidframe", "two earlier products I founded: a hiring marketplace for Roblox studios and a tender risk checker"],
];

const SKILLS = [
  ["Design", "Product design, UI/UX, interaction, design systems, brand identity, art direction, prototyping"],
  ["Build", "TypeScript, React, Next.js, Astro, Tailwind, Supabase, Vercel, SwiftUI, Tauri, Electron"],
  ["Growth", "Positioning, go to market, launch, landing pages, App Store assets, analytics (PostHog)"],
  ["AI", "Agentic coding (Claude Code, Codex, Cursor), LLM products, AI Gateway, OpenRouter"],
  ["3D", "Blender, ZBrush, Substance, game ready assets"],
  ["Tools", "Figma, Framer, Paper, Playwright, GitHub"],
];

const EARLIER = [
  ["Acquiblox", "CMO: marketing and community growth"],
  ["Basket Ent", "acquisitions, then post acquisition liveops"],
  ["World Ent", "3D artist on live Roblox titles"],
  ["SOF Agency", "PR, partnerships and crowdfunding for game studios"],
  ["Cosmos Models", "3D commissions"],
];

const job = (r) => `
  <article class="job">
    <div class="jh">
      <span class="jn">${esc(r.name)}</span>
      <span class="jt">${esc(r.title)}</span>
      <span class="jw">${esc(r.when)}</span>
    </div>
    <div class="jl">${esc(r.line)}${r.url ? ` · <a href="https://${r.url}">${esc(r.url)}</a>` : ""}</div>
    <ul>${r.points.map((p) => `<li>${md(p)}</li>`).join("")}</ul>
  </article>`;

const html = `<!doctype html><meta charset="utf-8">
<style>
  ${font(400)}${font(500)}${font(700)}
  @page { size: A4; margin: 10mm 12mm 8mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 8.4pt/1.38 Satoshi, sans-serif; color: #111; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  a { color: inherit; text-decoration: none; }
  b { font-weight: 700; color: #111; }

  header { display: flex; justify-content: space-between; align-items: flex-end; gap: 12pt; }
  h1 { margin: 0; font-size: 26pt; font-weight: 700; letter-spacing: -0.045em; line-height: 0.95; }
  .role { margin-top: 4pt; font-size: 10.5pt; font-weight: 500; color: #4f4f4f; letter-spacing: -0.01em; }
  .role i { font-style: normal; color: #f05a00; font-weight: 700; }
  .contact { text-align: right; font-size: 8.2pt; line-height: 1.55; color: #4f4f4f; }
  .contact b { font-weight: 500; color: #111; }

  .summary { margin: 8pt 0 0; font-size: 9.1pt; line-height: 1.45; color: #2b2b2b; letter-spacing: -0.005em; }

  .nums { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4pt; margin: 9pt 0 0; }
  .num { background: #efefef; border-radius: 6pt; padding: 6pt 7pt 6.5pt; }
  .num b { display: block; font-size: 15pt; line-height: 1; letter-spacing: -0.04em; }
  .num span { display: block; margin-top: 2.5pt; font-size: 7.2pt; line-height: 1.25; color: #4f4f4f; }

  .cols { display: grid; grid-template-columns: 1fr 52mm; gap: 14pt; margin-top: 9pt; }
  h2 { margin: 0 0 5pt; font-size: 10.5pt; font-weight: 700; letter-spacing: -0.02em; }
  h2 + * { margin-top: 0; }
  section + section { margin-top: 8pt; }

  .job { margin-bottom: 6pt; break-inside: avoid; }
  .job:last-child { margin-bottom: 0; }
  .jh { display: flex; align-items: baseline; gap: 5pt; }
  .jn { font-weight: 700; font-size: 9.8pt; letter-spacing: -0.015em; }
  .jt { font-weight: 500; font-size: 8.8pt; color: #111; }
  .jw { margin-left: auto; font-size: 7.8pt; color: #6b6b6b; white-space: nowrap; }
  .jl { font-size: 7.8pt; color: #6b6b6b; margin-top: 0.5pt; }
  .jl a { color: #6b6b6b; }
  ul { margin: 3pt 0 0; padding: 0; list-style: none; }
  li { position: relative; padding-left: 9pt; margin-bottom: 1.1pt; color: #333; }
  li::before { content: ""; position: absolute; left: 1.5pt; top: 5pt; width: 3pt; height: 3pt; border-radius: 50%; background: #111; }

  .side { background: #f6f6f6; border-radius: 8pt; padding: 9pt 9pt 10pt; align-self: start; }
  .side h2 { font-size: 9.6pt; }
  .kv { margin-bottom: 4pt; }
  .kv b { display: block; font-size: 8.2pt; }
  .kv span { display: block; font-size: 7.9pt; color: #4f4f4f; line-height: 1.38; }
  .side section + section { margin-top: 9pt; }

  .builds li { margin-bottom: 2pt; }
  .links { font-size: 7.9pt; line-height: 1.6; color: #4f4f4f; }
  .links b { font-weight: 500; color: #111; }
</style>

<header>
  <div>
    <h1>Jawad Jalal</h1>
    <div class="role">Product designer &amp; founder · London</div>
  </div>
  <div class="contact">
    <b><a href="mailto:${IDENTITY.email}">${esc(IDENTITY.email)}</a></b><br>
    <a href="${IDENTITY.site}">${esc(SITE)}</a> · <a href="https://x.com/jawadmakes">x.com/jawadmakes</a><br>
    <a href="https://www.linkedin.com/in/jawad-jalal-designs">linkedin.com/in/jawad-jalal-designs</a><br>
    <a href="${IDENTITY.site}/blog">${esc(SITE)}/blog</a> · youtube @jawadmake
  </div>
</header>

<p class="summary">${esc(SUMMARY)}</p>

<div class="nums">
  ${NUMBERS.map(([n, s]) => `<div class="num"><b>${esc(n)}</b><span>${esc(s)}</span></div>`).join("")}
</div>

<div class="cols">
  <main>
    <section>
      <h2>Experience</h2>
      ${ROLES.map(job).join("")}
    </section>
    <section>
      <h2>Selected builds</h2>
      <ul class="builds">${BUILDS.map(([n, s]) => `<li><b>${esc(n)}</b>: ${esc(s)}</li>`).join("")}</ul>
    </section>
  </main>

  <aside class="side">
    <section>
      <h2>Skills</h2>
      ${SKILLS.map(([k, v]) => `<div class="kv"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join("")}
    </section>
    <section>
      <h2>Education</h2>
      <div class="kv"><b>Queen Elizabeth's School, Barnet</b><span>GCSEs 2027 · predicted 9,9,9,9,9,9,9,9,8,8 · Triple Science, Maths, English (Higher), Economics, German, History, Production Design</span></div>
      <div class="kv"><b>Duke of Edinburgh's Award</b><span>Bronze</span></div>
    </section>
    <section>
      <h2>Earlier</h2>
      ${EARLIER.map(([k, v]) => `<div class="kv"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join("")}
    </section>
  </aside>
</div>`;

const out = resolve(root, "public/jawad-jalal-cv.pdf");
const exe = process.env.CHROMIUM_PATH;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: out, format: "A4", printBackground: true });
if (process.env.CV_PNG) {
  await page.setViewportSize({ width: 794, height: 1123 });
  await page.emulateMedia({ media: "print" });
  await page.screenshot({ path: process.env.CV_PNG, fullPage: true });
}
await browser.close();

const pages = (readFileSync(out).toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`cv → ${out} (${pages} page${pages === 1 ? "" : "s"})`);
