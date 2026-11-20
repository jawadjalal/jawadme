"use client";

import { callHref, openBooking } from "./cal";

/** A booking link: /call?src=<src> without JavaScript, Cal's popup with it. */
export function BookLink({ src, className, children }: { src: string; className?: string; children: React.ReactNode }) {
  return (
    <a href={callHref(src)} className={className} onClick={openBooking(src)}>
      {children}
    </a>
  );
}
