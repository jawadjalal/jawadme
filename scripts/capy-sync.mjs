#!/usr/bin/env node
// Syncs the Capy hackathon assets into the /capy page.
//
//   node scripts/capy-sync.mjs [--src /Users/jawadjalal/night/real/capyhack]
//
// Scans elite/<idea>/, packs/<pack>/, final/posters/<name>/ and banners/ under the source folder, and for every
// finished file writes into public/capy/:
//   <kind>/<id>.webp   the web preview, long edge 1400, under ~300 KB (alpha kept, so stickers stay cut out)
//   <kind>/<id>.png    the copy and download original, long edge capped at 4000
//   <kind>/<id>.mp4    videos and GIFs as they are, under 8 MB
//   <kind>/<id>.pdf    the print PDF for that size, only when under 12 MB
// then rewrites src/app/capy/assets.json and public/capy/og.jpg. Re-running is safe: a file is only rebuilt when its
// source is newer, and files whose source has gone are removed. Mac only (sips, cwebp, ffmpeg); no npm deps.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argSrc = process.argv.indexOf("--src");
const SRC = argSrc > -1 ? path.resolve(process.argv[argSrc + 1]) : "/Users/jawadjalal/night/real/capyhack";
const OUT = path.join(ROOT, "public/capy");
const JSON_OUT = path.join(ROOT, "src/app/capy/assets.json");

const PREVIEW_EDGE = 1400;
const PREVIEW_BYTES = 300 * 1024;
const ORIGINAL_EDGE = 4000;
const MEDIA_MAX = 8 * 1024 * 1024;
const PDF_MAX = 12 * 1024 * 1024;
const BUDGET = 245 * 1024 * 1024; // 250 MB is the cap; 5 MB of room for the OG image and rounding

const SKIP_DIRS = new Set(["src", "work", "assets", "fonts", "node_modules", ".git", "refs", "site"]);
const IMAGE = /\.(png|jpe?g|webp)$/i;
const VIDEO = /\.(mp4|mov|webm)$/i;
const GIF = /\.gif$/i;
const KINDS = ["posters", "banners", "stickers", "wallpapers", "social", "badges", "signs", "slides", "motion"];

