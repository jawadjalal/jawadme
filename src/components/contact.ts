"use client";

// One event, so any button anywhere on the page can open the modal without
// three separate components having to share a provider or lift state into the
// page. The modal is mounted once and listens.

export const CONTACT_OPEN = "contact:open";

export function openContact() {
  window.dispatchEvent(new Event(CONTACT_OPEN));
}
