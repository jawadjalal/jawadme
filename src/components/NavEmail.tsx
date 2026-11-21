"use client";

// The quiet second action in the bar, a soft key beside Book a call. The
// envelope sits on a small paper tile; on phones the tile alone carries it. It
// stays a real mailto in the markup, so with no script it still reaches him.

import { Obj } from "./Obj";
import { openContact } from "./contact";
import { IDENTITY } from "@/lib/profile";

export function NavEmail() {
  return (
    <a
      href={`mailto:${IDENTITY.email}`}
      onClick={(e) => {
        e.preventDefault();
        openContact();
      }}
      data-cur="say hi"
      aria-label="Send an email"
      className="key key-soft h-9 gap-2 px-1.5 text-[14px] sm:pr-3"
    >
      <span className="key-tile">
        <Obj name="contact" size={20} />
      </span>
      <span className="hidden sm:inline">Email</span>
    </a>
  );
}
