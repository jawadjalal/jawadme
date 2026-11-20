"use client";

import Link from "next/link";
import { callHref, openBooking } from "./cal";

export function BookLink({ src, className, children, cursor }: { src: string; className?: string; children: React.ReactNode; cursor?: boolean }) {
  return (
    <Link href={callHref(src)} className={className} onClick={openBooking(src)} data-cursor={cursor ? "book" : undefined}>
      {children}
    </Link>
  );
}
