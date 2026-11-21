import { track } from "@/lib/track";
import { IDENTITY } from "@/lib/profile";

/** Email as a contact on par with booking: a plain mailto that logs email_open with where it was clicked, as ?src= does
 *  for the call. A click also copies the address, for people without a mail app, and one shared status line announces it. */
export const MAIL = "mailto:" + IDENTITY.email;
export const trackEmail = (src: string) => track("email_open", { src });

let live: HTMLElement | null = null;
/** Copies the address and says so to screen readers; resolves true once it is on the clipboard. */
export function copyEmail(): Promise<boolean> {
  if (!navigator.clipboard) return Promise.resolve(false);
  return navigator.clipboard.writeText(IDENTITY.email).then(
    () => {
      if (!live) {
        live = document.createElement("p");
        live.setAttribute("role", "status");
        live.style.cssText = "position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap";
        document.body.append(live);
      }
      live.textContent = IDENTITY.email + " copied";
      return true;
    },
    () => false,
  );
}
