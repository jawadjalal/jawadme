import type { MetadataRoute } from "next";
import { REAL } from "@/content/work";
import { POSTS } from "@/lib/posts";
import { CURATED } from "@/lib/pieces";
import { abs } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") => ({ url: abs(path), changeFrequency, priority });
  return [
    page("/", 1, "weekly"),
    page("/work", 0.9, "weekly"),
    page("/about", 0.8),
    page("/cal", 0.8),
    page("/contact", 0.7),
    ...REAL.map((p) => page("/work/" + p.slug, 0.7)),
    ...CURATED.map((a) => page("/w/" + a.id, 0.5)),
    page("/fracture", 0.6),
    page("/capy", 0.5, "weekly"),
    page("/blog", 0.5, "weekly"),
    ...POSTS.map((p) => ({ url: abs("/blog/" + p.slug), lastModified: new Date(p.date), changeFrequency: "yearly" as const, priority: 0.4 })),
  ];
}
