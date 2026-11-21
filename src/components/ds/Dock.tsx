"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DockCta } from "./DockCta";
import { NAV, SITE } from "@/content/site";

function Nav({ onPick, list }: { onPick?: () => void; list?: boolean }) {
  const path = usePathname();
  const c = useSearchParams().get("c");
  const current = (href: string) => {
    const [p, q] = href.split("?c=");
    return path === p && (q ? c === q : !c) ? "page" : undefined;
  };
  return (
    <>
      {NAV.map((n) => {
        const link = (
          <Link key={n.href} href={n.href} aria-current={current(n.href)} onClick={onPick}>
            {n.label}
            <span className="lbl dim" aria-hidden="true">↗</span>
          </Link>
        );
        return list ? <li key={n.href}>{link}</li> : link;
      })}
    </>
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
          <Link href="/" className="dock-mark" aria-label="jawad jalal, home">
            <Image src="/design/jawad-die.webp" alt="" width={697} height={781} sizes="40px" priority />
          </Link>
          <ul className="dock-nav">
            <Suspense>
              <Nav list />
            </Suspense>
          </ul>
          <button className="dock-menu" aria-expanded={open} aria-controls="dock-sheet" onClick={() => setOpen((o) => !o)}>
            <i aria-hidden="true" />
            menu
          </button>
        </div>
        <DockCta />
      </nav>
    </>
  );
}
