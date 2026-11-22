"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { adById, type Ad } from "@/content/ads";
import { AdDialog } from "./AdDialog";
import { Flames } from "./kit/Flames";
import { want3d } from "./kit/gate";
import type { RoomBanner } from "./rooms";
import type { WorldAd } from "./scene";

// The stage behind the home page. First paint is a poster of the gate court before its fires are lit, rendered from
// the scene itself. Once the page has loaded, the live scene lights them in a wave out from the gate; without it, a
// lit poster fades in over the dark one. The other chambers' posters load after the page and cross-fade as the page
// reaches them. A lit poster's flames are a CSS flipbook (./kit/Flames), and the posters drift slowly with the page. The live scene (./scene, three.js) loads once the page is idle and takes over on a desktop GPU
// (./kit/gate). Phones, tablets, reduced motion, Save-Data, weak or software GPUs and no WebGL2 keep the posters, and
// three.js never loads. ?world=live|poster overrides the choice; ?shot=0..4 holds the camera
// on one shot (posters.mjs renders the posters that way) and ?snap drops the camera's easing (for screenshots).
//
// Each time the chamber in view changes, window gets a "world:chamber" event with "court", "hall", "theatre" or
// "river" as its detail (for analytics).
//
// ?world=rooms mounts the baked chambers (./rooms) instead of today's world, on the live tier only. Their banners get
// real anchors laid over them (moved onto the banners by the scene every frame); a click or Enter opens the ad
// full-screen in a dialog (./AdDialog). The rooms end at the hall, so the theatre and the river keep their posters.
//
// The camera follows five keys measured from the page's [data-world-stop] blocks: the gate (top of the page), the
// hall's start and end (its block's top meeting the top of the screen, its bottom meeting the bottom), the theatre
// (its block centred on the screen) and the landing (its block's bottom meeting the bottom of the screen).

const ROOMS = ["gate", "hall", "theatre", "river"] as const;
const CHAMBER = ["court", "hall", "theatre", "river"] as const;
const roomOf = (p: number) => (p < 0.5 ? 0 : p < 2.5 ? 1 : p < 3.5 ? 2 : 3);

export function World({ ads }: { ads: WorldAd[] }) {
  const host = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [live, setLive] = useState(false);
  const [room, setRoom] = useState(0);
  const [later, setLater] = useState(false);
  const [lit, setLit] = useState(false);
  const [rooms, setRooms] = useState(false);
  const [banners, setBanners] = useState<RoomBanner[]>([]);
  const [shown, setShown] = useState<{ ad: Ad; from: HTMLElement } | null>(null);
  const anchors = useRef<(HTMLElement | null)[]>([]);
  const seek = useRef<(p: number) => void>(() => {});

  useEffect(() => void dispatchEvent(new CustomEvent("world:chamber", { detail: CHAMBER[room] })), [room]);

  useEffect(() => {
    const el = host.current;
    const section = el?.closest<HTMLElement>("[data-world]");
    if (!el || !section) return;
    const q = new URLSearchParams(location.search);
    const asRooms = q.get("world") === "rooms";
    const go3d = asRooms || want3d();
    setRooms(asRooms);
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

    const glide = (y: number) => {
      const lenis = (window as Window & { __lenis?: { scrollTo: (y: number) => void } }).__lenis;
      if (lenis) lenis.scrollTo(y);
      else scrollTo({ top: y, behavior: "smooth" });
    };
    seek.current = (p) => {
      const i = Math.min(keys.length - 2, Math.floor(p));
      glide(keys[i] + (keys[i + 1] - keys[i]) * (p - i));
    };

    let off: (() => void) | undefined;
    let dead = false;
    const shot = q.get("shot");
    const go = () => {
      setLater(true);
      if (!go3d) return setLit(true);
      if (asRooms)
        return void import("./rooms").then((m) => {
          if (dead) return;
          off = m.mount(el, {
            progress: shot === null ? progress : () => Number(shot),
            still: shot !== null || q.has("snap") || matchMedia("(prefers-reduced-motion: reduce)").matches,
            src: (id) => adById(id)?.sm,
            banners: setBanners,
            el: (i) => anchors.current[i] ?? null,
            ready: () => setLive(true),
          });
        });
      import("./scene").then((m) => {
        if (dead) return;
        off = m.mount(el, {
          progress: shot === null ? progress : () => Number(shot),
          ads,
          small: innerWidth < 1100,
          still: shot !== null || q.has("snap"),
          bare: q.has("bare"),
          dim: q.has("dim"),
          open: (id) => router.push("/w/" + id),
          enter: () => glide(keys[1]),
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

  const glOn = live && !(rooms && room >= 2);
  return (
    <>
      <div className={"world-stage" + (glOn ? " live" : "")} aria-hidden="true">
        {ROOMS.map((r, i) => (
          <div key={r} className="world-poster" data-on={i === room ? "" : undefined}>
            {i === 0 || later ? (
              <div className="world-frame">
                <picture>
                  <source media="(max-width: 767px)" srcSet={"/world/poster/" + r + "-m.webp"} />
                  <img src={"/world/poster/" + r + "-d.webp"} alt="" decoding="async" fetchPriority={i === 0 ? "high" : "low"} />
                </picture>
                {i > 0 && !live ? <Flames of={r} /> : null}
              </div>
            ) : null}
          </div>
        ))}
        {lit ? (
          <div className="world-poster world-lit" data-on={room === 0 ? "" : undefined}>
            <div className="world-frame">
              <picture>
                <source media="(max-width: 767px)" srcSet="/world/poster/gate-lit-m.webp" />
                <img src="/world/poster/gate-lit-d.webp" alt="" decoding="async" />
              </picture>
              <Flames of="gate-lit" />
            </div>
          </div>
        ) : null}
        <div ref={host} className="world-gl" />
      </div>
      {rooms && banners.length ? (
        <nav className="rooms-ui" aria-label="the ads on the banners" hidden={!glOn}>
          {banners.map((b, i) => {
            const ad = adById(b.id);
            if (!ad) return null;
            return (
              <span key={i} className="rooms-a" ref={(n) => void (anchors.current[i] = n)}>
                <a
                  href={"/w/" + ad.id}
                  onClick={(e) => {
                    e.preventDefault();
                    setShown({ ad, from: e.currentTarget });
                  }}
                  onFocus={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) seek.current(b.p);
                  }}
                >
                  <span className="vh">
                    {ad.campaign}: {ad.alt.split(". ")[0].replace(/\.$/, "")}
                  </span>
                </a>
              </span>
            );
          })}
        </nav>
      ) : null}
      {shown ? (
        <AdDialog
          ad={shown.ad}
          onClose={() => {
            shown.from.focus({ preventScroll: true });
            setShown(null);
          }}
        />
      ) : null}
    </>
  );
}
