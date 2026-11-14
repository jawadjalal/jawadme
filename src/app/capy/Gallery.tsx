"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type Asset = {
  id: string;
  title: string;
  group: string;
  kind: string;
  size: string;
  w: number;
  h: number;
  type: "image" | "video" | "gif";
  preview: string;
  original: string;
  pdf?: string;
};

type CopyState = "idle" | "busy" | "image" | "link" | "failed";

const LABEL: Record<CopyState, string> = {
  idle: "copy",
  busy: "copying",
  image: "copied",
  link: "link copied",
  failed: "copy failed",
};

/** The original as a PNG blob: fetched, and drawn through a canvas when the file is not already a PNG. */
async function pngBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const blob = await res.blob();
  if (blob.type === "image/png") return blob;
  const bmp = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0);
  return new Promise((ok, no) => canvas.toBlob((b) => (b ? ok(b) : no(new Error("toBlob"))), "image/png"));
}

/** Copies the image itself; videos, GIFs and anything that fails fall back to the file's URL. */
async function copyAsset(a: Asset): Promise<CopyState> {
  const url = new URL(a.original, location.href).href;
  if (a.type === "image" && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      // the promise goes straight into the ClipboardItem so Safari still counts the click as the gesture
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob(a.original) })]);
      return "image";
    } catch {
      /* fall through to the link */
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "link";
  } catch {
    return "failed";
  }
}

function useCopy(a: Asset) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = useCallback(async () => {
    clearTimeout(timer.current);
    setState("busy");
    const s = await copyAsset(a);
    setState(s);
    timer.current = setTimeout(() => setState("idle"), 1800);
  }, [a]);
  return [state, copy] as const;
}

function fileName(a: Asset, url = a.original) {
  return `capy-${a.id}.${url.split(".").pop()}`;
}

/** Plays a video only while it is on screen, muted. */
function useInView<T extends HTMLElement>(on: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!on || !el || !(el instanceof HTMLVideoElement)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [on]);
  return ref;
}

