"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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

type Filter = "all" | "ads" | "brand-web" | "3d-roblox";

/** Brass Hands–framed visual work grid with smooth scroll-reveal refresh on every card. */
export function WorkShowcase({
  items,
  totalAds,
}: {
  items: ShowcaseItem[];
  totalAds: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const gridRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  // Smooth scroll-reveal refresh as cards enter the viewport
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".ws-card"));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      cards.forEach((c) => c.classList.add("is-in"));
      return;
    }

    cards.forEach((c) => c.classList.remove("is-in"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );

    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [visible]);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "ALL" },
    { key: "ads", label: `ADS (${totalAds})` },
    { key: "brand-web", label: "WEB & BRAND" },
    { key: "3d-roblox", label: "3D & ROBLOX" },
  ];

  return (
    <section className="ws-sec" id="work" aria-label="Selected work">
      <div className="ws-bar">
        <div className="ws-filters" role="tablist" aria-label="Filter work">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={filter === t.key}
              className={"ws-tab" + (filter === t.key ? " is-active" : "")}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Link href="/work" className="ws-more">
          ALL WORK ({totalAds + 24}+) ↗
        </Link>
      </div>

      <div ref={gridRef} className="ws-grid">
        {visible.map((item, idx) => {
          const spanClass =
            filter === "all"
              ? item.span === "full"
                ? "ws-full"
                : item.span === "third"
                  ? "ws-third"
                  : "ws-half"
              : filter === "ads"
                ? "ws-third"
                : "ws-half";

          return (
            <Link
              key={item.id}
              href={item.href}
              className={"ws-card ws-card-pure " + spanClass}
              style={{ ["--delay" as string]: `${(idx % 3) * 60}ms` }}
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
                          ? "(min-width: 768px) 32vw, 100vw"
                          : "(min-width: 768px) 48vw, 100vw"
                    }
                  />
                )}
              </div>
              <span className="ws-cap">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
