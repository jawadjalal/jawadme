"use client";

// The quiet second action in the bar, a soft key beside Book a call: a plain mailto, counted as email_open from the blog
// nav. The envelope sits on a small paper tile; on phones the tile alone carries it.

import { Obj } from "./Obj";
import { MAIL, trackEmail } from "./MailLink";

export function NavEmail() {
  return (
    <a
      href={MAIL}
      onClick={() => trackEmail("blog-nav")}
      data-cur="say hi"
      aria-label="send an email"
      className="key key-soft h-9 gap-2 px-1.5 text-[14px] sm:pr-3"
    >
      <span className="key-tile">
        <Obj name="contact" size={20} />
      </span>
      <span className="hidden sm:inline">email</span>
    </a>
  );
}
