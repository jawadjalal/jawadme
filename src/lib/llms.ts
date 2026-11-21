// The plain text a language model reads instead of the page (llmstxt.org): who Jawad is, the facts as questions and
// answers, and every page worth citing, built from the same content the pages render.

import { ADS } from "@/content/ads";
import { SITE, TIMELINE } from "@/content/site";
import { REAL, laneLabel } from "@/content/work";
import { FAQ } from "@/lib/facts";
import { ROOMS, headline } from "@/lib/gallery";
import { ENTITY, abs } from "@/lib/seo";

const head = () => [
  "# jawad jalal",
  "",
  "> " + ENTITY,
  "",
  "jawad jalal's own site, jawadjalal.com. headline: \"" + SITE.headline + "\". in his words: \"hi! i'm jawad jalal. i'm 15 and in london, designing and building things.\"",
];

const facts = () => ["## facts", "", ...FAQ.flatMap((f) => ["### " + f.q, "", f.a, ""])];

const pages = () => [
  "## pages",
  "",
  `- [home](${abs("/")}): the hero, his experience, a selection of ads and work`,
  `- [work](${abs("/work")}): the gallery: ${ADS.length} ads grouped by brand first, then websites, his design tool ignaru, 3d and his roblox game`,
  `- [about](${abs("/about")}): who he is, where he has worked, and the short answers`,
  `- [book a call](${abs("/cal")}): a free 15 minute video call`,
  `- [contact](${abs("/contact")}): book a call or email him, side by side`,
  `- [fracture, the game page](${abs("/derelictdepths")}): the roblox game he designs and builds`,
  "",
  "## case studies",
  "",
  ...REAL.map((p) => `- [${p.name}](${abs("/work/" + p.slug)}): ${p.lines.join(" ")} (${laneLabel(p.lane)}, ${p.year})`),
];

export function llms() {
  return [
    ...head(),
    "",
    ...facts(),
    ...pages(),
    "",
    "## optional",
    "",
    `- [everything, in one file](${abs("/llms-full.txt")}): every case study and every ad with its own address`,
    `- [email](mailto:${SITE.email})`,
    "",
  ].join("\n");
}

export function llmsFull() {
  return [
    ...head(),
    "",
    ...facts(),
    "## experience",
    "",
    ...TIMELINE.map((t) => `- ${t.co}, ${t.role}, ${t.years}${t.now ? " (now)" : " (past)"}: ${t.what.replace(/\. 14M views at its launch$/, "")}. ${t.href}`),
    "",
    ...pages(),
    "",
    "## case studies in full",
    "",
    ...REAL.flatMap((p) => [
      "### " + p.name,
      "",
      p.lines.join(" "),
      "",
      `- lane: ${laneLabel(p.lane)}`,
      `- year: ${p.year}`,
      `- disciplines: ${p.disciplines.join(", ")}`,
      ...(p.link ? [`- live: ${p.link.href.startsWith("/") ? abs(p.link.href) : p.link.href}`] : []),
      `- page: ${abs("/work/" + p.slug)}`,
      "",
      "pictures:",
      ...[p.cover, ...p.blocks.flatMap((b) => (Array.isArray(b.media) ? b.media : [b.media]))].map((m) => `- ${m.alt}`),
      "",
    ]),
    `## ads (${ADS.length})`,
    "",
    ...ADS.map((a) => `- [${a.campaign}: ${headline(a)}](${abs("/w/" + a.id)}): ${a.alt}`),
    "",
    ...ROOMS.filter((r) => r.section !== "ads").flatMap((r) => [
      `## ${r.title}`,
      "",
      r.note,
      "",
      ...r.entries.map((e) => `- [${e.title}: ${e.line}](${abs(e.href)})${e.piece ? ", " + e.piece.credit : ""}: ${e.media.alt}`),
      "",
    ]),
    "## contact",
    "",
    `- book a call: ${abs("/cal")}`,
    `- email: ${SITE.email}`,
    "",
  ].join("\n");
}
