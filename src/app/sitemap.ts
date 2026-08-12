// sitemap.xml, built from the posts on disk so it cannot go stale.

import type { MetadataRoute } from "next";
import { allPosts } from "@/lib/posts";
import { IDENTITY } from "@/lib/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = IDENTITY.site;
  const posts = allPosts();

  // The newest post is the best available signal for when /writing last moved.
  const newest = posts[0]?.date ? new Date(posts[0].date) : new Date();

  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/writing`, lastModified: newest, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/design`, changeFrequency: "monthly", priority: 0.6 },
    ...posts.map((p) => ({
      url: `${base}/writing/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
