import type { Metadata } from "next";
import { allPosts, formatDate } from "@/lib/posts";
import { Subscribe } from "./Subscribe";
import "./writing.css";

const DESCRIPTION =
  "Notes from Jawad Jalal on designing things, building them and getting them out of the door.";

export const metadata: Metadata = {
  title: "Writing — jawadOS",
  description: DESCRIPTION,
  alternates: {
    canonical: "/writing",
    // The feed, advertised as <link rel="alternate"> in the document head so
    // readers and crawlers can find it without being told.
    types: { "application/rss+xml": "/writing/rss.xml" },
  },
  openGraph: {
    title: "Writing — jawadOS",
    description: DESCRIPTION,
    url: "/writing",
    siteName: "jawadOS",
    type: "website",
  },
};

export default function WritingIndex() {
  const posts = allPosts();

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
              <a href="/">jawadOS</a>
              <a href="/writing/rss.xml">RSS</a>
            </div>
          </div>

          <div className="wr-body">
            <div className="wr-lede">
              <h1>Writing.</h1>
              <span className="wr-count">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </span>
            </div>

            <p className="wr-blurb">
              Notes on the things on this site: designing them, building them, and
              getting them out of the door.
            </p>

            {posts.length === 0 ? (
              <div className="wr-empty">
                <strong>Nothing published yet.</strong>
                <span>
                  The blog is wired up and waiting on its first post. Leave your
                  email below and the first one will come to you.
                </span>
              </div>
            ) : (
              <div className="wr-list">
                {posts.map((post) => (
                  <a key={post.slug} className="wr-item" href={`/writing/${post.slug}`}>
                    <div className="wr-item-head">
                      <h2>{post.title}</h2>
                      <span className="wr-when">{formatDate(post.date)}</span>
                    </div>
                    {post.summary ? <p className="wr-summary">{post.summary}</p> : null}
                    <div className="wr-tags">
                      {post.draft ? <span className="wr-tag wr-tag-draft">draft</span> : null}
                      {post.tags.map((tag) => (
                        <span key={tag} className="wr-tag">
                          {tag}
                        </span>
                      ))}
                      <span className="wr-more">{post.readingMinutes} min read →</span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            <Subscribe />
          </div>
        </div>
      </div>
    </main>
  );
}
