import { existsSync } from "node:fs";
import { join } from "node:path";
import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/posts";
import { LASTMOD, MAGNITUDE_URL, SITE_URL } from "@/lib/seo";

// Real routes only. /magnitude is the game, served on this domain by a rewrite, so it is listed here and its own
// metadata lives in that repo. Dates come from lib/seo.ts and the posts, never from the build clock.
// /capy is added by another branch; list it only once its page exists at build time.
const HAS_CAPY = existsSync(join(process.cwd(), "src/app/capy/page.tsx"));

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: LASTMOD.home, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/call`, lastModified: LASTMOD.call, changeFrequency: "monthly", priority: 0.8 },
    ...(HAS_CAPY ? [{ url: `${SITE_URL}/capy`, lastModified: LASTMOD.home, changeFrequency: "monthly" as const, priority: 0.5 }] : []),
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
