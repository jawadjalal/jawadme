"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { BookLink } from "@/components/BookLink";

type Piece = { id: string; src: string; w: number; h: number; alt: string; group: string; spec: boolean };
type At = { n: number; of: number; prev: string; next: string; strip: { id: string; sm: string; alt: string }[] } | null;

/** The piece full size on ink, its name and campaign in mono, previous and next by arrow keys or swipe, Escape
 *  back to the wall, and the call block in the corner. */
export function Viewer({ piece, at }: { piece: Piece; at: At }) {
  const router = useRouter();
  const touch = useRef<number | null>(null);
  useEffect(() => {
    if (at) {
      router.prefetch(`/w/${at.next}`);
      router.prefetch(`/w/${at.prev}`);
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/ads");
      if (!at) return;
      if (e.key === "ArrowRight") router.replace(`/w/${at.next}`, { scroll: false });
      if (e.key === "ArrowLeft") router.replace(`/w/${at.prev}`, { scroll: false });
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [at, router]);
  const headline = piece.alt.split(". ").slice(0, -1).join(". ") || piece.alt;
  return (
    <main
      className="viewer"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (!at || touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) router.replace(`/w/${dx < 0 ? at.next : at.prev}`, { scroll: false });
        touch.current = null;
      }}
    >
      <header className="v-top lbl">
        <Link href="/ads" className="v-close" aria-label="Back to all ads">
          ← All ads
        </Link>
        <h1 className="v-line">{headline}</h1>
        <span>{piece.group}</span>
        {piece.spec ? <span className="tag">Spec</span> : null}
        {at ? (
          <span className="v-count">
            [ {String(at.n).padStart(2, "0")} / {at.of} ]
          </span>
        ) : null}
      </header>
      <div className="v-stage">
        <Image key={piece.id} src={piece.src} width={piece.w} height={piece.h} alt={piece.alt} priority sizes="(min-width: 768px) 70vw, 100vw" quality={90} />
      </div>
      <footer className="v-bar">
        {at ? (
          <nav className="v-nav">
            <Link href={`/w/${at.prev}`} replace scroll={false} aria-label="Previous">
              ←
            </Link>
            <Link href={`/w/${at.next}`} replace scroll={false} aria-label="Next">
              →
            </Link>
          </nav>
        ) : null}
        {at ? (
          <nav className="v-strip" aria-label="More ads">
            {at.strip.map((s) => (
              <Link key={s.id} href={`/w/${s.id}`} replace scroll={false} aria-current={s.id === piece.id ? "page" : undefined}>
                <Image src={s.sm} width={88} height={110} alt={s.alt} sizes="44px" />
              </Link>
            ))}
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
