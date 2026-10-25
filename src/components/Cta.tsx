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
import { openContact } from "./contact";

export function Cta() {
  return (
    <a
      href={`mailto:${IDENTITY.email}`}
      onClick={(e) => {
        e.preventDefault();
        openContact();
      }}
      data-cur="say hi"
      className="key key-ink group h-12 cursor-pointer pl-2.5 pr-5 text-[16px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
    >
      <span
        className="relative z-20 flex items-center gap-2 transition-[gap] duration-300 group-hover:gap-8"
      >
        <span className="size-7 shrink-0 overflow-hidden rounded-[8px] bg-[var(--paper)]">
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
          className="absolute left-8 flex -translate-x-full items-center opacity-0 transition-[transform,opacity] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          <span className="cta-you ml-1 mr-2 flex size-7 items-center justify-center rounded-[8px] text-[10px] font-bold">
            You
          </span>
        </span>
        <span className="relative ml-0 block whitespace-nowrap font-bold transition-[margin-left] duration-300 group-hover:ml-6">
          Send an email
        </span>
      </span>
    </a>
  );
}
