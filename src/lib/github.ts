import snapshot from "@/content/github-contributions.json";
import { parseContributions, type Contributions } from "./contributions";

export const GITHUB_USER = "jawadjalal";
export const GITHUB = "https://github.com/" + GITHUB_USER;

/** The live calendar, refetched at most hourly; the snapshot scripts/github-snapshot.mjs wrote at build time if
 *  GitHub is down or its markup changes. Never a made-up number. */
export async function getContributions(): Promise<Contributions> {
  try {
    const res = await fetch(`https://github.com/users/${GITHUB_USER}/contributions`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("github " + res.status);
    return parseContributions(await res.text());
  } catch {
    return snapshot;
  }
}
