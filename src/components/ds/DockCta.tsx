import { BookCallB } from "@/components/cta/BookCallB";

/** The dock's call slot: the printed ticket at dock size. Swap this component to change the dock's CTA; the dock only
 *  places it. */
export function DockCta({ hold }: { hold?: boolean }) {
  return <BookCallB src="dock" size="dock" hold={hold} />;
}
