"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BookLink } from "@/components/BookLink";
import { NAV, SITE } from "@/content/site";

function Nav({ onPick }: { onPick?: () => void }) {
  const path = usePathname();
  const f = useSearchParams().get("f");
  const current = (href: string) => {
    const [p, q] = href.split("?f=");
    return path === p && (q ? f === q : !f) ? "page" : undefined;
  };
  return (
    <>
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} aria-current={current(n.href)} onClick={onPick}>
          {n.label}
          <span className="lbl dim" aria-hidden="true">↗</span>
        </Link>
      ))}
    </>
  );
}

/** The fixed bottom bar on every page but /cal: the mark, four links, and the call block. */
export function Dock() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [hide, setHide] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    let last = scrollY;
    const on = () => {
      const y = scrollY;
      if (Math.abs(y - last) < 6) return;
      setHide(y > last && y > 320);
      last = y;
    };
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  if (path === "/cal" || path.startsWith("/w/")) return null;
  return (
    <>
      <div className="dock-sheet" data-open={open} id="dock-sheet" aria-hidden={!open}>
        <Suspense>
          <Nav onPick={() => setOpen(false)} />
        </Suspense>
        <span className="lbl">{SITE.detail}</span>
      </div>
      <nav className="dock" aria-label="Site" data-hide={hide && !open}>
        <Link href="/" className="dock-mark" aria-label="Jawad Jalal, home">
          <Image src="/design/jawad-die.webp" alt="" width={697} height={781} sizes="40px" priority />
        </Link>
        <ul className="dock-nav">
          <Suspense>
            <Nav />
          </Suspense>
        </ul>
        <button className="dock-menu" aria-expanded={open} aria-controls="dock-sheet" onClick={() => setOpen((o) => !o)}>
          <i aria-hidden="true" />
          Menu
        </button>
        <BookLink src="dock" className="dock-cta" cursor>
          <span>
            {SITE.cta} <span className="arr">↗</span>
          </span>
          <small>{SITE.detail}</small>
        </BookLink>
      </nav>
    </>
  );
}
