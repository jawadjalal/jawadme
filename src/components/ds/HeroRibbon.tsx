"use client";

import Link from "next/link";
import { useState } from "react";
import type { Ad } from "@/content/ads";
import { LogoRow } from "./LogoRow";
import { OrbitMarquee } from "./OrbitMarquee";

/** The ribbon, the logo row under it, and the ruled status line that follows the ad in front. */
export function HeroRibbon({ ads, captions }: { ads: Ad[]; captions: string[] }) {
  const [front, setFront] = useState(0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <>
      <div className="hx-ribbon">
        <OrbitMarquee ads={ads} onFront={setFront} />
      </div>
      <LogoRow />
      <div className="hx-status">
        <span className="hx-status-k">NOW SHOWING</span>
        <Link href={"/w/" + ads[front].id} className="hx-status-v">
          {captions[front]}
        </Link>
        <span className="hx-status-n">
          {pad(front + 1)} / {pad(ads.length)}
        </span>
        <Link href="/work" className="hx-status-all">
          ALL WORK ↗
        </Link>
      </div>
    </>
  );
}
