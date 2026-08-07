"use client";

// Shared submit path for the two scene variants. The scene keeps its own
// optimistic "sent" animation; this only owns the network hop and reports
// whether the brief actually landed in the CMS.

export type BriefPayload = {
  name: string;
  email: string;
  link?: string;
  message: string;
  scope?: string;
  speed?: string;
  band?: string;
  estimate?: number;
  tier?: string;
  addons?: string[];
  variant: "desktop" | "mobile";
};

export async function submitBrief(payload: BriefPayload) {
  // Kept locally too, so a network failure never loses what someone typed.
  try {
    localStorage.setItem(
      "jawados.brief",
      JSON.stringify({ ...payload, at: new Date().toISOString() }),
    );
  } catch {
    /* private mode, storage full — not worth interrupting the send */
  }

  try {
    const res = await fetch("/api/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      return { ok: false as const, error: body?.error ?? `HTTP ${res.status}` };
    }
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "network error" };
  }
}
