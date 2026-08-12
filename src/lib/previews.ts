// The link previews: what each hover card on the homepage shows.
//
// Every entry is keyed, and /api/og takes only the key — never a URL from the
// query string. That is deliberate. An endpoint that fetches whatever URL a
// caller hands it is an open proxy: it will happily reach into a private
// network or an instance metadata endpoint on the caller's behalf. Keying the
// map server-side means the set of things this route can ever fetch is the set
// written down here.
//
// Three shapes:
//   image     — serve this file and never leave the origin. For sites whose own
//               share card is worse than the screenshot sitting in this repo.
//   url       — fetch the page and use its og:image.
//   fallback  — a local file to serve when that fetch fails or finds nothing.
//
// An entry with neither image nor a working fetch shows no card at all, rather
// than opening onto an empty rectangle.

export type Preview = { url?: string; image?: string; fallback?: string };

export const PREVIEWS: Record<string, Preview> = {
  // The screenshots read better than these three sites' share cards, so they
  // are used directly — no fetch, nothing to fail.
  bevel: { image: "/design/bevel-team.webp" },
  bidframe: { image: "/design/bidframe-org.webp" },
  weld: { image: "/design/weld.webp" },

  skribbl: { url: "https://skribbl.dev", fallback: "/design/skribbl-dev.webp" },

  "world ent": { url: "https://games.worldent.online" },
  "basket ent": { url: "https://basketent.com" },

  "jawadj.design": { url: "https://jawad-portfolio-kohl.vercel.app" },
  acquiblox: { url: "https://acquiblox.com" },
  "cosmos models": { url: "https://cosmosmodels.lovable.app" },
  "sof agency": { url: "https://sof.agency" },

  vizzbees: { url: "https://vizzbees.com", fallback: "/design/vizzbees.webp" },
  kleoklaw: { url: "https://kleoklaw.com", fallback: "/design/kleoklaw.webp" },
  "splitting point": { url: "https://splittingpoint.com", fallback: "/design/splittingpoint.webp" },
};
