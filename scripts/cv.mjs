// Builds public/jawad-jalal-cv.pdf from the site's own content.
//
// The CV and the page have to say the same thing. Typing it out twice is how
// they drift, so the roles, skills and contact details are read from
// src/lib/profile.ts. What the page leaves out and a recruiter wants (the
// summary, the numbers, what each role actually involved) is written below in
// HIGHLIGHTS. Two A4 pages. Run it after changing any role or blurb:
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
const { NOW, ARCHIVE, IDENTITY } = await import(
  pathToFileURL(resolve(root, "src/lib/profile.ts")).href
);

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const SUMMARY =
  "Designer and founder in London. I'm fifteen and have been making things for money since thirteen. " +
  "I run two small companies, Ignura, a launch studio for apps, and Bevel, a 3D art team, and I design for MenuFit and Okara. " +
  "I like owning a product end to end: the brand, the interface and the code that ships it.";

// The line a recruiter scans first, in the words a job spec uses.
const CORE = [
  "Product design", "UI/UX", "Design systems", "Brand identity", "Creative direction",
  "Launch & go-to-market", "Front-end (Next.js, React, TypeScript)", "3D art",
];

// Grouped the way a job spec is, and wider than the page's own skills table:
// everything here is something the work above actually involved.
const SKILLS = [
  ["Design", "Product design, UI/UX, design systems, brand identity, logo design, landing pages, App Store screenshots, art direction, Figma, Framer"],
  ["Build", "Next.js, React, TypeScript, Tailwind, Supabase, Vercel, SwiftUI, Electron"],
  ["Launch & growth", "Go-to-market, launch strategy, launch films, UGC, influencer marketing, community growth, PR and partnerships"],
  ["Product", "Product management, product strategy, consumer apps, mobile (iOS and Android), AI products, EdTech"],
  ["3D & art", "Blender, ZBrush, Substance, sculpting, texturing, game-ready assets"],
  ["AI tools", "Claude Code, Cursor, Codex, OpenRouter, Grok, Hermes Agent"],
];

// What each role involved, beyond the one line the page carries. Only things
// the site or the founder has stated, nothing rounded up.
const HIGHLIGHTS = {
  ignura: {
    title: "Founder",
    line: "Launch studio for apps · London",
    points: [
      "Started the studio and run it day to day with a team of four: design, launch films, UGC and launch day, so an app team gets one crew instead of five freelancers.",
      "Grew it to six figure ARR on fixed scope packages, from a one week App Store screenshot set to a four week launch that covers the landing page, polish on key screens, a launch film, UGC and launch day.",
      "Open every engagement with a free teardown: a written review within a week, with two or three mockups of the fixes we would make first. Burn, a monthly retainer, keeps campaigns and design going after launch.",
      "Run a UGC arm with a roster of 21 creators, backed by a guarantee: 10k views in two weeks or the money back.",
      "Delivered work for Okara, Splitting Point, Yummers and hypjam, and made Ignura's own brand, launch film and site, plus an internal ops dashboard and a site assistant.",
    ],
    skills: "Creative direction · Launch strategy · Go-to-market · Brand design · Launch films · App Store assets · Landing pages · UGC · Team leadership",
  },
  menufit: {
    name: "MenuFit",
    title: "Designer",
    line: "The app for eating out healthy · iOS and Android",
    points: [
      "Product designer on an app used by two million people.",
      "Work on the core experience: a personalised healthy menu for every restaurant, with calories, protein, carbs and fats on each dish and a score for how well it fits your macros.",
      "Design for both iOS and Android, where the app is live.",
    ],
    skills: "Product design · UI/UX · Mobile · Design systems · Figma · Consumer apps at scale",
  },
  bevel: {
    title: "Founder",
    line: "3D art team for hire · Blender, ZBrush, Substance",
    points: [
      "Built a 3D art team that studios hire by the job, at published rates, so clients know the price before they ask.",
      "Reached six figure ARR delivering game ready models, textures and commissions.",
      "Cover the full pipeline in Blender, ZBrush and Substance, from sculpt to textured asset, and run the studio's brand, site and client work.",
    ],
    skills: "3D modelling · Sculpting · Texturing · Game-ready assets · Art direction · Client management",
  },
  okara: {
    title: "Designer",
    line: "AI CMO that drafts and ships marketing work",
    points: [
      "Design the product for an AI CMO that drafts and ships marketing work, including the dashboard.",
      "Its launch film reached 14M views on X in a day.",
      "Work in Figma and ship in Next.js and Tailwind, and maintain the design system.",
    ],
    skills: "Product design · SaaS dashboards · Design systems · Figma · Next.js · Tailwind · AI products",
  },
  nooli: {
    title: "Head of Product",
    line: "Adaptive lessons for ages three to five · iOS",
    points: [
      "First hire. Owned the product and its design system, built in SwiftUI.",
      "Shaped lessons for three to five year olds that adapt to the child.",
    ],
    skills: "Product management · Product strategy · EdTech · iOS · Design systems · SwiftUI",
  },
  ignaru: {
    title: "Founder",
    line: "Side project · a growth engine in a box",
    points: [
      "B2B growth software. Leads in, calls out, and you approve everything in between.",
    ],
    skills: "Product design · B2B · Go-to-market",
  },
};

