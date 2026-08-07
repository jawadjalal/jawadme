"use client";

// Picks the variant. The two scenes are genuinely different builds — a CRT on a
// desk versus a phone on a plinth — not one layout reflowing, so they're
// separate components behind a matchMedia switch and only one ever mounts.
//
// Rendering nothing on the first client pass avoids mounting the desktop scene
// (with its ~1200 nodes and rAF loop) on a phone just to unmount it.

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const RoomDesktop = dynamic(() => import("./RoomDesktop"), { ssr: false });
const RoomMobile = dynamic(() => import("./RoomMobile"), { ssr: false });

const QUERY = "(max-width: 1023px), (pointer: coarse) and (max-width: 1180px)";

export default function DesignClient() {
  const [variant, setVariant] = useState<"desktop" | "mobile" | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setVariant(mq.matches ? "mobile" : "desktop");
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!variant) return null;
  return variant === "mobile" ? <RoomMobile /> : <RoomDesktop />;
}
