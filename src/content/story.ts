// The left column of the home page: who, the hire button, where he has worked, and replies on X. Facts only, from
// components/felt/copy.ts (JOBS, BOOK), lib/profile.ts and the CV; the replies are public replies on X to his ad
// posts, verbatim. Swap this file (and content/feed.ts) to put the same layout on another site.

import { BOOK, EMAIL } from "@/components/felt/copy";

/*
  Headline options. A hook with a turn, from facts already on the site (lib/profile.ts, components/felt/copy.ts): he is
  fifteen, he founded Ignaru and Ignura, he designed MenuFit's app, which has 1.5 million users. Nothing else. The grey
  half sets up the age, the ink half turns it; stickers of his own work sit in the type.
  1. "Fifteen [face] years old." / "Designed for 1.5M MenuFit [bag] users. [ad][icon]"
  2. "Fifteen [face] years old." / "Founder of Ignaru [icon] and Ignura. [ad]"
  3. "Fifteen [face], two companies in." / "One app [bag] with 1.5M users. [ad]"
  Used: 1. The number does the turning: a small one, then a big one, and the founder lines are in the timeline below.
*/
/** One array per line of type; the lines are set as given, never rewrapped. A picture is a sticker: `cut` is a
 *  cut-out with its own outline, otherwise a square card. */
export const HEADLINE = {
  lead: [
    [{ t: "Fifteen" }, { pic: "/design/jawad-cut.webp", alt: "Jawad's memoji", cut: true, w: 640, h: 723, tilt: -7 }],
    [{ t: "years old." }],
  ],
  main: [
    [{ t: "Designed for 1.5M" }],
    [
      { t: "MenuFit" },
      { pic: "/work/2026-11/sticker-menufit.webp", alt: "the MenuFit app mark, a paper bag", cut: true, w: 140, h: 159, tilt: 8 },
      { t: "users." },
      { pic: "/work/2026-11/inline-icon.webp", alt: "his billboard app icon", w: 128, h: 128, tilt: 7 },
    ],
  ],
} as const;

export type Bit = { t: string } | { pic: string; alt: string; w: number; h: number; tilt: number; cut?: boolean; tuck?: boolean };

export const HIRE = BOOK;
export const SECOND = { label: "or email me", href: `mailto:${EMAIL}?subject=Hiring%20you` };

/** Newest first, with each place's own mark from public/logos. `when` is what the CV says ("2026 to now" is now);
 *  SOF Agency and Basket Ent are from before. `role` is one short phrase. */
/** `logo` is the place's own mark; `tile` is a plain initial on its colour, for a place with no mark in the repo
 *  (public/logos/sof.png is only a red square). */
export const TIMELINE: { when: string; name: string; role: string; logo?: string; tile?: string; href: string; now?: boolean }[] = [
  { when: "Now", name: "Ignaru", role: "founder, design tool", logo: "/logos/ignaru.png", href: "https://ignaru.com", now: true },
  { when: "Now", name: "Ignura", role: "founder, design studio", logo: "/logos/ignura.png", href: "https://ignura.com", now: true },
  { when: "2026", name: "Okara", role: "product intern", logo: "/logos/okara.png", href: "https://okara.ai" },
  { when: "2026", name: "MenuFit", role: "product designer", logo: "/logos/menufit-bag-128.webp", href: "https://menufit.com" },
  { when: "Before", name: "SOF Agency", role: "PR, partnerships", tile: "#e01b1b", href: "https://sof.agency" },
  { when: "Before", name: "Basket Ent", role: "acquisitions, liveops", logo: "/logos/basketent.png", href: "https://basketent.com" },
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
