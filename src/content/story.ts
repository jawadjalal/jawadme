// The left column of the home page: who, the hire button, where he has worked, and replies on X. Facts only, from
// components/felt/copy.ts (JOBS, BOOK), lib/profile.ts and the CV; the replies are public replies on X to his ad
// posts, verbatim. Swap this file (and content/feed.ts) to put the same layout on another site.

import { BOOK, EMAIL } from "@/components/felt/copy";

/*
  Headline, his words (13 Nov, after seeing it live): "Too young to drive," / "but I'm a design mastermind." Two lines at
  every width (15 Nov, his ask: "two lines max"), each set whole, the first in grey and the second in ink. Both stickers
  ride on line one, the shorter: a little red car (his pick, 14 Nov, over the L plate it replaced) and his memoji. The
  earlier two-sentence version is kept as HEADLINE_ALT and shows with ?h=alt.
*/
const MEMOJI = { pic: "/design/jawad-die.webp", alt: "Jawad's memoji", cut: true, w: 697, h: 781, tilt: 5 } as const;
const CAR = { pic: "/work/2026-11/sticker-car.svg", alt: "a little red car", w: 156, h: 90, tilt: -4, cut: true, kind: "car" } as const;

/** One array per line of type; each line is set on one line, never rewrapped. A picture is a sticker: `cut` is a
 *  cut-out with its own outline, otherwise a die-cut card with a white edge. `fit` is the widest line's width in em,
 *  measured in the browser plus about 1.5% to spare for other browsers' kerning, so the type is sized to fill the
 *  column with it. */
export const HEADLINE = {
  lead: [[{ t: "Too young" }, CAR, { t: "to drive," }, MEMOJI]],
  main: [[{ t: "but I'm a design mastermind." }]],
  fit: 13.3,
} as const;

export const HEADLINE_ALT = {
  lead: [[{ t: "Too young" }, CAR, { t: "to drive." }, MEMOJI]],
  main: [[{ t: "Old enough to be a design mastermind." }]],
  fit: 17.45,
} as const;

export type Bit = { t: string } | { pic: string; alt: string; w: number; h: number; tilt: number; cut?: boolean; tuck?: boolean; kind?: string };

/** "call me" goes to the call page, which holds the booking calendar; BOOKING is the Cal.com page itself, the
 *  fallback inside it. */
export const HIRE = "/cal";
export const BOOKING = BOOK;
export const SECOND = { label: "email me", href: `mailto:${EMAIL}?subject=Hiring%20you`, address: EMAIL };

/** The startups he has worked at, for the first marquee at the column's foot: the CV's roles (scripts/cv.mjs ROLES),
 *  in the CV's order, with the marks the repo has. Nooli has no mark or site in the repo, so its name is set in type alone. */
export const WORKED: { name: string; role: string; logo?: string; href?: string }[] = [
  { name: "Ignaru", role: "founder", logo: "/logos/ignaru-mark.png", href: "https://ignaru.com" },
  { name: "Ignura", role: "founder", logo: "/logos/ignura.png", href: "https://ignura.com" },
  { name: "MenuFit", role: "product designer", logo: "/logos/menufit-bag-128.webp", href: "https://menufit.com" },
  { name: "Okara", role: "product intern", logo: "/logos/okara.png", href: "https://okara.ai" },
  { name: "Bevel", role: "founder", logo: "/logos/bevel.png", href: "https://bevel.team" },
  { name: "Nooli", role: "head of product" },
];

/** Where he is right now, for the second marquee: the city from lib/profile.ts, a live clock in its time zone, and the
 *  line the felt drawer opens with ("15, in London, building Ignaru"). */
export const NOW = { place: "London, England", zone: "Europe/London", city: "London", doing: "15, building Ignaru" } as const;

/** What he does, in his words, on one line under the buttons. */
export const DOES = ["Brand design", "Ads", "Design engineering"] as const;

/** His X handle: every reply below was posted under one of his ad posts. */
export const X_HANDLE = "jawadmakes";

/** Public replies on X to his ad posts, verbatim. Avatars are their X profile pictures, saved once (Benjamin Tay has
 *  none, so his shows an initial). */
export const REPLIES: { quote: string; name: string; handle: string; avatar?: string }[] = [
  { quote: "You have taste!", name: "Robert Scoble", handle: "Scobleizer", avatar: "/x-avatars/Scobleizer.webp" },
  { quote: "First one goes hard!", name: "Siddharth Borderwala", handle: "sidborderwala", avatar: "/x-avatars/sidborderwala.webp" },
  { quote: "these are really cool!", name: "owais", handle: "owaiskorejo7", avatar: "/x-avatars/owaiskorejo7.webp" },
  { quote: "respect the hustle at 15", name: "Tekon Burns", handle: "TekonBurns", avatar: "/x-avatars/TekonBurns.webp" },
  { quote: "these are great!", name: "Ray", handle: "rincidium", avatar: "/x-avatars/rincidium.webp" },
  { quote: "this is so good !", name: "void.", handle: "voidyaps", avatar: "/x-avatars/voidyaps.webp" },
  { quote: "Keep cooking bro", name: "Christoph Zimnicki", handle: "zimnickico", avatar: "/x-avatars/zimnickico.webp" },
  { quote: "yoo fire!", name: "jam", handle: "wespreadjam", avatar: "/x-avatars/wespreadjam.webp" },
  { quote: "beast", name: "Luis Vale", handle: "luis_vale", avatar: "/x-avatars/luis_vale.webp" },
  { quote: "Holy cool", name: "Anurag Sharma", handle: "AnuragShar74342", avatar: "/x-avatars/AnuragShar74342.webp" },
  { quote: "gas", name: "Benjamin Tay", handle: "bennytay07" },
];

export const CLOSING = "Still scrolling? Let's make yours.";
