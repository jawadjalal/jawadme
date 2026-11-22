"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookLink } from "@/components/BookLink";
import { NAV } from "@/content/site";

const ITEMS = [{ label: "home", href: "/" }, ...NAV];

/** Brass Hands–style bottom command bar: opaque matte #242424, sharp 0px geometry,
 *  clean head mark without gold background, uppercase mono links, hatched corner-bracketed CTA. */
export function Dock() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  if (path === "/cal") return null;

  const isActive = (href: string) => {
    if (href === "/") return path === "/";
    return path === href || path.startsWith(href + "/");
  };

  return (
    <>
      <div className="bh-sheet" data-open={open} id="bh-dock-sheet" aria-hidden={!open}>
        <div className="bh-sheet-links">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <span>{item.label.toUpperCase()}</span>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </div>

      <nav className="bh-dock" aria-label="Site navigation">
        <div className="bh-dock-shell">
          <Link href="/" className="bh-dock-brand" aria-label="Jawad Jalal, home">
            <Image
              src="/design/jawad-die.webp"
              alt=""
              width={36}
              height={40}
              sizes="28px"
              className="bh-head-sm"
            />
            <span>JAWAD</span>
          </Link>

          <span className="bh-dock-div" aria-hidden="true" />

          <ul className="bh-dock-nav">
            {ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={"bh-dock-link" + (active ? " is-active" : "")}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label.toUpperCase()}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            className="bh-dock-menu"
            aria-expanded={open}
            aria-controls="bh-dock-sheet"
            onClick={() => setOpen((o) => !o)}
          >
            <span>{open ? "CLOSE" : "MENU"}</span>
            <i aria-hidden="true" />
          </button>

          <BookLink src="dock" className="bh-cta bh-cta-sm">
            BOOK A CALL ↗
          </BookLink>
        </div>
      </nav>
    </>
  );
}
