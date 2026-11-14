#!/usr/bin/env node
// Syncs the Capy hackathon assets into the /capy page.
//
//   node scripts/capy-sync.mjs [--src /Users/jawadjalal/night/real/capyhack]
//
// Scans, in page order, strip2/ and strip3/ (the manga strips), v2/<idea>/ (the level-up rebuilds), elite/<idea>/,
// final/posters/<name>/, banners/, packs2/<pack>/ and packs/<pack>/ under the source folder, and for every finished file writes into
// public/capy/:
//   <kind>/<id>.webp   the web preview, long edge 1400 for strips and 1200 for the rest (alpha kept for stickers)
//   <kind>/<id>.jpg    the copy and download original, long edge capped at 2400, JPEG (92 for strips, 86 the rest)
//   <kind>/<id>.png    the same for stickers, badges and anything transparent
//   <kind>/<id>.mp4    videos and GIFs as they are, under 8 MB
// No PDFs. Over 250 MB, the heaviest originals outside the strips shrink first (the first elite round and the first
// flat packs before the rest), then GIFs that repeat an MP4 go, then the first elite round.
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

// previews: the strips at 1400 and up to 220 KB, everything else at 1200 and up to 160 KB
const PREVIEW = { strips: [1400, 220 * 1024], rest: [1200, 160 * 1024] };
const ORIGINAL_EDGE = 2400;
const MEDIA_MAX = 8 * 1024 * 1024;
const BUDGET = 248 * 1024 * 1024; // 250 MB is the cap; 2 MB of room for the OG image and rounding

const SKIP_DIRS = new Set(["src", "work", "assets", "fonts", "node_modules", ".git", "refs", "site"]);
const IMAGE = /\.(png|jpe?g|webp)$/i;
const VIDEO = /\.(mp4|mov|webm)$/i;
const GIF = /\.gif$/i;
const KINDS = ["strips", "rebuilds", "posters", "banners", "stickers", "wallpapers", "social", "badges", "signs", "slides", "motion"];

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
  const word = k.replace(dims[0], "").replace(/(^|-)in(?=-|$)/, "$1").replace(/^-+|-+$/g, "");
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

const skipFile = (f) => /sheet|contact|overview|^_|thumb/i.test(f);

/** One idea folder (elite/<idea> or final/posters/<name>): each PNG is a size, v2-/v3- prefixes are variations. */
function scanIdea(dir, kind, idea, out) {
  const files = list(dir).filter((f) => !isDir(path.join(dir, f)));
  for (const f of files) {
    if (!IMAGE.test(f) || skipFile(f)) continue;
    const variant = f.match(/^(v\d+)[-_]/i)?.[1]?.toLowerCase() ?? "";
    const rest = variant ? f.slice(variant.length + 1) : f;
    let key = rest.replace(/\.[a-z]+$/i, "").replace(/-?preview-?/i, "") || "poster";
    // "tankobon-15-social-1080x1920" in tankobon-15/ is the "social-1080x1920" size
    if (key.toLowerCase().startsWith(`${idea.toLowerCase()}-`)) key = key.slice(idea.length + 1);
    if (key === "") key = "poster";
    out.push({
      src: path.join(dir, f), kind, set: slug(`${idea}${variant ? `-${variant}` : ""}`),
      setTitle: titleCase(idea) + (variant ? ` ${variant}` : ""), key,
    });
  }
}

