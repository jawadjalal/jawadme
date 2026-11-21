// The facts a reader or an answer engine asks for, as questions and answers. Every answer is built from src/content
// and src/lib/profile.ts, so the About page, its FAQ data and /llms.txt say the same thing.

import { ADS } from "@/content/ads";
import { SITE, TIMELINE } from "@/content/site";
import { projectBySlug } from "@/content/work";
import { ENTITY } from "@/lib/seo";

const ignaru = projectBySlug("ignaru");
const fracture = projectBySlug("derelict-depths");
const past = TIMELINE.filter((t) => !t.now);
const now = TIMELINE.find((t) => t.now);

export const FAQ: { q: string; a: string }[] = [
  { q: "Who is Jawad Jalal?", a: ENTITY },
  { q: "How old is Jawad Jalal, and where is he based?", a: "He is 15 and lives in London, England." },
  { q: "What does he design?", a: `Brands, ads, websites, 3D and Roblox games. He builds his own products end to end: the brand, the interface, and the thing that actually ships. His gallery at jawadjalal.com/work holds ${ADS.length} of his ads beside his products, sites and Roblox game.` },
  ...(now ? [{ q: `What is ${now.co}?`, a: `${now.co} is the design studio Jawad founded and runs, from 2026 to now. It designs websites for startups and builds them from scratch.` }] : []),
  ...(ignaru ? [{ q: "What is Ignaru?", a: `Ignaru is a design tool Jawad designs and builds. ${ignaru.lines.slice(1).join(" ")}` }] : []),
  { q: "Where has he worked?", a: past.map((t) => `${t.role} at ${t.co} (${t.years}): ${t.what.charAt(0).toLowerCase() + t.what.slice(1).replace(/\. 14M views at its launch$/, "")}.`).join(" ") + " Both roles are in the past." },
  ...(fracture ? [{ q: "What is Fracture?", a: `Fracture is a Roblox mining game Jawad designs and builds, formerly called Derelict Depths. ${fracture.lines[1] ?? ""}`.trim() }] : []),
  { q: "How do I work with him?", a: `Book a free 15 minute video call at jawadjalal.com/cal, or email ${SITE.email}.` },
];
