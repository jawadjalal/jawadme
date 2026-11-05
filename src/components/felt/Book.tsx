// The booking key, the hero of the tab at the foot and of the last drawer: the call's real length and place from
// Cal.com (booking.ts), the next free day, and a live dot when there is a slot this week. Styles: felt.css (`fh-book`).
import { BOOK } from "./copy";
import type { Booking } from "./booking";

export function Book({ b, big }: { b: Booking; big?: boolean }) {
  const next = b.slots[0];
  return (
    <a className={`fh-book${big ? " fh-book-big" : ""}`} href={BOOK} target="_blank" rel="noreferrer">
      <span className="fh-book-glyph" aria-hidden="true">
        {b.where === "meet" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/meet.svg" alt="" width={22} height={18} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="5" width="11" height="10" rx="2.5" fill="currentColor" />
            <path d="M14 9l4-2.5v7L14 11z" fill="currentColor" />
          </svg>
        )}
      </span>
      <span className="fh-book-text">
        <b>Book a call</b>
        <span>
          {b.minutes} min · {b.where === "meet" ? "Google Meet" : "video call"}
          {next && (
            <>
              {" "}
              · <i className="fh-live" aria-hidden="true" />
              next free {next.day.split(" ")[0]} {next.time}
            </>
          )}
        </span>
      </span>
      <svg className="fh-book-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 11l6-6M6 5h5v5" />
      </svg>
    </a>
  );
}
