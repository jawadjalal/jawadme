"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export type ShowcaseItem = {
  id: string;
  href: string;
  title: string;
  category: "ads" | "brand-web" | "3d-roblox";
  src: string;
  w: number;
  h: number;
  alt: string;
  loop?: string;
  span: "full" | "half" | "third";
};

/** Pure, silent, Brass Hands–framed visual work wall with smooth scroll-reveal refresh.
 *  Zero filter pills, zero text overlays, zero chrome clutter. */
export function WorkShowcase({ items }: { items: ShowcaseItem[] }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".ws-card"));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      cards.forEach((c) => c.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "120px 0px 80px 0px", threshold: 0.01 },
    );

    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [items]);

  return (
    <section className="ws-sec" id="work" aria-label="Selected work">
      <div ref={gridRef} className="ws-grid">
        {items.map((item, idx) => {
          const spanClass =
            item.span === "full" ? "ws-full" : item.span === "third" ? "ws-third" : "ws-half";

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.title}
              className={"ws-card ws-card-pure " + spanClass}
              style={{ ["--delay" as string]: `${(idx % 4) * 50}ms` }}
            >
              <div className="ws-media">
                {item.loop ? (
                  <video
                    src={item.loop}
                    poster={item.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="ws-vid"
                  />
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.w}
                    height={item.h}
                    sizes={
                      spanClass === "ws-full"
                        ? "(min-width: 768px) 96vw, 100vw"
                        : spanClass === "ws-third"
                          ? "(min-width: 1280px) 24vw, (min-width: 768px) 32vw, 48vw"
                          : "(min-width: 768px) 48vw, 100vw"
                    }
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
