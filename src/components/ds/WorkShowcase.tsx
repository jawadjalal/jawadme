"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

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

/** Brass Hands–style pure visual showcase: almost zero chrome, ads & work fill the frame. */
export function WorkShowcase({
  items,
  totalAds,
  showBar = true,
}: {
  items: ShowcaseItem[];
  totalAds: number;
  showBar?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "ads", label: `Ads (${totalAds})` },
    { key: "brand-web", label: "Web & Brand" },
    { key: "3d-roblox", label: "3D & Roblox" },
  ];

  return (
    <section className="ws-sec" id={showBar ? "work" : undefined} aria-label="Selected work">
      {showBar ? (
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
            All {totalAds + 24}+ pieces ↗
          </Link>
        </div>
      ) : null}

      <div className="ws-grid">
        {visible.map((item) => {
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
            <Link key={item.id} href={item.href} className={"ws-card ws-card-pure " + spanClass}>
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
