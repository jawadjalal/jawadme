"use client";

import { useRef, useState } from "react";
import { track } from "@/lib/track";
import { IDENTITY } from "@/lib/profile";

/** Email as a contact on par with booking: a plain mailto that logs email_open with where it was clicked, as ?src= does for the call.
 *  The click also copies the address, for people without a mail app; the link shows "copied" for a moment and one shared
 *  status line announces it. */
export const MAIL = "mailto:" + IDENTITY.email;
export const trackEmail = (src: string) => track("email_open", { src });

let live: HTMLElement | null = null;
function announce(text: string) {
  if (!live) {
    live = document.createElement("p");
    live.setAttribute("role", "status");
    live.style.cssText = "position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap";
    document.body.append(live);
  }
  live.textContent = text;
}

export function MailLink({ src, className, children }: { src: string; className?: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  return (
    <a
      href={MAIL}
      className={className}
      data-mail=""
      data-m="press"
      data-copied={copied ? "" : undefined}
      onClick={() => {
        trackEmail(src);
        navigator.clipboard?.writeText(IDENTITY.email).then(
          () => {
            setCopied(true);
            announce(IDENTITY.email + " copied");
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => setCopied(false), 1800);
          },
          () => {},
        );
      }}
    >
      {children ?? IDENTITY.email}
    </a>
  );
}
