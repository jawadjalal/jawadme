"use client";

import { type ReactNode, useCallback } from "react";
import { preload } from "react-dom";
import { Stage } from "@/components/world/kit/Stage";
import type { SetName } from "./sets";
import "./moments.css";

/** A route's 3D moment: its set from ./sets on the world kit's Stage, the poster render first (and on phones), the
 *  live scene on capable screens near the viewport. Children are the page's own HTML laid over it. A `first` moment
 *  opens its page, so its poster is fetched with the document instead of waiting on the stage's lazy image. */
export function Moment({ set, first, className = "", children }: { set: SetName; first?: boolean; className?: string; children?: ReactNode }) {
  const d = "/moments/" + set + "-d.webp", ph = "/moments/" + set + "-m.webp";
  if (first) {
    preload(ph, { as: "image", media: "(max-width: 767px)", fetchPriority: "high" });
    preload(d, { as: "image", media: "(min-width: 768px)", fetchPriority: "high" });
  }
  const load = useCallback(() => import("./mount").then((m) => (host: HTMLElement, ctx: Parameters<typeof m.mount>[1]) => m.mount(host, ctx, set)), [set]);
  return (
    <Stage load={load} poster={{ d, m: ph }} className={"mo mo-" + set + (className ? " " + className : "")}>
      {children}
    </Stage>
  );
}
