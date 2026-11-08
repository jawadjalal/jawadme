/**
 * Everything in the work list on jawadjalal.com (src/components/felt/Showcase.tsx). One entry per line: adding a site
 * or an ad is adding one line here and dropping its still in public/showcase.
 *
 * - kind: what it is. "product" is something Jawad runs; "site" a website; "ad" an ad or a set of them.
 * - label: who it was for, said honestly. "own" is his own; "client" was paid for; "concept" is an unasked redesign
 *   of a real company's site; "spec" was made to pitch, unasked.
 * - image: a still, 16:10 for sites (1440 wide, shot at 1440 by 900), 4:5 for ads. `small` is the same still at half
 *   width, for phones. Stills of the sites were taken on a box on 8 Nov 2026.
 * - line: one short line, lowercase, under 80 characters.
 */
export type ShowcaseKind = "product" | "site" | "ad";
export type ShowcaseLabel = "own" | "client" | "concept" | "spec";

export type ShowcaseItem = {
  name: string;
  kind: ShowcaseKind;
  label: ShowcaseLabel;
  href: string;
  image: string;
  small?: string;
  line: string;
};

export const SHOWCASE: ShowcaseItem[] = [
  { name: "wayari", kind: "product", label: "own", href: "https://wayari.com", image: "/sites/wayari.webp", line: "coding agents on your own branches, ending in one pull request you merge." },
  { name: "ignaru", kind: "product", label: "own", href: "https://ignaru.com", image: "/sites/ignaru.webp", line: "a design canvas that opens your repo. circle what's wrong and your agent fixes it." },
  { name: "mercy", kind: "site", label: "client", href: "https://mercy-perps.vercel.app", image: "/showcase/mercy-1440.webp", small: "/showcase/mercy-720.webp", line: "perps that pay back 25 to 100% of liquidated margin, in usdc." },
  { name: "coresrent", kind: "site", label: "client", href: "https://coresrent.vercel.app", image: "/showcase/coresrent-1440.webp", small: "/showcase/coresrent-720.webp", line: "fund real gpus in verified data centres and earn rent every metered hour." },
  { name: "menufit screens", kind: "site", label: "client", href: "https://menufit-screens.vercel.app", image: "/showcase/menufit-screens-1440.webp", small: "/showcase/menufit-screens-720.webp", line: "my client design pass for the menufit app, every screen, light and dark." },
  { name: "audora", kind: "site", label: "concept", href: "https://audora-site.vercel.app", image: "/showcase/audora-1440.webp", small: "/showcase/audora-720.webp", line: "a redesign for audora.art: paste a fanfic and hear it performed." },
  { name: "roport", kind: "site", label: "concept", href: "https://roport-concept.vercel.app", image: "/showcase/roport-1440.webp", small: "/showcase/roport-720.webp", line: "a redesign for roport.lol, where you hire roblox developers who shipped." },
  { name: "jobbie", kind: "site", label: "spec", href: "https://jobbie-hero.vercel.app", image: "/showcase/jobbie-1440.webp", small: "/showcase/jobbie-720.webp", line: "three rounds of a hero for jobbie, from their site today to an engraved knight." },
  { name: "aside", kind: "ad", label: "spec", href: "https://x.com/jawadjalal/status/2119202750026367081", image: "/showcase/aside-manifesto-1080.webp", small: "/showcase/aside-manifesto-540.webp", line: "three free ads for aside, my go-to browser. this is the black one." },
  { name: "spec ads", kind: "ad", label: "spec", href: "https://ignaru-spec-ads.vercel.app", image: "/showcase/ignaru-spec-ads-1440.webp", small: "/showcase/ignaru-spec-ads-720.webp", line: "140 ads for seven companies, made in a day with ignaru. none of them asked." },
];

export const KIND_NAME: Record<ShowcaseKind, string> = { product: "products", site: "sites", ad: "ads" };
export const LABEL_NAME: Record<ShowcaseLabel, string> = { own: "mine", client: "client", concept: "concept", spec: "spec" };
