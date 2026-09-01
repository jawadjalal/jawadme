"use client";

// The closing button.
//
// Deliberately not magnetic, unlike the three in the hero. This is the last
// control on the page and the one a reader arrives at having decided to use
// it, rather than one they discover on the way past; a label that slides
// under the cursor at that moment is friction, not delight. The hover reveal
// is enough.

import Image from "next/image";
import { IDENTITY } from "@/lib/profile";

export function Cta() {


  return (
    <a
      href={`mailto:${IDENTITY.email}`}
      data-cur="say hi"
      className="cta-btn group inline-flex cursor-pointer items-center self-center rounded-md border px-2 py-1 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
    >
      <span
        className="relative z-20 flex items-center gap-2 transition-[gap] duration-300 group-hover:gap-8"
      >
        <span className="size-5 shrink-0 overflow-hidden rounded-full">
          <Image
            src={IDENTITY.avatar}
            alt=""
            width={40}
            height={40}
            className="size-full object-cover"
          />
        </span>
        <span
          aria-hidden="true"
          className="absolute left-6 flex -translate-x-full items-center opacity-0 transition-[transform,opacity] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          <span className="cta-you ml-1 mr-2 flex size-5 items-center justify-center rounded-full text-[8px]">
            You
          </span>
        </span>
        <span className="relative ml-0 block whitespace-nowrap text-sm font-bold transition-[margin-left] duration-300 group-hover:ml-4">
          Send an email
        </span>
      </span>
    </a>
  );
}
