"use client";

import Image from "next/image";
import Link from "next/link";
import { callHref, openBooking } from "@/components/cal";
import "./bookcallA.css";

/** The call, struck as a brass plate set in its bed: an ember enamel seal with the face, engraved lettering, and a
 *  plate that catches the light on hover and seats into its recess on press. */
export function BookCallA({ src, size }: { src: string; size: "dock" | "hero" }) {
  return (
    <Link href={callHref(src)} onClick={openBooking(src)} className="bca" data-size={size} data-cursor="book">
      <span className="bca-ring" aria-hidden="true" />
      <span className="bca-lift">
        <span className="bca-plate">
          <span className="bca-face">
            <span className="bca-seal">
              <Image src="/design/jawad-die.webp" alt="" width={697} height={781} sizes="40px" />
            </span>
            <span className="bca-type">
              <span className="bca-t">book a call</span>
              <span className="bca-sub">15 min, video</span>
            </span>
            <svg className="bca-arr" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2.5 9.5 9 3M4 2.75h5.25V8" />
            </svg>
            <span className="bca-glint" aria-hidden="true" />
          </span>
        </span>
      </span>
    </Link>
  );
}
