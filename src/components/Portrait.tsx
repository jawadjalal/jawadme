"use client";

// The portrait, in its double frame, with the switch that swaps the face.
//
// Both images are in the DOM and one is faded over the other, rather than the
// src being swapped: swapping would show an empty box on the first flip while
// the second file downloads, which is the one frame that matters here.
//
// The switch is a real `role="switch"` button rather than a click target on
// the image, so it is reachable by keyboard and announces its state. An
// image that silently changes when you click it tells a screen reader
// nothing.

import Image from "next/image";
import { useState } from "react";
import { IDENTITY } from "@/lib/profile";

export function Portrait() {
  const [alt, setAlt] = useState(false);

  return (
    <div className="flex w-fit flex-col items-center gap-2">
      <div className="w-fit rounded-[10px] border border-border p-[3px]">
        <div className="relative box-border size-16 select-none overflow-hidden rounded-[8px] border border-border bg-muted sm:size-20 md:size-[88px]">
          <Image
            src={IDENTITY.avatar}
            alt={`${IDENTITY.properName}, designer and founder`}
            width={160}
            height={160}
            priority
            className="absolute inset-0 size-full rounded-[6px] object-cover transition-opacity duration-300"
            style={{ opacity: alt ? 0 : 1 }}
          />
          <Image
            src={IDENTITY.avatarAlt}
            alt=""
            aria-hidden="true"
            width={160}
            height={160}
            className="absolute inset-0 size-full rounded-[6px] object-cover transition-opacity duration-300"
            style={{ opacity: alt ? 1 : 0 }}
          />
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={alt}
        aria-label="Show the other portrait"
        data-cur={alt ? "back" : "swap"}
        onClick={() => setAlt((v) => !v)}
        className={`tap relative h-[18px] w-8 shrink-0 rounded-full border outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring ${
          // Reads as on. A switch whose two states differ only by where the
          // knob sits is a switch you have to look at twice.
          alt ? "border-foreground bg-foreground" : "border-border bg-muted"
        }`}
      >
        <span
          aria-hidden="true"
          className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-background shadow-sm transition-[left] duration-200"
          style={{ left: alt ? "calc(100% - 14px)" : "2px" }}
        />
      </button>
    </div>
  );
}
