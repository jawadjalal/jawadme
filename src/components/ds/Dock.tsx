"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookLink } from "@/components/BookLink";
import { NAV, SITE } from "@/content/site";

const ITEMS = [{ label: "home", href: "/" }, ...NAV];

/** Brass Hands–inspired floating matte-obsidian bottom command dock.
 *  Centered, crisp 1px border, architectural corner ticks, active ember indicator,
 *  and direct Book a Call CTA. Clean mobile drawer included. */
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
        <div className="bh-sheet-head">
          <span>NAVIGATION</span>
          <span>{SITE.available.toUpperCase()}</span>
        </div>
        <div className="bh-sheet-links">
          {ITEMS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <span className="bh-sheet-idx">0{i + 1}</span>
              <span className="bh-sheet-lbl">{item.label.toUpperCase()}</span>
              <span className="bh-sheet-arr" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
        <div className="bh-sheet-foot">
          <span>LONDON, UK</span>
          <span>{SITE.detail.toUpperCase()}</span>
        </div>
      </div>

      <nav className="bh-dock" aria-label="Site navigation">
        <div className="bh-dock-shell">
          <Link href="/" className="bh-dock-brand" aria-label="Jawad Jalal, home">
            <Image src="/design/jawad-die.webp" alt="" width={64} height={72} sizes="28px" />
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
                    {active ? <i className="bh-dock-dot" aria-hidden="true" /> : null}
                    <span>{item.label.toUpperCase()}</span>
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

          <BookLink src="dock" className="bh-dock-cta">
            BOOK A CALL ↗
          </BookLink>
        </div>
      </nav>
    </>
  );
}
