import { NextResponse } from "next/server";
import { newsletterStoreReady, subscribe } from "@/lib/newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Same crude in-memory throttle as /api/brief. Serverless instances are
// short-lived and not shared, so this stops a single client hammering the form
// rather than being a real rate limiter — the length caps below bound the damage.
const seen = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function throttled(ip: string) {
  const now = Date.now();
  const hits = (seen.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  seen.set(ip, hits);
  if (seen.size > 5000) seen.clear();
  return hits.length > MAX_PER_WINDOW;
}

const str = (v: unknown, max: number) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (throttled(ip)) {
    return NextResponse.json({ error: "Too many attempts. Give it a minute." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Malformed body." }, { status: 400 });
  }

  const email = str(body.email, 200)?.toLowerCase() ?? null;
  if (!email) {
    return NextResponse.json({ error: "An email is required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "That email is not an email." }, { status: 400 });
  }

  const row = {
    email,
    source: str(body.source, 60),
    referer: str(req.headers.get("referer"), 500),
    user_agent: str(req.headers.get("user-agent"), 400),
  };

  if (!newsletterStoreReady()) {
    // Nothing to write to yet. Log it so the address is at least recoverable from
    // the platform logs, and tell the caller it was not persisted — the UI stays
    // unblocked either way.
    console.warn("[subscribe] store not configured, email not persisted:", JSON.stringify(row));
    return NextResponse.json({ ok: true, stored: false });
  }

  // A DNS/TLS failure reaching Supabase throws rather than returning !ok; catch it
  // so a flaky network is a clean 502 instead of an unhandled 500.
  const result = await subscribe(row).catch((err: unknown) => ({
    ok: false as const,
    error: err instanceof Error ? err.message : "fetch failed",
  }));
  if (!result.ok) {
    console.error("[subscribe] insert failed:", result.error, JSON.stringify(row));
    return NextResponse.json({ error: "Could not save that address." }, { status: 502 });
  }
  // A repeat signup is a success, not an error. `duplicate` is reported back so
  // the UI can say "you're already on the list" if it wants to, but the happy
  // path is identical.
  return NextResponse.json({ ok: true, stored: true, duplicate: result.duplicate === true });
}
