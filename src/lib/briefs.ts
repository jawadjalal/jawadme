// Storage layer for design-page briefs.
//
// Talks to Supabase over the REST endpoint with the service-role key rather
// than pulling in @supabase/supabase-js: two calls in the whole app, and the
// key must never reach the client anyway.
//
// If the env is not configured the store reports itself unavailable instead of
// throwing, so a missing key degrades the CMS rather than breaking the form.

export type Brief = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  link: string | null;
  message: string;
  scope: string | null;
  speed: string | null;
  band: string | null;
  estimate: number | null;
  tier: string | null;
  addons: string[] | null;
  variant: string | null;
  referer: string | null;
  user_agent: string | null;
  status: string;
};

export type NewBrief = Omit<Brief, "id" | "created_at" | "status">;

const url = () => process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY;

export const briefStoreReady = () => Boolean(url() && key());

function headers(extra: Record<string, string> = {}) {
  const k = key() as string;
  return {
    apikey: k,
    Authorization: `Bearer ${k}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function insertBrief(brief: NewBrief) {
  if (!briefStoreReady()) return { ok: false as const, error: "store not configured" };
  const res = await fetch(`${url()}/rest/v1/design_briefs`, {
    method: "POST",
    headers: headers({ Prefer: "return=minimal" }),
    body: JSON.stringify(brief),
    cache: "no-store",
  });
  if (!res.ok) {
    return { ok: false as const, error: `${res.status} ${await res.text()}`.slice(0, 300) };
  }
  return { ok: true as const };
}

export async function listBriefs(limit = 200): Promise<Brief[]> {
  if (!briefStoreReady()) return [];
  const res = await fetch(
    `${url()}/rest/v1/design_briefs?select=*&order=created_at.desc&limit=${limit}`,
    { headers: headers(), cache: "no-store" },
  );
  if (!res.ok) throw new Error(`briefs query failed: ${res.status}`);
  return (await res.json()) as Brief[];
}

export async function setBriefStatus(id: string, status: string) {
  if (!briefStoreReady()) return { ok: false as const, error: "store not configured" };
  const res = await fetch(
    `${url()}/rest/v1/design_briefs?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: headers({ Prefer: "return=minimal" }),
      body: JSON.stringify({ status }),
      cache: "no-store",
    },
  );
  if (!res.ok) return { ok: false as const, error: `${res.status}` };
  return { ok: true as const };
}