const NOOLI = { key: "nooli", name: "nooli", period: "2026" };
const IGNARU = NOW.find((i) => i.key === "ignaru");

const job = (item) => {
  const h = HIGHLIGHTS[item.key];
  return `
  <article class="job">
    <div class="row">
      <span class="name">${esc(h.name ?? cap(item.name))}</span>
      <span class="lead"></span>
      <span class="meta">${esc(h.title)} · ${esc(item.period)}</span>
    </div>
    <div class="sub">${esc(h.line)}</div>
    <ul class="points">${h.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
    <div class="kw">${esc(h.skills)}</div>
  </article>`;
};

const earlier = (r) => `
  <li>
    <div class="row">
      <span class="name">${esc(cap(r.name))}</span>
      <span class="lead"></span>
      <span class="meta">${esc(r.role)} · ${esc(r.period)}</span>
    </div>
    <p>${esc(r.blurb)}</p>
  </li>`;

const html = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&f[]=chillax@500,600&display=swap">
<style>
  @page { size: A4; margin: 13mm 16mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font: 9.6pt/1.5 Satoshi, system-ui, sans-serif;
    color: #1b1b19;
    -webkit-print-color-adjust: exact;
  }
  h1 { font-family: Chillax, Satoshi, sans-serif; font-size: 25pt; margin: 0; letter-spacing: -0.01em; line-height: 1.1; }
  h2 {
    font-family: Chillax, Satoshi, sans-serif;
    font-size: 11pt; font-weight: 600; margin: 0 0 7pt;
    padding-bottom: 3.5pt; border-bottom: 0.7pt solid #e4e4e0;
  }
  header { display: flex; justify-content: space-between; align-items: flex-end; }
  .tag { font-size: 10pt; color: #6b6b64; margin-top: 3pt; }
  .contact { text-align: right; font-size: 8.8pt; color: #6b6b64; line-height: 1.65; }
  .contact a { color: #1b1b19; text-decoration: none; }
  .summary { margin: 11pt 0 0; font-size: 10pt; line-height: 1.6; color: #2c2c29; }
  section { margin-top: 14pt; }
  ul { list-style: none; margin: 0; padding: 0; }
  .row { display: flex; align-items: baseline; gap: 6pt; }
  .name { font-weight: 700; font-size: 10.2pt; }
  .lead { flex: 1; border-bottom: 0.7pt dashed #d8d8d2; transform: translateY(-2pt); }
  .meta { font-size: 8.6pt; color: #6b6b64; white-space: nowrap; }
  .job { margin-bottom: 11pt; break-inside: avoid; }
  .job:last-child { margin-bottom: 0; }
  .sub { font-size: 8.6pt; color: #6b6b64; margin-top: 1pt; }
  .points { margin-top: 4pt; }
  .points li { position: relative; padding-left: 11pt; margin-bottom: 2.4pt; color: #3a3a36; font-size: 9.2pt; }
  .points li::before { content: ""; position: absolute; left: 1pt; top: 6.1pt; width: 3pt; height: 3pt; border-radius: 50%; background: #b9b9b1; }
  .earlier li { margin-bottom: 12pt; break-inside: avoid; }
  .earlier li p { margin: 2pt 0 0; color: #4a4a45; font-size: 9.2pt; }
  .skills { display: grid; grid-template-columns: 1fr 1fr; gap: 12pt 18pt; }
  .skill-area { font-weight: 700; font-size: 9.4pt; }
  .skill-list { color: #4a4a45; font-size: 9pt; }
  .kw { margin: 3pt 0 0 11pt; font-size: 8.2pt; color: #8a8a82; letter-spacing: 0.01em; }
  .core { margin: 10pt 0 0; font-size: 9pt; color: #4a4a45; }
  .page2 { break-before: page; }
  .online { margin: 0 0 6pt; font-size: 9.2pt; color: #4a4a45; }
  .links { display: flex; flex-wrap: wrap; gap: 4pt 16pt; font-size: 9.4pt; }
  .links a { color: #1b1b19; text-decoration: none; }
  .links span { color: #6b6b64; }
</style>
<header>
  <div>
    <h1>Jawad Jalal</h1>
    <div class="tag">Designer &amp; founder · London, England</div>
  </div>
  <div class="contact">
    <a href="mailto:${IDENTITY.email}">${esc(IDENTITY.email)}</a><br>
    <a href="${IDENTITY.site}">${esc(IDENTITY.site.replace(/^https?:\/\//, ""))}</a><br>
    <a href="https://www.linkedin.com/in/jawad-jalal-designs">linkedin.com/in/jawad-jalal-designs</a>
  </div>
</header>

<p class="summary">${esc(SUMMARY)}</p>
<p class="core"><b>Core skills:</b> ${CORE.map(esc).join(" · ")}</p>

<section>
  <h2>Experience</h2>
  ${NOW.filter((i) => i.key !== "ignaru").map(job).join("")}
</section>

<div class="page2">
  <section style="margin-top:0">
    <h2>Education &amp; achievements</h2>
    <div class="row">
      <span class="name">Queen Elizabeth's School, Barnet</span>
      <span class="lead"></span>
      <span class="meta">2022 – 2027</span>
    </div>
    <ul class="points">
      <li>GCSEs, sitting 2027. Predicted grades: 9, 9, 9, 9, 9, 9, 9, 9, 8, 8.</li>
      <li>Subjects: Production Design, Economics, History, German, Triple Science (Higher), English (Higher), Maths (Higher).</li>
      <li>The Duke of Edinburgh's Award: Bronze.</li>
    </ul>
  </section>

  <section>
    <h2>Side project</h2>
    ${job(IGNARU)}
  </section>

  <section>
    <h2>Earlier work</h2>
    ${job(NOOLI)}
    <ul class="earlier">
      ${ARCHIVE.map(earlier).join("")}
    </ul>
  </section>

  <section>
    <h2>Skills</h2>
    <div class="skills">
      ${SKILLS.map(
        ([area, list]) => `<div>
          <div class="skill-area">${esc(area)}</div>
          <div class="skill-list">${esc(list)}</div>
        </div>`,
      ).join("")}
    </div>
  </section>

  <section>
    <h2>Online</h2>
    <p class="online">I write about design, building products and launching apps at ${esc(IDENTITY.site.replace(/^https?:\/\//, ""))}/blog, and post my work on X, YouTube and Instagram.</p>
    <div class="links">
      <a href="mailto:${IDENTITY.email}">${esc(IDENTITY.email)}</a>
      <a href="${IDENTITY.site}">${esc(IDENTITY.site.replace(/^https?:\/\//, ""))}</a>
      <a href="${IDENTITY.site}/blog">Blog</a>
      <a href="https://x.com/jawadmakes">X @jawadmakes</a>
      <a href="https://www.youtube.com/@jawadmake">YouTube @jawadmake</a>
      <a href="https://www.instagram.com/j.awadjalal/">Instagram @j.awadjalal</a>
      <a href="https://www.linkedin.com/in/jawad-jalal-designs">LinkedIn</a>
    </div>
  </section>

</div>`;

const out = resolve(root, "public/jawad-jalal-cv.pdf");
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: out, format: "A4", printBackground: true });
await browser.close();

const pages = (readFileSync(out).toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`cv → ${out} (${pages} page${pages === 1 ? "" : "s"})`);
