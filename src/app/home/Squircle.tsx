"use client";

// A box clipped to a squircle rather than a rounded rectangle.
//
// The clip path depends on the element's pixel size, so it cannot be written
// once — a ResizeObserver recomputes it whenever the box changes. Until the
// first measurement lands the element keeps a plain border-radius, so it is
// never briefly square while the observer catches up.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { squircleClip } from "./squircle";

export function Squircle({
  children,
  radius,
  smoothing = 0.8,
  className,
  style,
}: {
  children: ReactNode;
  radius: number;
  smoothing?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [clip, setClip] = useState<string>();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setClip(squircleClip(width, height, radius, smoothing));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [radius, smoothing]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ borderRadius: clip ? undefined : radius, clipPath: clip, ...style }}
    >
      {children}
    </div>
  );
}
