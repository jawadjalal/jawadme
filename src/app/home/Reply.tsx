"use client";

// The reply box that closes the page.
//
// A message, an optional address to answer it at, and a send button. It posts to
// /api/reply, which writes to the same Supabase project the design briefs go to;
// the inbox is at /responses.
//
// The card sits still until it is scrolled to, then lifts in — see the
// `.hm-reply` rules in home.css. This component's only part in that is setting
// `is-in` once, the first time the card is on screen.

import { useEffect, useRef, useState } from "react";

const MAX = 4000;

type State = "idle" | "sending" | "sent";

export function Reply() {
  const root = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  // Reveal on first sight. `once` semantics: the observer disconnects the moment
  // it fires, so scrolling back up and down again does not replay the entrance.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // No IntersectionObserver (or a browser that has it disabled) must not leave
    // the card invisible — show it immediately instead.
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        el.classList.add("is-in");
        io.disconnect();
      },
      // A sliver is enough: the card is tall, and waiting for a third of it to
      // clear the fold means the animation starts after you have already read it.
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The textarea grows with what is typed into it, up to the max-height the
  // stylesheet sets, after which it scrolls. Height is reset to auto first so it
  // can shrink again when text is deleted.
  useEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [message]);

  const send = async () => {
    if (state !== "idle") return;
    // An empty box is not an error to report, it is a cursor to put back. The
    // button stays live rather than greying out — it is the one solid mass in
    // the card and dimming it at rest makes the whole thing look switched off.
    if (!message.trim()) {
      field.current?.focus();
      return;
    }
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), email: email.trim() || null }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again in a moment.");
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      // Offline, blocked, or the request never landed. The message is still in
      // the box, so a retry costs nothing but the click.
      setError("No connection. Your message is still here, so try again.");
      setState("idle");
    }
  };

  // Enter sends. Shift+Enter makes a new line, and ⌘/Ctrl+Enter sends too, so
  // the habit anyone arrives with also works.
  //
  // The one case Enter must not send is mid-composition: typing Japanese, Korean
  // or Chinese, Enter commits the candidate the IME is offering and the browser
  // reports keyCode 229 while that is happening. Sending there would fire the
  // message on the first character of a word.
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;
    if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return;
    if (e.shiftKey || e.altKey) return;
    e.preventDefault();
    void send();
  };

  const left = MAX - message.length;
  const ready = message.trim().length > 0;

  return (
    <div ref={root} className="hm-reply">
      <p className="hm-reply-label">or just say something here. it lands in my inbox.</p>

      <div className="hm-reply-card">
        {state === "sent" ? (
          <div className="hm-reply-done">
            <span className="hm-reply-check" aria-hidden="true">
              <Check />
            </span>
            <span role="status">
              Got it{email.trim() ? ", I’ll reply to that address" : ""}. Thank you.
            </span>
          </div>
        ) : (
          <form
            className="hm-reply-form"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label className="hm-sr-only" htmlFor="hm-reply-text">
              Your message
            </label>
            <textarea
              id="hm-reply-text"
              ref={field}
              className="hm-reply-text"
              placeholder="reply to jawad…"
              rows={1}
              maxLength={MAX}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={onKeyDown}
            />

            {/* A hairline under the message, so the address and the button read
                as the controls for what is written above them rather than as
                two more things to fill in. */}
            <div className="hm-reply-rule" aria-hidden="true" />

            <div className="hm-reply-row">
              <label className="hm-sr-only" htmlFor="hm-reply-email">
                Your email, if you want a reply
              </label>
              <input
                id="hm-reply-email"
                className="hm-reply-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="your email"
                maxLength={200}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Only worth showing once the ceiling is close enough to matter.
                  aria-live is off: a number ticking down on every keystroke is
                  noise in a screen reader, and maxLength already stops the
                  overflow. */}
              {left <= 200 ? (
                <span className={`hm-reply-count ${left <= 20 ? "is-low" : ""}`}>{left}</span>
              ) : null}

              <button
                type="submit"
                className={[
                  "hm-reply-send",
                  state === "sending" ? "is-sending" : "",
                  ready ? "is-ready" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={state === "sending"}
                aria-label={state === "sending" ? "Sending" : "Send"}
              >
                {state === "sending" ? <Spinner /> : <ArrowUp />}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Holds its line height whether or not there is anything in it, so the
          page does not shift when an error appears. The keys sit on the same
          line, on the right, and drop out once there is an error to read or a
          message already gone. */}
      <div className={`hm-reply-foot ${error ? "is-error" : ""}`}>
        <p>{error ?? (state === "sent" ? "" : "no address needed unless you want an answer.")}</p>
        {!error && state !== "sent" ? (
          <p className="hm-reply-keys" aria-hidden="true">
            <kbd>Enter</kbd> sends, <kbd>Shift</kbd>
            <kbd>Enter</kbd> new line
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ArrowUp() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2.2} opacity={0.25} />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12.5l5.5 5.5L20 6.5" />
    </svg>
  );
}
