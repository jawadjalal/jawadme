"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { capable } from "./kit/gate";
import type { WorldAd } from "./scene";

// The stage behind the home page. First paint is a poster of the gate court before its fires are lit, rendered from
// the scene itself. Once the page has loaded, the live scene lights them in a wave out from the gate; without it, a
// lit poster fades in over the dark one. The other chambers' posters load after the page and cross-fade as the page
// reaches them. On a capable desktop GPU
// the live scene (./scene, three.js) loads once the page is idle and takes over. Phones, reduced motion, weak or
// software GPUs and no WebGL2 keep the posters. ?world=live|poster overrides the choice; ?shot=0..4 holds the camera
// on one shot (posters.mjs renders the posters that way) and ?snap drops the camera's easing (for screenshots).
//
// The camera follows five keys measured from the page's [data-world-stop] blocks: the gate (top of the page), the
// hall's start and end (its block's top meeting the top of the screen, its bottom meeting the bottom), the theatre
// (its block centred on the screen) and the landing (its block's bottom meeting the bottom of the screen).

const ROOMS = ["gate", "hall", "theatre", "river"] as const;
const roomOf = (p: number) => (p < 0.5 ? 0 : p < 2.5 ? 1 : p < 3.5 ? 2 : 3);

export function World({ ads }: { ads: WorldAd[] }) {
  const host = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [live, setLive] = useState(false);
  const [room, setRoom] = useState(0);
  const [later, setLater] = useState(false);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const el = host.current;
    const section = el?.closest<HTMLElement>("[data-world]");
    if (!el || !section) return;
    const q = new URLSearchParams(location.search);
    const w = q.get("world");
    const go3d = w === "live" || (w !== "poster" && capable());
    section.dataset.mode = go3d ? "live" : "poster";

    let keys = [0, 1, 2, 3, 4];
    const measure = () => {
      const at = (name: string) => section.querySelector<HTMLElement>('[data-world-stop="' + name + '"]')?.getBoundingClientRect();
      const [g, hl, t, r] = ["gate", "hall", "theatre", "river"].map(at);
      if (!g || !hl || !t || !r) return;
      const y = scrollY, vh = innerHeight;
      keys = [g.top + y, hl.top + y, hl.bottom + y - vh, t.top + y + t.height / 2 - vh / 2, r.bottom + y - vh].map((k) => Math.max(0, k));
    };
    const progress = () => {
      const y = scrollY;
      for (let i = 0; i < keys.length - 1; i++) if (y < keys[i + 1]) return i + Math.max(0, y - keys[i]) / Math.max(1, keys[i + 1] - keys[i]);
      return keys.length - 1;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    let raf = 0;
    const onScroll = () =>
      void (raf ||= requestAnimationFrame(() => {
        raf = 0;
        setRoom(roomOf(progress()));
      }));
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    let off: (() => void) | undefined;
    let dead = false;
    const shot = q.get("shot");
    const go = () => {
      setLater(true);
      if (!go3d) return setLit(true);
      import("./scene").then((m) => {
        if (dead) return;
        off = m.mount(el, {
          progress: shot === null ? progress : () => Number(shot),
          ads,
          small: innerWidth < 1100,
          still: shot !== null || q.has("snap"),
          dim: q.has("dim"),
          open: (id) => router.push("/w/" + id),
          ready: () => setLive(true),
        });
      });
    };
    const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 2500 }) : setTimeout(go, 300));
    if (document.readyState === "complete") idle();
    else addEventListener("load", idle, { once: true });
    return () => {
      dead = true;
      ro.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("load", idle);
      off?.();
    };
  }, [ads, router]);

  return (
    <div className={"world-stage" + (live ? " live" : "")} aria-hidden="true">
      {ROOMS.map((r, i) => (
        <picture key={r} className="world-poster" data-on={i === room ? "" : undefined}>
          {i === 0 || later ? (
            <>
              <source media="(max-width: 767px)" srcSet={"/world/poster/" + r + "-m.webp"} />
              <img src={"/world/poster/" + r + "-d.webp"} alt="" decoding="async" fetchPriority={i === 0 ? "high" : "low"} />
            </>
          ) : null}
        </picture>
      ))}
      {lit ? (
        <picture className="world-poster world-lit" data-on={room === 0 ? "" : undefined}>
          <source media="(max-width: 767px)" srcSet="/world/poster/gate-lit-m.webp" />
          <img src="/world/poster/gate-lit-d.webp" alt="" decoding="async" />
        </picture>
      ) : null}
      <div ref={host} className="world-gl" />
    </div>
  );
}
