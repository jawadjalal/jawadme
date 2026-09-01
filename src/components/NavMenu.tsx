"use client";

// The header navigation, as menus.
//
// Each section of the page gets a menu listing what is actually inside it, so
// the header answers "what is on this page" without the reader having to
// scroll it to find out. Built on <details>, which means it opens with no
// JavaScript at all; the script here only adds the two behaviours the native
// element does not have: closing on outside click, and closing on Escape.

import { useEffect, useRef } from "react";
import { Icon, type IconName } from "./Icon";

export type NavGroup = {
  label: string;
  icon: IconName;
  items: { label: string; href: string; note?: string; external?: boolean }[];
};

export function NavMenu({ groups }: { groups: NavGroup[] }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeAll = (except?: EventTarget | null) => {
      host.current?.querySelectorAll("details[open]").forEach((d) => {
        if (!except || !d.contains(except as Node)) d.removeAttribute("open");
      });
    };

    const onDown = (e: PointerEvent) => {
      if (!host.current?.contains(e.target as Node)) closeAll();
      else closeAll(e.target);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };

    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={host} className="flex items-center gap-1">
      {groups.map((g) => (
        <details key={g.label} className="nav-menu">
          <summary data-cur="open">
            {g.label}
            <Icon name="chev" size={11} className="nav-chev" />
          </summary>
          <div className="nav-pop">
            {g.items.map((it) => (
              <a
                key={it.label}
                href={it.href}
                target={it.external ? "_blank" : undefined}
                rel={it.external ? "noopener noreferrer" : undefined}
                className="nav-item"
              >
                <span className="nav-item-label">{it.label}</span>
                {it.note && <span className="nav-item-note">{it.note}</span>}
              </a>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
