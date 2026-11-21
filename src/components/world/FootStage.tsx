"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MAIL, trackEmail } from "@/components/MailLink";
import { SITE, SOCIAL } from "@/content/site";
import { IDENTITY } from "@/lib/profile";
import type { Exit, FootV } from "./foot";
import { Stage } from "./kit/Stage";

// The footer's object: the last chamber of the world on flat ink, the same on every page (./footScene on the world
// kit's Stage). Its targets are real links laid over the scene, which moves them onto the object every frame, so they
// work for keyboards and screen readers, and over the poster (a render of the same chamber) where the scene does not
// run. ?footer=a|b|c picks the take.

const X = SOCIAL.find((s) => s.label === "X")!.href;
const LANES = SITE.lanes.join(", ");
const CALL = (src: string): Exit => ({ key: "call", label: SITE.cta, sub: SITE.detail, href: "/cal?src=" + src, glyph: "call", main: true });

export const EXITS: Record<FootV, Exit[]> = {
  a: [CALL("footer-door"), { key: "work", label: "Work", sub: LANES, href: "/work", glyph: "work" }, { key: "x", label: "X", sub: "@" + new URL(X).pathname.slice(1), href: X, glyph: "x" }, { key: "mail", label: "Email", sub: IDENTITY.email, href: MAIL, glyph: "mail" }],
  b: [CALL("footer-card"), { key: "work", label: "See the work", sub: LANES, href: "/work", glyph: "work" }, { key: "hi", label: "Say hi", sub: IDENTITY.email, href: MAIL, glyph: "mail" }],
  c: [
    CALL("footer-die"),
    { key: "work", label: "Work", sub: LANES, href: "/work", glyph: "work" },
    { key: "ads", label: "Ads", sub: "Ads for startups", href: "/ads", glyph: "ads" },
    { key: "3d", label: "3D", sub: "Worlds and objects", href: "/work?f=3d", glyph: "cube" },
    { key: "roblox", label: "Roblox", sub: "Games I design and build", href: "/work?f=roblox", glyph: "roblox" },
    { key: "hi", label: "Say hi", sub: IDENTITY.email, href: MAIL, glyph: "mail" },
  ],
};

const HINT: Record<FootV, string> = { a: "Pick a door.", b: "Pick one.", c: "Roll for it." };

export function FootStage() {
  const router = useRouter();
  const [v, setV] = useState<FootV>("a");
  useEffect(() => {
    const f = new URLSearchParams(location.search).get("footer");
    if (f === "b" || f === "c") setV(f);
  }, []);
  const [face, setFace] = useState("call");
  const [rolls, setRolls] = useState(0);
  const load = useCallback(
    () =>
      import("./footScene").then((m) => (host: HTMLElement, ctx: Parameters<typeof m.mount>[1]) =>
        m.mount(host, ctx, {
          v,
          exits: EXITS[v],
          el: (k) => host.parentElement!.querySelector<HTMLElement>('[data-exit="' + k + '"]'),
          go: (href) => (href.startsWith("/") ? router.push(href) : location.assign(href)),
          face: (k) => {
            setFace(k);
            setRolls((n) => n + 1);
          },
        }),
      ),
    [v, router],
  );

  const exits = EXITS[v];
  const shown = exits.find((e) => e.key === face) ?? exits[0];
  const ext = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noopener" } : href === MAIL ? { onClick: () => trackEmail("footer-" + v) } : {});
  return (
    <Stage load={load} poster={{ d: "/world/poster/foot-" + v + "-d.webp", m: "/world/poster/foot-" + v + "-m.webp" }} className="foot-stage" data-v={v}>
      <div className="foot-head">
        <h2 className="foot-h">Where to next?</h2>
        <p className="foot-hint">{HINT[v]}</p>
      </div>
      <nav className="foot-ui" aria-label="Where to next">
        {v === "c" ? <button type="button" data-exit="die" className="foot-die" aria-label="Roll the die: it lands on a page to visit" /> : null}
        {v === "c" ? (
          <a data-exit="pick" href={shown.href} className={"foot-pick" + (shown.main ? " main" : "")} {...ext(shown.href)} aria-live="polite">
            <span className="foot-pick-k">{rolls > 1 ? "The die says" : "Jawad says"}</span>
            <span className="foot-pick-l">
              {shown.label} <span aria-hidden="true">↗</span>
            </span>
            <span className="foot-pick-s">{shown.sub}</span>
          </a>
        ) : null}
        {exits.map((e) => (
          <a key={e.key} data-exit={v === "c" ? undefined : e.key} href={e.href} className={"foot-x" + (e.main ? " main" : "")} {...ext(e.href)}>
            <span className="foot-x-t">
              <span className="foot-x-l">
                {e.label} <span aria-hidden="true">↗</span>
              </span>
              <span className="foot-x-s">{e.sub}</span>
            </span>
          </a>
        ))}
      </nav>
    </Stage>
  );
}
