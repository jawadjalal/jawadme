"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import { BookLink } from "@/components/BookLink";
import { ViewerMoment } from "@/components/moments/viewer";

type Piece = { id: string; src: string; w: number; h: number; alt: string; line: string; group: string; credit: string; spec: boolean };
type Near = { id: string; src: string; w: number; h: number };
type At = { n: number; of: number; prev: Near; next: Near; strip: { id: string; sm: string; alt: string }[] } | null;

const SIZES = "(min-width: 1024px) 58vw, 100vw";

/** Warms the browser cache with the picture the next arrow press will show, at the size the stage will ask for. */
function warm(p: Near) {
  const { props } = getImageProps({ src: p.src, width: p.w, height: p.h, alt: "", sizes: SIZES, quality: 90 });
  preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: "low" });
}

/** The piece full size on ink, its name and campaign in mono, previous and next by arrow keys or swipe, Escape
 *  back to the wall, and the call block in the corner. */
export function Viewer({ piece, at }: { piece: Piece; at: At }) {
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
  const related = at?.strip.filter((item) => item.id !== piece.id).slice(1, 5) ?? [];
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
          ← All work
        </Link>
        {at ? <span>{at.n} / {at.of}</span> : null}
      </header>
      <div className="v-main">
        <ViewerMoment>
          <Image key={piece.id} src={piece.src} width={piece.w} height={piece.h} alt={piece.alt} priority sizes={SIZES} quality={90} style={{ viewTransitionName: "piece" }} />
        </ViewerMoment>
        <div className="v-info">
          <h1 className="v-title">{piece.line}</h1>
          <p>{`${piece.group}, ${piece.credit}.`}</p>
          {related.length ? (
            <nav className="v-strip" aria-label="More work">
              {related.map((item) => (
                <Link key={item.id} href={`/w/${item.id}`} replace scroll={false}>
                  <Image src={item.sm} width={160} height={200} alt={item.alt} sizes="(min-width: 1024px) 11vw, 1px" />
                </Link>
              ))}
            </nav>
          ) : null}
          {piece.spec ? <p className="disclose">Independent work. Not commissioned by or affiliated with the brands shown.</p> : null}
        </div>
      </div>
      <footer className="v-bar">
        {at ? (
          <nav className="v-nav">
            <Link href={`/w/${at.prev.id}`} replace scroll={false} aria-label="Previous">
              ←
            </Link>
            <Link href={`/w/${at.next.id}`} replace scroll={false} aria-label="Next">
              →
            </Link>
          </nav>
        ) : null}
        <BookLink src="viewer" className="dock-cta v-cta" cursor>
          <span>
            Book a call <span className="arr">↗</span>
          </span>
          <small>15 min, video</small>
        </BookLink>
      </footer>
    </main>
  );
}
