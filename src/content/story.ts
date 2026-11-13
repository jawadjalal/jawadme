// The left column of the home page: who, the hire button, where he has worked, and replies on X. Facts only, from
// components/felt/copy.ts (JOBS, BOOK), lib/profile.ts and the CV; the replies are public replies on X to his ad
// posts, verbatim. Swap this file (and content/feed.ts) to put the same layout on another site.

import { BOOK, EMAIL } from "@/components/felt/copy";

/*
  Headline options (two tones: the grey line sets it up, the ink line says what he does; tiny pictures sit in the type):
  1. "I'm Jawad [face], fifteen, in London." / "I design ads [ad], brands and app icons [icon] for startups."
  2. "Fifteen [face] and selling my work since thirteen." / "Ads [ad] and brands [icon] for startups."
  3. "Too young [face] to sign the contract." / "Old enough to design your launch [ad]."  (needs a parent for contracts:
     true for a 15 year old in England, but it is not on the site, so it is left out)
  4. "I'm Jawad [face], fifteen, in London." / "Ads [ad] and brands [icon] for startups."
  Used: 4, option 1 cut to two lines a side so it sits like the reference: who, then what.
*/
/** One array per line of type; the lines are set as given, never rewrapped. */
export const HEADLINE = {
  lead: [
    [{ t: "I'm Jawad," }, { pic: "/work/2026-11/inline-face.webp", alt: "Jawad" }],
    [{ t: "fifteen, in London." }],
  ],
  main: [
    [{ t: "Ads" }, { pic: "/work/2026-11/inline-ad.webp", alt: "a crop of his Shown Media ad: an eye" }, { t: "and brands" }, { pic: "/work/2026-11/inline-icon.webp", alt: "his billboard app icon" }],
    [{ t: "for startups." }],
  ],
} as const;

export type Bit = { t: string } | { pic: string; alt: string };

export const HIRE = BOOK;
export const SECOND = { label: "or email me", href: `mailto:${EMAIL}?subject=Hiring%20you` };

/** Newest first. `when` is what the CV says ("2026 to now" is now); SOF Agency and Basket Ent are from before. */
export const TIMELINE: { when: string; name: string; line: string; href: string; now?: boolean }[] = [
  { when: "Now", name: "Ignaru", line: "Founder. The design tool I'm building.", href: "https://ignaru.com", now: true },
  { when: "Now", name: "Ignura", line: "Founder. A design studio.", href: "https://ignura.com", now: true },
  { when: "2026", name: "Okara", line: "Product development intern.", href: "https://okara.ai" },
  { when: "2026", name: "MenuFit", line: "Product designer. 1.5 million users.", href: "https://menufit.com" },
  { when: "Before", name: "SOF Agency", line: "PR and partnerships for game studios.", href: "https://sof.agency" },
  { when: "Before", name: "Basket Ent", line: "Acquisitions, then liveops.", href: "https://basketent.com" },
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

/** Places he has worked, with their own marks (public/logos), for the foot of the column. */
export const MARKS: { name: string; logo: string }[] = [
  { name: "MenuFit", logo: "/logos/menufit-bag-128.webp" },
  { name: "Okara", logo: "/logos/okara.png" },
  { name: "Basket Ent", logo: "/logos/basketent.png" },
];

export const CLOSING = "Still scrolling? Let's make yours.";
