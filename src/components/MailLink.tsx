"use client";

import { useEffect, useRef, useState } from "react";
import { MAIL, copyEmail, trackEmail } from "@/lib/mail";
import { IDENTITY } from "@/lib/profile";

export { MAIL, trackEmail } from "@/lib/mail";

/** Clean Neo-Industrial email link that opens mail, logs email_open, and copies the address
 *  with an inline "copied" feedback badge. */
export function MailLink({
  src,
  className,
  children,
}: {
  src: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <a
      href={MAIL}
      className={className}
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
      {children ?? IDENTITY.email}
      <span className="mail-tag" aria-hidden="true">
        copied
      </span>
    </a>
  );
}
