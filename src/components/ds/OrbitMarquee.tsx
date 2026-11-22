"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Ad } from "@/content/ads";
import { headline } from "@/lib/gallery";

type Props = {
  ads: Ad[];
};

/** Outpace Studios–inspired curved 3D perspective rotating marquee.
 *  Cards travel along a subtle concave cylindrical arc with pointer drag-to-scrub,
 *  momentum inertia, and smooth hover deceleration. */
export function OrbitMarquee({ ads }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const offsetRef = useRef(0);
  const velRef = useRef(0);
  const hoverRef = useRef(false);
  const dragRef = useRef<{ active: boolean; startX: number; lastX: number; moved: boolean }>({
    active: false,
    startX: 0,
    lastX: 0,
    moved: false,
  });
  const [dragging, setDragging] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const stage = stageRef.current;
      if (stage) {
        const vw = stage.clientWidth;
        const cardW = vw < 768 ? Math.min(260, vw * 0.68) : Math.min(340, Math.max(260, vw * 0.235));
        const gap = vw < 768 ? 18 : 28;
        const stride = cardW + gap;
        const total = ads.length * stride;

        if (!dragRef.current.active) {
          const baseSpeed = hoverRef.current ? 16 : 46;
          offsetRef.current += (baseSpeed + velRef.current) * dt;
          velRef.current *= Math.pow(0.06, dt);
          if (Math.abs(velRef.current) < 0.5) velRef.current = 0;
        }

        // Keep offset wrapped cleanly within [0, total)
        offsetRef.current = ((offsetRef.current % total) + total) % total;

        const half = total / 2;
        const radius = Math.max(vw * 1.15, 1100);

        for (let i = 0; i < ads.length; i++) {
          const el = cardsRef.current[i];
          if (!el) continue;

          let x = i * stride - offsetRef.current;
          while (x < -half) x += total;
          while (x > half) x -= total;

          // Hide cards far outside viewport for performance
          const visibleLimit = vw * 0.85 + cardW;
          if (Math.abs(x) > visibleLimit) {
            el.style.visibility = "hidden";
            continue;
          }

          el.style.visibility = "visible";
          // Normalized position across viewport [-1..1]
          const norm = x / Math.max(vw * 0.55, 360);
          const angleDeg = Math.max(-28, Math.min(28, norm * 16.5));
          const angleRad = (angleDeg * Math.PI) / 180;
          // Curved cylindrical recess: edges curve slightly forward/inward like Outpace
          const z = (Math.cos(angleRad) - 1) * radius * 0.32;
          const yCurve = Math.abs(norm) * Math.abs(norm) * (vw < 768 ? 12 : 24);
          const tiltZ = norm * (vw < 768 ? -1.4 : -2.2);
          const scale = 1 - Math.min(0.1, Math.abs(norm) * 0.045);

          el.style.width = `${cardW}px`;
          el.style.transform = `translate3d(${x}px, ${yCurve}px, ${z}px) rotateY(${-angleDeg}deg) rotateZ(${tiltZ}deg) scale(${scale})`;
          el.style.zIndex = String(Math.round(100 - Math.abs(norm) * 40));
          el.style.opacity = String(Math.max(0.25, 1 - Math.max(0, Math.abs(norm) - 1.1) * 0.8));
        }
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [ads.length, reduced]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    dragRef.current = { active: true, startX: e.clientX, lastX: e.clientX, moved: false };
    setDragging(true);
    velRef.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    dragRef.current.lastX = e.clientX;
    if (Math.abs(e.clientX - dragRef.current.startX) > 6) {
      dragRef.current.moved = true;
    }
    offsetRef.current -= dx * 1.15;
    velRef.current = -dx * 18;
  };

  const endDrag = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setDragging(false);
    window.setTimeout(() => {
      dragRef.current.moved = false;
    }, 60);
  };

  return (
    <div
      ref={stageRef}
      className={"orbit-stage" + (dragging ? " is-dragging" : "") + (reduced ? " is-reduced" : "")}
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
        endDrag();
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="region"
      aria-label="Selected ad concepts rotating showcase"
    >
      <div className="orbit-track">
        {ads.map((ad, i) => (
          <Link
            key={ad.id}
            href={"/w/" + ad.id}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className="orbit-card"
            draggable={false}
            onClick={(e) => {
              if (dragRef.current.moved) e.preventDefault();
            }}
          >
            <div className="orbit-media">
              <Image
                src={ad.sm || ad.src}
                alt={ad.alt}
                width={ad.w}
                height={ad.h}
                sizes="(max-width: 767px) 68vw, 340px"
                draggable={false}
                priority={i < 4}
              />
            </div>
            <div className="orbit-meta">
              <div className="orbit-meta-l">
                <span className="orbit-brand">{ad.campaign}</span>
                <span className="orbit-line">{headline(ad)}</span>
              </div>
              <span className="orbit-tag">{ad.spec ? "CONCEPT" : "BRAND"}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
