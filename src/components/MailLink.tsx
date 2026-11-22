"use client";

import { useEffect, useRef, useState } from "react";
import { Gilded } from "@/components/gilded/Gilded";
import { MAIL, copyEmail, trackEmail } from "@/lib/mail";
import { IDENTITY } from "@/lib/profile";

export { MAIL, trackEmail } from "@/lib/mail";

/** The email. On its own it is the gilded email button with the address; wrapped around something drawn (the footer
 *  pillar's painted sign) it stays a plain link so the drawing shows. Either way a click opens mail, logs email_open,
 *  and copies the address with a copied tag and a status line. */
export function MailLink({ src, children }: { src: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  if (!children)
    return (
      <Gilded variant="email" src={src}>
        {IDENTITY.email}
      </Gilded>
    );
  return (
    <a
      href={MAIL}
      data-mail=""
      data-copied={copied ? "" : undefined}
      onClick={() => {
        trackEmail(src);
        copyEmail().then((ok) => {
          if (!ok) return;
          setCopied(true);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setCopied(false), 1800);
        });
      }}
    >
      {children}
      <span className="mail-tag" aria-hidden="true">
        copied
      </span>
    </a>
  );
}