/** Files of a pack or the banners folder, recursively, minus the working folders. */
function walk(dir, acc = [], skip = SKIP_DIRS) {
  for (const f of list(dir)) {
    const p = path.join(dir, f);
    if (isDir(p)) {
      if (!skip.has(f.toLowerCase()) && !f.startsWith("_")) walk(p, acc, skip);
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

const SIZED = /^(.*?)[-_@]((?:(?:banner|poster|post|story|square|wide|tall|strip|rollup|hanger|tent)-)?\d+(?:\.\d+)?x\d+(?:\.\d+)?(?:in)?|\d{3,4}(?:px)?|phone|desktop|square|story|wide|tall|a\d)$/i;

const GENERIC = /^(preview|phone|desktop|poster|rollup|fourfive|final|image|cover|main|full|print|web|mobile|index|square|story|wide|tall)$/i;

/** A pack or the banners: "<name>-<size>.png" files in one folder are one design in sizes; anything else stands alone. */
function scanLoose(dir, kind, out, { tag = "", skip = SKIP_DIRS } = {}) {
  const manifest = readManifest(dir);
  for (const p of walk(dir, [], skip)) {
    const m = manifest.get(p) ?? {};
    const here = path.dirname(p);
    // "cover-24x36-preview", "preview-banner-33.5x80" and "x-header-1500x500-2x" name their size without the extras
    const base = path.basename(p).replace(/\.[a-z0-9]+$/i, "").replace(/-preview$|^preview-/i, "").replace(/-\d+x$/i, "").replace(/-\d+ppi$/i, "");
    let sized = base.match(SIZED);
    let name = String(m.group ?? m.set ?? (sized ? sized[1] : base));
    // "banners/03-manga-day/preview.png": a generic file name takes its folder's name, and the file name is its size
    if (!m.group && !m.set && here !== dir && GENERIC.test(base)) {
      name = path.basename(here).replace(/^\d+[-_]/, "");
      sized = [base, name, /^(preview|final|image|main|full|print|web|index)$/i.test(base) ? "" : base];
    }
    // "capy-sticker-go" in the stickers pack is just "go"; "b-s3-countdown" in a strip's posts shows as "Countdown"
    name = name.replace(new RegExp(`^capy[-_]${kind.replace(/s$/, "")}[-_]`, "i"), "");
    const shown = name
      .replace(/^b-s\d+-/i, "")
      .replace(/^sticker-\d+-/i, tag === "m" ? "" : "sticker-")
      .replace(tag === "m" ? /^(social|sign|badge|wallpaper)-(\d+-)?/i : /^$/, "")
      .replace(/^(am|pm)(\d{1,2})(\d{2})?$/i, (_, m, h, mm) => `${h}${mm ? `:${mm}` : ""} ${m.toLowerCase()}`)
      .replace(/^[a-c][-_](?=[a-z]{2})/i, "");
    out.push({
      src: p, kind, set: slug(`${kind}-${tag ? `${tag}-` : ""}${name}`),
      // "a-home-screen" is idea A, "Home screen"
      setTitle: typeof (m.title ?? m.name) === "string" ? m.title ?? m.name : titleCase(shown),
      key: sized ? sized[2] : typeof m.size === "string" ? m.size : "",
    });
  }
}

const found = [];
const hasPng = (d) => list(d).some((f) => /\.png$/i.test(f) && !skipFile(f));
// the manga strips lead the page: strip2 and strip3, minus their plates, sources, renders in progress and PDFs
const STRIP_SKIP = new Set([...SKIP_DIRS, "plates", "out", "gen"]);
for (const [folder, tag] of [["strip2", "s2"], ["strip3", "s3"]]) {
  const d = path.join(SRC, folder);
  if (isDir(d)) scanLoose(d, "strips", found, { tag, skip: STRIP_SKIP });
}
// the level-up rebuilds come second
const rebuilt = new Set();
for (const idea of list(path.join(SRC, "v2"))) {
  const d = path.join(SRC, "v2", idea);
  if (!isDir(d) || !hasPng(d)) continue;
  rebuilt.add(idea);
  scanIdea(d, "rebuilds", idea, found);
}
// the first elite round; an idea that has a rebuild is left out, and the rest goes first when the budget is tight
const ELITE = new Set();
for (const idea of list(path.join(SRC, "elite"))) {
  const d = path.join(SRC, "elite", idea);
  if (!isDir(d) || rebuilt.has(idea)) continue;
  const before = found.length;
  scanIdea(d, "posters", idea, found);
  for (const a of found.slice(before)) ELITE.add(a.src);
}
for (const name of list(path.join(SRC, "final/posters"))) {
  const d = path.join(SRC, "final/posters", name);
  if (!isDir(d)) continue;
  const before = found.length;
  scanIdea(d, "posters", name, found);
  for (const a of found.slice(before)) ELITE.add(a.src);
}
if (isDir(path.join(SRC, "banners"))) scanLoose(path.join(SRC, "banners"), "banners", found);
const packKind = (pack) => KINDS.find((k) => slug(pack).startsWith(k.replace(/s$/, ""))) ?? slug(pack);
// the manga-style packs (packs2) come ahead of the first flat packs inside each tab
for (const pack of list(path.join(SRC, "packs2"))) {
  const d = path.join(SRC, "packs2", pack);
  if (isDir(d) && pack !== "src") scanLoose(d, packKind(pack), found, { tag: "m" });
}
// the first flat packs; their flat-blue wallpapers and social cards are replaced by packs2 and left out,
// and the rest shrink first when the budget is tight
const OLD_PACK = new Set();
const REPLACED = new Set(["wallpapers", "social"]);
for (const pack of list(path.join(SRC, "packs"))) {
  const d = path.join(SRC, "packs", pack);
  if (!isDir(d) || REPLACED.has(packKind(pack))) continue;
  const before = found.length;
  scanLoose(d, packKind(pack), found);
  for (const a of found.slice(before)) OLD_PACK.add(a.src);
}

// ── building the outputs ────────────────────────────────────────────────────

fs.mkdirSync(OUT, { recursive: true });
const keep = new Set();
const assets = [];
const problems = [];

function makePreview(src, out, w, h, [PREVIEW_EDGE, PREVIEW_BYTES] = PREVIEW.rest) {
  if (fresh(out, src)) return;
  const tmp = `${out}.tmp.png`;
  let input = src;
  if (!/\.(png|jpe?g)$/i.test(src)) {
    run("sips", ["-s", "format", "png", src, "--out", tmp]);
    input = tmp;
  }
  const big = Math.max(w, h) > PREVIEW_EDGE;
  const resize = big ? (w >= h ? ["-resize", String(PREVIEW_EDGE), "0"] : ["-resize", "0", String(PREVIEW_EDGE)]) : [];
  for (const q of [78, 70, 62, 54, 46]) {
    run("cwebp", ["-quiet", "-q", String(q), "-m", "5", "-alpha_q", "90", ...resize, input, "-o", out]);
    if (bytes(out) <= PREVIEW_BYTES) break;
  }
  if (fs.existsSync(tmp)) fs.rmSync(tmp);
}

/**
 * Stickers, badges and anything named transparent keep their alpha as PNG when the file has an alpha channel;
 * everything else is a JPEG, at quality 92 for the strips and 86 for the rest.
 */
const hasAlpha = (f) => /hasAlpha: yes/.test(run("sips", ["-g", "hasAlpha", f]));
const needsAlpha = (a) => (/stickers|badges/.test(a.kind) || /sticker|transparent|cutout/i.test(a.src)) && hasAlpha(a.src);

function makeOriginal(src, out, w, h, quality) {
  if (fresh(out, src)) return;
  const png = /\.png$/i.test(out);
  if (png && /\.png$/i.test(src) && Math.max(w, h) <= ORIGINAL_EDGE) return fs.copyFileSync(src, out);
  const args = png ? ["-s", "format", "png"] : ["-s", "format", "jpeg", "-s", "formatOptions", String(quality)];
  if (Math.max(w, h) > ORIGINAL_EDGE) args.push("-Z", String(ORIGINAL_EDGE));
  run("sips", [...args, src, "--out", out]);
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
const elite = new Set();
const oldPack = new Set();
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
      else makePreview(a.src, prev, w, h, PREVIEW[a.kind] ?? PREVIEW.rest);
      keep.add(orig).add(prev);
      Object.assign(entry, { type: ext === "mp4" ? "video" : "gif", preview: rel(`${id}.webp`), original: rel(`${id}.${ext}`) });
    } else {
      const prev = path.join(dir, `${id}.webp`);
      const ext = needsAlpha(a) ? "png" : "jpg";
      const orig = path.join(dir, `${id}.${ext}`);
      makePreview(a.src, prev, w, h, PREVIEW[a.kind] ?? PREVIEW.rest);
      makeOriginal(a.src, orig, w, h, a.kind === "strips" ? 92 : 86);
      keep.add(prev).add(orig);
      if (ELITE.has(a.src)) elite.add(id);
      if (OLD_PACK.has(a.src)) oldPack.add(id);
      Object.assign(entry, { preview: rel(`${id}.webp`), original: rel(`${id}.${ext}`) });
      if (Math.max(w, h) > ORIGINAL_EDGE) {
        const s = ORIGINAL_EDGE / Math.max(w, h);
        Object.assign(entry, { w: Math.round(w * s), h: Math.round(h * s) });
      }
      // no PDFs on the page: the print files stay in the night folders
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

// ── the budget: shrink the heaviest originals outside the strips (2048, then 1600), drop GIFs that repeat an MP4,
// then drop the first elite round, largest first ──
const total = () => [...keep].reduce((s, p) => s + (fs.existsSync(p) ? bytes(p) : 0), 0);
const file = (a) => path.join(ROOT, "public", a.original);
// the first elite round and the first flat packs give way before anything else
const weak = (a) => (elite.has(a.id) ? 2 : oldPack.has(a.id) ? 1 : 0);
for (const edge of [2048, 1600]) {
  if (total() <= BUDGET) break;
  const big = assets
    .filter((a) => a.type === "image" && a.kind !== "strips" && Math.max(a.w, a.h) > edge)
    .sort((a, b) => weak(b) - weak(a) || bytes(file(b)) - bytes(file(a)));
  for (const a of big) {
    if (total() <= BUDGET) break;
    run("sips", ["-Z", String(edge), file(a)]);
  }
}
// in the first flat packs, a smaller copy of the same picture (a sticker at 1024 beside its 2048) is the weaker copy
if (total() > BUDGET) {
  const small = assets
    .filter((a) => oldPack.has(a.id) && assets.some((b) => b !== a && b.group === a.group && b.type === a.type && Math.abs(b.w / b.h - a.w / a.h) < 0.01 && b.w > a.w))
    .sort((a, b) => bytes(file(b)) - bytes(file(a)));
  for (const a of small) {
    if (total() <= BUDGET) break;
    keep.delete(file(a));
    keep.delete(path.join(ROOT, "public", a.preview));
    a.dropped = true;
  }
}
// a GIF whose loop is also here as an MP4 is the weaker copy
if (total() > BUDGET) {
  const dup = assets
    .filter((a) => a.type === "gif" && assets.some((b) => b.group === a.group && b.type === "video"))
    .sort((a, b) => bytes(file(b)) - bytes(file(a)));
  for (const a of dup) {
    if (total() <= BUDGET) break;
    keep.delete(file(a));
    keep.delete(path.join(ROOT, "public", a.preview));
    a.dropped = true;
  }
}
if (total() > BUDGET) {
  // a whole design at a time, the heaviest first, so no design is left with half its sizes
  const weight = new Map();
  for (const a of assets) if (elite.has(a.id)) weight.set(a.group, (weight.get(a.group) ?? 0) + bytes(file(a)));
  for (const [g] of [...weight].sort((x, y) => y[1] - x[1])) {
    if (total() <= BUDGET) break;
    for (const a of assets) {
      if (a.group !== g) continue;
      keep.delete(file(a));
      keep.delete(path.join(ROOT, "public", a.preview));
      a.dropped = true;
    }
  }
}
for (let i = assets.length - 1; i >= 0; i--) if (assets[i].dropped) assets.splice(i, 1);
// an original shrunk on an earlier run stays shrunk; read its real size back
for (const a of assets) {
  if (a.type !== "image") continue;
  const d = dims(file(a));
  Object.assign(a, { w: d.w, h: d.h });
}
if (total() > BUDGET) problems.push("still over budget: lower ORIGINAL_EDGE");

// ── the OG image: the widest-ratio asset nearest 1.91:1, covered into 1200×630 ──
const og = path.join(OUT, "og.jpg");
const ogPool = assets.filter((a) => a.type === "image" && a.kind === "strips");
const ogPick = (ogPool.length ? ogPool : assets.filter((a) => a.type === "image"))
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
const groupRank = new Map();
for (const a of assets) if (!groupRank.has(a.group)) groupRank.set(a.group, groupRank.size);
assets.sort((a, b) => kindRank(a.kind) - kindRank(b.kind) || groupRank.get(a.group) - groupRank.get(b.group) || b.w * b.h - a.w * a.h);
// two designs with one name in a kind take the word that sets them apart ("Crew pile, phone"), or else a number
const titles = new Map();
for (const g of groupRank.keys()) {
  const first = assets.find((a) => a.group === g);
  if (!first) continue;
  const k = `${first.kind}:${first.title}`;
  const before = titles.get(k);
  if (!before) {
    titles.set(k, [g]);
    continue;
  }
  before.push(g);
  const mine = g.split("-");
  const word = mine.find((t) => /^(phone|desktop|mobile|blue|white|black|dark|light)$/.test(t) && !before[0].split("-").includes(t));
  const tag = word ?? (mine.includes("s3") && !before[0].split("-").includes("s3") ? "strip 3" : String(before.length));
  for (const a of assets) if (a.group === g) a.title = word || tag === "strip 3" ? `${a.title}, ${tag}` : `${a.title} ${tag}`;
}

fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });
fs.writeFileSync(JSON_OUT, `${JSON.stringify({ og: ogPick ? "/capy/og.jpg" : null, assets }, null, 1)}\n`);

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
const byKind = {};
for (const a of assets) byKind[a.kind] = (byKind[a.kind] ?? 0) + 1;
console.log(`capy-sync: ${assets.length} assets in ${new Set(assets.map((a) => a.group)).size} sets`, byKind);
console.log(`capy-sync: public/capy total ${mb(total())} (budget ${mb(BUDGET)})`);
if (problems.length) console.log(`capy-sync: ${problems.length} skipped\n  ${problems.join("\n  ")}`);
