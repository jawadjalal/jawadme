import { NextResponse } from "next/server";
import { briefStoreReady, insertBrief } from "@/lib/briefs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Crude in-memory throttle. Serverless instances are short-lived and not
// shared, so this stops a single client hammering the form rather than being a
// real rate limiter — the length caps below are what bound the damage.
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
    return NextResponse.json({ error: "Too many briefs. Give it a minute." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Malformed body." }, { status: 400 });
  }

  const name = str(body.name, 120);
  const email = str(body.email, 200);
  const message = str(body.message, 8000);
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "That email is not an email." }, { status: 400 });
  }

  const addons = Array.isArray(body.addons)
    ? body.addons.filter((a): a is string => typeof a === "string").slice(0, 12)
    : null;
  const estimate =
    typeof body.estimate === "number" && Number.isFinite(body.estimate)
      ? Math.round(body.estimate)
      : null;

  const brief = {
    name,
    email,
    link: str(body.link, 500),
    message,
    scope: str(body.scope, 60),
    speed: str(body.speed, 60),
    band: str(body.band, 60),
    estimate,
    tier: str(body.tier, 40),
    addons,
    variant: str(body.variant, 20),
    referer: str(req.headers.get("referer"), 500),
    user_agent: str(req.headers.get("user-agent"), 400),
  };

  if (!briefStoreReady()) {
    // Nothing to write to yet. Log it so the brief is at least recoverable from
    // the platform logs, and tell the caller it was not persisted.
    console.warn("[brief] store not configured, brief not persisted:", JSON.stringify(brief));
    return NextResponse.json({ ok: true, stored: false });
  }

  const result = await insertBrief(brief);
  if (!result.ok) {
    console.error("[brief] insert failed:", result.error, JSON.stringify(brief));
    return NextResponse.json({ error: "Could not save the brief." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, stored: true });
}
