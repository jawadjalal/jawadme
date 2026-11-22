import { llms } from "@/lib/llms";

export const dynamic = "force-static";

export function GET() {
  return new Response(llms(), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
