"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import { Gilded } from "@/components/gilded/Gilded";

type Piece = { id: string; src: string; w: number; h: number; alt: string; line: string; group: string; credit: string; spec: boolean };
type Near = { id: string; src: string; w: number; h: number };
type At = { n: number; of: number; prev: Near; next: Near; strip: { id: string; sm: string; alt: string }[] } | null;
type Facts = { client: string; year?: number; role: string };

const SIZES = "(min-width: 1024px) 58vw, 100vw";

/** Warms the browser cache with the picture the next arrow press will show, at the size the stage will ask for. */
function warm(p: Near) {
  const { props } = getImageProps({ src: p.src, width: p.w, height: p.h, alt: "", sizes: SIZES, quality: 90 });
  preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: "low" });
}

/** The piece full size in a frame cut to its own shape, its name and facts beside it, previous and next beside the
 *  count (or by arrow keys and swipe), Escape back to the wall, and the call block in the corner. */
export function Viewer({ piece, at, facts }: { piece: Piece; at: At; facts: Facts }) {
  const router = useRouter();
  const back = "/work#" + piece.id;
  const touch = useRef<number | null>(null);
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
          <p>{`${piece.group}, ${piece.credit}.`}</p>
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
              <dt>role</dt>
              <dd>{facts.role}</dd>
            </div>
          </dl>
          {at?.strip.length ? (
            <nav className="v-strip" aria-label="more work">
              {at.strip.map((item) => (
                <Link key={item.id} href={`/w/${item.id}`} replace scroll={false}>
                  <Image src={item.sm} width={160} height={200} alt={item.alt} sizes="(min-width: 1024px) 11vw, 1px" />
                </Link>
              ))}
            </nav>
          ) : null}
          {piece.spec ? <p className="disclose">independent work. not commissioned by or affiliated with the brands shown.</p> : null}
        </div>
      </div>
      <footer className="v-bar">
        <span className="v-cta">
          <Gilded variant="cta" src="viewer" size="dock" />
        </span>
      </footer>
    </main>
  );
}
