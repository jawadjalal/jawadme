import { BookLink } from "@/components/BookLink";
import { SITE } from "@/content/site";

/** The dock's call slot: the ember stub at the end of the ticket. Swap this component to change the dock's CTA; the
 *  dock only places it. */
export function DockCta() {
  return (
    <BookLink src="dock" className="dock-cta" cursor>
      <span>
        {SITE.cta} <span className="arr">↗</span>
      </span>
      <small>{SITE.detail}</small>
    </BookLink>
  );
}
