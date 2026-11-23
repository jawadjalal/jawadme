"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookLink } from "@/components/BookLink";
import { NAV } from "@/content/site";

/** One slim bar on every page: the mark home, work · about · contact, and the call. */
export function Dock() {
  const path = usePathname();
  if (path === "/cal") return null;

  return (
    <nav className="sbar" aria-label="site">
      <Link href="/" className="sbar-brand" aria-label="jawad jalal, home" aria-current={path === "/" ? "page" : undefined}>
        <Image src="/design/jawad-die.webp" alt="" width={36} height={40} sizes="24px" className="sbar-head" />
        <span>JAWAD JALAL</span>
      </Link>
      <ul className="sbar-nav">
        {NAV.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="sbar-link"
              aria-current={path === l.href || path.startsWith(l.href + "/") ? "page" : undefined}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <BookLink src="dock" className="sbar-cta">
        book a call <span aria-hidden="true">↗</span>
      </BookLink>
    </nav>
  );
}
