"use client";

// The copy button on the responses table.
//
// The only client component on the page: everything else is server-rendered,
// and the clipboard is the one thing the server cannot reach. The text it
// copies is formatted in src/lib/slack.ts and handed down as a prop, so what
// lands on the clipboard is decided in one place rather than in the browser.

import { useEffect, useRef, useState } from "react";

type State = "idle" | "copied" | "failed";

// Clipboard API first. It needs a secure context and a permission the browser
// is allowed to refuse, so a hidden textarea and execCommand stay as the
// fallback — deprecated, but still the thing that works when the modern path is
// denied, and this page is an inbox, not a place to lose a message over.
async function write(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fall through
  }
  try {
    const pad = document.createElement("textarea");
    pad.value = text;
    pad.setAttribute("readonly", "");
    pad.style.position = "fixed";
    pad.style.top = "0";
    pad.style.opacity = "0";
    document.body.appendChild(pad);
    pad.select();
    const ok = document.execCommand("copy");
    pad.remove();
    return ok;
  } catch {
    return false;
  }
}

export function Copy({
  text,
  label = "Copy",
  className = "rp-copy",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Copy a row, navigate away before the label resets, and the timer would fire
  // into an unmounted component.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onClick = async () => {
    const ok = await write(text);
    setState(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  };

  return (
    <button
      type="button"
      className={`${className} ${state === "copied" ? "is-copied" : ""} ${
        state === "failed" ? "is-failed" : ""
      }`}
      onClick={() => void onClick()}
    >
      {/* The label changes under the cursor, so it is announced rather than
          silently swapped for anyone not watching the button. */}
      <span role="status">
        {state === "copied" ? "Copied" : state === "failed" ? "Blocked" : label}
      </span>
    </button>
  );
}
