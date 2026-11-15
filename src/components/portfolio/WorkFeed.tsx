"use client";

// The wall of work: every piece in the manifest, packed into justified rows (each row's pieces share one height, so no
// picture is cropped), with the story lines between. The first pass is rendered on the server. When the visitor
// reaches its end, the wall goes on: the pictures come round again in a new order, one pass at a time, until MAX_PASSES,
// then it closes. Live components only appear in the first pass, so the repeats stay light.

import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { srcSetOf, type Entry, type Piece } from "@/content/feed";
import { pack, ratio, reshuffle, type Row } from "./pack";
import { StoryLine, type Look } from "./StoryLine";
import { SquircleButton } from "./SquircleButton";

const MAX_PASSES = 6;
const LOOK: Look = "sticker";
const LOOKS: Look[] = ["print", "sticker", "typed"];

/** A live component in a frame of its own ground colour. Each one is laid out for a small window (`stage` px wide),
 *  then scaled to fill its tile, so the component fills most of the frame instead of floating small in it. On a phone
 *  the frame is the phone's own width at 4:5 and nothing is scaled. */
function LiveFrame({ p }: { p: Extract<Piece, { embed: string }> }) {
  const box = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ w: number; h: number; s: number } | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const phone = matchMedia("(max-width: 560px)");
    const measure = () => {
      const tw = el.clientWidth;
      if (!tw) return;
      if (phone.matches || !p.stage) setFit({ w: tw, h: el.clientHeight, s: 1 });
      else setFit({ w: p.stage, h: p.stage / p.ratio, s: tw / p.stage });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    phone.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      phone.removeEventListener("change", measure);
    };
  }, [p.stage, p.ratio]);
  // the live page is mounted only while its frame is on screen (or about to be), so off-screen components, the hidden
  // copy of a drifting column and the wall that is not shown at this width cost nothing
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "160px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className="live-box" style={{ aspectRatio: String(p.ratio), background: p.ground }}>
      {on ? (
        <iframe
          src={`/components/${p.embed}.html`}
          title={p.name}
          style={fit ? { width: fit.w, height: fit.h, transform: `scale(${fit.s})`, background: p.ground } : { background: p.ground }}
        />
      ) : null}
    </div>
  );
}

/** How wide a picture shows in the plain wall (phones and narrow windows, up to 820px): wide pieces and every piece
 *  on a phone fill the width, the rest go two to a row. The drifting wall passes its own column widths. */
const FLOW_SIZES = { wide: "100vw", pair: "(max-width: 560px) 100vw, 50vw" };
/** the plain wall is shown up to 820px, the drifting wall above it */
export const FLOW_MEDIA = "(max-width: 820px)";
export const DRIFT_MEDIA = "(min-width: 821px)";
/** a 1px transparent gif: what a picture shows where its wall is hidden, so nothing is fetched for it */
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** Where a loop plays its 720 wide encode instead of the full 1280: phones on the plain wall, and the drifting wall's
 *  columns until the window is wide enough for a column to need more than 720 pixels at 2x. */
const LOOP_SMALL = { flow: "(max-width: 560px)", drift: "(max-width: 1800px)" };

/** A loop's encodes, best first. Where `small` matches: 720 wide at 30 fps, AV1 where the browser plays it (a fifth
 *  smaller again), H.264 everywhere else. Otherwise the full size H.264. Nothing is fetched until the video plays. */
export function LoopSources({ video, small }: { video: string; small: string }) {
  const b = `/work/2026-11/${video.replace(/\.mp4$/, "")}`;
  return (
    <>
      <source media={small} src={`${b}-720-av1.mp4`} type={'video/mp4; codecs="av01.0.04M.08"'} />
      <source media={small} src={`${b}-720.mp4`} type="video/mp4" />
      <source src={`${b}.mp4`} type="video/mp4" />
    </>
  );
}

/** Both walls are in the page and one is display:none, and a browser still fetches a hidden picture. So each picture
 *  names its wall (`media`): where the other wall shows, its <picture> picks a blank instead, and a phone never
 *  fetches the desktop wall (nor a laptop the phone's). `eager` marks a piece in the first screen of its wall; it is
 *  preloaded at high priority, again only where its wall shows. */
