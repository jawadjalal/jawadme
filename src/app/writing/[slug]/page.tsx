import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allPosts, formatDate, getPost } from "@/lib/posts";
import "../writing.css";

type Params = { slug: string };

// Prerender every post at build time — the whole blog is files on disk, so
// there is nothing to fetch at request time.
export function generateStaticParams(): Params[] {
  return allPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found — jawadOS" };

  const url = `/writing/${post.slug}`;
  return {
    title: `${post.title} — jawadOS`,
    description: post.summary,
    alternates: {
      canonical: url,
      types: { "application/rss+xml": "/writing/rss.xml" },
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      url,
      siteName: "jawadOS",
      type: "article",
      publishedTime: post.date || undefined,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const when = formatDate(post.date);

  return (
    <main className="wr">
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div className="wr-shell">
        <div className="wr-window">
          <div className="wr-bar">
            <span className="wr-dot" />
            <strong>Writing</strong>
            <div className="wr-bar-right">
              <a href="/writing">Index</a>
              <a href="/">jawadOS</a>
            </div>
          </div>

          <div className="wr-body">
            <a className="wr-back" href="/writing">
              ← All posts
            </a>

            <article className="wr-article">
              <header className="wr-article-head">
                <h1>{post.title}</h1>
                <div className="wr-meta">
                  {when ? <span>{when}</span> : null}
                  {when ? <span className="sep">·</span> : null}
                  <span>{post.readingMinutes} min read</span>
                  {post.draft ? <span className="wr-tag wr-tag-draft">draft</span> : null}
                  {post.tags.map((tag) => (
                    <span key={tag} className="wr-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </header>

              {/* Rendered from the site's own markdown files at build time — no
                  user input reaches marked(), so the HTML is trusted. */}
              <div className="wr-prose" dangerouslySetInnerHTML={{ __html: post.html }} />

              <footer className="wr-foot">
                <a href="/writing">← All posts</a>
                <a href="/writing/rss.xml">RSS</a>
              </footer>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}
