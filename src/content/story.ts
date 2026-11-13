// The left column of the home page: who, the hire button, where he has worked, and replies on X. Facts only, from
// components/felt/copy.ts (JOBS, BOOK), lib/profile.ts and the CV; the replies are public replies on X to his ad
// posts, verbatim. Swap this file (and content/feed.ts) to put the same layout on another site.

import { BOOK, EMAIL } from "@/components/felt/copy";

/*
  Headline, his words (13 Nov, after seeing it live): "Too young to drive," / "but I'm a design mastermind." Exactly
  two lines at every width, both in ink, the first a touch lighter. His memoji on line one, and one more sticker that
  means something: an L plate. The earlier two-sentence version is kept as HEADLINE_ALT and shows with ?h=alt.
*/
const MEMOJI = { pic: "/design/jawad-die.webp", alt: "Jawad's memoji", cut: true, w: 697, h: 781, tilt: 5 } as const;
const LPLATE = { pic: "/work/2026-11/sticker-lplate.svg", alt: "an L plate", w: 120, h: 120, tilt: -5 } as const;

/** One array per line of type; each line is set on one line, never rewrapped. A picture is a sticker: `cut` is a
 *  cut-out with its own outline, otherwise a die-cut card with a white edge. */
export const HEADLINE = {
  lead: [[{ t: "Too young" }, LPLATE, { t: "to drive," }, MEMOJI]],
  main: [[{ t: "but I'm a design mastermind." }]],
} as const;

export const HEADLINE_ALT = {
  lead: [[{ t: "Too young" }, LPLATE, { t: "to drive." }, MEMOJI]],
  main: [[{ t: "Old enough to be a design mastermind." }]],
} as const;

export type Bit = { t: string } | { pic: string; alt: string; w: number; h: number; tilt: number; cut?: boolean; tuck?: boolean };

/** "call me" goes to the call page, which holds the booking calendar; BOOKING is the Cal.com page itself, the
 *  fallback inside it. */
export const HIRE = "/call";
export const BOOKING = BOOK;
export const SECOND = { label: "email me", href: `mailto:${EMAIL}?subject=Hiring%20you`, address: EMAIL };

/** Newest first, a timeline. `logo` is the place's own mark (Ignaru's is the orange app icon from the ignaru repo);
 *  `tile` is a plain initial on its colour where the repo has no real mark (public/logos/sof.png is only a red square).
 *  `when` only where the site sources it: lib/profile.ts has "Since 2026" for Okara and MenuFit, both since left;
 *  nothing dates SOF Agency or Basket Ent, so they carry no date. */
/** His own two companies, linked at the top of the column. */
export const TIMELINE: { name: string; role: string; logo: string; href: string }[] = [
  { name: "Ignaru", role: "founder, design tool", logo: "/logos/ignaru-mark.png", href: "https://ignaru.com" },
  { name: "Ignura", role: "founder, ad and brand studio", logo: "/logos/ignura.png", href: "https://ignura.com" },
];

/** Places he has worked before, drifting past in the column's marquee. Roles as he gave them; Bevel's in his words. */
export const PAST: { name: string; role: string; logo: string; href: string }[] = [
  { name: "Okara", role: "product intern", logo: "/logos/okara.png", href: "https://okara.ai" },
  { name: "MenuFit", role: "product designer", logo: "/logos/menufit-bag-128.webp", href: "https://menufit.com" },
  { name: "Bevel", role: "founder, scaled to six-figure ARR", logo: "/logos/bevel.png", href: "https://bevel.team" },
];

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
