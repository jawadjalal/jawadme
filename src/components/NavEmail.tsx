"use client";

// The one action in the bar: a solid ink key, the strongest thing in the nav,
// as ignura.com's Growth Check is. The envelope sits on a small paper tile so
// its orange seal reads against the ink. It stays a real mailto in the markup,
// so with no script it still reaches him.

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
      className="key key-ink h-9 gap-2 pl-1.5 pr-3 text-[14px]"
    >
      <span className="key-tile">
        <Obj name="contact" size={20} />
      </span>
      <span className="hidden sm:inline">Send an email</span>
      <span className="sm:hidden">Email</span>
    </a>
  );
}
