"use client";

// The contact form, in a dialog.
//
// A native <dialog> opened with showModal(), which is what gets the focus
// trap, the Escape key, the inert background and the top layer for free.
// Hand-rolling those is where custom modals go wrong: focus escapes to the
// page behind, or Escape does nothing.
//
// The buttons that open this keep their mailto: href and only preventDefault
// once this component has mounted, so with scripting off the page still has a
// working way to reach him rather than a button that does nothing.

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { CONTACT_OPEN } from "./contact";
import { IDENTITY } from "@/lib/profile";

type State = "idle" | "sending" | "sent" | "error" | "unconfigured";

export function ContactModal() {
  const dialog = useRef<HTMLDialogElement>(null);
  const first = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>("idle");
  const [problem, setProblem] = useState("");

  useEffect(() => {
    const open = () => {
      setState("idle");
      setProblem("");
      dialog.current?.showModal();
      // After the dialog paints, or the caret lands nowhere.
      requestAnimationFrame(() => first.current?.focus());

      // Ask whether the form can actually send, so somebody is not invited to
      // write a message that has nowhere to go. A failure here is ignored on
      // purpose: the form stays usable and the POST reports the real problem.
      fetch("/api/contact", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (d && d.configured === false) setState("unconfigured");
        })
        .catch(() => {});
    };
    window.addEventListener(CONTACT_OPEN, open);
    return () => window.removeEventListener(CONTACT_OPEN, open);
  }, []);

  const close = () => dialog.current?.close();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;

    const form = new FormData(e.currentTarget);
    setState("sending");
    setProblem("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
          company: form.get("company"),
        }),
      });

      if (res.ok) {
        setState("sent");
        return;
      }

      const { error } = (await res.json().catch(() => ({}))) as { error?: string };
      if (error === "not_configured") {
        setState("unconfigured");
        return;
      }
      setState("error");
      setProblem(
        error === "rate_limited"
          ? "That is a few messages in a short while. Try again in a little bit."
          : error === "bad_email"
            ? "That email address does not look right."
            : "That did not send. Try again, or email me directly.",
      );
    } catch {
      setState("error");
      setProblem("That did not send. Check your connection, or email me directly.");
    }
  }

  return (
    <dialog ref={dialog} className="cm" onClose={() => setState("idle")}>
      {/* Clicking the backdrop closes, which is what the backdrop is for.
          The check is on the dialog itself because a click on the backdrop
          has the dialog as its target; a click inside lands on a child. */}
      <div
        className="cm-shell"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="cm-card">
          <button type="button" onClick={close} aria-label="Close" data-cur="close" className="cm-x">
            <Icon name="chev" size={14} />
          </button>

          {state === "unconfigured" ? (
            <div className="cm-done">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Email me directly
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                The form is not connected yet, so this is the quickest way.
              </p>
              <a href={`mailto:${IDENTITY.email}`} className="cm-send mt-4">
                {IDENTITY.email}
                <Icon name="mail" size={13} />
              </a>
            </div>
          ) : state === "sent" ? (
            <div className="cm-done">
              <span className="cm-done-mark" aria-hidden="true">
                <Icon name="check" size={22} />
              </span>
              <h2 className="font-display text-lg font-semibold">That has sent.</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                It lands in my inbox and I reply to the address you gave.
              </p>
              <button type="button" onClick={close} className="cm-send mt-4">
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Send me an email
              </h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Straight to my inbox. I read everything.
              </p>

              <form onSubmit={submit} className="mt-4 space-y-2.5">
                {/* The honeypot. Hidden from view and from the tab order, so a
                    person never reaches it and a bot that fills every field
                    gives itself away. Not type="hidden": plenty of bots skip
                    those and fill only what looks like a real input. */}
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="cm-pot"
                />

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <label className="cm-field">
                    <span>Name</span>
                    <input ref={first} name="name" required maxLength={80} autoComplete="name" />
                  </label>
                  <label className="cm-field">
                    <span>Email</span>
                    <input
                      name="email"
                      type="email"
                      required
                      maxLength={160}
                      autoComplete="email"
                      inputMode="email"
                    />
                  </label>
                </div>

                <label className="cm-field">
                  <span>Message</span>
                  <textarea name="message" required rows={5} maxLength={4000} />
                </label>

                {state === "error" && (
                  <p role="alert" className="cm-problem">
                    {problem}
                  </p>
                )}


                <div className="flex items-center justify-between gap-3 pt-1">
                  <a href={`mailto:${IDENTITY.email}`} className="cm-alt">
                    or use your own mail app
                  </a>
                  <button
                    type="submit"
                    disabled={state === "sending"}
                    data-cur="send"
                    className="cm-send"
                  >
                    {state === "sending" ? "Sending" : "Send"}
                    <Icon name="send" size={13} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
