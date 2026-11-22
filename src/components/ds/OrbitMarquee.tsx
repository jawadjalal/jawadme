"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Ad } from "@/content/ads";

type Props = {
  ads: Ad[];
};

/** Outpace Studios–style curved 3D rotating hero work carousel.
 *  Pure visual art — zero captions or brand text cluttering the curve. */
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
        const cardW = vw < 768 ? Math.min(270, vw * 0.72) : Math.min(370, Math.max(290, vw * 0.26));
        const gap = vw < 768 ? 18 : 30;
        const stride = cardW + gap;
        const total = ads.length * stride;

        if (!dragRef.current.active) {
          const baseSpeed = hoverRef.current ? 12 : 44;
          offsetRef.current += (baseSpeed + velRef.current) * dt;
          velRef.current *= Math.pow(0.06, dt);
          if (Math.abs(velRef.current) < 0.5) velRef.current = 0;
        }

        offsetRef.current = ((offsetRef.current % total) + total) % total;

        const half = total / 2;
        const radius = Math.max(vw * 1.15, 1150);

        for (let i = 0; i < ads.length; i++) {
          const el = cardsRef.current[i];
          if (!el) continue;

          let x = i * stride - offsetRef.current;
          while (x < -half) x += total;
          while (x > half) x -= total;

          const visibleLimit = vw * 0.85 + cardW;
          if (Math.abs(x) > visibleLimit) {
            el.style.visibility = "hidden";
            continue;
          }

          el.style.visibility = "visible";
          const norm = x / Math.max(vw * 0.52, 360);
          // Graceful concave cylindrical Outpace curve
          const angleDeg = Math.max(-30, Math.min(30, norm * 18.5));
          const angleRad = (angleDeg * Math.PI) / 180;
          const z = (Math.cos(angleRad) - 1) * radius * 0.34;
          const yCurve = Math.abs(norm) * Math.abs(norm) * (vw < 768 ? 12 : 24);
          const tiltZ = norm * (vw < 768 ? -1.4 : -2.2);
          const scale = 1 - Math.min(0.1, Math.abs(norm) * 0.04);

          el.style.width = `${cardW}px`;
          el.style.marginLeft = `${-cardW / 2}px`;
          el.style.transform = `translate3d(${x}px, ${yCurve}px, ${z}px) rotateY(${-angleDeg}deg) rotateZ(${tiltZ}deg) scale(${scale})`;
          el.style.zIndex = String(Math.round(100 - Math.abs(norm) * 40));
          el.style.opacity = String(Math.max(0.3, 1 - Math.max(0, Math.abs(norm) - 1.15) * 0.75));
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
      aria-label="Selected work carousel"
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
            aria-label={ad.alt}
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
                sizes="(max-width: 767px) 72vw, 370px"
                draggable={false}
                priority={i < 5}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
