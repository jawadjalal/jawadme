// The link previews: what each hover card on the homepage shows.
//
// Every entry is keyed, and /api/og takes only the key — never a URL from the
// query string. That is deliberate. An endpoint that fetches whatever URL a
// caller hands it is an open proxy: it will happily reach into a private
// network or an instance metadata endpoint on the caller's behalf. Keying the
// map server-side means the set of things this route can ever fetch is the set
// written down here.
//
// `fallback` is a local screenshot to serve when a site exposes no og:image, or
// is slow, or is down. Not every site has one; entries without it simply show
// no preview rather than an empty card.

export type Preview = { url: string; fallback?: string };

export const PREVIEWS: Record<string, Preview> = {
  skribbl: { url: "https://skribbl.dev", fallback: "/design/skribbl-dev.webp" },
  bevel: { url: "https://bevel.team", fallback: "/design/bevel-team.webp" },
  bidframe: { url: "https://bidframe.org", fallback: "/design/bidframe-org.webp" },
  weld: { url: "https://weldroblox.com", fallback: "/design/weld.webp" },

  "jawadj.design": { url: "https://jawad-portfolio-kohl.vercel.app" },
  acquiblox: { url: "https://acquiblox.com" },
  "cosmos models": { url: "https://cosmosmodels.lovable.app" },
  "sof agency": { url: "https://sof.agency" },

  vizzbees: { url: "https://vizzbees.com", fallback: "/design/vizzbees.webp" },
  kleoklaw: { url: "https://kleoklaw.com", fallback: "/design/kleoklaw.webp" },
  "splitting point": { url: "https://splittingpoint.com", fallback: "/design/splittingpoint.webp" },
};
