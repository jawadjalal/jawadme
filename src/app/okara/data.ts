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
    afterTitle: "Lead with one real draft",
    measure: "Count the free users who open a draft. Today that number is 0, by design.",
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
      { n: "1", x: 300, y: 168, label: "The draft at the length it will publish." },
      { n: "2", x: 150, y: 600, label: "Each row names the agent and what it is waiting on." },
      { n: "3", x: 480, y: 645, label: "Row height follows what is in the row." },
      { n: "4", x: 140, y: 460, label: "One locked band, one Upgrade, and the count adds up." },
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
    measure: "Second-week returns. A daily habit forms in the first fortnight or it never forms.",
    href: "/okara/morning",
    crop: { src: "/okara/shots/dashboard.png", s: 0.28, sx: 0, sy: 0, w: 2880, h: 1620 },
    mock: { nw: 1520, nh: 1066 },
    beforeAnns: [
      { n: "1", ix: 1023, iy: 56, side: "right", label: "10 dated terminal entries come back. One line of them is shown." },
      { n: "2", ix: 1000, iy: 1500, side: "right", label: "54 numbers on one screen, and not one of them dated." },
      { n: "3", ix: 300, iy: 620, side: "left", label: "Nothing here says what happened while you were asleep." },
    ],
    afterAnns: [
      { n: "1", x: 700, y: 142, label: "The date sits in the greeting." },
      { n: "2", x: 960, y: 208, label: "One number, in a sentence." },
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
    measure: "How often someone clicks a thing they cannot afford. Each one is a person deciding you are broken.",
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
      { n: "3", x: 900, y: 790, label: "3 chat runs, dated. Chat took every credit." },
    ],
  },
];

export const INTRO = {
  kicker: "For Fatima at Okara",
  title: "Three changes to the dashboard.",
  body:
    "You asked me to take a stab at it. I signed in on the free tier with one agent on skribbl.dev and used it for a week. Every number on this page came off that account.",
  lines: [
    "The free tier sells with placeholder text while the finished drafts are already in the response.",
    "Nothing on the dashboard carries a date, so a returning user cannot tell what changed.",
    "My credit balance went from 14 to 7 with nothing saying when, or on what.",
  ],
};

export const EVIDENCE_LINE =
  "I pointed AI agents at the product and had them capture everything. 65 screens at desktop and phone widths, every modal and empty state, the network traffic on a cold load, and your design tokens pulled straight out of the running app. That is why the screens above are set in your fonts and your colours. It also let me read what your API returns beside what your interface draws, and all 3 changes live in that gap.";

export const UNTOUCHED = [
  { title: "Pricing", why: "All 3 tiers list the same 12 features, Free included. Someone has to decide what Lite withholds before anyone can design it." },
  { title: "Onboarding", why: "I only ever saw it as a returning user, so I have no evidence about it." },
  { title: "The chat", why: "It answers well, and it is the one place the product explains itself." },
  { title: "Analytics", why: "The numbers are formatted wrong, not measured wrong. That is a fix, and it does not need me." },
];

export const CLOSE = {
  title: "I would build any of these in a week.",
  body:
    "Every screen above runs. Press Approve on the feed and it approves. They already use your tokens and your stack, so the first one is close to a pull request. Start with credits if it were my call. It is the plainest of the 3 and the one a paying customer feels first.",
};
