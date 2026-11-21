"use client";

// One ticker for the whole site: Lenis smooth scroll driven from gsap.ticker, ScrollTrigger kept in step with it.
// On every route it wires the three page-wide effects by attribute, so pages stay server components:
//   .media[data-plate]  the picture opens from the bottom as it enters, and [data-in] (info bars, the signpost)
//                       plays its entrance; CSS does the move, this adds .in
//   [data-lines]        the text splits into lines that rise out of a mask, 50 ms apart
//   [data-room]         the page flips to ink while the section is in the middle of the screen
// Reduced motion: no Lenis, plates and lines rest at their end state (ds.css), rooms still flip without travel.

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

type Win = Window & { __lenis?: Lenis; __vtDone?: () => void };

export function Motion() {
  const path = usePathname();
  const first = useRef(true);

  // Every navigation after the first load, unless a cover morph is carrying it: the new page is cut in from the top
  // edge on the site's cut ease while it settles up 24 px. The first load has its own choreography per page.
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if ((window as Win).__vtDone || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelector("main")?.animate(
      [
        { clipPath: "inset(0 0 100% 0)", transform: "translateY(24px)" },
        { clipPath: "inset(0 0 0% 0)", transform: "none" },
      ],
      { duration: 640, easing: "cubic-bezier(0.7, 0, 0.2, 1)" },
    );
  }, [path]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.1, syncTouch: false, stopInertiaOnNavigate: true });
    (window as Win).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as Win).__lenis;
    };
  }, []);

  useEffect(() => {
    const w = window as Win;
    w.__lenis?.scrollTo(0, { immediate: true, force: true });
    w.__vtDone?.();
    delete w.__vtDone;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>(".media[data-plate], [data-in]").forEach((el) =>
        ScrollTrigger.create({ trigger: el, start: "top 94%", once: true, onEnter: () => el.classList.add("in") }),
      );
      document.querySelectorAll<HTMLElement>("[data-lines]").forEach((el) => {
        const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "ln-line" });
        el.classList.add("split");
        if (reduce) return;
        const top = el.getBoundingClientRect().top < innerHeight;
        gsap.from(split.lines, {
          yPercent: 112,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.05,
          delay: top ? 0.05 : 0,
          scrollTrigger: top ? undefined : { trigger: el, start: "top 92%", once: true },
        });
      });
      document.querySelectorAll<HTMLElement>("[data-room]").forEach((el) =>
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) root.dataset.room = el.dataset.room;
            else if (root.dataset.room === el.dataset.room) delete root.dataset.room;
          },
        }),
      );
    });
    const r = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(r);
      ctx.revert();
      delete root.dataset.room;
    };
  }, [path]);

  return null;
}
