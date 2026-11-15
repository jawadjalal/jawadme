"use client";

// The wall's muted loops (feed.ts `video`): the encodes a <video> chooses from, and when they play. Both walls use them.

import { useEffect, useState, type RefObject } from "react";

/** A loop's encodes, best first. Where `small` matches: 720 wide at 30 fps, AV1 where the browser plays it (a fifth
 *  smaller again), H.264 everywhere else. Otherwise the full size H.264. Nothing is fetched until the video plays. */
export function LoopSources({ video, small }: { video: string; small: string }) {
  const b = `/work/2026-11/${video.replace(/\.mp4$/, "")}`;
  return (
    <>
      <source media={small} src={`${b}-720-av1.mp4`} type={'video/mp4; codecs="av01.0.04M.08"'} />
      <source media={small} src={`${b}-720.mp4`} type="video/mp4" />
      <source src={`${b}.mp4`} type="video/mp4" />
    </>
  );
}

/** Loops under `root` play only while they are on screen, and never with reduced motion or Save-Data (the poster stays).
 *  They start once the page has loaded, so a loop never races the first screen of pictures. The first play reloads the
 *  video, so its <source media> is matched against the window as it is now, not as it was when the page was built (a
 *  phone turned from landscape to portrait gets the phone encode). `key` changes when new loops are drawn. */
export function useLoops(root: RefObject<HTMLElement | null>, key: unknown) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (document.readyState === "complete") return setLoaded(true);
    const on = () => setLoaded(true);
    addEventListener("load", on, { once: true });
    return () => removeEventListener("load", on);
  }, []);
  useEffect(() => {
    const el = root.current;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!el || !loaded || saveData || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (seen) => {
        for (const e of seen) {
          const v = e.target as HTMLVideoElement;
          if (!e.isIntersecting) {
            v.pause();
            continue;
          }
          if (!("picked" in v.dataset)) {
            v.dataset.picked = "";
            v.load();
          }
          v.play().catch(() => {});
        }
      },
      { threshold: 0.25 },
    );
    for (const v of el.querySelectorAll<HTMLVideoElement>("video[data-loop]")) io.observe(v);
    return () => io.disconnect();
  }, [root, loaded, key]);
}
