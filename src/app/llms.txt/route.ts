import { IDENTITY } from "@/lib/profile";
import { BOOK, EMAIL } from "@/components/felt/copy";
import { DOES, PAST, TIMELINE, X_HANDLE } from "@/content/story";
import { POSTS } from "@/lib/posts";
import { SITE_URL } from "@/lib/seo";

const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

// /llms.txt: a plain summary for answer engines. Built from the same files as the page, so it cannot drift from it.
export const dynamic = "force-static";

export function GET() {
  const companies = TIMELINE.map((t) => `- [${t.name}](${t.href}): ${t.role}`).join("\n");
  const before = PAST.map((p) => `- [${p.name}](${p.href}): ${p.role}`).join("\n");
  const posts = [...POSTS]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description}`)
    .join("\n");

  const body = `# ${IDENTITY.properName}

> ${IDENTITY.properName} is a designer and founder. He does ${list(DOES.map((d) => d.toLowerCase()))} for startups. He runs Ignura, an ad and brand studio, and is building Ignaru, a design tool. This site is his portfolio: a wall of his ads, brand studies, sites and components. Ads and studies of companies that did not ask for them are labelled unsolicited, and none of those companies is a client.

## Pages

- [Home](${SITE_URL}/): who he is, his two companies, where he has worked, and the wall of his work.
- [Call](${SITE_URL}/call): book a short video call with him.
- [Magnitude](${SITE_URL}/magnitude): a game he made, an incremental RPG on an endless canvas.
- [Blog](${SITE_URL}/blog): notes on design, building products and launching apps.
- [CV](${SITE_URL}${IDENTITY.cv}): his CV as a PDF.

## His companies

${companies}

## Where he has worked

${before}

## Blog

${posts}

## Get in touch

- Book a call: ${BOOK}
- Email: ${EMAIL}
- X: https://x.com/${X_HANDLE}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
