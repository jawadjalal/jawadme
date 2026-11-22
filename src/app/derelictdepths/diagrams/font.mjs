// Sets every diagram's text in Geist. The SVGs load as <img>, which cannot reach the page's fonts, so each one carries
// its own copy of Geist, subset to the characters it draws, as a data url. Safe to run again on its own output.
//   node src/app/derelictdepths/diagrams/font.mjs public/derelictdepths/d src/fonts/Geist-var.woff2
// Needs pyftsubset (pip install fonttools brotli).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [dir, font] = process.argv.slice(2);
const FACE = /@font-face\{font-family:geist;[^}]*\}/g;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dd-font-"));
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".svg")).sort()) {
  const file = path.join(dir, f);
  const svg = fs.readFileSync(file, "utf8").replace(FACE, "");
  const text = svg
    .replace(/<style>[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  const out = path.join(tmp, f + ".woff2");
  execFileSync("pyftsubset", [font, "--text=" + [...new Set(text + " ")].join(""), "--flavor=woff2", "--layout-features=kern,liga", "--output-file=" + out]);
  const face = "@font-face{font-family:geist;font-weight:100 900;src:url(data:font/woff2;base64," + fs.readFileSync(out).toString("base64") + ") format('woff2');}";
  const next = svg.replace(/font-family:\s*[^;}"]*/g, "font-family:geist,Arial,Helvetica,sans-serif").replace("<style>", "<style>" + face);
  fs.writeFileSync(file, next);
  console.log(f, Math.round(fs.statSync(file).size / 1024) + " kb");
}
fs.rmSync(tmp, { recursive: true });
