"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export function SignIn({ configured }: { configured: boolean }) {
  const [error, action, pending] = useActionState(signIn, undefined);

  return (
    <div className="rp-gate">
      <div className="rp-gate-card">
        <h1>Responses</h1>
        <p className="rp-gate-note">Everything left in the box at the bottom of the homepage.</p>

        {configured ? (
          <form action={action} className="rp-gate-form">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
            />
            <button className="rp-button" type="submit" disabled={pending}>
              {pending ? "Checking…" : "Open the inbox"}
            </button>
            {error ? <span className="rp-error">{error}</span> : null}
          </form>
        ) : (
          <p className="rp-note">
            <strong>Not configured.</strong> Set <code>DESIGN_ADMIN_PASSWORD</code> in the
            deployment environment to open this inbox.
          </p>
        )}
      </div>

      <a className="rp-back" href="/">
        ← back to the site
      </a>
    </div>
  );
}
