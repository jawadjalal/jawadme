"use client";

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

/** The fixed bottom bar on every page but /call: the mark, four links, the booking status and the call block. */
export function Dock() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  if (path === "/call" || path.startsWith("/w/")) return null;
  return (
    <>
      <div className="dock-sheet" data-open={open} id="dock-sheet" aria-hidden={!open}>
        <Suspense>
          <Nav onPick={() => setOpen(false)} />
        </Suspense>
        <span className="lbl">[ ● Booking {SITE.bookingMonth} · {SITE.detail} ]</span>
      </div>
      <nav className="dock" aria-label="Site">
        <Link href="/" className="dock-mark" aria-label="Jawad Jalal, home">
          <svg viewBox="0 0 40 24" aria-hidden="true">
            <path fill="currentColor" d="M8 0h10v15.5C18 21 14.6 24 9.3 24 4 24 1 21.2 0 16.8l6.3-1.6c.4 1.9 1.4 3 3 3 1.6 0 2.3-1 2.3-3.1V5.6H8V0Zm20 0h10v15.5C38 21 34.6 24 29.3 24c-5.3 0-8.3-2.8-9.3-7.2l6.3-1.6c.4 1.9 1.4 3 3 3 1.6 0 2.3-1 2.3-3.1V5.6H28V0Z" />
          </svg>
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
        <span className="dock-status lbl">
          <i aria-hidden="true" />[ Booking {SITE.bookingMonth} ]
        </span>
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
