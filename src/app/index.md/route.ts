// The homepage as markdown, for agents and anything else that would rather read
// a document than a React tree. Advertised from the page head as
// <link rel="alternate" type="text/markdown">.

import { profileMarkdown } from "@/lib/agentText";

export const dynamic = "force-static";

export function GET() {
  return new Response(profileMarkdown(), {
    headers: {
      // charset matters: the copy uses typographic dashes and apostrophes.
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
