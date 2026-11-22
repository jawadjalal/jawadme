"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { DockCta } from "./DockCta";
import { Gilded } from "@/components/gilded/Gilded";
import { NAV, SITE } from "@/content/site";

function Nav({ onPick, list }: { onPick?: () => void; list?: boolean }) {
  const path = usePathname();
  const c = useSearchParams().get("c");
  const current = (href: string) => {
    const [p, q] = href.split("?c=");
    return path === p && (q ? c === q : !c);
  };
  return (
    <>
      {NAV.map((n, i) =>
        list ? (
          <li key={n.href}>
            <Gilded variant="pill" href={n.href} selected={current(n.href)}>
              {n.label}
            </Gilded>
          </li>
        ) : (
          <Link key={n.href} href={n.href} aria-current={current(n.href) ? "page" : undefined} onClick={onPick} data-m="press" style={{ ["--i" as string]: i }}>
            {n.label}
            <span className="lbl dim" aria-hidden="true">↗</span>
          </Link>
        ),
      )}
    </>
  );
}

/** The ticket pinned to the corner of every page but /cal: the mark and the way round on its body, the
 *  call on its accent stub. The call stays on screen at every depth, so it is always one tap away; the body tucks away
 *  while the reader scrolls down, so it never sits over what they are reading, and returns on scroll up or a pause. */
export function Dock() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const dock = useRef<HTMLElement>(null);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const el = dock.current;
    if (!el) return;
    let last = window.scrollY;
    let idle = 0;
    const show = () => el.removeAttribute("data-tuck");
    const onScroll = () => {
      const y = window.scrollY;
      if (y > last + 2 && y > 80) el.setAttribute("data-tuck", "");
      else if (y < last - 2) show();
      last = y;
      window.clearTimeout(idle);
      idle = window.setTimeout(show, 260);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idle);
      show();
    };
  }, [path]);
  if (path === "/cal") return null;
  return (
    <>
      <div className="dock-sheet" data-open={open} id="dock-sheet" aria-hidden={!open}>
        <Suspense>
          <Nav onPick={() => setOpen(false)} />
        </Suspense>
        <span className="lbl">{SITE.detail}</span>
      </div>
      <nav ref={dock} className="dock" aria-label="site">
        <div className="dock-body">
          <Link href="/" className="dock-mark" aria-label="jawad jalal, home" data-m="press">
            <Image src="/design/jawad-die.webp" alt="" width={697} height={781} sizes="40px" priority />
          </Link>
          <ul className="dock-nav">
            <Suspense>
              <Nav list />
            </Suspense>
          </ul>
          <button className="dock-menu" data-m="press" aria-expanded={open} aria-controls="dock-sheet" onClick={() => setOpen((o) => !o)}>
            <i aria-hidden="true" />
            menu
          </button>
        </div>
        <DockCta hold={path === "/" || path === "/contact"} />
      </nav>
    </>
  );
}
