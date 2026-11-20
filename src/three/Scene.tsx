"use client";

// The one canvas: fixed over the page, transparent, never catching the pointer. Each [data-view] box in the page
// gets a drei View scissored into it, so the hero Mark and the footer call key share one WebGL context.
// The loop pauses while no box is on screen, DPR is capped at 1.5, and a governor drops to DPR 1 and then back to
// the posters if the 75th percentile frame stays over 22 ms for two seconds.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { MarkView } from "./Mark";
import { KeyView } from "./Key";
import { SignpostView } from "./Signpost";

function Governor({ onFail }: { onFail: () => void }) {
  const setDpr = useThree((s) => s.setDpr);
  const times = useRef<number[]>([]);
  const since = useRef(0);
  const dropped = useRef(false);
  useFrame((_, dt) => {
    const t = times.current;
    t.push(dt * 1000);
    if (t.length > 90) t.shift();
    since.current += dt;
    if (since.current < 2 || t.length < 60) return;
    since.current = 0;
    const p75 = [...t].sort((a, b) => a - b)[Math.floor(t.length * 0.75)];
    if (p75 <= 22) return;
    if (!dropped.current) {
      dropped.current = true;
      setDpr(1);
      t.length = 0;
    } else onFail();
  });
  return null;
}

function Pause({ els }: { els: HTMLElement[] }) {
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    if (!els.length) return;
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      setFrameloop(seen.size ? "always" : "never");
    });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [els, setFrameloop]);
  return null;
}

export default function Scene({ onFail }: { onFail: () => void }) {
  const path = usePathname();
  const [els, setEls] = useState<HTMLElement[]>([]);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEls([...document.querySelectorAll<HTMLElement>("[data-view]")]));
    return () => cancelAnimationFrame(id);
  }, [path]);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.gl = "live";
    return () => {
      delete root.dataset.gl;
    };
  }, []);
  const tracks = useMemo(() => els.map((el) => ({ el, ref: { current: el } })), [els]);
  return (
    <Canvas
      className="gl-stage"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 4 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      onCreated={({ gl }) => gl.domElement.addEventListener("webglcontextlost", onFail)}
    >
      {tracks.map(({ el, ref }, i) => (
        <View key={`${path}-${i}`} track={ref as React.RefObject<HTMLElement>}>
          {el.dataset.view === "mark" ? <MarkView el={el} /> : el.dataset.view === "signpost" ? <SignpostView el={el} /> : <KeyView el={el} path={path} />}
        </View>
      ))}
      <Governor onFail={onFail} />
      <Pause els={els} />
    </Canvas>
  );
}
