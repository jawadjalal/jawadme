import type { Metadata } from "next";
import { adminConfigured, isSignedIn } from "@/lib/adminAuth";
import { briefStoreReady, listBriefs, type Brief } from "@/lib/briefs";
import { listSubscribers, newsletterStoreReady, type Subscriber } from "@/lib/newsletter";
import { SignIn } from "./SignIn";
import { removeSubscriber, signOut, updateStatus } from "./actions";
import "./admin.css";

export const metadata: Metadata = {
  title: "Briefs — jawadOS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUSES = ["new", "replied", "won", "archived"] as const;

function when(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const message = (err: unknown) => (err instanceof Error ? err.message : "unknown error");

function money(n: number) {
  return "$" + n.toLocaleString("en-US");
}

function Tags({ brief }: { brief: Brief }) {
  const tags: { label: string; accent?: boolean }[] = [];
  if (brief.estimate) tags.push({ label: money(brief.estimate), accent: true });
  if (brief.tier) tags.push({ label: brief.tier });
  if (brief.scope) tags.push({ label: brief.scope });
  if (brief.speed) tags.push({ label: brief.speed });
  if (brief.band) tags.push({ label: brief.band });
  (brief.addons ?? []).forEach((a) => tags.push({ label: `+ ${a}` }));
  if (brief.variant) tags.push({ label: brief.variant });
  return (
    <>
      {tags.map((t, i) => (
        <span key={i} className={t.accent ? "cms-tag cms-tag-accent" : "cms-tag"}>
          {t.label}
        </span>
      ))}
    </>
  );
}

export default async function AdminPage() {
  if (!(await isSignedIn())) {
    return (
      <main className="cms">
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <SignIn configured={adminConfigured()} />
      </main>
    );
  }

  // Both stores read the same two env vars, so in practice `ready` covers the
  // whole page — but each query gets its own error slot so a broken table on one
  // side does not blank the other.
  const ready = briefStoreReady() && newsletterStoreReady();
  let briefs: Brief[] = [];
  let subscribers: Subscriber[] = [];
  let loadError: string | null = null;
  let subsError: string | null = null;
  if (ready) {
    const [briefsResult, subsResult] = await Promise.allSettled([
      listBriefs(),
      listSubscribers(),
    ]);
    if (briefsResult.status === "fulfilled") briefs = briefsResult.value;
    else loadError = message(briefsResult.reason);
    if (subsResult.status === "fulfilled") subscribers = subsResult.value;
    else subsError = message(subsResult.reason);
  }

  const open = briefs.filter((b) => b.status === "new").length;
  const active = subscribers.filter((s) => !s.unsubscribed_at).length;

  return (
    <main className="cms">
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div className="cms-shell">
        <div className="cms-window">
          <div className="cms-bar">
            <span className="cms-dot" />
            <h1>Briefs</h1>
            <div className="cms-bar-right">
              <a href="/design">jawadOS</a>
              <form action={signOut}>
                <button className="cms-signout" type="submit">
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <div className="cms-body">
            <div className="cms-lede">
              <h2>Everything the form caught.</h2>
              <span className="cms-count">
                {briefs.length} total · {open} unread
              </span>
            </div>

            {!ready ? (
              <p className="cms-note">
                <strong>No store connected.</strong> Set <code>SUPABASE_URL</code> and{" "}
                <code>SUPABASE_SERVICE_ROLE_KEY</code> in the deployment environment. Until then
                submissions are written to the platform logs instead of this table.
              </p>
            ) : null}

            {loadError ? (
              <p className="cms-note">
                <strong>Could not read the table.</strong> {loadError}
              </p>
            ) : null}

            {ready && !loadError && briefs.length === 0 ? (
              <p className="cms-empty">Nothing yet. The form is live and waiting.</p>
            ) : null}

            <div className="cms-list">
              {briefs.map((b) => (
                <article key={b.id} className="cms-brief">
                  <div className="cms-brief-head">
                    <span className="who">{b.name}</span>
                    <a href={`mailto:${b.email}`}>{b.email}</a>
                    {b.link ? (
                      <a href={b.link} target="_blank" rel="noreferrer">
                        {b.link}
                      </a>
                    ) : null}
                    <span className="cms-when">{when(b.created_at)}</span>
                  </div>
                  <p className="cms-message">{b.message}</p>
                  <div className="cms-tags">
                    <Tags brief={b} />
                    <div className="cms-status">
                      {STATUSES.map((s) => (
                        <form key={s} action={updateStatus}>
                          <input type="hidden" name="id" value={b.id} />
                          <input type="hidden" name="status" value={s} />
                          <button type="submit" aria-pressed={b.status === s}>
                            {s}
                          </button>
                        </form>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="cms-lede cms-lede-section">
              <h2>Newsletter.</h2>
              <span className="cms-count">
                {subscribers.length} total · {active} subscribed
              </span>
            </div>

            {subsError ? (
              <p className="cms-note">
                <strong>Could not read the subscribers.</strong> {subsError}
              </p>
            ) : null}

            {ready && !subsError && subscribers.length === 0 ? (
              <p className="cms-empty">No signups yet.</p>
            ) : null}

            <div className="cms-list">
              {subscribers.map((s) => (
                <article
                  key={s.id}
                  className={s.unsubscribed_at ? "cms-sub cms-sub-out" : "cms-sub"}
                >
                  <a className="cms-sub-email" href={`mailto:${s.email}`}>
                    {s.email}
                  </a>
                  {s.source ? <span className="cms-tag">{s.source}</span> : null}
                  {s.unsubscribed_at ? <span className="cms-tag">unsubscribed</span> : null}
                  <span className="cms-when">{when(s.created_at)}</span>
                  {s.unsubscribed_at ? null : (
                    <form action={removeSubscriber}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="cms-sub-remove" type="submit">
                        unsubscribe
                      </button>
                    </form>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
