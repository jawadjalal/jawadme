"use client";

import { Gilded } from "@/components/gilded/Gilded";
import { callHref, trackBooking } from "@/components/cal";
import { SITE } from "@/content/site";

/** The call as a gilded pill, for a row of pills that the call's plate would break: same /cal?src= link, same book_open. */
export function BookPill({ src }: { src: string }) {
  return (
    <Gilded variant="pill" href={callHref(src)} onClick={() => trackBooking("book_open", src)}>
      {SITE.cta}
    </Gilded>
  );
}