function Media({ a, eager }: { a: Asset; eager?: boolean }) {
  const video = useInView<HTMLVideoElement>(a.type === "video");
  const [loaded, setLoaded] = useState(false);
  if (a.type === "video") {
    return (
      <video
        ref={video}
        className="cp-media"
        src={a.original}
        poster={a.preview}
        width={a.w}
        height={a.h}
        muted
        loop
        playsInline
        preload="none"
        aria-label={`${a.title}, ${a.size}`}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="cp-media"
      data-loaded={loaded || undefined}
      ref={(el) => {
        if (el?.complete) setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      src={a.type === "gif" ? a.original : a.preview}
      width={a.w}
      height={a.h}
      alt={`${a.title}, ${a.size}`}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}

function Actions({ a, big }: { a: Asset; big?: boolean }) {
  const [state, copy] = useCopy(a);
  return (
    <span className="cp-actions" data-big={big || undefined}>
      <button type="button" className="cp-copy" data-state={state} onClick={copy} aria-live="polite">
        {LABEL[state]}
      </button>
      <a className="cp-dl" href={a.original} download={fileName(a)}>
        download
      </a>
      {big && a.pdf ? (
        <a className="cp-dl" href={a.pdf} download={fileName(a, a.pdf)}>
          print pdf
        </a>
      ) : null}
    </span>
  );
}

/** One tile. `r` is the box's aspect; very tall pieces (a 33.5 × 80 banner) sit contained in a wider box. */
function Tile({ a, r, width, onOpen, eager, named }: { a: Asset; r: number; width?: number; onOpen: (a: Asset) => void; eager: boolean; named?: boolean }) {
  return (
    <figure className="cp-tile" style={(width ? { width } : { "--r": r }) as React.CSSProperties}>
      <button type="button" className="cp-frame" onClick={() => onOpen(a)} aria-label={`Open ${a.title}, ${a.size}`}>
        <span className="cp-box" style={{ aspectRatio: `${r}` }}>
          <Media a={a} eager={eager} />
        </span>
      </button>
      <figcaption className="cp-cap">
        <span className="cp-size" title={named ? `${a.title}, ${a.size}` : a.size}>{named ? a.title : a.size}</span>
        <Actions a={a} />
      </figcaption>
    </figure>
  );
}

/** Splits aspects, in order, into k rows whose aspect sums sit as close to the even share as possible. */
function partition(rs: number[], k: number): number[][] {
  const n = rs.length;
  if (k >= n) return rs.map((_, i) => [i]);
  const pre = [0];
  for (const r of rs) pre.push(pre[pre.length - 1] + r);
  const cost = (i: number, j: number) => pre[j] - pre[i];
  const even = pre[n] / k;
  // best[j][m]: least squared distance from the even share, for the first j items in m rows
  const best = Array.from({ length: n + 1 }, () => new Array<number>(k + 1).fill(Infinity));
  const cut = Array.from({ length: n + 1 }, () => new Array<number>(k + 1).fill(0));
  best[0][0] = 0;
  for (let j = 1; j <= n; j++)
    for (let m = 1; m <= Math.min(k, j); m++)
      for (let i = m - 1; i < j; i++) {
        const v = best[i][m - 1] + (cost(i, j) - even) ** 2;
        if (v < best[j][m]) {
          best[j][m] = v;
          cut[j][m] = i;
        }
      }
  const rows: number[][] = [];
  for (let j = n, m = k; m > 0; m--) {
    const i = cut[j][m];
    rows.unshift(Array.from({ length: j - i }, (_, x) => i + x));
    j = i;
  }
  return rows;
}

/**
 * Justified rows: every row runs the full width and its pieces share one height, so a 33.5 × 80 banner, a 2560 × 1080
 * strip and an A4 sit together without gaps. Until the width is measured it falls back to wrapping flex rows.
 */
function Rows({ items, onOpen, eagerFrom, named }: { items: Asset[]; onOpen: (a: Asset) => void; eagerFrom: number; named?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const phone = W > 0 && W < 600;
  const target = phone ? 230 : W < 1100 ? 320 : 400;
  const gap = phone ? 12 : 18;
  const minR = phone ? 150 / target : 0.42;
  // a 48:1 lanyard strip sits contained in a 5:1 box, so it cannot swallow the row count of everything beside it
  const rs = items.map((a) => Math.min(Math.max(a.w / a.h, minR), 5));

  if (!W) {
    return (
      <div className="cp-rows" ref={ref}>
        {items.map((a, i) => (
          <Tile key={a.id} a={a} r={rs[i]} onOpen={onOpen} eager={eagerFrom + i < 4} named={named} />
        ))}
      </div>
    );
  }
  const total = rs.reduce((s, r) => s + r, 0);
  const k = Math.max(1, Math.min(items.length, Math.round((total * target) / W)));
  // a phone holds two pieces a row, so every caption keeps room for its two actions
  const rows = phone
    ? Array.from({ length: Math.ceil(items.length / 2) }, (_, i) => [2 * i, 2 * i + 1].filter((x) => x < items.length))
    : partition(rs, k);
  return (
    <div className="cp-rows cp-rows-on" ref={ref}>
      {rows.map((row) => {
        const sum = row.reduce((s, i) => s + rs[i], 0);
        // a row of one or two pieces would grow too tall; cap it and leave the rest of the row as space
        const h = Math.min((W - gap * (row.length - 1)) / sum, target * 1.45);
        return (
          <div className="cp-row" key={row[0]} style={{ gap }}>
            {row.map((i) => (
              <Tile key={items[i].id} a={items[i]} r={rs[i]} width={Math.floor(rs[i] * h)} onOpen={onOpen} eager={eagerFrom + i < 4} named={named} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Lightbox({ a, sizes, onPick, onClose }: { a: Asset; sizes: Asset[]; onPick: (a: Asset) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = sizes.findIndex((s) => s.id === a.id);
      if (e.key === "ArrowRight" && i < sizes.length - 1) onPick(sizes[i + 1]);
      if (e.key === "ArrowLeft" && i > 0) onPick(sizes[i - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [a, sizes, onPick]);
  return (
    <dialog
      ref={ref}
      className="cp-lb"
      aria-label={`${a.title}, ${a.size}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("cp-lb-stage")) onClose();
      }}
    >
      <div className="cp-lb-bar">
        <h2 className="cp-lb-title">
          {a.title} <span>{a.size}</span>
        </h2>
        <button type="button" className="cp-close" onClick={onClose}>
          close
        </button>
      </div>
      <div className="cp-lb-stage">
        <Media key={a.id} a={a} eager />
      </div>
      <div className="cp-lb-foot">
        {sizes.length > 1 ? (
          <div className="cp-sizes" role="group" aria-label="Sizes">
            {sizes.map((s) => (
              <button key={s.id} type="button" aria-pressed={s.id === a.id} onClick={() => onPick(s)}>
                <span className="cp-thumb" style={{ aspectRatio: `${s.w / s.h}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.preview} alt="" loading="lazy" />
                </span>
                {s.size}
                {s.type === "video" ? " MP4" : s.type === "gif" ? " GIF" : ""}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <div className="cp-lb-actions">
          <span className="cp-px">
            {a.w} × {a.h}
          </span>
          <Actions key={a.id} a={a} big />
        </div>
      </div>
    </dialog>
  );
}

const KIND_NAME: Record<string, string> = {
  strips: "Manga strips",
  rebuilds: "Level-up rebuilds",
  posters: "Posters",
  banners: "Banners",
  stickers: "Stickers",
  wallpapers: "Wallpapers",
  social: "Social",
  badges: "Badges",
  signs: "Signs",
  slides: "Slides",
  motion: "Motion",
};
const typeRank = { video: 0, image: 1, gif: 2 } as const;
/** The pieces of a design worth a tile each: one per aspect, the video first, then the largest. */
function faces(g: Asset[]): Asset[] {
  const by = new Map<string, Asset>();
  for (const a of g) {
    const key = (a.w / a.h).toFixed(2);
    const b = by.get(key);
    if (!b || typeRank[a.type] < typeRank[b.type] || (a.type === b.type && a.w * a.h > b.w * b.h)) by.set(key, a);
  }
  return g.filter((a) => [...by.values()].includes(a));
}

const kindName = (k: string) => KIND_NAME[k] ?? k.charAt(0).toUpperCase() + k.slice(1).replace(/-/g, " ");

export function Gallery({ assets, kinds, total, sets }: { assets: Asset[]; kinds: string[]; total: number; sets: number }) {
  const [kind, setKind] = useState<string>("all");
  const [open, setOpen] = useState<Asset | null>(null);

  const byKind = useMemo(() => {
    const m = new Map<string, Map<string, Asset[]>>();
    for (const a of assets) {
      const k = m.get(a.kind) ?? new Map<string, Asset[]>();
      k.set(a.group, [...(k.get(a.group) ?? []), a]);
      m.set(a.kind, k);
    }
    return m;
  }, [assets]);
  const sizesOf = useCallback((a: Asset) => byKind.get(a.kind)?.get(a.group) ?? [a], [byKind]);

  // a link to /capy#<asset id> opens that asset
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    const hit = id && assets.find((a) => a.id === id);
    if (hit) setOpen(hit);
  }, [assets]);
  useEffect(() => {
    const url = open ? `#${open.id}` : location.pathname + location.search;
    history.replaceState(null, "", url);
  }, [open]);

  const shown = kind === "all" ? kinds : [kind];
  let n = 0;

  if (!assets.length) {
    return <p className="cp-empty">The first assets land here tonight.</p>;
  }

  return (
    <main className="cp-main">
      <nav className="cp-filter" aria-label="Kinds">
        <div className="cp-filter-in">
          <button type="button" aria-pressed={kind === "all"} onClick={() => setKind("all")}>
            All <span>{total}</span>
          </button>
          {kinds.map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>
              {kindName(k)} <span>{[...(byKind.get(k)?.values() ?? [])].flat().length}</span>
            </button>
          ))}
          <span className="cp-count">
            {total} files in {sets} designs
          </span>
        </div>
      </nav>

      {shown.map((k) => {
        const groups = [...(byKind.get(k)?.entries() ?? [])];
        const files = groups.reduce((s, [, g]) => s + g.length, 0);
        // a kind of single files (stickers, badges) flows as one wall; a kind of designs in sizes gets a row per design
        // designs made in several sizes get a block each; single pieces (badges, table tents) flow as one wall after them
        // one tile per shape: a sticker at 1024 and 2048, or a loop as MP4 and GIF, is one piece with sizes in its view
        const shown = groups.map(([gid, g]) => [gid, faces(g)] as const);
        const multi = shown.filter(([, g]) => g.length > 1);
        const singles = shown.filter(([, g]) => g.length === 1).map(([, g]) => g[0]);
        return (
          <section key={k} className="cp-kind" aria-labelledby={`k-${k}`}>
            <h2 id={`k-${k}`} className="cp-kind-title">
              {kindName(k)} <span>{multi.length ? `${groups.length} designs, ${files} files` : files}</span>
            </h2>
            {multi.map(([gid, g]) => (
              <div key={gid} className="cp-set">
                <h3 className="cp-set-title">
                  {g[0].title} <span>{sizesOf(g[0]).length} sizes</span>
                </h3>
                <Rows items={g} onOpen={setOpen} eagerFrom={(n += g.length) - g.length} />
              </div>
            ))}
            {singles.length ? (
              <div className="cp-set">
                {multi.length ? <h3 className="cp-set-title">More {kindName(k).toLowerCase()}</h3> : null}
                <Rows named items={singles} onOpen={setOpen} eagerFrom={(n += singles.length) - singles.length} />
              </div>
            ) : null}
          </section>
        );
      })}

      {open ? <Lightbox a={open} sizes={sizesOf(open)} onPick={setOpen} onClose={() => setOpen(null)} /> : null}
    </main>
  );
}
