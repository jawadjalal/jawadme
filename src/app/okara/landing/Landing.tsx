"use client";

/* The design file shipped with a small runtime of its own: a counter, a typing
   paragraph, a billing toggle, scroll reveals and a marquee that eases on
   hover. The markup is now static HTML, so those five behaviours live here and
   find their targets through data attributes the port left behind.

   Everything is progressive: the page is complete and readable before this
   runs. The .okara-js class is what switches reveals from "always visible" to
   "fade in", so a failed bundle degrades to the whole page rather than a blank
   one. */
import { useEffect, useRef } from "react";
import { MARKUP } from "./markup";

/* The paragraph that types itself under the X post. Kept in sync with the copy
   the port wrote into the markup, which is also the no-JS fallback. */
const PARA =
  "Publish where founders already decide what to try. Build in public on X, answer real questions on Reddit, ship launches to Hacker News. Every post goes out only once you approve it.";

/* The two sets the icon clusters rotate through. `stack` is the integrations
   the page already lists further down; `logos` is every customer logo the page
   has, so the avatars stop implying the customer list is five names long.
   Order is deliberate: the first entries are the ones the markup ships with, so
   the first paint matches the design and the rotation starts from there. */
const POOLS: Record<string, string[]> = {
  stack: [
    "wordpress-28x28.svg",
    "webflow-28x28.svg",
    "framer-28x28.svg",
    "wix.svg",
    "sanity-28x28.svg",
    "github-28x28.svg",
    "gsc.png",
    "ga.png",
    "linkedin-agent-28x28.svg",
    "x-twitter-agent-28x28.svg",
    "whatsapp-28x28.svg",
    "telegram-28x28.svg",
  ].map((f) => `/okara/landing/assets/${f}`),
  logos: [
    "konghq-com",
    "razer-com",
    "photoroom-com",
    "bitpanda-com",
    "stickermule-com",
    "vwo-com",
    "freightpop-com",
    "planhat-com",
    "slite-com",
    "locket-camera",
    "flocksafety-com",
    "seekingalpha-com",
    "kinguin-net",
    "eightify-app",
    "metadata-io",
    "cloud66-com",
    "locus-sh",
    "crowdcow-com",
  ].map((f) => `/okara/landing/assets/logos/${f}-128.png`),
};

/* One swap every this many ms, per cluster. Slow enough to read as a change
   rather than a flicker. */
const CYCLE_MS = 2200;
const FADE_MS = 260;

const BILL_BASE =
  "display:inline-flex;align-items:center;height:42px;padding:0 30px;border-radius:12px;cursor:pointer;font-size:15px;font-weight:600;transition:background .2s ease, color .2s ease;";
const BILL_ON = BILL_BASE + "background:#0a0a0a;color:#ffffff";
const BILL_OFF = BILL_BASE + "background:transparent;color:#726a5a";

