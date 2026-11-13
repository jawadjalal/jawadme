// The left column of the home page: who, the hire button, where he has worked, and replies on X. Facts only, from
// components/felt/copy.ts (JOBS, BOOK), lib/profile.ts and the CV; the replies are public replies on X to his ad
// posts, verbatim. Swap this file (and content/feed.ts) to put the same layout on another site.

import { BOOK, EMAIL } from "@/components/felt/copy";

/*
  Headline: his words (13 Nov, after seeing it live): two lines, "Fifteen years old." / "Design mastermind.", both in
  ink, his memoji stuck into the first line. Earlier options, kept for reference:
  1. "Fifteen years old." / "Designed for 1.5M MenuFit users."
  2. "Fifteen years old." / "Founder of Ignaru and Ignura."
*/
/** One array per line of type; the lines are set as given, never rewrapped. A picture is a sticker: `cut` is a
 *  cut-out with its own outline, otherwise a square card. */
export const HEADLINE = {
  lead: [[{ t: "Fifteen" }, { pic: "/design/jawad-cut.webp", alt: "Jawad's memoji", cut: true, w: 640, h: 723, tilt: -7 }, { t: "years old." }]],
  main: [[{ t: "Design mastermind." }]],
} as const;

export type Bit = { t: string } | { pic: string; alt: string; w: number; h: number; tilt: number; cut?: boolean; tuck?: boolean };

export const HIRE = BOOK;
export const SECOND = { label: "or email me", href: `mailto:${EMAIL}?subject=Hiring%20you` };

/** Newest first, a timeline. `logo` is the place's own mark (Ignaru's is the orange app icon from the ignaru repo);
 *  `tile` is a plain initial on its colour where the repo has no real mark (public/logos/sof.png is only a red square).
 *  `when` only where the site sources it: lib/profile.ts has "Since 2026" for Okara and MenuFit, both since left;
 *  nothing dates SOF Agency or Basket Ent, so they carry no date. */
export const TIMELINE: { name: string; role: string; when?: string; logo?: string; tile?: string; href: string; now?: boolean }[] = [
  { name: "Ignaru", role: "founder, design tool", when: "now", logo: "/logos/ignaru-mark.png", href: "https://ignaru.com", now: true },
  { name: "Ignura", role: "founder, design studio", when: "now", logo: "/logos/ignura.png", href: "https://ignura.com", now: true },
  { name: "Okara", role: "product intern", when: "2026", logo: "/logos/okara.png", href: "https://okara.ai" },
  { name: "MenuFit", role: "product designer", when: "2026", logo: "/logos/menufit-bag-128.webp", href: "https://menufit.com" },
  { name: "SOF Agency", role: "PR, partnerships", tile: "#e01b1b", href: "https://sof.agency" },
  { name: "Basket Ent", role: "acquisitions, liveops", logo: "/logos/basketent.png", href: "https://basketent.com" },
];

/** Public replies on X to his ad posts, verbatim. */
export const REPLIES: { quote: string; name: string; handle: string }[] = [
  { quote: "You have taste!", name: "Robert Scoble", handle: "Scobleizer" },
  { quote: "First one goes hard!", name: "Siddharth Borderwala", handle: "sidborderwala" },
  { quote: "these are really cool!", name: "owais", handle: "owaiskorejo7" },
  { quote: "respect the hustle at 15", name: "Tekon Burns", handle: "TekonBurns" },
  { quote: "these are great!", name: "Ray", handle: "rincidium" },
  { quote: "this is so good !", name: "void.", handle: "voidyaps" },
  { quote: "Keep cooking bro", name: "Christoph Zimnicki", handle: "zimnickico" },
  { quote: "yoo fire!", name: "jam", handle: "wespreadjam" },
  { quote: "beast", name: "Luis Vale", handle: "luis_vale" },
  { quote: "Holy cool", name: "Anurag Sharma", handle: "AnuragShar74342" },
  { quote: "gas", name: "Benjamin Tay", handle: "bennytay07" },
];

export const CLOSING = "Still scrolling? Let's make yours.";
