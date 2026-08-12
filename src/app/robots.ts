// robots.txt. Everything is public except the admin route behind /design, which
// is a sign-in page and has nothing to index.

import type { MetadataRoute } from "next";
import { IDENTITY } from "@/lib/profile";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/design/admin", "/api/"] }],
    sitemap: `${IDENTITY.site}/sitemap.xml`,
    host: IDENTITY.site,
  };
}