export function Tile({ p, eager, sizes, media = FLOW_MEDIA }: { p: Piece; eager?: boolean; sizes?: string; media?: string }) {
  const r = ratio(p);
  if ("embed" in p) {
    return (
      <figure className="tile tile-live" data-kind={p.kind} style={{ flexGrow: r }}>
        <LiveFrame p={p} />
        {p.caption ? <figcaption>{p.caption}</figcaption> : null}
      </figure>
    );
  }
  const base = `/work/2026-11/${p.file}`;
  const wide = r > 1.2;
  const srcSet = srcSetOf(p.file);
  const sz = sizes ?? (wide ? FLOW_SIZES.wide : FLOW_SIZES.pair);
  if (eager) {
    // a loop's poster has one size (the half size one, about as sharp as its 720 encode); it is still named as a srcset
    // so each wall's preload is its own (React keeps one preload per href, and per srcset and sizes)
    const set = p.video ? `${base}-sm.webp ${Math.round(p.w / 2)}w` : srcSet;
    preload(p.video ? `${base}-sm.webp` : `${base}.webp`, { as: "image", imageSrcSet: set, imageSizes: sz, fetchPriority: "high", media });
  }
  return (
    <figure
      className="tile"
      data-kind={p.kind}
      data-file={p.file}
      data-slides={p.slides ? p.slides.length + 1 : undefined}
      tabIndex={0}
      role="button"
      aria-label={`Open: ${p.alt}`}
      style={{ flexGrow: r }}
    >
      {p.video ? (
        <video
          data-loop=""
          poster={`${base}-sm.webp`}
          width={p.w}
          height={p.h}
          style={{ aspectRatio: `${p.w} / ${p.h}` }}
          muted
          loop
          playsInline
          preload="none"
          aria-label={p.alt}
        >
          <LoopSources video={p.video} small={media === DRIFT_MEDIA ? LOOP_SMALL.drift : LOOP_SMALL.flow} />
        </video>
      ) : (
        <picture>
          <source media={media === FLOW_MEDIA ? DRIFT_MEDIA : FLOW_MEDIA} srcSet={BLANK} />
          <img
            src={`${base}.webp`}
            srcSet={srcSet}
            sizes={sz}
            width={p.w}
            height={p.h}
            alt={p.alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            {...(eager ? { fetchPriority: "high" as const } : {})}
          />
        </picture>
      )}
      {p.slides ? (
        <span className="tile-badge" aria-hidden="true">
          <i />
          {p.slides.length + 1} slides
        </span>
      ) : p.video ? (
        <span className="tile-badge" aria-hidden="true">
          <i data-play="" />
          reel
        </span>
      ) : null}
      <figcaption className="tile-cap">
        <b>{p.brand}</b>
        {p.kind === "product" ? ", " : " "}
        {p.what}
        {p.unsolicited ? ", unsolicited" : ""}
      </figcaption>
    </figure>
  );
}

function Rows({ rows, href, look, storyFrom = 0 }: { rows: Row[]; href: string; look: Look; storyFrom?: number }) {
  let s = storyFrom;
  return (
    <>
      {rows.map((row, i) => {
        if (row.type === "story") {
          const n = s++;
          const st = row.story;
          return <StoryLine key={row.key} text={st.story} cta={st.cta} pic={st.pic} at={st.at} href={href} look={look} index={n} />;
        }
        return (
          <div key={row.key} className="row-wrap">
            <div className="row" data-count={row.pieces.length} data-family={row.pieces[0].kind}>
              {row.pieces.map((p) => (
                <Tile key={"file" in p ? p.file : p.embed} p={p} eager={storyFrom === 0 && i === 0} />
              ))}
            </div>
            {row.pieces[0].kind === "icon" ? (
              <p className="row-cap">
                <b>App icons</b>, live: {row.pieces.map((p) => ("name" in p ? p.name.replace(" app icon", "") : "")).join(", ")}
              </p>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

export function WorkFeed({ entries, href, closing, name }: { entries: Entry[]; href: string; closing: string; name: string }) {
  const first = pack(entries, "p0");
  const [passes, setPasses] = useState<Row[][]>([]);
  const [look, setLook] = useState<Look>(LOOK);
  const root = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const done = passes.length >= MAX_PASSES;

  // ?lines=print|sticker|typed shows the other looks of the story lines, so they can be compared on the real page
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("lines") as Look | null;
    if (q && LOOKS.includes(q)) setLook(q);
  }, []);

  // pieces fade and settle in once as they first enter; anything already on screen stays as it is
  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (seen) => {
        for (const e of seen) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.in = "";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    for (const t of el.querySelectorAll<HTMLElement>(".tile:not([data-seen]), .story:not([data-seen])")) {
      t.dataset.seen = "";
      if (t.getBoundingClientRect().top < innerHeight) continue;
      t.dataset.wait = "";
    }
    // everything still waiting (from this run or one before it) is watched again
    for (const t of el.querySelectorAll<HTMLElement>("[data-wait]:not([data-in])")) io.observe(t);
    return () => io.disconnect();
  }, [passes.length, look]);

  // video loops play only while they are on screen, and never with reduced motion or Save-Data (the poster stays). They
  // start once the page has loaded, so a loop never races the first screen of pictures (the poster shows until then).
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (document.readyState === "complete") return setLoaded(true);
    const on = () => setLoaded(true);
    addEventListener("load", on, { once: true });
    return () => removeEventListener("load", on);
  }, []);
  useEffect(() => {
    const el = root.current;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!el || !loaded || saveData || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (seen) => {
        for (const e of seen) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: 0.25 },
    );
    for (const v of el.querySelectorAll<HTMLVideoElement>("video[data-loop]")) io.observe(v);
    return () => io.disconnect();
  }, [passes.length, loaded]);

  useEffect(() => {
    const el = end.current;
    if (!el || done) return;
    const io = new IntersectionObserver(
      (seen) => {
        if (!seen.some((e) => e.isIntersecting)) return;
        setPasses((prev) => {
          if (prev.length >= MAX_PASSES) return prev;
          const n = prev.length + 1;
          // every other pass carries one line with the hire button, so a long scroll is never far from it
          const order: Entry[] = reshuffle(entries);
          if (n % 2 === 1) order.splice(Math.floor(order.length / 2) & ~1, 0, { story: closing, cta: true });
          return [...prev, pack(order, `p${n}`)];
        });
      },
      { rootMargin: "1600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [entries, closing, done]);

  const storiesInFirst = first.filter((r) => r.type === "story").length;

  return (
    <div className="feed" ref={root}>
      <Rows rows={first} href={href} look={look} />
      {passes.map((rows, i) => (
        <Rows key={i} rows={rows} href={href} look={look} storyFrom={storiesInFirst + i} />
      ))}
      <div ref={end} className="feed-end" aria-hidden="true" />
      {done ? (
        <footer className="feed-close">
          <p className="feed-close-name">{name}</p>
          <SquircleButton href={href} />
        </footer>
      ) : null}
    </div>
  );
}
