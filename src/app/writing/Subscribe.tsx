"use client";

import { useState } from "react";

type State = "idle" | "pending" | "ok" | "error";

// Same shape the API validates against, so an obvious typo is caught before a
// round trip. The server re-checks it — this is politeness, not security.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Reply = { ok?: boolean; stored?: boolean; duplicate?: boolean; error?: string };

export function Subscribe() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [note, setNote] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "pending") return;

    const value = email.trim();
    if (!EMAIL.test(value)) {
      setState("error");
      setNote("That does not look like an email address.");
      return;
    }

    setState("pending");
    setNote("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source: "writing" }),
      });
      // A 429 or 502 still returns JSON with an `error`; a proxy failure might
      // not return JSON at all, hence the catch.
      const data: Reply = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setState("error");
        setNote(data.error ?? "Something broke on the way. Try again in a moment.");
        return;
      }
      setState("ok");
      setNote(
        data.duplicate
          ? "You are already on the list. Nothing more to do."
          : "You are on the list. New posts will land in your inbox.",
      );
      setEmail("");
    } catch {
      setState("error");
      setNote("Could not reach the server. Check your connection and try again.");
    }
  }

  return (
    <section className="wr-sub">
      <h2>Get the next one by email.</h2>
      <p>
        One message when something new goes up here. No schedule, no digest, no
        forwarding your address anywhere.
      </p>
      <form onSubmit={onSubmit} noValidate>
        <label htmlFor="wr-email" style={{ position: "absolute", left: "-9999px" }}>
          Email address
        </label>
        <input
          id="wr-email"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") {
              setState("idle");
              setNote("");
            }
          }}
          aria-invalid={state === "error"}
          aria-describedby={note ? "wr-sub-note" : undefined}
        />
        <button type="submit" disabled={state === "pending"}>
          {state === "pending" ? "Sending…" : "Subscribe"}
        </button>
      </form>
      {note ? (
        <p
          id="wr-sub-note"
          className={state === "ok" ? "wr-note wr-note-ok" : "wr-note wr-note-bad"}
          role="status"
          aria-live="polite"
        >
          {note}
        </p>
      ) : null}
    </section>
  );
}