const has = (bin) => {
  try {
    execFileSync("which", [bin], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};
for (const bin of ["sips", "cwebp", "ffmpeg", "ffprobe"]) {
  if (!has(bin)) {
    console.error(`capy-sync: needs ${bin} on PATH`);
    process.exit(1);
  }
}

const run = (bin, args) => execFileSync(bin, args, { stdio: ["ignore", "pipe", "pipe"] }).toString();
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const isDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();
const list = (p) => (isDir(p) ? fs.readdirSync(p).filter((f) => !f.startsWith(".")).sort() : []);
const mtime = (p) => fs.statSync(p).mtimeMs;
const bytes = (p) => fs.statSync(p).size;
const fresh = (out, src) => fs.existsSync(out) && mtime(out) >= mtime(src) && bytes(out) > 0;

function titleCase(s) {
  const t = s.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** A friendly label for a size key: "a4" -> "A4", "fourfive" -> "4:5", "social-1080x1350" -> "1080 × 1350". */
function sizeLabel(key) {
  const k = key.toLowerCase();
  const named = {
    poster: "Poster", preview: "Poster", square: "Square", story: "Story", tall: "Tall", wide: "Wide", strip: "Strip",
    rollup: "Roll-up", fourfive: "4:5", banner: "Banner", phone: "Phone", desktop: "Desktop",
  };
  if (named[k]) return named[k];
  if (/^a\d$/.test(k)) return k.toUpperCase();
  const dims = k.match(/(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)/);
  if (!dims) return titleCase(k);
  // print sizes are in inches, screen sizes in pixels
  const d = Number(dims[2]) < 200 ? `${dims[1]} × ${dims[2]} in` : `${dims[1]} × ${dims[2]}`;
  const word = k.replace(dims[0], "").replace(/^-+|-+$/g, "");
  return word ? `${named[word] ?? titleCase(word)}, ${d}` : d;
}

function dims(file) {
  if (VIDEO.test(file)) {
    const o = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file]);
    const [w, h] = o.trim().split(",").map(Number);
    return { w, h };
  }
  const o = run("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file]);
  return { w: Number(o.match(/pixelWidth: (\d+)/)[1]), h: Number(o.match(/pixelHeight: (\d+)/)[1]) };
}

// ── finding the assets ──────────────────────────────────────────────────────

/** Paper sizes by aspect (w/h), so a PNG can find its PDF when the names do not say. */
const PAPER = { a4: 210 / 297, a3: 297 / 420, "11x17": 11 / 17, "18x24": 18 / 24, "24x36": 24 / 36 };
function pdfAspect(name) {
  const n = name.toLowerCase();
  for (const [k, r] of Object.entries(PAPER)) if (n.includes(k)) return r;
  return null;
}

/** Picks the print PDF for one PNG: same size key in the name first, then the nearest paper aspect. Trim over bleed. */
function pickPdf(dir, key, w, h, pdfs) {
  if (!pdfs.length) return null;
  const rank = (p) => (/-trim/i.test(p) ? 2 : /-bleed/i.test(p) ? 0 : 1);
  const order = (arr) => [...arr].sort((a, b) => rank(b) - rank(a));
  const k = key.toLowerCase();
  const byName = pdfs.filter((p) => {
    const base = p.toLowerCase().replace(/\.pdf$/, "").replace(/-(trim|bleed)$/, "");
    return base === k || base === `poster-${k}` || base.endsWith(`-${k}`);
  });
  if (byName.length) return path.join(dir, order(byName)[0]);
  const r = w / h;
  const near = pdfs
    .map((p) => ({ p, d: pdfAspect(p) == null ? 9 : Math.abs(pdfAspect(p) - r) / r }))
    .filter((x) => x.d < 0.02)
    .sort((a, b) => a.d - b.d || rank(b.p) - rank(a.p));
  return near.length ? path.join(dir, near[0].p) : null;
}

const skipFile = (f) => /sheet|contact|^_|thumb/i.test(f);

/** One idea folder (elite/<idea> or final/posters/<name>): each PNG is a size, v2-/v3- prefixes are variations. */
function scanIdea(dir, kind, idea, out) {
  const files = list(dir).filter((f) => !isDir(path.join(dir, f)));
  const pdfs = files.filter((f) => /\.pdf$/i.test(f));
  for (const f of files) {
    if (!IMAGE.test(f) || skipFile(f)) continue;
    const variant = f.match(/^(v\d+)[-_]/i)?.[1]?.toLowerCase() ?? "";
    const rest = variant ? f.slice(variant.length + 1) : f;
    let key = rest.replace(/\.[a-z]+$/i, "").replace(/-?preview-?/i, "") || "poster";
    if (key === "") key = "poster";
    const vPdfs = pdfs.filter((p) => (variant ? p.toLowerCase().startsWith(`${variant}-`) : !/^v\d+[-_]/i.test(p)));
    out.push({
      src: path.join(dir, f), kind, set: slug(`${idea}${variant ? `-${variant}` : ""}`),
      setTitle: titleCase(idea) + (variant ? ` ${variant}` : ""), key, pdfs: vPdfs, dir,
    });
  }
}

/** Files of a pack or the banners folder, recursively, minus the working folders. */
function walk(dir, acc = []) {
  for (const f of list(dir)) {
    const p = path.join(dir, f);
    if (isDir(p)) {
      if (!SKIP_DIRS.has(f.toLowerCase()) && !f.startsWith("_")) walk(p, acc);
    } else if ((IMAGE.test(f) || VIDEO.test(f) || GIF.test(f)) && !skipFile(f)) acc.push(p);
  }
  return acc;
}

/** Reads a pack's manifest.json leniently: an array, or {items|assets|files: [...]}, entries a path or an object. */
function readManifest(dir) {
  const m = path.join(dir, "manifest.json");
  if (!fs.existsSync(m)) return new Map();
  let data;
  try {
    data = JSON.parse(fs.readFileSync(m, "utf8"));
  } catch {
    return new Map();
  }
  const arr = Array.isArray(data) ? data : data.items ?? data.assets ?? data.files ?? [];
  const map = new Map();
  for (const e of Array.isArray(arr) ? arr : []) {
    if (typeof e === "string") map.set(path.resolve(dir, e), {});
    else if (e && typeof e === "object") {
      const file = e.file ?? e.path ?? e.src ?? e.png ?? e.output;
      if (typeof file === "string") map.set(path.resolve(dir, file), e);
    }
  }
  return map;
}

const SIZED = /^(.*?)[-_@]((?:(?:banner|poster|post|story|square|wide|tall|strip|rollup|hanger|tent|phone|desktop)-)?\d+(?:\.\d+)?x\d+(?:\.\d+)?|\d{3,4}(?:px)?|phone|desktop|square|story|wide|tall|a\d)$/i;

const GENERIC = /^(preview|phone|desktop|poster|final|image|cover|main|full|print|web|mobile|index|square|story|wide|tall)$/i;

/** A pack or the banners: "<name>-<size>.png" files in one folder are one design in sizes; anything else stands alone. */
function scanLoose(dir, kind, out) {
  const manifest = readManifest(dir);
  for (const p of walk(dir)) {
    const m = manifest.get(p) ?? {};
    const here = path.dirname(p);
    const base = path.basename(p).replace(/\.[a-z0-9]+$/i, "");
    let sized = base.match(SIZED);
    let name = String(m.group ?? m.set ?? (sized ? sized[1] : base));
    // "banners/03-manga-day/preview.png": a generic file name takes its folder's name, and the file name is its size
    if (!m.group && !m.set && here !== dir && GENERIC.test(base)) {
      name = path.basename(here).replace(/^\d+[-_]/, "");
      sized = [base, name, /^(preview|final|image|main|full|print|web|index)$/i.test(base) ? "" : base];
    }
    const pdfs = list(here).filter((f) => /\.pdf$/i.test(f) && slug(f).startsWith(slug(name)));
    // "capy-sticker-go" in the stickers pack is just "go"
    name = name.replace(new RegExp(`^capy[-_]${kind.replace(/s$/, "")}[-_]`, "i"), "");
    out.push({
      src: p, kind, set: slug(`${kind}-${name}`),
      // "a-home-screen" is idea A, "Home screen"
      setTitle: typeof (m.title ?? m.name) === "string" ? m.title ?? m.name : titleCase(name.replace(/^[a-z][-_](?=[a-z]{2})/i, "")),
      key: sized ? sized[2] : typeof m.size === "string" ? m.size : "", pdfs, dir: here,
    });
  }
}

const found = [];
for (const idea of list(path.join(SRC, "elite"))) {
  const d = path.join(SRC, "elite", idea);
  if (isDir(d)) scanIdea(d, "posters", idea, found);
}
for (const name of list(path.join(SRC, "final/posters"))) {
  const d = path.join(SRC, "final/posters", name);
  if (isDir(d)) scanIdea(d, "posters", name, found);
}
if (isDir(path.join(SRC, "banners"))) scanLoose(path.join(SRC, "banners"), "banners", found);
for (const pack of list(path.join(SRC, "packs"))) {
  const d = path.join(SRC, "packs", pack);
  if (!isDir(d)) continue;
  const kind = KINDS.find((k) => slug(pack).startsWith(k.replace(/s$/, ""))) ?? slug(pack);
  scanLoose(d, kind, found);
}

// ── building the outputs ────────────────────────────────────────────────────

fs.mkdirSync(OUT, { recursive: true });
const keep = new Set();
const assets = [];
const problems = [];

function makePreview(src, out, w, h) {
  if (fresh(out, src)) return;
  const tmp = `${out}.tmp.png`;
  let input = src;
  if (!/\.(png|jpe?g)$/i.test(src)) {
    run("sips", ["-s", "format", "png", src, "--out", tmp]);
    input = tmp;
  }
  const big = Math.max(w, h) > PREVIEW_EDGE;
  const resize = big ? (w >= h ? ["-resize", String(PREVIEW_EDGE), "0"] : ["-resize", "0", String(PREVIEW_EDGE)]) : [];
  for (const q of [82, 72, 62, 50, 40]) {
    run("cwebp", ["-quiet", "-q", String(q), "-m", "5", "-alpha_q", "90", ...resize, input, "-o", out]);
    if (bytes(out) <= PREVIEW_BYTES) break;
  }
  if (fs.existsSync(tmp)) fs.rmSync(tmp);
}

function makeOriginal(src, out, w, h) {
  if (fresh(out, src)) return;
  if (/\.png$/i.test(src) && Math.max(w, h) <= ORIGINAL_EDGE) fs.copyFileSync(src, out);
  else {
    const args = ["-s", "format", "png"];
    if (Math.max(w, h) > ORIGINAL_EDGE) args.push("-Z", String(ORIGINAL_EDGE));
    run("sips", [...args, src, "--out", out]);
  }
}

function videoPoster(src, out) {
  if (fresh(out, src)) return;
  const frame = `${out}.frame.png`;
  run("ffmpeg", ["-v", "error", "-y", "-ss", "0.4", "-i", src, "-frames:v", "1", frame]);
  const d = dims(frame);
  makePreview(frame, out, d.w, d.h);
  fs.rmSync(frame, { force: true });
}

const usedIds = new Set();
for (const a of found) {
  try {
    const { w, h } = dims(a.src);
    if (!w || !h) throw new Error("no dimensions");
    let id = slug(`${a.set}-${a.key || "main"}`);
    for (let n = 2; usedIds.has(id); n++) id = slug(`${a.set}-${a.key || "main"}-${n}`);
    usedIds.add(id);
    const dir = path.join(OUT, a.kind);
    fs.mkdirSync(dir, { recursive: true });
    const rel = (f) => `/capy/${a.kind}/${f}`;
    const entry = {
      id, title: a.setTitle, group: a.set, kind: a.kind, size: a.key && !/^\d+(px)?$/i.test(a.key) ? sizeLabel(a.key) : `${w} × ${h}`, w, h,
      type: "image", preview: "", original: "",
    };
    if (VIDEO.test(a.src) || GIF.test(a.src)) {
      const ext = VIDEO.test(a.src) ? "mp4" : "gif";
      const orig = path.join(dir, `${id}.${ext}`);
      if (!fresh(orig, a.src)) {
        if (ext === "mp4" && !/\.mp4$/i.test(a.src)) {
          run("ffmpeg", ["-v", "error", "-y", "-i", a.src, "-an", "-c:v", "libx264", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", orig]);
        } else fs.copyFileSync(a.src, orig);
      }
      if (bytes(orig) > MEDIA_MAX && ext === "mp4") {
        const tmp = `${orig}.tmp.mp4`;
        run("ffmpeg", ["-v", "error", "-y", "-i", orig, "-an", "-vf", "scale='min(1080,iw)':-2", "-c:v", "libx264", "-crf", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart", tmp]);
        fs.renameSync(tmp, orig);
      }
      if (bytes(orig) > MEDIA_MAX) {
        fs.rmSync(orig);
        problems.push(`${path.relative(SRC, a.src)}: over 8 MB, skipped`);
        continue;
      }
      const prev = path.join(dir, `${id}.webp`);
      if (ext === "mp4") videoPoster(orig, prev);
      else makePreview(a.src, prev, w, h);
      keep.add(orig).add(prev);
      Object.assign(entry, { type: ext === "mp4" ? "video" : "gif", preview: rel(`${id}.webp`), original: rel(`${id}.${ext}`) });
    } else {
      const prev = path.join(dir, `${id}.webp`);
      const orig = path.join(dir, `${id}.png`);
      makePreview(a.src, prev, w, h);
      makeOriginal(a.src, orig, w, h);
      keep.add(prev).add(orig);
      Object.assign(entry, { preview: rel(`${id}.webp`), original: rel(`${id}.png`) });
      if (Math.max(w, h) > ORIGINAL_EDGE) {
        const s = ORIGINAL_EDGE / Math.max(w, h);
        Object.assign(entry, { w: Math.round(w * s), h: Math.round(h * s) });
      }
      const pdf = pickPdf(a.dir, a.key, w, h, a.pdfs);
      if (pdf && bytes(pdf) <= PDF_MAX) {
        const out = path.join(dir, `${id}.pdf`);
        if (!fresh(out, pdf)) fs.copyFileSync(pdf, out);
        keep.add(out);
        entry.pdf = rel(`${id}.pdf`);
      }
    }
    assets.push(entry);
  } catch (e) {
    problems.push(`${path.relative(SRC, a.src)}: ${String(e.message).split("\n")[0]}`);
  }
}

// ids must be unique; a clash gets a counter
const seen = new Map();
for (const a of assets) {
  const n = seen.get(a.id) ?? 0;
  seen.set(a.id, n + 1);
  if (n) problems.push(`duplicate id ${a.id}`);
}

// ── the budget: shrink the heaviest originals (2560, then 2048, then 1600 on the long edge), then drop the largest PDFs ──
const total = () => [...keep].reduce((s, p) => s + (fs.existsSync(p) ? bytes(p) : 0), 0);
// each pass brings the heaviest originals above that edge down to it, until the folder fits
for (const edge of [2560, 2048, 1600]) {
  if (total() <= BUDGET) break;
  const big = assets
    .filter((a) => a.type === "image" && Math.max(a.w, a.h) > edge)
    .sort((a, b) => bytes(path.join(ROOT, "public", b.original)) - bytes(path.join(ROOT, "public", a.original)));
  for (const a of big) {
    if (total() <= BUDGET) break;
    run("sips", ["-Z", String(edge), path.join(ROOT, "public", a.original)]);
    const s = edge / Math.max(a.w, a.h);
    Object.assign(a, { w: Math.round(a.w * s), h: Math.round(a.h * s) });
  }
}
// an original shrunk on an earlier run stays shrunk; read its real size back
for (const a of assets) {
  if (a.type !== "image") continue;
  const d = dims(path.join(ROOT, "public", a.original));
  Object.assign(a, { w: d.w, h: d.h });
}
if (total() > BUDGET) {
  const pdfs = assets.filter((a) => a.pdf).sort((a, b) => bytes(path.join(ROOT, "public", b.pdf)) - bytes(path.join(ROOT, "public", a.pdf)));
  for (const a of pdfs) {
    if (total() <= BUDGET) break;
    keep.delete(path.join(ROOT, "public", a.pdf));
    delete a.pdf;
  }
}
if (total() > BUDGET) problems.push("still over budget after dropping PDFs: lower ORIGINAL_EDGE");

// ── the OG image: the widest-ratio asset nearest 1.91:1, covered into 1200×630 ──
const og = path.join(OUT, "og.jpg");
const ogPick = assets
  .filter((a) => a.type === "image")
  .sort((a, b) => Math.abs(a.w / a.h - 1.905) - Math.abs(b.w / b.h - 1.905) || b.w - a.w)[0];
if (ogPick) {
  const src = path.join(ROOT, "public", ogPick.original);
  if (!fresh(og, src) || !fs.existsSync(`${og}`)) {
    run("ffmpeg", ["-v", "error", "-y", "-i", src, "-vf", "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630", "-q:v", "3", og]);
  }
  keep.add(og);
}

// ── remove what no longer has a source ──
function prune(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      prune(p);
      if (!fs.readdirSync(p).length) fs.rmdirSync(p);
    } else if (!keep.has(p)) fs.rmSync(p);
  }
}
prune(OUT);

// order: kinds in page order, then set, then the largest size first within a set
const kindRank = (k) => (KINDS.indexOf(k) < 0 ? 99 : KINDS.indexOf(k));
assets.sort((a, b) => kindRank(a.kind) - kindRank(b.kind) || a.group.localeCompare(b.group) || b.w * b.h - a.w * a.h);

fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });
fs.writeFileSync(JSON_OUT, `${JSON.stringify({ og: ogPick ? "/capy/og.jpg" : null, assets }, null, 1)}\n`);

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
const byKind = {};
for (const a of assets) byKind[a.kind] = (byKind[a.kind] ?? 0) + 1;
console.log(`capy-sync: ${assets.length} assets in ${new Set(assets.map((a) => a.group)).size} sets`, byKind);
console.log(`capy-sync: public/capy total ${mb(total())} (budget ${mb(BUDGET)})`);
if (problems.length) console.log(`capy-sync: ${problems.length} skipped\n  ${problems.join("\n  ")}`);
