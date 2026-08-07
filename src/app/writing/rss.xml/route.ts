import { allPosts } from "@/lib/posts";

// The feed is built from files on disk, so it can be baked at build time and
// served as a static asset.
export const dynamic = "force-static";

// Must match metadataBase in src/app/layout.tsx: RSS items need absolute URLs,
// and readers key off <guid>, so this host is not allowed to drift.
const SITE = "https://jawadjalal.com";

const TITLE = "Jawad Jalal — Writing";
const DESCRIPTION =
  "Notes from Jawad Jalal on designing things, building them and getting them out of the door.";

/** Escape the five XML predefined entities. `&` first, or it double-escapes. */
function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822 date, which RSS 2.0 requires for pubDate. */
function rfc822(date: string) {
  const t = Date.parse(date);
  return new Date(Number.isNaN(t) ? Date.now() : t).toUTCString();
}

export async function GET() {
  const posts = allPosts();
  const latest = posts[0]?.date;

  const items = posts
    .map((post) => {
      const url = `${SITE}/writing/${post.slug}`;
      return [
        "    <item>",
        `      <title>${esc(post.title)}</title>`,
        `      <link>${esc(url)}</link>`,
        // Feed readers dedupe on guid; the permalink is stable, so it is the guid.
        `      <guid isPermaLink="true">${esc(url)}</guid>`,
        `      <pubDate>${rfc822(post.date)}</pubDate>`,
        `      <description>${esc(post.summary)}</description>`,
        ...post.tags.map((tag) => `      <category>${esc(tag)}</category>`),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${esc(TITLE)}</title>`,
    `    <link>${SITE}/writing</link>`,
    `    <description>${esc(DESCRIPTION)}</description>`,
    "    <language>en-gb</language>",
    `    <lastBuildDate>${rfc822(latest ?? "")}</lastBuildDate>`,
    `    <atom:link href="${SITE}/writing/rss.xml" rel="self" type="application/rss+xml"/>`,
    items ? items : "",
    "  </channel>",
    "</rss>",
    "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
