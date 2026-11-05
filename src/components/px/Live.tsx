"use client";

import { useEffect, useState } from "react";

/** London's wall clock, ticking each minute. Rendered empty on the server so
 *  the first paint never shows the build machine's time. */
export function LondonTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London", timeZoneName: "short" });
    const set = () => setT(f.format(new Date()).toLowerCase());
    set();
    const id = setInterval(set, 15000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{t || "london"}</span>;
}

/**
 * Adds `is-in` to every `[data-in]` element the first time it is on screen,
 * and drives the doodles' scroll-linked boil.
 * The CSS moves them with steps(), so things arrive in whole frames, the way
 * sprites do, instead of easing in.
 */
export function Arrivals() {
  // every doodle on the page flips to its other boil frame each 96px scrolled
  useEffect(() => {
    let f = -1;
    const on = () => {
      const n = Math.floor(scrollY / 96) % 2;
      if (n !== f) document.documentElement.style.setProperty("--boil", String((f = n)));
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-in]");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return null;
}
