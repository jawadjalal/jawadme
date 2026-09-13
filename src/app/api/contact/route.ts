// The contact endpoint behind the modal.
//
// The button used to be a mailto:, which hands the visitor off to whatever
// their machine thinks a mail client is. On a borrowed laptop or a phone with
// no account set up that opens nothing at all, and the message is lost with
// no sign that anything failed. This takes the message itself.
//
// Everything here is server-side. The API key never reaches the browser, and
// nothing the form sends is trusted: the address is re-validated, the fields
// are length-capped, and the body is escaped before it goes into the HTML
// version of the mail.

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { IDENTITY } from "@/lib/profile";

// The route reads secrets and keeps a counter, so it cannot be static.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX = { name: 80, email: 160, message: 4000 };

/** Per-IP budget. */
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

// Best effort, deliberately. This lives in the memory of one serverless
// instance, so it resets on a cold start and is not shared between regions: it
// is a brake on someone hammering the form, not a security control. The real
// protections are the honeypot below and Resend's own sending limits. A
// durable counter would mean standing up Redis for a personal contact form,
// which is not a trade worth making until this is actually abused.
const hits = new Map<string, number[]>();

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // The map would otherwise grow for the life of the instance.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > LIMIT;
}

// Deliberately loose. A stricter pattern rejects real addresses, and the
// address is only ever used as a Reply-To, never trusted or displayed raw.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

// Asked by the modal when it opens, so a visitor is told the form is not
// connected before they type a message rather than after. Checked at request
// time rather than baked into the page: the key can be added in Vercel
// without a redeploy, and a statically rendered flag would then be wrong.
export async function GET() {
  return NextResponse.json(
    { configured: Boolean(process.env.RESEND_API_KEY) },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // The honeypot. A field that is present in the markup, hidden from view and
  // skipped by the tab order, so a person never reaches it and a bot filling
  // every input it finds gives itself away. Answered with 200 rather than an
  // error, because telling a bot which rule it tripped is how it learns to
  // stop tripping it.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim().slice(0, MAX.name);
  const email = String(body.email ?? "").trim().slice(0, MAX.email);
  const message = String(body.message ?? "").trim().slice(0, MAX.message);

  if (!name || !email || !message) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "bad_email" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (tooMany(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Answered distinctly so the modal can offer the address instead of
    // showing a visitor an error they can do nothing about.
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const to = process.env.CONTACT_TO ?? IDENTITY.email;
  // Must be a domain verified with Resend. Until jawadjalal.com is verified,
  // set CONTACT_FROM to onboarding@resend.dev, which sends only to the address
  // on the Resend account.
  const from = process.env.CONTACT_FROM ?? `jawadjalal.com <hello@jawadjalal.com>`;

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to,
      // The visitor's address, so replying in the inbox reaches them directly.
      replyTo: email,
      subject: `${name} via jawadjalal.com`,
      text: `${name} <${email}>\n\n${message}`,
      html:
        `<p style="margin:0 0 4px"><strong>${esc(name)}</strong> ` +
        `&lt;${esc(email)}&gt;</p>` +
        `<p style="margin:0 0 16px;color:#6b6b64;font-size:13px">via jawadjalal.com</p>` +
        `<div style="white-space:pre-wrap;line-height:1.6">${esc(message)}</div>`,
    });

    if (error) {
      console.error("resend refused the message", error);
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact route threw", err);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
}
