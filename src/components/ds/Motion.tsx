"use client";

// One ticker for the whole site: Lenis smooth scroll driven from gsap.ticker, ScrollTrigger kept in step with it.
// On every route it wires the three page-wide effects by attribute, so pages stay server components:
//   .media[data-plate]  the picture opens from the bottom as it enters, and [data-in] (info bars, the signpost)
//                       plays its entrance; CSS does the move, one IntersectionObserver adds .in
//   [data-lines]        the text splits into lines that rise out of a mask, 50 ms apart
//   [data-par]          the hero ads drift up at their own rate as the hero scrolls away
//   [data-room]         the page flips to ink while the section is in the middle of the screen
// Reduced motion: no Lenis, plates and lines rest at their end state (ds.css), rooms still flip without travel. Touch
// screens scroll natively (no Lenis) and keep every other effect.

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import type Lenis from "lenis";
import { SPRINGS } from "@/lib/motion";

type Win = Window & { __lenis?: Lenis; __vtDone?: () => void };

// gsap and its plugins arrive after hydration in their own chunk, so the first paint and the LCP never wait on them;
// plates open from the observer below without them. One load, shared by every effect and every route.
let kit: Promise<{ gsap: typeof import("gsap").default; ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger; SplitText: typeof import("gsap/SplitText").SplitText }> | undefined;
const loadKit = () =>
  (kit ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText")]).then(([{ default: gsap }, { ScrollTrigger }, { SplitText }]) => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    return { gsap, ScrollTrigger, SplitText };
  }));

export function Motion() {
  const path = usePathname();
  const first = useRef(true);

  // Every navigation after the first load, unless a cover morph is carrying it: the new page fades in over 180 ms while
  // it settles up 14 px on the soft spring. Opacity and transform only; the dock sits outside <main>, so the call never
  // waits on it. The first load has its own choreography per page and is never held back.
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if ((window as Win).__vtDone || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.querySelector("main");
    main?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "linear" });
    main?.animate([{ transform: "translateY(14px)" }, { transform: "none" }], { duration: SPRINGS.soft.ms, easing: SPRINGS.soft.easing });
  }, [path]);

  // data-m="tilt": the surface under a mouse pointer gets the pointer's place as --rx/--ry (-1..1), once a frame at most,
  // from one listener for the whole site; motion.css turns it into the lean.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce), (hover: none)").matches) return;
    let el: HTMLElement | null = null;
    let raf = 0;
    let x = 0;
    let y = 0;
    const settle = () => {
      el?.style.removeProperty("--rx");
      el?.style.removeProperty("--ry");
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const hit = (e.target as Element | null)?.closest?.<HTMLElement>('[data-m~="tilt"]') ?? null;
      if (hit !== el) {
        settle();
        el = hit;
      }
      if (!el) return;
      x = e.clientX;
      y = e.clientY;
      raf ||= requestAnimationFrame(() => {
        raf = 0;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--rx", (((x - r.left) / r.width) * 2 - 1).toFixed(3));
        el.style.setProperty("--ry", (((y - r.top) / r.height) * 2 - 1).toFixed(3));
      });
    };
    const out = () => {
      settle();
      el = null;
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", out);
    return () => {
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", out);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    // touch screens keep their own scroll: Lenis does nothing there but would still run the ticker every frame, and
    // its chunk never loads
    if (matchMedia("(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)").matches) return;
    let off: (() => void) | undefined;
    let dead = false;
    Promise.all([loadKit(), import("lenis")]).then(([{ gsap, ScrollTrigger }, { default: Lenis }]) => {
      if (dead) return;
      const lenis = new Lenis({ autoRaf: false, lerp: 0.1, syncTouch: false, stopInertiaOnNavigate: true });
      (window as Win).__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      off = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        delete (window as Win).__lenis;
      };
    });
    return () => {
      dead = true;
      off?.();
    };
  }, []);

  useEffect(() => {
    const w = window as Win;
    const mark = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    const y = mark ? Math.max(0, mark.getBoundingClientRect().top + scrollY - innerHeight * 0.18) : 0;
    if (w.__lenis) w.__lenis.scrollTo(y, { immediate: true, force: true });
    else if (mark) scrollTo(0, y);
    w.__vtDone?.();
    delete w.__vtDone;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll(".media[data-plate], [data-in]").forEach((el) => io.observe(el));
    let off: (() => void) | undefined;
    let dead = false;
    loadKit().then(({ gsap, ScrollTrigger, SplitText }) => {
      if (dead) return;
      const ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>("[data-lines]").forEach((el) => {
          const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "ln-line", aria: "none" });
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
        if (!reduce && matchMedia("(min-width: 768px)").matches)
          document.querySelectorAll<HTMLElement>("[data-par]").forEach((el) =>
            gsap.to(el, {
              y: -Number(el.dataset.par) * 4,
              ease: "none",
              scrollTrigger: { trigger: el.closest("section") ?? el, start: "top top", end: "bottom top", scrub: true },
            }),
          );
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
      off = () => {
        cancelAnimationFrame(r);
        ctx.revert();
      };
    });
    return () => {
      dead = true;
      off?.();
      io.disconnect();
      delete root.dataset.room;
    };
  }, [path]);

  return null;
}
