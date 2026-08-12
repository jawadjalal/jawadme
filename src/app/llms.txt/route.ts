// /llms.txt — the site index for language models: who this is in a sentence,
// then where everything else lives. A map, not the content.

import { llmsTxt } from "@/lib/agentText";

export const dynamic = "force-static";

export function GET() {
  return new Response(llmsTxt(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
