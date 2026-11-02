"use client";

// The portrait, pinned to the hero sheet on a white mat, with the switch that
// swaps the drawing for the memoji it was drawn from.
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
    <div className="portrait">
      <div className="portrait-mat">
        <div className="portrait-frame relative box-border select-none overflow-hidden rounded-[14px] bg-background">
          <Image
            src={IDENTITY.avatar}
            alt={`${IDENTITY.properName}, designer and founder`}
            width={320}
            height={320}
            priority
            className="absolute inset-0 size-full rounded-[14px] object-cover transition-opacity duration-300"
            style={{ opacity: alt ? 0 : 1 }}
          />
          <Image
            src={IDENTITY.avatarAlt}
            alt=""
            aria-hidden="true"
            width={320}
            height={320}
            className="absolute inset-0 size-full rounded-[14px] object-cover transition-opacity duration-300"
            style={{ opacity: alt ? 1 : 0 }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
      <span className="flip-note" aria-hidden="true">flip me</span>
      <button
        type="button"
        role="switch"
        aria-checked={alt}
        aria-label="Show the memoji"
        data-cur={alt ? "back" : "swap"}
        onClick={() => setAlt((v) => !v)}
        className={`tap relative h-5 w-9 shrink-0 rounded-full outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring ${
          // Reads as on. A switch whose two states differ only by where the
          // knob sits is a switch you have to look at twice.
          alt ? "bg-foreground" : "bg-muted"
        }`}
      >
        <span
          aria-hidden="true"
          className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-background shadow-sm transition-[left] duration-200"
          style={{ left: alt ? "calc(100% - 18px)" : "2px" }}
        />
      </button>
      </div>
    </div>
  );
}
