// Renders scripts/cv/cv.html to public/jawad-jalal-cv.pdf using Playwright +
// the pre-installed Chromium. Run with: node scripts/generate-cv.mjs
//
// Keeping the CV as HTML (rather than a hand-authored PDF) means the document
// is versioned, on-brand, and regenerable whenever Jawad's roles change.

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { writeFile } from "node:fs/promises";

// Playwright ships with the toolchain (not as a project dependency), so resolve
// it from wherever `require` can find it — including the global install.
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, "cv/cv.html");
const outPath = resolve(__dirname, "../public/jawad-jalal-cv.pdf");

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
  // Give the web fonts a beat to settle so the document renders in Space
  // Grotesk rather than the system-sans fallback.
  await page.evaluate(() => document.fonts.ready);

  // Report which family actually resolved. If Google Fonts is unreachable at
  // render time the CV falls back to a system sans on purpose — worth knowing,
  // because it changes the metrics and therefore the one-page fit.
  // NB: document.fonts.check() is not enough — with the stylesheet blocked there
  // is no @font-face to match, and check() then answers `true` for the fallback.
  // Inspect the loaded face set instead.
  const fontLoaded = await page.evaluate(() =>
    [...document.fonts].some(
      (f) => f.family.includes("Space Grotesk") && f.status === "loaded",
    ),
  );
  console.log(
    fontLoaded
      ? "Fonts: Space Grotesk resolved."
      : "Fonts: Space Grotesk did NOT resolve — rendered in the system sans fallback.",
  );

  // The sheet is a fixed 297mm box; anything taller than the viewport content
  // box means copy has outgrown the page and would be clipped.
  const fit = await page.evaluate(() => {
    const sheet = document.querySelector(".sheet");
    return { scroll: sheet.scrollHeight, client: sheet.clientHeight };
  });
  if (fit.scroll > fit.client + 1) {
    console.warn(
      `WARNING: content overflows the sheet by ${fit.scroll - fit.client}px — tighten the copy.`,
    );
  }

  const buffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });
  await writeFile(outPath, buffer);

  // Hard assertion on the one-page constraint: read the page count straight
  // out of the page-tree node Chromium writes into the PDF.
  const pdfText = buffer.toString("latin1");
  const counts = [...pdfText.matchAll(/\/Type\s*\/Pages[\s\S]{0,200}?\/Count\s+(\d+)/g)].map(
    (m) => Number(m[1]),
  );
  const pages = counts.length ? Math.max(...counts) : null;
  console.log(`Wrote ${outPath}${pages ? ` (${pages} page${pages > 1 ? "s" : ""})` : ""}`);
  if (pages && pages !== 1) {
    console.error(`ERROR: the CV must be one page, got ${pages}.`);
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
