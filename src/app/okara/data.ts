// Content for /okara. Every number here comes from a signed-in free-tier account
// on skribbl.dev, captured 17 August 2026. Nothing is illustrative.

export type Ann = { n: string; label: string };
export type BeforeAnn = Ann & { ix: number; iy: number; side: "left" | "right" };
export type AfterAnn = Ann & { x: number; y: number };

export type Change = {
  kind: "feed" | "note" | "credits";
  num: string;
  title: string;
  problem: string;
  shotNote: string;
  afterTitle: string;
  measure: string;
  href: string;
  crop: { src: string; s: number; sx: number; sy: number; w: number; h: number };
  mock: { nw: number; nh: number };
  beforeAnns: BeforeAnn[];
  afterAnns: AfterAnn[];
};

export const CHANGES: Change[] = [
  {
    kind: "feed",
    num: "Change 01",
    title: "Agents feed",
    problem:
      "Seven of the 9 agents are locked. Of the 2 that aren’t, one shows you a post with [pain point] still in it.",
    shotNote: "Their build, 17 August",
    afterTitle: "Put one real draft at the top",
    measure: "I’d watch whether a free user ever opens a draft. Right now nobody can.",
    href: "/okara/feed",
    crop: { src: "/okara/shots/dashboard.png", s: 0.56, sx: 1380, sy: 100, w: 750, h: 1030 },
    mock: { nw: 600, nh: 845 },
    beforeAnns: [
      { n: "1", ix: 1616, iy: 407, side: "right", label: "Reddit says 2 opportunities ready. Its own logs say reddit:0." },
      { n: "2", ix: 1979, iy: 632, side: "right", label: "6 of the 8 rows in view carry the same Upgrade chip." },
      { n: "3", ix: 1708, iy: 770, side: "left", label: "Set up your brand voice, with no way to do it from here." },
      { n: "4", ix: 1560, iy: 1015, side: "left", label: "Every row the same height, whether it holds a post or nothing." },
    ],
    afterAnns: [
      { n: "1", x: 300, y: 168, label: "The draft itself, at the length it will publish at." },
      { n: "2", x: 150, y: 600, label: "Each row names the agent and what it is waiting on." },
      { n: "3", x: 480, y: 645, label: "Row height follows what is in the row." },
      { n: "4", x: 140, y: 460, label: "One locked band, one Upgrade, an honest count." },
    ],
  },
  {
    kind: "note",
    num: "Change 02",
    title: "The morning note",
    problem:
      "You come back on Monday to 54 numbers and no dates. Nothing on the screen tells you what happened over the weekend.",
    shotNote: "Their build, 17 August",
    afterTitle: "Say what happened while I was asleep",
    measure: "I’d watch how many people come back in their second week.",
    href: "/okara/morning",
    crop: { src: "/okara/shots/dashboard.png", s: 0.28, sx: 0, sy: 0, w: 2880, h: 1620 },
    mock: { nw: 1520, nh: 1066 },
    beforeAnns: [
      { n: "1", ix: 1023, iy: 56, side: "right", label: "10 dated terminal entries come back. One line of them is shown." },
      { n: "2", ix: 1000, iy: 1500, side: "right", label: "54 numbers on one screen, and not one of them dated." },
      { n: "3", ix: 300, iy: 620, side: "left", label: "Nothing here says what happened while you were asleep." },
    ],
    afterAnns: [
      { n: "1", x: 700, y: 142, label: "Dated, and the date is part of the greeting." },
      { n: "2", x: 960, y: 208, label: "One number, in a headline sentence you can read at a glance." },
      { n: "3", x: 492, y: 785, label: "Each overnight item listed, dated, with one waiting on you." },
    ],
  },
  {
    kind: "credits",
    num: "Change 03",
    title: "Credits",
    problem: "I had 14 credits on Sunday. On Monday I had 7. Nothing told me what spent them.",
    shotNote: "Their account menu, 17 August",
    afterTitle: "Put the price on the button",
    measure: "I’d watch how often someone clicks something they can’t afford.",
    href: "/okara/credits",
    crop: { src: "/okara/shots/account-credits.png", s: 0.78, sx: 2240, sy: 20, w: 640, h: 600 },
    mock: { nw: 1440, nh: 900 },
    beforeAnns: [
      { n: "1", ix: 2701, iy: 73, side: "right", label: "14 credits in the header. 7 by the next morning." },
      { n: "2", ix: 2469, iy: 221, side: "left", label: "The menu repeats the number and never says what it buys." },
      { n: "3", ix: 2605, iy: 237, side: "left", label: "Upgrade is the only price here, and it prices the plan, not the work." },
    ],
    afterAnns: [
      { n: "1", x: 1000, y: 220, label: "The balance, and that it never refills, in one line." },
      { n: "2", x: 1080, y: 470, label: "Every action priced. What you cannot afford greys out." },
      { n: "3", x: 900, y: 790, label: "3 real chat runs, dated. Chat took every credit." },
    ],
  },
];

export const INTRO = {
  kicker: "For Fatima at Okara",
  title: "Three changes to the dashboard.",
  body:
    "You asked me to take a stab at it. I signed in on the free tier with one agent on skribbl.dev, used it for a week, and looked at what the app already knows against what it actually shows. All 3 changes come out of that gap, and every number on this page is from that account.",
  lines: [
    "The free tier sells with placeholder text while the finished drafts are already in the response.",
    "Nothing on the dashboard carries a date, so a returning user cannot tell what changed.",
    "My credit balance went from 14 to 7 with nothing saying when, or on what.",
  ],
};

export const EVIDENCE_LINE =
  "I used it for a week on skribbl.dev, walked every screen, and read the network traffic on a cold load. I drove the capture with my own tooling and pulled your design tokens out of the running app, so what I drew would drop into your codebase rather than look like a rebrand. All 3 changes came out of the gap between what the response holds and what the screen shows.";

export const UNTOUCHED = [
  { title: "Pricing", why: "Their tiers list the same 12 features as each other and as Free. That is a copy problem before it is a design one." },
  { title: "Onboarding", why: "I only ever saw it as a returning user, so I have no evidence about it." },
  { title: "The chat", why: "It answers well, and it is the one place the product explains itself." },
  { title: "Analytics", why: "The numbers are formatted wrong rather than measured wrong, so it is a fix, not a redesign." },
];

export const CLOSE = {
  title: "I would build any of these properly in a week.",
  body:
    "These are working screens, not pictures of screens. They use your fonts, your tokens and your stack, so the first one is mostly a pull request. If it were my call I would start with credits. It is the plainest of the 3 and the one a paying customer feels first.",
};
