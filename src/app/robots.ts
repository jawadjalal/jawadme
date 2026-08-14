// robots.txt. Everything is public except the two inboxes — /design/admin and
// /responses — which are sign-in pages with nothing to index.

import type { MetadataRoute } from "next";
import { IDENTITY } from "@/lib/profile";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/design/admin", "/responses", "/api/"] },
    ],
    sitemap: `${IDENTITY.site}/sitemap.xml`,
    host: IDENTITY.site,
  };
}
