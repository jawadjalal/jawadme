"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookLink } from "@/components/BookLink";
import { MailLink } from "@/components/MailLink";
import { SITE } from "@/content/site";

/** Brass Hands–style bottom bar: clean head mark on left, centered nav (and centered MENU on mobile),
 *  CV download + Email, and square glossy Book a Call CTA on right. */
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
          <Link href="/" aria-current={isActive("/") ? "page" : undefined} onClick={() => setOpen(false)}>
            <span>HOME</span>
            <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/work" aria-current={isActive("/work") ? "page" : undefined} onClick={() => setOpen(false)}>
            <span>WORK</span>
            <span aria-hidden="true">↗</span>
          </Link>
          <a href={SITE.cv} download onClick={() => setOpen(false)}>
            <span>DOWNLOAD CV</span>
            <span aria-hidden="true">↓</span>
          </a>
          <MailLink src="dock-sheet" className="bh-sheet-mail">
            <span>EMAIL</span>
            <span aria-hidden="true">↗</span>
          </MailLink>
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

          <ul className="bh-dock-nav">
            <li>
              <Link href="/" className={"bh-dock-link" + (isActive("/") ? " is-active" : "")}>
                HOME
              </Link>
            </li>
            <li>
              <Link href="/work" className={"bh-dock-link" + (isActive("/work") ? " is-active" : "")}>
                WORK
              </Link>
            </li>
            <li>
              <a href={SITE.cv} download className="bh-dock-link">
                CV
              </a>
            </li>
            <li>
              <MailLink src="dock" className="bh-dock-link">
                EMAIL
              </MailLink>
            </li>
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
            <span className="bh-cta-in">BOOK A CALL ↗</span>
          </BookLink>
        </div>
      </nav>
    </>
  );
}
