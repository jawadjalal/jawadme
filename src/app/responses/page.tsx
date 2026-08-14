import type { Metadata } from "next";
import { REPLIES_COOKIE, adminConfigured, isSignedIn } from "@/lib/adminAuth";
import { REPLY_STATUSES, listReplies, replyStoreReady, type Reply } from "@/lib/replies";
import { THEME_SCRIPT, ThemeToggle } from "../home/Theme";
import { SignIn } from "./SignIn";
import { signOut, updateStatus } from "./actions";
import "../theme.css";
import "./responses.css";

export const metadata: Metadata = {
  title: "Responses — jawad jalal",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const message = (err: unknown) => (err instanceof Error ? err.message : "unknown error");

// A reply link that opens the mail client with the thread already quoted, so
// answering one of these is a click and then typing — which is the whole point
// of collecting them in the first place.
function mailto(reply: Reply) {
  const quoted = reply.message
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  const body = `\n\n---\nYou wrote on ${when(reply.created_at)}:\n${quoted}\n`;
  return `mailto:${reply.email}?subject=${encodeURIComponent(
    "Re: your message on jawadjalal.com",
  )}&body=${encodeURIComponent(body)}`;
}

export default async function ResponsesPage() {
  const themeScript = <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;

  if (!(await isSignedIn(REPLIES_COOKIE))) {
    return (
      <main className="rp">
        {themeScript}
        <ThemeToggle />
        <SignIn configured={adminConfigured()} />
      </main>
    );
  }

  const ready = replyStoreReady();
  let replies: Reply[] = [];
  let loadError: string | null = null;
  if (ready) {
    try {
      replies = await listReplies();
    } catch (err) {
      loadError = message(err);
    }
  }

  const unread = replies.filter((r) => r.status === "new").length;
  const reachable = replies.filter((r) => r.email).length;

  return (
    <main className="rp">
      {themeScript}
      <ThemeToggle />

      <div className="rp-shell">
        <header className="rp-head">
          <div>
            <h1>Responses</h1>
            <p className="rp-sub">
              {replies.length} total · {unread} unread · {reachable} with an address
            </p>
          </div>
          <form action={signOut}>
            <button className="rp-signout" type="submit">
              Sign out
            </button>
          </form>
        </header>

        {!ready ? (
          <p className="rp-note">
            <strong>No store connected.</strong> Set <code>SUPABASE_URL</code> and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> in the deployment environment, and run{" "}
            <code>supabase/migrations/0001_home_replies.sql</code> against the project. Until then
            messages are written to the platform logs instead of this table.
          </p>
        ) : null}

        {loadError ? (
          <p className="rp-note">
            <strong>Could not read the table.</strong> {loadError}
          </p>
        ) : null}

        {ready && !loadError && replies.length === 0 ? (
          <p className="rp-empty">Nothing yet. The box is live and waiting.</p>
        ) : null}

        <div className="rp-list">
          {replies.map((r) => (
            <article key={r.id} className={r.status === "new" ? "rp-item is-new" : "rp-item"}>
              <div className="rp-item-head">
                {r.email ? (
                  <a className="rp-from" href={mailto(r)}>
                    {r.email}
                  </a>
                ) : (
                  <span className="rp-from rp-anon">no address left</span>
                )}
                <span className="rp-when">{when(r.created_at)}</span>
              </div>

              <p className="rp-message">{r.message}</p>

              <div className="rp-item-foot">
                <div className="rp-status">
                  {REPLY_STATUSES.map((s) => (
                    <form key={s} action={updateStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value={s} />
                      <button type="submit" aria-pressed={r.status === s}>
                        {s}
                      </button>
                    </form>
                  ))}
                </div>
                {r.email ? (
                  <a className="rp-reply" href={mailto(r)}>
                    Reply by email →
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
