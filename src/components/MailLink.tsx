"use client";

import { track } from "@/lib/track";
import { IDENTITY } from "@/lib/profile";

/** Email as a contact on par with booking: a plain mailto that logs email_open with where it was clicked, as ?src= does for the call. */
export const MAIL = "mailto:" + IDENTITY.email;
export const trackEmail = (src: string) => track("email_open", { src });

export function MailLink({ src, className, children }: { src: string; className?: string; children?: React.ReactNode }) {
  return (
    <a href={MAIL} className={className} onClick={() => trackEmail(src)}>
      {children ?? IDENTITY.email}
    </a>
  );
}
