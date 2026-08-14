"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  REPLIES_COOKIE,
  adminConfigured,
  checkPassword,
  issueToken,
  isSignedIn,
} from "@/lib/adminAuth";
import { REPLY_STATUSES, setReplyStatus } from "@/lib/replies";

const PATH = "/responses";

export async function signIn(_prev: string | undefined, form: FormData) {
  if (!adminConfigured()) return "DESIGN_ADMIN_PASSWORD is not set on this deployment.";
  const password = String(form.get("password") ?? "");
  if (!checkPassword(password)) return "Wrong password.";
  const token = issueToken();
  (await cookies()).set(REPLIES_COOKIE, token.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: PATH,
    maxAge: token.maxAge,
  });
  revalidatePath(PATH);
  return undefined;
}

export async function signOut() {
  (await cookies()).delete({ name: REPLIES_COOKIE, path: PATH });
  revalidatePath(PATH);
}

export async function updateStatus(form: FormData) {
  if (!(await isSignedIn(REPLIES_COOKIE))) return;
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!id || !(REPLY_STATUSES as readonly string[]).includes(status)) return;
  await setReplyStatus(id, status);
  revalidatePath(PATH);
}
