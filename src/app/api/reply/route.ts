import { NextResponse } from "next/server";
import { insertReply, replyStoreReady } from "@/lib/replies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Crude in-memory throttle, carried over from /api/brief. Serverless instances
// are short-lived and not shared, so this stops one client hammering the box
// rather than being a real rate limiter — the length caps below bound the rest.
const seen = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 4;

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
    return NextResponse.json({ error: "Too many messages. Give it a minute." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Malformed body." }, { status: 400 });
  }

  const message = str(body.message, 4000);
  if (!message) {
    return NextResponse.json({ error: "Say something first." }, { status: 400 });
  }

  // The address is optional — someone should be able to leave a note without
  // handing over a way to be contacted. If they do give one it has to be real,
  // or the reply goes nowhere and neither side finds out.
  const email = str(body.email, 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "That email is not an email." }, { status: 400 });
  }

  const reply = {
    message,
    email,
    referer: str(req.headers.get("referer"), 500),
    user_agent: str(req.headers.get("user-agent"), 400),
  };

  if (!replyStoreReady()) {
    // Nothing to write to yet. Log it so the message is at least recoverable
    // from the platform logs, and tell the caller it was not persisted.
    console.warn("[reply] store not configured, reply not persisted:", JSON.stringify(reply));
    return NextResponse.json({ ok: true, stored: false });
  }

  const result = await insertReply(reply);
  if (!result.ok) {
    console.error("[reply] insert failed:", result.error, JSON.stringify(reply));
    return NextResponse.json({ error: "Could not send that. Try again in a moment." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, stored: true });
}
