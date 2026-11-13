"use client";

// The wall of work: every piece in the manifest, packed into justified rows (each row's pieces share one height, so no
// picture is cropped), with the story lines between. The first pass is rendered on the server. When the visitor
// reaches its end, the wall goes on: the pictures come round again in a new order, one pass at a time, until MAX_PASSES,
// then it closes. Live components only appear in the first pass, so the repeats stay light.

import { useEffect, useRef, useState } from "react";
import type { Entry, Piece } from "@/content/feed";
import { pack, ratio, reshuffle, type Row } from "./pack";
import { StoryLine, type Tone } from "./StoryLine";
import { SquircleButton } from "./SquircleButton";

const MAX_PASSES = 6;
const TONES: Tone[] = ["red", "cyan", "yellow"];

/** A live component in a frame. Each one is laid out for a small window (`stage` px wide), then scaled to fill its
 *  tile, so its type and controls read at the tile's size instead of floating small in a big empty frame. On a phone
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
  return (
    <div ref={box} className="live-box" style={{ aspectRatio: String(p.ratio) }}>
      <iframe
        src={`/components/${p.embed}.html`}
        title={p.name}
        loading="lazy"
        style={fit ? { width: fit.w, height: fit.h, transform: `scale(${fit.s})` } : undefined}
      />
    </div>
  );
}

function Tile({ p, eager }: { p: Piece; eager?: boolean }) {
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
  return (
    <figure className="tile" data-kind={p.kind} style={{ flexGrow: r }}>
      <img
        src={`${base}.webp`}
        srcSet={`${base}-sm.webp ${Math.round(p.w / 2)}w, ${base}.webp ${p.w}w`}
        sizes={wide ? "(max-width: 760px) 100vw, 70vw" : "(max-width: 760px) 100vw, 36vw"}
        width={p.w}
        height={p.h}
        alt={p.alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        {...(eager ? { fetchPriority: "high" as const } : {})}
      />
      <figcaption className="tile-tag">
        {p.brand}
        {p.unsolicited ? <span>unsolicited</span> : null}
      </figcaption>
    </figure>
  );
}

function Rows({ rows, href, storyFrom = 0 }: { rows: Row[]; href: string; storyFrom?: number }) {
  let s = storyFrom;
  return (
    <>
      {rows.map((row, i) => {
        if (row.type === "story") {
          const n = s++;
          return <StoryLine key={row.key} text={row.story.story} cta={row.story.cta} href={href} tone={TONES[n % TONES.length]} index={n} />;
        }
        return (
          <div key={row.key} className="row" data-count={row.pieces.length} data-family={row.pieces[0].kind}>
            {row.pieces.map((p) => (
              <Tile key={"file" in p ? p.file : p.embed} p={p} eager={storyFrom === 0 && i === 0} />
            ))}
          </div>
        );
      })}
    </>
  );
}

export function WorkFeed({ entries, href, closing, name }: { entries: Entry[]; href: string; closing: string; name: string }) {
  const first = pack(entries, "p0");
  const [passes, setPasses] = useState<Row[][]>([]);
  const end = useRef<HTMLDivElement>(null);
  const done = passes.length >= MAX_PASSES;

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
          if (n % 2 === 1) order.splice(Math.floor(order.length / 2), 0, { story: closing, cta: true });
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
    <div className="feed">
      <Rows rows={first} href={href} />
      {passes.map((rows, i) => (
        <Rows key={i} rows={rows} href={href} storyFrom={storiesInFirst + i} />
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
