// Serves the og:image of a linked site, for the homepage hover previews.
//
// Two fetches per cold request: the page's HTML to find the image, then the
// image itself, which is streamed back from this origin. Proxying rather than
// redirecting keeps the browser off third-party hosts — no referrer leak, no
// mixed-origin cache behaviour, and a site that blocks hotlinking still works.
//
// The route accepts a key, never a URL. See src/lib/previews.ts for why.

import { PREVIEWS } from "@/lib/previews";

// A day at the edge, and a stale copy may be served for a week while the next
// one is fetched. These images change about never, and a hover should not wait
// on someone else's server.
const CACHE = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

// Long enough for a slow origin, short enough that a dead one does not hold the
// connection open while somebody is waving their cursor around.
const TIMEOUT = 5000;

// Sites hand out different tags; take them in descending order of how likely
// each is to be the deliberate share image.
const TAGS = [
  /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
  /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
];

function findImage(html: string, base: string): string | null {
  for (const tag of TAGS) {
    const hit = html.match(tag);
    if (!hit?.[1]) continue;
    try {
      // og:image is often a path, sometimes protocol-relative. Resolving
      // against the page URL handles every shape without special-casing.
      const resolved = new URL(hit[1].replace(/&amp;/g, "&"), base);
      if (resolved.protocol === "http:" || resolved.protocol === "https:") {
        return resolved.toString();
      }
    } catch {
      // A malformed content attribute is not worth failing the request over —
      // try the next tag.
    }
  }
  return null;
}

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("k");
  const entry = key ? PREVIEWS[key] : undefined;

  // An unknown key is a bug in the page, not something a caller can probe for
  // interesting hosts — every reachable URL is in the map.
  if (!entry) return new Response("unknown preview", { status: 404 });

  // The local screenshot, when there is one. Used for every failure below, so a
  // site being slow or down degrades to a still image rather than a blank card.
  const fallback = () =>
    entry.fallback
      ? Response.redirect(new URL(entry.fallback, request.url), 307)
      : new Response("no preview", { status: 404 });

  try {
    const page = await fetch(entry.url, {
      signal: AbortSignal.timeout(TIMEOUT),
      redirect: "follow",
      headers: {
        // Some hosts serve a stripped page, or none, without a browser-shaped
        // Accept and User-Agent.
        accept: "text/html,application/xhtml+xml",
        "user-agent": "Mozilla/5.0 (compatible; jawadjalal.com link preview)",
      },
    });
    if (!page.ok) return fallback();

    // og:image lives in <head>; reading the whole document just to find it
    // would mean pulling megabytes of markup for a tag in the first few KB.
    const html = (await page.text()).slice(0, 120_000);
    const found = findImage(html, page.url || entry.url);
    if (!found) return fallback();

    const image = await fetch(found, {
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { accept: "image/*", referer: entry.url },
    });
    if (!image.ok) return fallback();

    const type = image.headers.get("content-type") ?? "";
    // A site that answers an image request with an HTML error page should not
    // have that page handed to an <img> tag.
    if (!type.startsWith("image/")) return fallback();

    return new Response(image.body, {
      headers: { "content-type": type, "cache-control": CACHE },
    });
  } catch {
    // Timeout, DNS failure, TLS error, unreachable host — all the same to the
    // page: show the screenshot if we have one.
    return fallback();
  }
}
