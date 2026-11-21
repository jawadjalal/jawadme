"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DockCta } from "./DockCta";
import { NAV, SITE } from "@/content/site";

function Nav({ onPick, onHover, list }: { onPick?: () => void; onHover?: (link: HTMLAnchorElement | null) => void; list?: boolean }) {
  const path = usePathname();
  const c = useSearchParams().get("c");
  const current = (href: string) => {
    const [p, q] = href.split("?c=");
    return path === p && (q ? c === q : !c) ? "page" : undefined;
  };
  return (
    <>
      {NAV.map((n, i) => {
        const link = (
          <Link
            key={n.href}
            href={n.href}
            aria-current={current(n.href)}
            onClick={onPick}
            onPointerEnter={(e) => e.pointerType === "mouse" && onHover?.(e.currentTarget)}
            onFocus={(e) => onHover?.(e.currentTarget)}
            onBlur={() => onHover?.(null)}
            data-m="press"
            style={{ ["--i" as string]: i }}
          >
            {n.label}
            <span className="lbl dim" aria-hidden="true">↗</span>
          </Link>
        );
        return list ? <li key={n.href}>{link}</li> : link;
      })}
    </>
  );
}

function DockNav() {
  const ref = useRef<HTMLUListElement>(null);
  const path = usePathname();
  const c = useSearchParams().get("c");
  const show = (link?: HTMLAnchorElement | null) => {
    const nav = ref.current;
    const line = nav?.querySelector<HTMLElement>(".dock-nav-line");
    if (!nav || !line) return;
    const target = link ?? nav.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
    if (!target) {
      delete nav.dataset.line;
      return;
    }
    const rect = target.getBoundingClientRect();
    line.style.transform = `translateX(${rect.left - nav.getBoundingClientRect().left}px) scaleX(${rect.width})`;
    nav.dataset.line = "";
  };
  useLayoutEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    show();
    const observer = new ResizeObserver(() => show());
    observer.observe(nav);
    nav.querySelectorAll("a").forEach((link) => observer.observe(link));
    document.fonts.ready.then(() => show());
    return () => observer.disconnect();
  }, [path, c]);
  return (
    <ul className="dock-nav" ref={ref} onPointerLeave={() => show()}>
      <Nav list onHover={show} />
      <li className="dock-nav-track" aria-hidden="true"><span className="dock-nav-line" /></li>
    </ul>
  );
}

/** The ticket pinned to the corner of every page but /cal and the viewer: the mark and the way round on its body, the
 *  call on its accent stub. It stays on screen at every depth, so the call is always one tap away. */
export function Dock() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  if (path === "/cal" || path.startsWith("/w/")) return null;
  return (
    <>
      <div className="dock-sheet" data-open={open} id="dock-sheet" aria-hidden={!open}>
        <Suspense>
          <Nav onPick={() => setOpen(false)} />
        </Suspense>
        <span className="lbl">{SITE.detail}</span>
      </div>
      <nav className="dock" aria-label="site">
        <div className="dock-body">
          <Link href="/" className="dock-mark" aria-label="jawad jalal, home" data-m="press">
            <Image src="/design/jawad-die.webp" alt="" width={697} height={781} sizes="40px" priority />
          </Link>
          <Suspense>
            <DockNav />
          </Suspense>
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
