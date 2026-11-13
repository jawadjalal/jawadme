import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/posts";
import { LASTMOD, MAGNITUDE_URL, SITE_URL } from "@/lib/seo";

// Real routes only. /magnitude is the game, served on this domain by a rewrite, so it is listed here and its own
// metadata lives in that repo. Dates come from lib/seo.ts and the posts, never from the build clock.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: LASTMOD.home, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/call`, lastModified: LASTMOD.call, changeFrequency: "monthly", priority: 0.8 },
    { url: MAGNITUDE_URL, lastModified: LASTMOD.magnitude, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/blog`, lastModified: LASTMOD.blog, changeFrequency: "monthly", priority: 0.6 },
    ...POSTS.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.date,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
