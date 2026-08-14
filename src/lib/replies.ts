// Storage layer for the homepage reply box.
//
// Same shape and same reasoning as src/lib/briefs.ts: the Supabase REST endpoint
// with the service-role key rather than the JS client, because it is three calls
// in the whole app and the key must never reach the browser.
//
// If the env is not configured the store reports itself unavailable instead of
// throwing, so a missing key degrades the inbox rather than breaking the form.

export type Reply = {
  id: string;
  created_at: string;
  message: string;
  email: string | null;
  referer: string | null;
  user_agent: string | null;
  status: string;
};

export type NewReply = Omit<Reply, "id" | "created_at" | "status">;

export const REPLY_STATUSES = ["new", "replied", "archived"] as const;

const url = () => process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY;

export const replyStoreReady = () => Boolean(url() && key());

function headers(extra: Record<string, string> = {}) {
  const k = key() as string;
  return {
    apikey: k,
    Authorization: `Bearer ${k}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function insertReply(reply: NewReply) {
  if (!replyStoreReady()) return { ok: false as const, error: "store not configured" };
  const res = await fetch(`${url()}/rest/v1/home_replies`, {
    method: "POST",
    headers: headers({ Prefer: "return=minimal" }),
    body: JSON.stringify(reply),
    cache: "no-store",
  });
  if (!res.ok) {
    return { ok: false as const, error: `${res.status} ${await res.text()}`.slice(0, 300) };
  }
  return { ok: true as const };
}

export async function listReplies(limit = 200): Promise<Reply[]> {
  if (!replyStoreReady()) return [];
  const res = await fetch(
    `${url()}/rest/v1/home_replies?select=*&order=created_at.desc&limit=${limit}`,
    { headers: headers(), cache: "no-store" },
  );
  if (!res.ok) throw new Error(`replies query failed: ${res.status}`);
  return (await res.json()) as Reply[];
}

export async function setReplyStatus(id: string, status: string) {
  if (!replyStoreReady()) return { ok: false as const, error: "store not configured" };
  const res = await fetch(`${url()}/rest/v1/home_replies?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headers({ Prefer: "return=minimal" }),
    body: JSON.stringify({ status }),
    cache: "no-store",
  });
  if (!res.ok) return { ok: false as const, error: `${res.status}` };
  return { ok: true as const };
}
