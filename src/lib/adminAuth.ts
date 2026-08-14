import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Password gate for /design/admin. One shared password (DESIGN_ADMIN_PASSWORD),
// exchanged for an HMAC-signed cookie so the password itself is not replayed on
// every request. Deliberately minimal — this guards a list of inbound briefs,
// not an account system.

export const COOKIE = "jos_admin";

// The homepage reply inbox at /responses. Same password and same signature —
// one gate, two rooms — but its own cookie, scoped to its own path, so signing
// out of one does not sign you out of the other and neither cookie is sent to
// the route that cannot use it.
export const REPLIES_COOKIE = "jj_replies";

const MAX_AGE = 60 * 60 * 12;

const password = () => process.env.DESIGN_ADMIN_PASSWORD;
// The password doubles as the signing secret: one env var to set, and rotating
// it invalidates every outstanding session, which is the behaviour you want.
const secret = () => process.env.DESIGN_ADMIN_SECRET ?? password() ?? "";

export const adminConfigured = () => Boolean(password());

function sign(expires: number) {
  return createHmac("sha256", secret()).update(`v1.${expires}`).digest("hex");
}

export function issueToken() {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  return { value: `${expires}.${sign(expires)}`, maxAge: MAX_AGE };
}

function equal(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(candidate: string) {
  const expected = password();
  return Boolean(expected) && equal(candidate, expected as string);
}

export function verifyToken(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const [rawExpires, mac] = token.split(".");
  const expires = Number(rawExpires);
  if (!Number.isFinite(expires) || expires < Date.now() / 1000) return false;
  return equal(mac ?? "", sign(expires));
}

export async function isSignedIn(cookie: string = COOKIE) {
  const jar = await cookies();
  return verifyToken(jar.get(cookie)?.value);
}
