"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties, type FocusEvent } from "react";
import type { Ad } from "@/content/ads";

// The hall's ads as a real list of links. With the live world it is invisible to the eye: each link sits in the hall's
// block at the scroll position where the camera faces its ad, so tabbing to one scrolls the camera to it, lights it
// in the scene and shows its caption. With the posters (phones, reduced motion, no WebGL) it is the hall itself, a
// strip of the ads to swipe and tap. Pictures load after the page has.

const line = (a: Ad) => a.alt.split(". ")[0].replace(/\.$/, "");

export function AdRing({ ads }: { ads: Ad[] }) {
  const [pics, setPics] = useState(false);
  useEffect(() => {
    const go = () => setPics(true);
    if (document.readyState === "complete") go();
    else addEventListener("load", go, { once: true });
    return () => removeEventListener("load", go);
  }, []);
  const face = (e: FocusEvent<HTMLAnchorElement>) => {
    if (e.currentTarget.closest("[data-world]")?.getAttribute("data-mode") === "live") e.currentTarget.parentElement?.scrollIntoView({ block: "center" });
  };
  const n = ads.length;
  return (
    <ul className="w-ads">
      {ads.map((a, i) => (
        <li key={a.id} style={{ "--f": i / Math.max(1, n - 1) } as CSSProperties}>
          <Link href={"/w/" + a.id} data-ad={i} onFocus={face}>
            {pics ? <Image src={a.src} alt="" width={a.w} height={a.h} sizes="(max-width: 767px) 74vw, 300px" /> : <span className="w-ad-ph" />}
            <span className="w-ad-cap">
              <b>{a.campaign}</b>
              <span>{line(a)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
