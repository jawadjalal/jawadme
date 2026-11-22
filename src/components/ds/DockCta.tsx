import { Gilded } from "@/components/gilded/Gilded";

/** The dock's call slot: the gilded call at dock size. Swap this component to change the dock's CTA; the dock only
 *  places it. */
export function DockCta({ hold }: { hold?: boolean }) {
  return <Gilded variant="cta" src="dock" size="dock" hold={hold} />;
}
