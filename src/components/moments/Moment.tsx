"use client";

import { type ReactNode, useCallback } from "react";
import { Stage } from "@/components/world/kit/Stage";
import type { SetName } from "./sets";
import "./moments.css";

/** A route's 3D moment: its set from ./sets on the world kit's Stage, the poster render first (and on phones), the
 *  live scene on capable screens near the viewport. Children are the page's own HTML laid over it. */
export function Moment({ set, className = "", children }: { set: SetName; className?: string; children?: ReactNode }) {
  const load = useCallback(() => import("./mount").then((m) => (host: HTMLElement, ctx: Parameters<typeof m.mount>[1]) => m.mount(host, ctx, set)), [set]);
  return (
    <Stage load={load} poster={{ d: "/moments/" + set + "-d.webp", m: "/moments/" + set + "-m.webp" }} className={"mo mo-" + set + (className ? " " + className : "")}>
      {children}
    </Stage>
  );
}
