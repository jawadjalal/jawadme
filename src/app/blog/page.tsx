import Link from "next/link";
import type { Metadata } from "next";
import { IDENTITY } from "@/lib/profile";
import { formatDate, POSTS } from "@/lib/posts";

const TITLE = `Blog, ${IDENTITY.properName}`;
const DESCRIPTION =
  "Notes from Jawad Jalal on design, building products and launching apps with Ignura.";
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
    images: [{ url: "/og.png", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: "summary_large_image", creator: "@jawadmakes", images: ["/og.png"] },
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
      <div className="screen-line-bottom px-4 py-1">
        <h1 className="font-display text-xl font-medium tracking-tight sm:text-2xl">Blog</h1>
      </div>
      <ul className="space-y-1 px-4 py-5 sm:px-6">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="role-row -mx-2 block rounded-lg px-2 py-2">
              <div className="flex items-baseline gap-2">
                <h2 className="min-w-0 font-display text-[15px] font-semibold leading-snug">{p.title}</h2>
                <span className="lead" aria-hidden="true" />
                <time dateTime={p.date} className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {formatDate(p.date)}
                </time>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{p.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
