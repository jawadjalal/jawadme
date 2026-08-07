// Storage layer for newsletter subscribers.
//
// Same shape as src/lib/briefs.ts: plain Supabase REST with the service-role
// key, no @supabase/supabase-js. RLS on public.newsletter_subscribers is
// deny-all, so only this key ever reaches the table — and it is server-only.
//
// If the env is not configured the store reports itself unavailable instead of
// throwing, so a missing key degrades the CMS rather than breaking the signup.

export type Subscriber = {
  id: string;
  created_at: string;
  email: string;
  source: string | null;
  referer: string | null;
  user_agent: string | null;
  unsubscribed_at: string | null;
};

export type NewSubscriber = Pick<Subscriber, "email" | "source" | "referer" | "user_agent">;

const url = () => process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY;

export const newsletterStoreReady = () => Boolean(url() && key());

function headers(extra: Record<string, string> = {}) {
  const k = key() as string;
  return {
    apikey: k,
    Authorization: `Bearer ${k}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function subscribe(row: NewSubscriber) {
  if (!newsletterStoreReady()) return { ok: false as const, error: "store not configured" };

  // email is UNIQUE, and signing up twice is a completely ordinary thing to do —
  // a second submit, a bookmarked page, two devices. So the insert is an upsert:
  // `resolution=merge-duplicates` + on_conflict=email makes Postgres turn the
  // collision into an UPDATE of the existing row instead of raising 23505.
  //
  // unsubscribed_at is sent as null on purpose: re-signing up after having
  // unsubscribed should put you back on the list, which is what the merge does.
  // created_at is left out so the original signup date survives the merge.
  const res = await fetch(
    `${url()}/rest/v1/newsletter_subscribers?on_conflict=email`,
    {
      method: "POST",
      headers: headers({ Prefer: "return=minimal,resolution=merge-duplicates" }),
      body: JSON.stringify({ ...row, unsubscribed_at: null }),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const body = await res.text();
    // Belt and braces: if the upsert path ever fails to apply (an older PostgREST,
    // a missing unique index, a partial index it cannot use for ON CONFLICT) the
    // duplicate surfaces as Postgres 23505. That is still a successful signup as
    // far as the caller is concerned — the address is on the list either way — so
    // swallow it rather than showing someone an error for subscribing twice.
    if (res.status === 409 || body.includes("23505")) {
      return { ok: true as const, duplicate: true };
    }
    return { ok: false as const, error: `${res.status} ${body}`.slice(0, 300) };
  }
  return { ok: true as const, duplicate: false };
}

export async function listSubscribers(limit = 500): Promise<Subscriber[]> {
  if (!newsletterStoreReady()) return [];
  const res = await fetch(
    `${url()}/rest/v1/newsletter_subscribers?select=*&order=created_at.desc&limit=${limit}`,
    { headers: headers(), cache: "no-store" },
  );
  if (!res.ok) throw new Error(`subscribers query failed: ${res.status}`);
  return (await res.json()) as Subscriber[];
}

export async function unsubscribe(id: string) {
  if (!newsletterStoreReady()) return { ok: false as const, error: "store not configured" };
  const res = await fetch(
    `${url()}/rest/v1/newsletter_subscribers?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: headers({ Prefer: "return=minimal" }),
      body: JSON.stringify({ unsubscribed_at: new Date().toISOString() }),
      cache: "no-store",
    },
  );
  if (!res.ok) return { ok: false as const, error: `${res.status}` };
  return { ok: true as const };
}
