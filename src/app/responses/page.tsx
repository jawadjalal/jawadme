import type { Metadata } from "next";
import { REPLIES_COOKIE, adminConfigured, isSignedIn } from "@/lib/adminAuth";
import { REPLY_STATUSES, listReplies, replyStoreReady, type Reply } from "@/lib/replies";
import { slackDigest, slackMessage, stamp } from "@/lib/slack";
import { THEME_SCRIPT, ThemeToggle } from "../home/Theme";
import { Copy } from "./Copy";
import { SignIn } from "./SignIn";
import { signOut, updateStatus } from "./actions";
import "../theme.css";
import "./responses.css";

export const metadata: Metadata = {
  title: "Slack Responses — jawad jalal",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const message = (err: unknown) => (err instanceof Error ? err.message : "unknown error");

// Long messages would each set the height of their own row and turn the table
// into a column of paragraphs. Past this they collapse into a <details>, which
// costs no JavaScript and keeps the table scannable.
const PREVIEW = 220;

// A reply link that opens the mail client with the thread already quoted. It is
// not how anything gets delivered any more — the table is — but when an address
// was left, answering it should still be a click and then typing.
function mailto(reply: Reply) {
  const quoted = reply.message
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  const body = `\n\n---\nYou wrote on ${stamp(reply.created_at)}:\n${quoted}\n`;
  return `mailto:${reply.email}?subject=${encodeURIComponent(
    "Re: your message on jawadjalal.com",
  )}&body=${encodeURIComponent(body)}`;
}

// Closed, the summary is the preview. Open, CSS hides the preview and reorders
// the summary below the full message, so the same one control reads as "show
// all" on the way in and "show less" on the way out. No state, no JavaScript.
function Message({ text }: { text: string }) {
  if (text.length <= PREVIEW) return <p className="rp-message">{text}</p>;
  return (
    <details className="rp-long">
      <summary>
        <span className="rp-message rp-long-preview">{`${text.slice(0, PREVIEW).trimEnd()}…`}</span>
        <span className="rp-long-cue">
          <span className="rp-long-more">show all</span>
          <span className="rp-long-less">show less</span>
        </span>
      </summary>
      <p className="rp-message">{text}</p>
    </details>
  );
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

  const fresh = replies.filter((r) => r.status === "new");
  const reachable = replies.filter((r) => r.email).length;

  return (
    <main className="rp">
      {themeScript}
      <ThemeToggle />

      <div className="rp-shell">
        <header className="rp-head">
          <div>
            <h1>Slack Responses</h1>
            <p className="rp-sub">
              {replies.length} total · {fresh.length} unread · {reachable} with an address
            </p>
          </div>
          <form action={signOut}>
            <button className="rp-signout" type="submit">
              Sign out
            </button>
          </form>
        </header>

        <p className="rp-lede">
          Everything the box on the homepage catches, logged here in one table. Nothing is forwarded
          anywhere and no Slack app is wired up: copy a row and paste it into Slack yourself.
        </p>

        {replies.length > 0 ? (
          <div className="rp-actions">
            {fresh.length > 0 ? (
              <Copy
                className="rp-button"
                text={slackDigest(fresh)}
                label={`Copy ${fresh.length} unread for Slack`}
              />
            ) : null}
            <Copy
              className="rp-button"
              text={slackDigest(replies)}
              label={`Copy all ${replies.length} for Slack`}
            />
          </div>
        ) : null}

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

        {replies.length > 0 ? (
          /* The table keeps its columns and scrolls sideways inside this box on a
             narrow screen, rather than reflowing into something that is no longer
             a table. The page itself never scrolls sideways. */
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">From</th>
                  <th scope="col">Message</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="hm-sr-only">Copy for Slack</span>
                    <span aria-hidden="true">Slack</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {replies.map((r) => (
                  <tr key={r.id} className={r.status === "new" ? "is-new" : undefined}>
                    <td className="rp-c-when">{stamp(r.created_at)}</td>

                    <td className="rp-c-from">
                      {r.email ? (
                        <a href={mailto(r)}>{r.email}</a>
                      ) : (
                        <span className="rp-anon">no address left</span>
                      )}
                    </td>

                    <td className="rp-c-message">
                      <Message text={r.message} />
                    </td>

                    <td className="rp-c-status">
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
                    </td>

                    <td className="rp-c-copy">
                      <Copy text={slackMessage(r)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </main>
  );
}