export default function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("okara-js");

    const timers: number[] = [];
    const frames: number[] = [];

    /* 1. The artboard is 1440px wide and does not reflow, so narrower viewports
       scale it down to fit. No floor: a phone gets the whole page small rather
       than a slice of it with a sideways scrollbar, and pinch-zoom does the
       rest. The banner above the page says as much. */
    const page = root.querySelector<HTMLElement>("#okara-page");
    const fit = () => {
      if (!page) return;
      const avail = document.documentElement.clientWidth;
      page.style.zoom = avail >= 1440 ? "" : String(avail / 1440);
    };
    fit();
    window.addEventListener("resize", fit);

    /* 2. Count up to the user number, once. */
    const counters = root.querySelectorAll<HTMLElement>("[data-count]");
    if (counters.length && !reduced) {
      const target = 100000;
      const dur = 1600;
      let t0: number | null = null;
      const step = (now: number) => {
        if (t0 === null) t0 = now;
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const v = Math.round(target * eased).toLocaleString("en-US") + "+";
        counters.forEach((el) => (el.textContent = v));
        if (p < 1) frames.push(requestAnimationFrame(step));
      };
      frames.push(requestAnimationFrame(step));
    }

    /* 3. The paragraph types itself, then rests, then types again. */
    const typed = root.querySelector<HTMLElement>("[data-typed]");
    if (typed && !reduced) {
      let i = 0;
      let tick = 0;
      const run = () => {
        i = 0;
        typed.textContent = "";
        tick = window.setInterval(() => {
          i += 7;
          if (i >= PARA.length) {
            typed.textContent = PARA;
            window.clearInterval(tick);
            timers.push(window.setTimeout(run, 5200));
          } else {
            typed.textContent = PARA.slice(0, i);
          }
        }, 90);
        timers.push(tick);
      };
      run();
    }

    /* 4. Monthly and annual. The two paid cards carry an annual-only badge and
       a price that swaps, so the discount never shows in a state where it is
       not true. */
    const bills = root.querySelectorAll<HTMLElement>("[data-bill]");
    const setBilling = (annual: boolean) => {
      bills.forEach((el) => {
        const on = (el.dataset.bill === "annual") === annual;
        el.setAttribute("style", on ? BILL_ON : BILL_OFF);
        el.setAttribute("aria-pressed", String(on));
      });
      root.querySelectorAll<HTMLElement>("[data-annual-only]").forEach((el) => {
        el.hidden = !annual;
      });
      const price = (key: string, v: string) => {
        const el = root.querySelector<HTMLElement>(`[data-price="${key}"]`);
        if (el) el.textContent = v;
      };
      price("pro", annual ? "$208" : "$249");
      price("lite", annual ? "$108" : "$129");
    };
    const onBill = (e: Event) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-bill]");
      if (!el) return;
      setBilling(el.dataset.bill === "annual");
    };
    const onBillKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-bill]");
      if (!el) return;
      e.preventDefault();
      setBilling(el.dataset.bill === "annual");
    };
    root.addEventListener("click", onBill);
    root.addEventListener("keydown", onBillKey);

    /* 5. Reveal on scroll. An observer rather than the design's per-frame
       polling, plus a failsafe that shows everything if it never fires. */
    const reveals = [...root.querySelectorAll<HTMLElement>(".okara-reveal")];
    let io: IntersectionObserver | null = null;
    if (!reduced && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("okara-in");
            io?.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px" },
      );
      reveals.forEach((el) => io?.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add("okara-in"));
    }
    timers.push(
      window.setTimeout(() => reveals.forEach((el) => el.classList.add("okara-in")), 4000),
    );

    /* 6. The logo lanes ease to a stop under the cursor instead of snapping. */
    const lanes = [...root.querySelectorAll<HTMLElement>(".okara-mq-a, .okara-mq-b")];
    const marquee = root.querySelector<HTMLElement>(".okara-marquee");
    let rate = 1;
    let want = 1;
    let mqFrame = 0;
    const pump = () => {
      rate += (want - rate) * 0.08;
      lanes.forEach((l) => l.getAnimations().forEach((a) => (a.playbackRate = rate)));
      mqFrame = requestAnimationFrame(pump);
    };
    if (lanes.length) {
      frames.push((mqFrame = requestAnimationFrame(pump)));
      marquee?.addEventListener("mouseenter", () => (want = 0.15));
      marquee?.addEventListener("mouseleave", () => (want = 1));
    }

    /* 7. The icon clusters rotate. One image at a time, round robin, never
       showing a logo the cluster is already displaying, so the group always
       reads as a set of different companies. Clusters are offset from each
       other so they do not tick in unison. */
    if (!reduced) {
      root.querySelectorAll<HTMLElement>("[data-cycle]").forEach((group, gi) => {
        const pool = POOLS[group.dataset.cycle ?? ""];
        const imgs = [...group.querySelectorAll<HTMLImageElement>("img")];
        if (!pool || !imgs.length || pool.length <= imgs.length) return;
        /* The markup ships two sizes of the same logo, so match on the company
           rather than the file, or a cluster can show one brand twice. */
        const key = (src: string | null) =>
          (src ?? "").split("/").pop()?.replace(/-(?:64|128)\.png$/, "") ?? "";
        imgs.forEach((img) => {
          img.style.transition = `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`;
        });
        let slot = 0;
        let next = imgs.length;
        const tick = () => {
          const img = imgs[slot % imgs.length];
          const shown = new Set(imgs.map((i) => key(i.getAttribute("src"))));
          let tries = 0;
          while (shown.has(key(pool[next % pool.length])) && tries++ < pool.length) next += 1;
          const src = pool[next % pool.length];
          next += 1;
          slot += 1;
          img.style.opacity = "0";
          img.style.transform = "scale(0.82)";
          timers.push(
            window.setTimeout(() => {
              img.src = src;
              img.style.opacity = "1";
              img.style.transform = "scale(1)";
            }, FADE_MS),
          );
        };
        timers.push(
          window.setTimeout(
            () => timers.push(window.setInterval(tick, CYCLE_MS)),
            gi * 550,
          ),
        );
      });
    }

    /* 8. The two email-capture forms are decoration on a page with no backend.
       Swallow the submit rather than reloading the route. */
    const onSubmit = (e: Event) => e.preventDefault();
    const forms = [...root.querySelectorAll("form")];
    forms.forEach((f) => f.addEventListener("submit", onSubmit));

    return () => {
      window.removeEventListener("resize", fit);
      root.removeEventListener("click", onBill);
      root.removeEventListener("keydown", onBillKey);
      forms.forEach((f) => f.removeEventListener("submit", onSubmit));
      io?.disconnect();
      timers.forEach(window.clearTimeout);
      timers.forEach(window.clearInterval);
      frames.forEach(cancelAnimationFrame);
      cancelAnimationFrame(mqFrame);
    };
  }, []);

  return <div ref={rootRef} dangerouslySetInnerHTML={{ __html: MARKUP }} />;
}
