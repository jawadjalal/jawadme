"use client";

// Picks the variant for the homepage. Mirrors design/DesignClient.tsx: the two
// scenes are genuinely different builds — a CRT on a desk versus a phone on a
// plinth — not one layout reflowing, so they're separate components and only one
// is ever visible.
//
// The desktop room is imported statically so it server-renders. That matters
// here more than anywhere: the scene markup *is* the page's content, and a front
// door that ships an empty shell has nothing for crawlers or link unfurls to
// read. The mobile room stays client-only — it is the swap-in case, never the
// first paint.
//
// `mobile` deliberately starts false rather than null so the first client render
// matches the server exactly; the media query is consulted in an effect and
// swaps afterwards. Rendering null first would blank the SSR'd markup on
// hydration, which is the whole thing we're avoiding.

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import RoomHome from "./design/RoomHome";

const RoomHomeMobile = dynamic(() => import("./design/RoomHomeMobile"), { ssr: false });

const QUERY = "(max-width: 1023px), (pointer: coarse) and (max-width: 1180px)";

// Posts are read and date-formatted on the server (see src/app/page.tsx) and
// passed down as plain data. Formatting there rather than here is deliberate:
// toLocaleDateString resolves against the runtime's locale, so doing it in the
// client would risk a different string on hydration than the one that was
// server-rendered.
export type HomePost = { slug: string; title: string; date: string };

export default function HomeClient({ posts }: { posts: HomePost[] }) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return mobile ? <RoomHomeMobile posts={posts} /> : <RoomHome posts={posts} />;
}
