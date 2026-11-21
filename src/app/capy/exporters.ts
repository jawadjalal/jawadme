// Exports, made in the browser from the files already on the site, so nothing new is stored. Every file carries the
// fan work line, as a comment and as a small caption.

import type { Asset, Piece, Rect } from "./arrange";

export const FAN_LINE =
  "Unofficial, unsolicited fan work by Jawad Jalal. Not made by or for Capy or YC. Capy's characters and logos belong to Capy.";
const SITE = "https://jawadjalal.com/capy";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function blobOf(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  return res.blob();
}

function dataUrl(b: Blob): Promise<string> {
  return new Promise((ok, no) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => no(r.error);
    r.readAsDataURL(b);
  });
}

export function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export const fileBase = (a: Asset) => `capy-${a.id}`;

/** A smaller copy made at request time by the site's image optimizer, so the page stores nothing new. */
export const sized = (url: string, w: 256 | 640 | 1080, q = 75) => `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=${q}`;

/** True vector or an image wrapped in SVG: none of the Capy pieces has a vector source today, so all of them wrap. */
export const isVector = (a: Asset) => Boolean(a.svg);
/** Videos export their poster frame as the picture; the loop itself is the PNG's sibling download on the site. */
const picture = (a: Asset) => (a.type === "image" ? a.original : a.preview);

/** The full file as a PNG: a PNG original as it is, anything else drawn through a canvas at its own size. */
export async function pngOf(a: Asset): Promise<Blob> {
  const blob = await blobOf(picture(a));
  if (blob.type === "image/png") return blob;
  const bmp = await createImageBitmap(blob);
  const c = document.createElement("canvas");
  c.width = bmp.width;
  c.height = bmp.height;
  c.getContext("2d")!.drawImage(bmp, 0, 0);
  return new Promise((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error("toBlob"))), "image/png"));
}

/** A standalone SVG at the piece's true size: the real vector where one exists, otherwise the file embedded in it. */
export async function svgOf(a: Asset): Promise<{ text: string; vector: boolean }> {
  if (a.svg) {
    const src = await (await blobOf(a.svg)).text();
    const body = src.replace(/^\s*<\?xml[^>]*\?>\s*/, "");
    return { text: `<?xml version="1.0" encoding="UTF-8"?>\n<!-- ${a.title}, ${a.size}. ${FAN_LINE} ${SITE} -->\n${body}`, vector: true };
  }
  const href = await dataUrl(await blobOf(picture(a)));
  const text = `<?xml version="1.0" encoding="UTF-8"?>
<!-- ${esc(a.title)}, ${esc(a.size)}. ${FAN_LINE} ${SITE} -->
<svg xmlns="http://www.w3.org/2000/svg" width="${a.w}" height="${a.h}" viewBox="0 0 ${a.w} ${a.h}">
<title>${esc(a.title)}, ${esc(a.size)}</title>
<desc>${esc(FAN_LINE)}</desc>
<image href="${href}" x="0" y="0" width="${a.w}" height="${a.h}" preserveAspectRatio="none"/>
</svg>
`;
  return { text, vector: false };
}

const PAGE_CSS = `*{box-sizing:border-box}html,body{margin:0;background:#141414;color:#ededed;font:15px/1.45 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
main{padding:32px 24px 24px}h1{margin:0 0 4px;font-size:20px;font-weight:650;letter-spacing:-.01em}
p{margin:0;color:#9a9a9a;font-size:13px}figure{margin:24px 0 0}img,video{display:block;max-width:100%;height:auto;margin:0 auto}`;

/** A self-contained page that shows the piece, the file inside it. */
export async function htmlOf(a: Asset): Promise<string> {
  const src = await dataUrl(await blobOf(picture(a)));
  return `<!doctype html>
<!-- ${esc(a.title)}, ${esc(a.size)}. ${FAN_LINE} ${SITE} -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(a.title)}, ${esc(a.size)}</title><style>${PAGE_CSS}</style></head>
<body><main><h1>${esc(a.title)}, ${esc(a.size)}</h1><p>${esc(FAN_LINE)} <a href="${SITE}#${a.id}" style="color:inherit">${SITE}</a></p>
<figure><img src="${src}" width="${a.w}" height="${a.h}" alt="${esc(a.title)}, ${esc(a.size)}"></figure></main></body></html>
`;
}

