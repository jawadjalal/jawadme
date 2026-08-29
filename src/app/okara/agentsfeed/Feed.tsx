"use client";

/* Drives one agents-feed prototype. The design carried a small state machine
   and the port left its pieces behind as data attributes, so this reads them
   and applies the same rules:

     xOpen / infOpen   the two cards collapse, measured rather than guessed
     revealed          the next draft sits under a blur until you ask for it
     xState            idle, then flying for 760ms while the post leaves, then done
     infState          idle, then the paywall when you try to create a campaign

   Two instances of this live on the page (the panel alone, then the panel
   inside the dashboard) and they keep their own state, the way two browser
   tabs would. */
import { memo, useEffect, useState } from "react";

const FLIGHT_MS = 760;

type State = {
  xOpen: boolean;
  infOpen: boolean;
  revealed: boolean;
  xState: "idle" | "flying" | "done";
  infState: "idle" | "paywall";
};

export function useFeedPrototype(root: HTMLElement | null) {
  useEffect(() => {
    if (!root) return;
    const s: State = {
      xOpen: true,
      infOpen: true,
      revealed: false,
      xState: "idle",
      infState: "idle",
    };
    let flight = 0;
    const settles = new Map<HTMLElement, number>();

    const when = (name: string, on: boolean) =>
      root.querySelectorAll<HTMLElement>(`[data-when="${name}"]`).forEach((el) => {
        el.style.display = on ? "contents" : "none";
      });

    const apply = () => {
      (["x", "inf"] as const).forEach((k) => {
        const open = k === "x" ? s.xOpen : s.infOpen;
        root.querySelectorAll<HTMLElement>(`[data-rot="${k}"]`).forEach((el) => {
          el.style.transform = open ? "rotate(0deg)" : "rotate(180deg)";
        });
        root.querySelectorAll<HTMLElement>(`[data-wrap="${k}"]`).forEach((el) => {
          /* max-height cannot transition to or from none, so a collapse pins
             the measured height first and an open settles back to none once
             the transition has run. Without that last step the card would clip
             anything that grows inside it, like the paywall. */
          el.style.opacity = open ? "1" : "0";
          if (!open) {
            el.style.maxHeight = `${el.scrollHeight}px`;
            requestAnimationFrame(() => {
              el.style.maxHeight = "0px";
            });
          } else {
            el.style.maxHeight = `${el.scrollHeight}px`;
            window.clearTimeout(settles.get(el));
            settles.set(
              el,
              window.setTimeout(() => {
                if (el.style.maxHeight !== "0px") el.style.maxHeight = "none";
              }, 420),
            );
          }
        });
      });

      root.querySelectorAll<HTMLElement>("[data-blur]").forEach((el) => {
        el.style.filter = s.revealed ? "blur(0px)" : "blur(5px)";
      });
      root.querySelectorAll<HTMLElement>('[data-fly="x"]').forEach((el) => {
        el.classList.toggle("okara-flyout", s.xState === "flying");
      });

      when("xShowFirst", s.xState !== "done");
      when("xShowNext", s.xState === "done");
      when("xHidden", !s.revealed);
      when("xIdle", s.xState === "idle");
      when("xFlying", s.xState === "flying");
      when("xDone", s.xState === "done");
      when("infIdle", s.infState === "idle");
      when("infPaywall", s.infState === "paywall");

      /* The panel changes height when a card collapses or the paywall opens.
         Whatever is scaling it to fit the screen needs to hear about that. */
      root.dispatchEvent(new CustomEvent("okara:resize", { bubbles: true }));
    };

    const act = (name: string) => {
      switch (name) {
        case "toggleX":
          s.xOpen = !s.xOpen;
          break;
        case "toggleInf":
          s.infOpen = !s.infOpen;
          break;
        case "reveal":
          s.revealed = true;
          break;
        case "post":
          if (s.xState === "flying") return;
          s.xState = "flying";
          s.revealed = false;
          flight = window.setTimeout(() => {
            s.xState = "done";
            apply();
          }, FLIGHT_MS);
          break;
        case "create":
          s.infState = "paywall";
          break;
        case "cancel":
          s.infState = "idle";
          break;
        default:
          return;
      }
      apply();
    };

    const onClick = (e: Event) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-act]");
      if (!el || !root.contains(el)) return;
      e.preventDefault();
      act(el.dataset.act ?? "");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-act]");
      if (!el || !root.contains(el)) return;
      e.preventDefault();
      act(el.dataset.act ?? "");
    };
    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKey);
    /* Forms inside the prototype have nowhere to post to. */
    const forms = [...root.querySelectorAll("form")];
    const swallow = (e: Event) => e.preventDefault();
    forms.forEach((f) => f.addEventListener("submit", swallow));

    apply();
    /* Fonts land after first paint and change the measured heights. */
    const settle = window.setTimeout(apply, 600);

    return () => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKey);
      forms.forEach((f) => f.removeEventListener("submit", swallow));
      window.clearTimeout(flight);
      window.clearTimeout(settle);
      settles.forEach((id) => window.clearTimeout(id));
    };
  }, [root]);
}

/* One prototype, mounted from a markup string and wired up.

   Memoised on purpose. The parent re-renders whenever it re-measures the
   viewport, and a re-render here hands React a fresh dangerouslySetInnerHTML
   object, which rewrites the subtree and throws away every inline style the
   driver has set. The markup never changes, so skipping those renders is both
   correct and the thing that keeps the prototype's state on screen. */
function Feed({ html, className }: { html: string; className?: string }) {
  /* A callback ref in state rather than useRef, so the hook runs once the node
     actually exists. */
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  useFeedPrototype(node);
  return <div ref={setNode} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default memo(Feed);
