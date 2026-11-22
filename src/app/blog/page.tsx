import Link from "next/link";
import type { Metadata } from "next";
import { IDENTITY } from "@/lib/profile";
import { X_HANDLE } from "@/lib/seo";
import { formatDate, POSTS } from "@/lib/posts";

const TITLE = `blog, ${IDENTITY.properName}`;
const DESCRIPTION =
  "notes from jawad jalal on design, building products and launching apps with ignura.";
const URL = `${IDENTITY.site}/blog`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: IDENTITY.properName,
    type: "website",
    images: [{ url: "/og/blog.png", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: "summary_large_image", creator: X_HANDLE, images: ["/og/blog.png"] },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: TITLE,
  url: URL,
  author: { "@type": "Person", name: IDENTITY.properName, url: IDENTITY.site },
  blogPost: POSTS.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    url: `${URL}/${p.slug}`,
    datePublished: p.date,
  })),
};

export default function BlogIndex() {
  const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <div className="screen-line-bottom px-4 py-1 sm:px-6">
        <h1 className="font-display text-xl font-medium tracking-tight sm:text-2xl">blog</h1>
      </div>
      <ul className="space-y-1 px-4 py-5 sm:px-6">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="role-row !block">
              <div className="flex flex-col-reverse gap-1 sm:flex-row sm:items-baseline sm:gap-2">
                <h2 className="min-w-0 text-balance font-display text-[19px] font-semibold leading-snug sm:text-[15px]">{p.title}</h2>
                <span className="lead max-sm:hidden" aria-hidden="true" />
                <time dateTime={p.date} className="shrink-0 text-[13px] tabular-nums text-muted-foreground sm:text-xs">
                  {formatDate(p.date)}
                </time>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground sm:mt-1 sm:text-[13px]">{p.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