/** Several pieces as one sheet, laid out as they sit on the board. The sheet embeds the web previews to stay light. */
async function sheetParts(ps: Piece[], pad = 120) {
  const box = bounds(ps);
  const x0 = box.x - pad;
  const y0 = box.y - pad;
  // a few pieces embed the web previews; a big selection embeds 640 wide copies so the file stays sendable
  const src = (a: Asset) => (ps.length > 12 ? sized(a.preview, ps.length > 60 ? 256 : 640) : a.preview);
  const parts = await Promise.all(ps.map(async (p) => ({ p, href: await dataUrl(await blobOf(src(p.a))) })));
  return { W: Math.round(box.w + pad * 2), H: Math.round(box.h + pad * 2), x0, y0, parts };
}

export function bounds(ps: Rect[]): Rect {
  const x = Math.min(...ps.map((p) => p.x));
  const y = Math.min(...ps.map((p) => p.y));
  const r = Math.max(...ps.map((p) => p.x + p.w));
  const b = Math.max(...ps.map((p) => p.y + p.h));
  return { x, y, w: r - x, h: b - y };
}

export async function svgSheet(ps: Piece[]): Promise<string> {
  const { W, H, x0, y0, parts } = await sheetParts(ps);
  const cap = Math.round(Math.max(W, H) / 120);
  const imgs = parts
    .map(({ p, href }) => `<image href="${href}" x="${Math.round(p.x - x0)}" y="${Math.round(p.y - y0)}" width="${Math.round(p.w)}" height="${Math.round(p.h)}" preserveAspectRatio="none"><title>${esc(p.a.title)}, ${esc(p.a.size)}</title></image>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- ${ps.length} pieces from ${SITE}. ${FAN_LINE} -->
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + cap * 3}" viewBox="0 0 ${W} ${H + cap * 3}">
<desc>${esc(FAN_LINE)}</desc>
<rect width="100%" height="100%" fill="#141414"/>
${imgs}
<text x="${cap * 2}" y="${H + cap * 1.6}" fill="#8a8a8a" font-family="system-ui, sans-serif" font-size="${cap}">${esc(FAN_LINE)}</text>
</svg>
`;
}

export async function htmlSheet(ps: Piece[], title: string): Promise<string> {
  const { W, H, x0, y0, parts } = await sheetParts(ps);
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(4)}%`;
  const items = parts
    .map(
      ({ p, href }) =>
        `<a href="${SITE}#${p.a.id}" style="left:${pct(p.x - x0, W)};top:${pct(p.y - y0, H)};width:${pct(p.w, W)};height:${pct(p.h, H)}"><img src="${href}" alt="${esc(p.a.title)}, ${esc(p.a.size)}"></a>`,
    )
    .join("\n");
  return `<!doctype html>
<!-- ${esc(title)}. ${FAN_LINE} ${SITE} -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>${PAGE_CSS}
.board{position:relative;width:100%;aspect-ratio:${W}/${H};margin-top:24px}.board a{position:absolute;display:block}.board img{width:100%;height:100%;object-fit:fill}</style></head>
<body><main><h1>${esc(title)}</h1><p>${esc(FAN_LINE)} <a href="${SITE}" style="color:inherit">${SITE}</a></p>
<div class="board">
${items}
</div></main></body></html>
`;
}

/** The whole board as one page: every piece at thumbnail size, each linking to its full file on the site. */
export async function boardHtml(ps: Piece[], titles: { x: number; y: number; size: number; text: string }[], board: Rect): Promise<string> {
  const pad = board.w * 0.02;
  const W = board.w + pad * 2;
  const H = board.h + pad * 2;
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(4)}%`;
  const thumbs = await Promise.all(ps.map(async (p) => dataUrl(await blobOf(p.a.thumb ?? sized(p.a.preview, 256)))));
  const items = ps
    .map(
      (p, i) =>
        `<a href="${new URL(p.a.original, SITE).href}" style="left:${pct(p.x - board.x + pad, W)};top:${pct(p.y - board.y + pad, H)};width:${pct(p.w, W)};height:${pct(p.h, H)}"><img src="${thumbs[i]}" alt="${esc(p.a.title)}, ${esc(p.a.size)}" loading="lazy"></a>`,
    )
    .join("\n");
  const heads = titles
    .map((t) => `<h2 style="left:${pct(t.x - board.x + pad, W)};top:${pct(t.y - board.y + pad, H)};font-size:${((t.size / W) * 100).toFixed(3)}vw">${esc(t.text)}</h2>`)
    .join("\n");
  return `<!doctype html>
<!-- Capy hackathon assets, the whole board. ${FAN_LINE} ${SITE} -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Capy hackathon assets, the board</title><style>${PAGE_CSS}
.board{position:relative;width:100%;aspect-ratio:${W.toFixed(0)}/${H.toFixed(0)};margin-top:24px}.board a{position:absolute;display:block}
.board img{width:100%;height:100%;object-fit:fill}.board h2{position:absolute;margin:0;transform:translateY(-110%);font-weight:900;font-style:italic;text-transform:uppercase;line-height:.9;letter-spacing:-.01em;white-space:nowrap}</style></head>
<body><main><h1>Capy hackathon assets, the board</h1><p>${esc(FAN_LINE)} Each piece links to its full file. <a href="${SITE}" style="color:inherit">${SITE}</a></p>
<div class="board">
${heads}
${items}
</div></main></body></html>
`;
}

