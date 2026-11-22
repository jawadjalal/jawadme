// Writes src/content/github-contributions.json, the fallback the live contribution graph uses when GitHub can't be
// reached. Runs before every build; with --soft a failed fetch keeps the committed snapshot instead of failing the build.
//   npm run gh:snapshot
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseContributions } from "../src/lib/contributions.ts";

const out = resolve(dirname(fileURLToPath(import.meta.url)), "../src/content/github-contributions.json");
try {
  const res = await fetch("https://github.com/users/jawadjalal/contributions");
  if (!res.ok) throw new Error("github " + res.status);
  const c = parseContributions(await res.text());
  writeFileSync(out, JSON.stringify(c) + "\n");
  console.log(`github snapshot: ${c.total} contributions from ${c.start}, ${c.levels.length} days`);
} catch (e) {
  if (!process.argv.includes("--soft")) throw e;
  console.warn("github snapshot kept: " + e.message);
}
