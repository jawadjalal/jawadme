"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

type Placed = WorldItem & {
  x: number;
  y: number;
  drawW: number;
  drawH: number;
};

/** Fast, virtualized 2D explorable spatial work world.
 *  Only mounts tiles near the current viewport (~12-16 on first load) so it opens instantly,
 *  with rounded cards, smooth fade-in on load, organic spiral clustering, and silky drag inertia. */
export function WorkWorld({ items }: { items: WorldItem[] }) {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  const [zoomPct, setZoomPct] = useState(92);
  const [dragging, setDragging] = useState(false);
  const [viewBox, setViewBox] = useState({ minX: -900, maxX: 900, minY: -650, maxY: 650 });

  // Curated spiral-outward layout so the strongest pieces sit right in the center on load
  const layout = useMemo(() => {
    const placed: Placed[] = [];
    const cols = 9;
    const cellW = 330;
    const cellH = 400;

    // Order cells by distance from center so index 0..11 fill the opening screen
    const slots: { col: number; row: number; dist: number }[] = [];
    const rows = Math.ceil(items.length / cols);
    const midC = (cols - 1) / 2;
    const midR = (rows - 1) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dx = (c - midC) * 1.05;
        const dy = (r - midR) * 1.15;
        slots.push({ col: c, row: r, dist: Math.hypot(dx, dy) });
      }
    }
    slots.sort((a, b) => a.dist - b.dist);

    let maxAbsX = 800;
    let maxAbsY = 600;

    items.forEach((item, i) => {
      const slot = slots[i];
      const ar = item.w / Math.max(item.h, 1);
      const isHero = i < 6;
      const w = ar > 1.25 ? (isHero ? 320 : 286) : isHero ? 268 : 238;
      const h = Math.round(w / ar);

      // Subtle organic gallery stagger
      const jx = ((slot.col * 47 + slot.row * 31) % 36) - 18;
      const jy = ((slot.row * 53 + slot.col * 23) % 52) - 26;
      const x = (slot.col - midC) * cellW - w / 2 + jx;
      const y = (slot.row - midR) * cellH - h / 2 + jy;

      maxAbsX = Math.max(maxAbsX, Math.abs(x) + w);
      maxAbsY = Math.max(maxAbsY, Math.abs(y) + h);
      placed.push({ ...item, x, y, drawW: w, drawH: h });
    });

    return { placed, maxAbsX, maxAbsY };
  }, [items]);

  const stateRef = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    vx: 0,
    vy: 0,
    scale: 0.92,
    tScale: 0.92,
    dragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    moved: false,
    lastCullX: 99999,
    lastCullY: 99999,
    lastCullS: 0,
  });

  const syncCull = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const s = stateRef.current;
    const hw = stage.clientWidth / (2 * s.scale);
    const hh = stage.clientHeight / (2 * s.scale);
    const pad = 340 / s.scale;
    const cx = -s.x / s.scale;
    const cy = -s.y / s.scale;
    s.lastCullX = s.x;
    s.lastCullY = s.y;
    s.lastCullS = s.scale;
    setViewBox({
      minX: cx - hw - pad,
      maxX: cx + hw + pad,
      minY: cy - hh - pad,
      maxY: cy + hh + pad,
    });
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const world = worldRef.current;
    if (!stage || !world) return;

    const s = stateRef.current;
    s.x = s.tx = 0;
    s.y = s.ty = 0;
    syncCull();

    let raf = 0;
    const tick = () => {
      if (!s.dragging) {
        s.tx += s.vx;
        s.ty += s.vy;
        s.vx *= 0.9;
        s.vy *= 0.9;
        if (Math.abs(s.vx) < 0.05) s.vx = 0;
        if (Math.abs(s.vy) < 0.05) s.vy = 0;
      }

      const limitX = layout.maxAbsX * s.scale * 0.88;
      const limitY = layout.maxAbsY * s.scale * 0.88;
      s.tx = Math.max(-limitX, Math.min(limitX, s.tx));
      s.ty = Math.max(-limitY, Math.min(limitY, s.ty));

      s.x += (s.tx - s.x) * 0.14;
      s.y += (s.ty - s.y) * 0.14;
      s.scale += (s.tScale - s.scale) * 0.14;

      world.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) scale(${s.scale})`;

      // Recompute visible virtualized window only when panned/zoomed meaningfully
      if (
        Math.hypot(s.x - s.lastCullX, s.y - s.lastCullY) > 140 ||
        Math.abs(s.scale - s.lastCullS) > 0.1
      ) {
        syncCull();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const next = Math.min(1.55, Math.max(0.45, s.tScale - e.deltaY * 0.002));
        s.tScale = next;
        setZoomPct(Math.round(next * 100));
      } else {
        s.tx -= e.deltaX;
        s.ty -= e.deltaY;
      }
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", syncCull);
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", syncCull);
    };
  }, [layout.maxAbsX, layout.maxAbsY, syncCull]);

  const visibleItems = useMemo(
    () =>
      layout.placed.filter(
        (p) =>
          p.x + p.drawW >= viewBox.minX &&
          p.x <= viewBox.maxX &&
          p.y + p.drawH >= viewBox.minY &&
          p.y <= viewBox.maxY,
      ),
    [layout.placed, viewBox],
  );

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
    s.tx += dx;
    s.ty += dy;
    s.vx = dx * 0.82;
    s.vy = dy * 0.82;
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
    const next = Math.min(1.55, Math.max(0.45, s.tScale + delta));
    s.tScale = next;
    setZoomPct(Math.round(next * 100));
  };

  const resetView = () => {
    const s = stateRef.current;
    s.tx = 0;
    s.ty = 0;
    s.vx = 0;
    s.vy = 0;
    s.tScale = 0.92;
    setZoomPct(92);
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
            CENTER
          </button>
        </div>
      </div>

      <div ref={worldRef} className="ww-canvas">
        {visibleItems.map((item) => (
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
              sizes="320px"
              draggable={false}
              loading="eager"
              onLoad={(e) => e.currentTarget.setAttribute("data-loaded", "1")}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
