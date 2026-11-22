"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import { Gilded } from "@/components/gilded/Gilded";

type Piece = { id: string; src: string; w: number; h: number; alt: string; line: string; group: string; credit: string; kind: string; spec: boolean };
type Near = { id: string; src: string; w: number; h: number };
type At = { n: number; of: number; prev: Near; next: Near; strip: { id: string; sm: string; alt: string }[] } | null;
type Facts = { client: string; year?: number; format: string; of?: string };

const SIZES = "(min-width: 1024px) 58vw, 100vw";

/** Warms the browser cache with the picture the next arrow press will show, at the size the stage will ask for. */
function warm(p: Near) {
  const { props } = getImageProps({ src: p.src, width: p.w, height: p.h, alt: "", sizes: SIZES, quality: 90 });
  preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: "low" });
}

/** The piece full size in a frame cut to its own shape, its name, picture and facts beside it with the rest of its
 *  campaign, previous and next beside the count (under the picture on a phone, or by arrow keys and swipe), Escape back
 *  to the wall, and the call block in the corner. */
export function Viewer({ piece, at, facts }: { piece: Piece; at: At; facts: Facts }) {
  const router = useRouter();
  const back = "/work#" + piece.id;
  const touch = useRef<number | null>(null);
  const said = piece.alt.startsWith(piece.line + ". ") ? piece.alt.slice(piece.line.length + 2) : piece.alt;
  useEffect(() => {
    if (at) {
      router.prefetch(`/w/${at.next.id}`);
      router.prefetch(`/w/${at.prev.id}`);
      warm(at.next);
      warm(at.prev);
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push(back);
      if (!at) return;
      if (e.key === "ArrowRight") router.replace(`/w/${at.next.id}`, { scroll: false });
      if (e.key === "ArrowLeft") router.replace(`/w/${at.prev.id}`, { scroll: false });
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [at, router, back]);
  return (
    <main
      className="viewer"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (!at || touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) router.replace(`/w/${dx < 0 ? at.next.id : at.prev.id}`, { scroll: false });
        touch.current = null;
      }}
    >
      <header className="bar v-top">
        <Link href={back} className="v-close">
          ← all work
        </Link>
        {at ? (
          <nav className="v-nav" aria-label="pieces">
            <Gilded variant="pill" href={`/w/${at.prev.id}`}>
              ← prev
            </Gilded>
            <span className="v-count">
              {at.n} / {at.of}
            </span>
            <Gilded variant="pill" href={`/w/${at.next.id}`}>
              next →
            </Gilded>
          </nav>
        ) : null}
      </header>
      <div className="v-main">
        <div className="v-pic">
          <div className="v-stage" style={{ aspectRatio: `${piece.w} / ${piece.h}`, ["--ar" as string]: piece.w / piece.h }}>
            <Image key={piece.id} src={piece.src} width={piece.w} height={piece.h} alt={piece.alt} priority sizes={SIZES} quality={90} style={{ viewTransitionName: "piece" }} />
          </div>
        </div>
        <div className="v-info">
          <h1 className="v-title">{piece.line}</h1>
          <p className="v-said">{said}</p>
          <dl className="v-facts">
            <div>
              <dt>client</dt>
              <dd>{facts.client}</dd>
            </div>
            {facts.year ? (
              <div>
                <dt>year</dt>
                <dd>{facts.year}</dd>
              </div>
            ) : null}
            <div>
              <dt>work</dt>
              <dd>{piece.kind}</dd>
            </div>
            <div>
              <dt>format</dt>
              <dd>{facts.format}</dd>
            </div>
            {facts.of ? (
              <div>
                <dt>piece</dt>
                <dd>{facts.of}</dd>
              </div>
            ) : null}
            <div>
              <dt>credit</dt>
              <dd>{piece.credit}</dd>
            </div>
          </dl>
          {at?.strip.length ? (
            <nav className="v-strip" aria-label={piece.group} style={{ ["--n" as string]: at.strip.length > 4 ? Math.ceil(at.strip.length / 2) : at.strip.length }}>
              {at.strip.map((item) => (
                <Link key={item.id} href={`/w/${item.id}`} replace scroll={false} aria-current={item.id === piece.id ? "page" : undefined}>
                  <Image src={item.sm} width={160} height={200} alt={item.alt} sizes="(min-width: 1024px) 14vw, 1px" />
                </Link>
              ))}
            </nav>
          ) : null}
          {piece.spec ? <p className="disclose">independent work. not commissioned by or affiliated with the brands shown.</p> : null}
        </div>
        {at ? (
          <nav className="v-step" aria-label="pieces">
            <Gilded variant="pill" href={`/w/${at.prev.id}`}>
              ← prev
            </Gilded>
            <Gilded variant="pill" href={`/w/${at.next.id}`}>
              next →
            </Gilded>
          </nav>
        ) : null}
      </div>
      <footer className="v-bar">
        <span className="v-cta">
          <Gilded variant="cta" src="viewer" size="dock" />
        </span>
      </footer>
    </main>
  );
}
