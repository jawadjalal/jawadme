"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export type ShowcaseItem = {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  category: "brand-web" | "ads" | "3d-roblox";
  disciplines: string;
  metric?: string;
  year: string;
  src: string;
  w: number;
  h: number;
  alt: string;
  loop?: string;
  span: "full" | "half" | "third";
};

type Filter = "all" | "brand-web" | "ads" | "3d-roblox";

/** Brass Hands–inspired dense visual work grid with Joyco-style bracketed category filters.
 *  Alternates monumental full-width showcase plates with 2-up and 3-up architectural bento tiles. */
export function WorkShowcase({
  items,
  totalAds,
}: {
  items: ShowcaseItem[];
  totalAds: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(
    () => ({
      all: items.length,
      "brand-web": items.filter((i) => i.category === "brand-web").length,
      ads: totalAds,
      "3d-roblox": items.filter((i) => i.category === "3d-roblox").length,
    }),
    [items, totalAds],
  );

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "ALL WORK", count: counts.all },
    { key: "brand-web", label: "BRAND & WEB", count: counts["brand-web"] },
    { key: "ads", label: "ADS", count: counts.ads },
    { key: "3d-roblox", label: "3D & ROBLOX", count: counts["3d-roblox"] },
  ];

  return (
    <section className="ws-sec" id="work" aria-labelledby="ws-heading">
      <div className="sec-head">
        <div className="sec-head-l">
          <span className="sec-idx">[02] // SELECTED ARCHIVE</span>
          <h2 id="ws-heading" className="sec-title">
            BUILT TO STOP SCROLLS.
          </h2>
        </div>
        <div className="sec-head-r">
          <div className="ws-filters" role="tablist" aria-label="Filter work by discipline">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={filter === t.key}
                className={"ws-tab" + (filter === t.key ? " is-active" : "")}
                onClick={() => setFilter(t.key)}
              >
                <span>{t.label}</span>
                <span className="ws-tab-n">[{t.count}]</span>
              </button>
            ))}
          </div>
          <Link href="/work" className="sec-all-link">
            FULL ARCHIVE ({totalAds + 24}+) ↗
          </Link>
        </div>
      </div>

      <div className="ws-grid">
        {visible.map((item, idx) => {
          const spanClass =
            filter === "all"
              ? item.span === "full"
                ? "ws-full"
                : item.span === "third"
                  ? "ws-third"
                  : "ws-half"
              : idx === 0
                ? "ws-full"
                : "ws-half";

          return (
            <Link key={item.id} href={item.href} className={"ws-card " + spanClass}>
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
                <span className="ws-corner tl" aria-hidden="true" />
                <span className="ws-corner br" aria-hidden="true" />
              </div>
              <div className="ws-foot">
                <div className="ws-foot-l">
                  <span className="ws-num">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="ws-name">{item.title}</span>
                  <span className="ws-sub">{item.subtitle}</span>
                </div>
                <div className="ws-foot-r">
                  <span className="ws-disc">{item.disciplines}</span>
                  {item.metric ? <span className="ws-metric">{item.metric}</span> : null}
                  <span className="ws-yr">{item.year} ↗</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
