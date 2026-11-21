import snapshot from "@/content/github-contributions.json";
import { SOCIALS } from "@/lib/profile";
import { parseContributions, type Contributions } from "./contributions";

const link = SOCIALS.find((s) => s.label === "github");
if (!link) throw new Error("src/lib/profile.ts SOCIALS has no github link");
export const GITHUB = link.href;
const USER = new URL(GITHUB).pathname.split("/")[1];

/** The live calendar, refetched at most hourly; the snapshot scripts/github-snapshot.mjs wrote at build time if
 *  GitHub is down or its markup changes. Never a made-up number. */
export async function getContributions(): Promise<Contributions> {
  try {
    const res = await fetch(`https://github.com/users/${USER}/contributions`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("github " + res.status);
    return parseContributions(await res.text());
  } catch {
    return snapshot;
  }
}
