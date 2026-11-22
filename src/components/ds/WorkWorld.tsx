"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export type WorldItem = {
  key: string;
  href: string;
  title: string;
  src: string;
  w: number;
  h: number;
  alt: string;
  section: "ads" | "web" | "3d";
};

/** Baked.studio-inspired explorable 2D spatial work world.
 *  Drag anywhere to pan freely with inertia, scroll or use HUD controls to zoom, click any piece to open. */
export function WorkWorld({ items }: { items: WorldItem[] }) {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  const [zoomPct, setZoomPct] = useState(85);
  const [dragging, setDragging] = useState(false);

  // Lay out all pieces across an expansive spatial grid with organic vertical offsets
  const layout = useMemo(() => {
    const cols = 10;
    const cellW = 310;
    const cellH = 380;
    const totalW = cols * cellW;
    const rows = Math.ceil(items.length / cols);
    const totalH = rows * cellH;

    const placed = items.map((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ar = item.w / Math.max(item.h, 1);
      const w = ar > 1.25 ? 300 : 238;
      const h = Math.round(w / ar);
      // Organic staggered vertical rhythm like a curated gallery wall
      const jitterY = ((col * 53 + row * 29) % 44) - 22;
      const jitterX = ((row * 37 + col * 19) % 24) - 12;
      const x = col * cellW - totalW / 2 + cellW / 2 - w / 2 + jitterX;
      const y = row * cellH - totalH / 2 + cellH / 2 - h / 2 + jitterY;
      return { ...item, x, y, drawW: w, drawH: h };
    });

    return { placed, totalW, totalH };
  }, [items]);

  const stateRef = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    vx: 0,
    vy: 0,
    scale: 0.85,
    tScale: 0.85,
    dragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    moved: false,
  });

  useEffect(() => {
    const stage = stageRef.current;
    const world = worldRef.current;
    if (!stage || !world) return;

    const s = stateRef.current;
    // Start centered on the upper-middle of the gallery
    s.x = s.tx = 0;
    s.y = s.ty = layout.totalH * 0.22;

    let raf = 0;
    const tick = () => {
      if (!s.dragging) {
        s.tx += s.vx;
        s.ty += s.vy;
        s.vx *= 0.91;
        s.vy *= 0.91;
        if (Math.abs(s.vx) < 0.05) s.vx = 0;
        if (Math.abs(s.vy) < 0.05) s.vy = 0;
      }

      // Soft bounds so the user never gets lost in empty space
      const maxX = layout.totalW * 0.52;
      const maxY = layout.totalH * 0.52;
      s.tx = Math.max(-maxX, Math.min(maxX, s.tx));
      s.ty = Math.max(-maxY, Math.min(maxY, s.ty));

      s.x += (s.tx - s.x) * 0.14;
      s.y += (s.ty - s.y) * 0.14;
      s.scale += (s.tScale - s.scale) * 0.14;

      world.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) scale(${s.scale})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const next = Math.min(1.65, Math.max(0.42, s.tScale - e.deltaY * 0.002));
        s.tScale = next;
        setZoomPct(Math.round(next * 100));
      } else {
        s.tx -= e.deltaX / s.scale;
        s.ty -= e.deltaY / s.scale;
      }
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener("wheel", onWheel);
    };
  }, [layout.totalH, layout.totalW]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = stateRef.current;
    s.dragging = true;
    s.startX = e.clientX;
    s.startY = e.clientY;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.moved = false;
    s.vx = 0;
    s.vy = 0;
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = stateRef.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    if (Math.hypot(e.clientX - s.startX, e.clientY - s.startY) > 6) {
      s.moved = true;
    }
    s.tx += dx / s.scale;
    s.ty += dy / s.scale;
    s.vx = (dx / s.scale) * 0.85;
    s.vy = (dy / s.scale) * 0.85;
  };

  const endDrag = () => {
    const s = stateRef.current;
    if (!s.dragging) return;
    s.dragging = false;
    setDragging(false);
    window.setTimeout(() => {
      s.moved = false;
    }, 60);
  };

  const stepZoom = (delta: number) => {
    const s = stateRef.current;
    const next = Math.min(1.65, Math.max(0.42, s.tScale + delta));
    s.tScale = next;
    setZoomPct(Math.round(next * 100));
  };

  const resetView = () => {
    const s = stateRef.current;
    s.tx = 0;
    s.ty = layout.totalH * 0.22;
    s.vx = 0;
    s.vy = 0;
    s.tScale = 0.85;
    setZoomPct(85);
  };

  return (
    <div
      ref={stageRef}
      className={"ww-stage" + (dragging ? " is-dragging" : "")}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <div className="ww-hud">
        <span className="ww-hud-l">DRAG TO EXPLORE · {items.length} PIECES</span>
        <div className="ww-hud-r">
          <button type="button" onClick={() => stepZoom(-0.18)} aria-label="Zoom out">
            −
          </button>
          <span>{zoomPct}%</span>
          <button type="button" onClick={() => stepZoom(0.18)} aria-label="Zoom in">
            +
          </button>
          <button type="button" onClick={resetView} className="ww-reset">
            RESET
          </button>
        </div>
      </div>

      <div ref={worldRef} className="ww-canvas">
        {layout.placed.map((item, i) => (
          <a
            key={item.key}
            href={item.href}
            className="ww-tile"
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              width: `${item.drawW}px`,
              height: `${item.drawH}px`,
            }}
            draggable={false}
            aria-label={item.title}
            onClick={(e) => {
              e.preventDefault();
              if (!stateRef.current.moved) router.push(item.href);
            }}
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={item.w}
              height={item.h}
              sizes="300px"
              draggable={false}
              priority={i < 12}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
