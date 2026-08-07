"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export function SignIn({ configured }: { configured: boolean }) {
  const [error, action, pending] = useActionState(signIn, undefined);

  return (
    <div className="cms-gate">
      <div className="cms-window">
        <div className="cms-bar">
          <span className="cms-dot" />
          <h1>jawadOS — briefs</h1>
        </div>
        <div className="cms-body">
          {configured ? (
            <form action={action}>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" autoFocus />
              <button className="cms-submit" type="submit" disabled={pending}>
                {pending ? "Checking…" : "Open the inbox"}
              </button>
              {error ? <span className="cms-error">{error}</span> : null}
            </form>
          ) : (
            <p className="cms-note">
              <strong>Not configured.</strong> Set <code>DESIGN_ADMIN_PASSWORD</code> in the
              deployment environment to open this inbox.
            </p>
          )}
        </div>
      </div>
      <a className="cms-back" href="/design">
        ← back to jawadOS
      </a>
    </div>
  );
}
