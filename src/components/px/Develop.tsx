"use client";

import { useEffect, useRef } from "react";

// A project still that develops like a sprite loading in: the first time it
// scrolls into view it is drawn at 32px blocks, then 16, 8, 4 and 2, and then
// the real image is uncovered. The <img> is always there underneath, so the
// still is in the HTML for anyone without scripts and for search engines.

const STEPS = [32, 16, 8, 4, 2];

export function Develop({
  src,
  alt,
  width,
  height,
  priority,
  pos,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  pos?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = box.current, im = img.current, c = cv.current;
    if (!el || !im || !c) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      const r = el.getBoundingClientRect();
      c.width = Math.max(1, Math.round(r.width));
      c.height = Math.max(1, Math.round(r.height));
      const g = c.getContext("2d");
      if (!g) return el.classList.add("is-in");
      const tmp = document.createElement("canvas");
      const tg = tmp.getContext("2d")!;
      // object-fit: cover, matching the img's own crop
      const s = Math.max(c.width / im.naturalWidth, c.height / im.naturalHeight);
      const dw = im.naturalWidth * s, dh = im.naturalHeight * s;
      const [px, py] = (pos ?? "50% 0%").split(" ").map((v) => parseFloat(v) / 100);
      const dx = (c.width - dw) * (isNaN(px) ? 0.5 : px), dy = (c.height - dh) * (isNaN(py) ? 0 : py);
      let i = 0;
      const step = () => {
        if (i >= STEPS.length) {
          el.classList.add("is-in");
          return;
        }
        const b = STEPS[i++];
        tmp.width = Math.ceil(c.width / b);
        tmp.height = Math.ceil(c.height / b);
        tg.imageSmoothingEnabled = true;
        tg.drawImage(im, dx / b, dy / b, dw / b, dh / b);
        g.imageSmoothingEnabled = false;
        g.clearRect(0, 0, c.width, c.height);
        g.drawImage(tmp, 0, 0, tmp.width * b, tmp.height * b);
        setTimeout(step, 85);
      };
      step();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (im.complete && im.naturalWidth) run();
        else im.addEventListener("load", run, { once: true });
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pos]);

  return (
    <div ref={box} className="dev">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={img}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        decoding="async"
        style={pos ? { objectPosition: pos } : undefined}
      />
      <canvas ref={cv} aria-hidden="true" />
    </div>
  );
}
