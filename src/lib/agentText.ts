// The site as plain text, for readers that are not browsers.
//
// Two shapes of the same facts. /index.md is the homepage as a document — what
// an agent asked to "read jawadjalal.com" should get instead of a React tree
// full of typing-animation spans. /llms.txt is the site-level index: who this
// is, in a paragraph, plus where everything else lives.
//
// Both build from src/lib/profile.ts, so neither can quietly disagree with the
// page a human sees.

import { ARCHIVE, ELSEWHERE, IDENTITY, PROJECTS, PROSE, SKILLS, SUMMARY, WORK_LINKS } from "./profile";
import { SOCIALS } from "./content";
import { allPosts, formatDate } from "./posts";

const link = (text: string, href: string) => `[${text}](${href})`;

/** The homepage, as a markdown document. */
export function profileMarkdown(): string {
  const projects = PROJECTS.map((p) => `- ${link(p.name, p.href)} — ${p.blurb}`);
  const archive = ARCHIVE.map((p) => `- ${link(p.name, p.href)} — ${p.blurb}`);
  const elsewhere = ELSEWHERE.map((e) => `- ${link(e.name, e.href)} — ${e.note}`);
  const socials = SOCIALS.map((s) => `- ${link(s.label, s.href)}`);

  const posts = allPosts().slice(0, 5);
  const writing = posts.length
    ? posts.map(
        (p) =>
          `- ${link(p.title, `${IDENTITY.site}/writing/${p.slug}`)} — ${formatDate(p.date)}`,
      )
    : ["- nothing published yet."];

  return [
    `# ${IDENTITY.name}`,
    "",
    `${IDENTITY.role} · ${IDENTITY.locality}, ${IDENTITY.region}`,
    "",
    PROSE.p1,
    "",
    "## working on",
    "",
    ...projects,
    "",
    "## also mine",
    "",
    ...archive,
    "",
    "## everything else",
    "",
    ...elsewhere,
    "",
    "## other work",
    "",
    `${PROSE.p3}`,
    "",
    `${PROSE.p4a}${link(PROSE.worldent, WORK_LINKS.worldent)}${PROSE.p4b}` +
      `${link(PROSE.basket, WORK_LINKS.basket)}${PROSE.p4c}`,
    "",
    PROSE.p5,
    "",
    "## what i do",
    "",
    ...SKILLS.map((s) => `- ${s}`),
    "",
    "## writing",
    "",
    ...writing,
    "",
    "## contact",
    "",
    ...socials,
    `- email: ${IDENTITY.email}`,
    `- cv: ${IDENTITY.site}${IDENTITY.cv}`,
    "",
  ].join("\n");
}

/** The site index, in the /llms.txt convention: a title, a one-line summary,
 *  then linked sections. Kept short on purpose — it is a map, not the content. */
export function llmsTxt(): string {
  const projects = [...PROJECTS, ...ARCHIVE].map(
    (p) => `- ${link(p.name, p.href)}: ${p.blurb}`,
  );

  return [
    `# ${IDENTITY.name}`,
    "",
    `> ${SUMMARY}`,
    "",
    "## pages",
    "",
    `- ${link("homepage (markdown)", `${IDENTITY.site}/index.md`)}: this profile as a document`,
    `- ${link("writing", `${IDENTITY.site}/writing`)}: notes on designing and shipping things`,
    `- ${link("writing feed", `${IDENTITY.site}/writing/rss.xml`)}: rss`,
    `- ${link("cv", `${IDENTITY.site}${IDENTITY.cv}`)}: pdf`,
    "",
    "## projects",
    "",
    ...projects,
    "",
    "## contact",
    "",
    `- email: ${IDENTITY.email}`,
    ...SOCIALS.map((s) => `- ${s.label.toLowerCase()}: ${s.href}`),
    "",
  ].join("\n");
}
