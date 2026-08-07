"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { COOKIE, adminConfigured, checkPassword, issueToken, isSignedIn } from "@/lib/adminAuth";
import { setBriefStatus } from "@/lib/briefs";
import { unsubscribe } from "@/lib/newsletter";

export async function signIn(_prev: string | undefined, form: FormData) {
  if (!adminConfigured()) return "DESIGN_ADMIN_PASSWORD is not set on this deployment.";
  const password = String(form.get("password") ?? "");
  if (!checkPassword(password)) return "Wrong password.";
  const token = issueToken();
  (await cookies()).set(COOKIE, token.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/design/admin",
    maxAge: token.maxAge,
  });
  revalidatePath("/design/admin");
  return undefined;
}

export async function signOut() {
  (await cookies()).delete({ name: COOKIE, path: "/design/admin" });
  revalidatePath("/design/admin");
}

export async function updateStatus(form: FormData) {
  if (!(await isSignedIn())) return;
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!id || !["new", "replied", "won", "archived"].includes(status)) return;
  await setBriefStatus(id, status);
  revalidatePath("/design/admin");
}

export async function removeSubscriber(form: FormData) {
  if (!(await isSignedIn())) return;
  const id = String(form.get("id") ?? "");
  if (!id) return;
  // Soft removal: stamps unsubscribed_at rather than deleting, so a re-signup
  // still merges onto the same row and the history is not lost.
  await unsubscribe(id);
  revalidatePath("/design/admin");
}
