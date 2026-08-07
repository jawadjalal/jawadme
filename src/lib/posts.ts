// The blog's content layer. Posts are markdown files with YAML frontmatter in
// content/posts/*.md — no CMS, no database. Everything here runs on the server
// at build time (node:fs), so /writing and /writing/[slug] prerender to static
// HTML and the markdown parser never reaches the browser.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type PostMeta = {
  slug: string;
  title: string;
  /** ISO date from frontmatter, kept as a string so it serialises cleanly. */
  date: string;
  summary: string;
  tags: string[];
  draft: boolean;
  /** Whole minutes, floored at 1 — derived from the body's word count. */
  readingMinutes: number;
};

export type Post = PostMeta & {
  /** Raw markdown body, frontmatter stripped. */
  body: string;
  /** Rendered HTML, ready for dangerouslySetInnerHTML. */
  html: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

// 200 wpm is the usual convention for prose and reads honestly for these
// lengths. The count is deliberately crude: markdown punctuation splits on
// whitespace like anything else, and a few tokens either way never moves the
// rounded minute.
const WORDS_PER_MINUTE = 200;

function readingMinutes(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

const asString = (v: unknown, fallback = "") =>
  typeof v === "string" && v.trim() ? v.trim() : fallback;

function asTags(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((t) => asString(t)).filter(Boolean);
}

/** A date we can sort by. Unparseable/missing dates sort last rather than throw. */
function timestamp(date: string) {
  const t = Date.parse(date);
  return Number.isNaN(t) ? 0 : t;
}

function parse(slug: string, raw: string): Post {
  let data: Record<string, unknown>;
  let content: string;
  try {
    const parsed = matter(raw);
    data = parsed.data as Record<string, unknown>;
    content = parsed.content;
  } catch (err) {
    // gray-matter throws a bare YAMLException with a line number but no
    // filename, which in a build log is close to useless. Say which post.
    const why = err instanceof Error ? err.message : String(err);
    throw new Error(`Bad frontmatter in content/posts/${slug}.md: ${why}`);
  }
  const body = content.trim();
  return {
    slug,
    title: asString(data.title, slug),
    date: asString(data.date),
    summary: asString(data.summary),
    tags: asTags(data.tags),
    draft: data.draft === true,
    readingMinutes: readingMinutes(body),
    body,
    // GitHub-flavoured markdown; `breaks` stays off so wrapped source lines do
    // not become <br>. The source is the site owner's own files, so there is no
    // untrusted HTML to sanitise here.
    html: marked.parse(body, { gfm: true, breaks: false, async: false }),
  };
}

function slugOf(filename: string) {
  return filename.replace(/\.mdx?$/i, "");
}

/** True in `next build`/production; drafts are visible in dev only. */
const showDrafts = process.env.NODE_ENV !== "production";

function readAll(): Post[] {
  let files: string[];
  try {
    files = fs.readdirSync(POSTS_DIR);
  } catch {
    // No content directory yet — an empty blog, not a crash.
    return [];
  }
  return files
    .filter((f) => /\.mdx?$/i.test(f) && !f.startsWith("."))
    .map((f) => parse(slugOf(f), fs.readFileSync(path.join(POSTS_DIR, f), "utf8")))
    .filter((p) => showDrafts || !p.draft)
    .sort((a, b) => timestamp(b.date) - timestamp(a.date));
}

/** Every publishable post, newest first. Drafts are excluded in production. */
export function allPosts(): Post[] {
  return readAll();
}

/** One post by slug, or null if it does not exist (or is a hidden draft). */
export function getPost(slug: string): Post | null {
  return readAll().find((p) => p.slug === slug) ?? null;
}

/** e.g. "7 August 2026". Falsy/invalid dates render as an empty string. */
export function formatDate(date: string): string {
  const t = Date.parse(date);
  if (Number.isNaN(t)) return "";
  return new Date(t).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
