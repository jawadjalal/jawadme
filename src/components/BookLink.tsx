"use client";

import { callHref, openBooking } from "./cal";

/** A booking link: /call?src=<src> without JavaScript, Cal's popup with it. */
export function BookLink({ src, className, children, cursor }: { src: string; className?: string; children: React.ReactNode; cursor?: boolean }) {
  return (
    <a href={callHref(src)} className={className} onClick={openBooking(src)} data-cursor={cursor ? "book" : undefined}>
      {children}
    </a>
  );
}
