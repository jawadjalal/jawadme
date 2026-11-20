"use client";

import { callHref, openBooking } from "@/components/cal";

/** The call key: an oversized orange keycap that opens the booking. With live 3D, the shared canvas draws the key
 *  into this box (data-view="key") and the CSS cap steps aside; otherwise the CSS cap is the key. */
export function CallKey({ src }: { src: string }) {
  return (
    <a href={callHref(src)} onClick={openBooking(src)} className="key" data-view="key" data-cursor="book" aria-label="Book a call">
      <span className="key-cap poster-3d" aria-hidden="true">
        <span className="key-top">
          Book
          <br />a call
        </span>
      </span>
      <span className="lbl dim key-label">[ Press to book ]</span>
    </a>
  );
}
