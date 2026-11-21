// The plain text a language model reads instead of the page (llmstxt.org): who Jawad is, the facts as questions and
// answers, and every page worth citing, built from the same content the pages render.

import { ADS } from "@/content/ads";
import { SITE, TIMELINE } from "@/content/site";
import { REAL, laneLabel } from "@/content/work";
import { FAQ } from "@/lib/facts";
import { ROOMS, headline } from "@/lib/gallery";
import { ENTITY, abs } from "@/lib/seo";

const head = () => [
  "# Jawad Jalal",
  "",
  "> " + ENTITY,
  "",
  "Jawad Jalal's own site, jawadjalal.com. Headline: \"" + SITE.headline + "\". In his words: \"Hi! I'm Jawad Jalal. I'm 15 and in London, designing and building things.\"",
];

const facts = () => ["## Facts", "", ...FAQ.flatMap((f) => ["### " + f.q, "", f.a, ""])];

const pages = () => [
  "## Pages",
  "",
  `- [Home](${abs("/")}): the hero, his experience, a selection of ads and work`,
  `- [Work](${abs("/work")}): the gallery: ${ADS.length} ads grouped by brand first, then websites, his design tool Ignaru, 3D and his Roblox game`,
  `- [About](${abs("/about")}): who he is, where he has worked, and the short answers`,
  `- [Book a call](${abs("/cal")}): a free 15 minute video call`,
  `- [Fracture, the game page](${abs("/derelictdepths")}): the Roblox game he designs and builds`,
  "",
  "## Case studies",
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
    "## Optional",
    "",
    `- [Everything, in one file](${abs("/llms-full.txt")}): every case study and every ad with its own address`,
    `- [Email](mailto:${SITE.email})`,
    "",
  ].join("\n");
}

export function llmsFull() {
  return [
    ...head(),
    "",
    ...facts(),
    "## Experience",
    "",
    ...TIMELINE.map((t) => `- ${t.co}, ${t.role}, ${t.years}${t.now ? " (now)" : " (past)"}: ${t.what.replace(/\. 14M views at its launch$/, "")}. ${t.href}`),
    "",
    ...pages(),
    "",
    "## Case studies in full",
    "",
    ...REAL.flatMap((p) => [
      "### " + p.name,
      "",
      p.lines.join(" "),
      "",
      `- Lane: ${laneLabel(p.lane)}`,
      `- Year: ${p.year}`,
      `- Disciplines: ${p.disciplines.join(", ")}`,
      ...(p.link ? [`- Live: ${p.link.href.startsWith("/") ? abs(p.link.href) : p.link.href}`] : []),
      `- Page: ${abs("/work/" + p.slug)}`,
      "",
      "Pictures:",
      ...[p.cover, ...p.blocks.flatMap((b) => (Array.isArray(b.media) ? b.media : [b.media]))].map((m) => `- ${m.alt}`),
      "",
    ]),
    `## Ads (${ADS.length})`,
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
    "## Contact",
    "",
    `- Book a call: ${abs("/cal")}`,
    `- Email: ${SITE.email}`,
    "",
  ].join("\n");
}
