import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IDENTITY } from "@/lib/profile";
import { formatDate, postBySlug, POSTS } from "@/lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = postBySlug((await params).slug);
  if (!post) return {};
  const url = `${IDENTITY.site}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    authors: [{ name: IDENTITY.properName, url: IDENTITY.site }],
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: IDENTITY.properName,
      type: "article",
      publishedTime: post.date,
      authors: [IDENTITY.properName],
      images: [{ url: "/og.png", width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", creator: "@jawadmakes", images: ["/og.png"] },
  };
}

export default async function PostPage({ params }: Props) {
  const post = postBySlug((await params).slug);
  if (!post) notFound();
  const url = `${IDENTITY.site}/blog/${post.slug}`;
  const author = { "@type": "Person", name: IDENTITY.properName, url: IDENTITY.site };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      author,
      publisher: author,
      url,
      mainEntityOfPage: url,
      image: `${IDENTITY.site}/og.png`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: IDENTITY.properName, item: IDENTITY.site },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${IDENTITY.site}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="screen-line-bottom px-4 py-6 sm:px-6">
        <p className="text-xs text-muted-foreground">
          <Link href="/blog" className="rp-link">Blog</Link>
          {" · "}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {" · "}
          {IDENTITY.properName}
        </p>
        <h1 className="mt-2 text-balance font-display text-2xl font-semibold tracking-tight md:text-3xl">
          {post.title}
        </h1>
      </header>

      <div className="post px-4 py-6 sm:px-6">
        {post.body}

        <h2>FAQ</h2>
        {post.faq.map((f) => (
          <div key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
