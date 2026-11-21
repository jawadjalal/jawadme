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
  { q: "who is jawad jalal?", a: ENTITY },
  { q: "how old is jawad jalal, and where is he based?", a: "he is 15 and lives in london, england." },
  { q: "what does he design?", a: `brands, ads, websites, 3d and roblox games. he builds his own products end to end: the brand, the interface, and the thing that actually ships. his gallery at jawadjalal.com/work holds ${ADS.length} of his ads beside his products, sites and roblox game.` },
  ...(now ? [{ q: `what is ${now.co}?`, a: `${now.co} is the design studio jawad founded and runs, from 2026 to now. it designs websites for startups and builds them from scratch.` }] : []),
  ...(ignaru ? [{ q: "what is ignaru?", a: `ignaru is a design tool jawad designs and builds. ${ignaru.lines.slice(1).join(" ")}` }] : []),
  { q: "where has he worked?", a: past.map((t) => `${t.role} at ${t.co} (${t.years}): ${t.what.charAt(0).toLowerCase() + t.what.slice(1).replace(/\. 14M views at its launch$/, "")}.`).join(" ") + " both roles are in the past." },
  ...(fracture ? [{ q: "what is fracture?", a: `fracture is a roblox mining game jawad designs and builds, formerly called derelict depths. ${fracture.lines[1] ?? ""}`.trim() }] : []),
  { q: "how do i work with him?", a: `book a free 15 minute video call at jawadjalal.com/cal, or email ${SITE.email}.` },
];