/** What is on screen now, drawn from the pictures the page already holds. */
export async function viewPng(
  w: number,
  h: number,
  dpr: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): Promise<Blob> {
  const c = document.createElement("canvas");
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#141414";
  ctx.fillRect(0, 0, w, h);
  draw(ctx);
  ctx.font = "500 12px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "#3a3a3a";
  ctx.textBaseline = "bottom";
  ctx.fillText(FAN_LINE, 16, h - 14);
  return new Promise((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error("toBlob"))), "image/png"));
}

/** Text to the clipboard; the promise goes straight into the ClipboardItem so Safari still counts the key or click. */
export async function copyText(make: Promise<string>): Promise<void> {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ "text/plain": make.then((t) => new Blob([t], { type: "text/plain" })) })]);
      return;
    } catch {
      /* fall back to writeText */
    }
  }
  await navigator.clipboard.writeText(await make);
}

export const mb = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/** Several pieces as one PNG, laid out as they sit on the board, no side longer than `max` pixels. */
export async function pngSheet(ps: Piece[], max = 8000): Promise<Blob> {
  const pad = 120;
  const box = bounds(ps);
  const W = box.w + pad * 2;
  const H = box.h + pad * 2;
  // under about 16 megapixels too, the most a phone's canvas will hold
  const k = Math.min(1, max / Math.max(W, H), Math.sqrt(16e6 / (W * H)));
  const c = document.createElement("canvas");
  c.width = Math.round(W * k);
  c.height = Math.round(H * k + 40);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#f3f0e8";
  ctx.fillRect(0, 0, c.width, c.height);
  const want = (p: Piece) => {
    const px = p.w * k;
    return px <= 256 ? sized(p.a.preview, 256) : px <= 640 ? sized(p.a.preview, 640) : p.a.preview;
  };
  // eight at a time, so a whole board does not fetch and decode 376 pictures at once
  const todo = [...ps];
  const worker = async () => {
    for (let p = todo.shift(); p; p = todo.shift()) {
      const bmp = await createImageBitmap(await blobOf(want(p)));
      ctx.drawImage(bmp, (p.x - box.x + pad) * k, (p.y - box.y + pad) * k, p.w * k, p.h * k);
      bmp.close();
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  ctx.font = "500 14px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "#6b6b6b";
  ctx.textBaseline = "bottom";
  ctx.fillText(FAN_LINE, 16, c.height - 14);
  return new Promise((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error("toBlob"))), "image/png"));
}
