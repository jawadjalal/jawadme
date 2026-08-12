// The homepage, as data.
//
// Four things render from this file: the page itself, the markdown at
// /index.md, the summary at /llms.txt, and the JSON-LD in the document head.
// They have to agree — a share card or a structured-data blob that contradicts
// the page is worse than not having one — so the words live here once and every
// surface reads them.

export const IDENTITY = {
  name: "jawad jalal",
  properName: "Jawad Jalal",
  role: "designer & founder",
  location: "london",
  locality: "London",
  region: "England",
  country: "GB",
  email: "hijawadjalal@gmail.com",
  cv: "/jawad-jalal-cv.pdf",
  site: "https://jawadjalal.com",
  avatar: "/design/jawad.webp",
};

/** The paragraphs, in the order they appear. Link text is split out so the page
 *  can reveal an underline mid-sentence; the other surfaces just join it up. */
export const PROSE = {
  p1: "i'm a designer and founder, mostly working on my own stuff.",
  p2: "right now it's two things:",
  p3: "i also do a bit of 3d art and logo design on the side.",
  p4a: "i'm a 3d artist at ",
  worldent: "world ent",
  p4b: " and help out on acquisitions at ",
  basket: "basket ent",
  p4c: ".",
  p5: "i like the web, and making things that feel good to use.",
};

export const WORK_LINKS = {
  worldent: "https://games.worldent.online",
  basket: "https://basketent.com",
};

export type Project = {
  key: string;
  name: string;
  href: string;
  icon: string;
  blurb: string;
  bevel: boolean;
};

const favicon = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

/** What he is actually working on. Two, so they sit side by side without the
 *  blurbs wrapping to four lines each. */
export const PROJECTS: Project[] = [
  {
    key: "skribbl",
    name: "skribbl",
    href: "https://skribbl.dev",
    icon: favicon("skribbl.dev"),
    blurb: "mac app for running a few coding agents at once",
    bevel: false,
  },
  {
    key: "bevel",
    name: "bevel",
    href: "https://bevel.team",
    icon: favicon("bevel.team"),
    blurb: "3d art team you can hire by the job",
    bevel: true,
  },
];

/** Still live, still his, just not what he is spending the week on. Putting
 *  these in the same row as the current two would say otherwise. */
export const ARCHIVE: Project[] = [
  {
    key: "bidframe",
    name: "bidframe",
    href: "https://bidframe.org",
    icon: favicon("bidframe.org"),
    blurb: "reads public tenders and flags what would sink a bid",
    bevel: false,
  },
  {
    key: "weld",
    name: "weld",
    href: "https://weldroblox.com",
    icon: favicon("weldroblox.com"),
    blurb: "marketplace for how roblox studios hire developers",
    bevel: true,
  },
];

/** The long tail, as rows rather than tiles: a list you scan, not a set of
 *  things being pitched. */
export const ELSEWHERE = [
  {
    name: "jawadj.design",
    href: "https://jawad-portfolio-kohl.vercel.app",
    note: "brand identity, ui/ux and full site builds",
  },
  { name: "acquiblox", href: "https://acquiblox.com", note: "cmo, marketing and community growth" },
  {
    name: "cosmos models",
    href: "https://cosmosmodels.lovable.app",
    note: "3d commissions in zbrush, blender and substance",
  },
  {
    name: "sof agency",
    href: "https://sof.agency",
    note: "pr, partnerships and crowdfunding for game studios",
  },
  { name: "vizzbees", href: "https://vizzbees.com", note: "saas site build" },
  { name: "kleoklaw", href: "https://kleoklaw.com", note: "mobile product site build" },
  { name: "splitting point", href: "https://splittingpoint.com", note: "landing page build" },
];

/** A third-person summary, for the machine-facing surfaces. The page speaks in
 *  the first person, which reads badly when an answer engine quotes it back as
 *  a description of someone — so the sentence they should lift is written once,
 *  here, rather than stitched together from the page's copy. */
export const SUMMARY =
  `${"Jawad Jalal"} is a designer and founder based in London, England. He works mostly on ` +
  "his own products — skribbl, a mac app for running several coding agents at once, and " +
  "bevel, a 3d art team available for hire — and does 3d art and logo design alongside them.";

/** What he does, in the plain terms an answer engine can quote back. The page
 *  says these things in prose; this is the same claim in a list. */
export const SKILLS = [
  "product design",
  "brand identity",
  "ui/ux design",
  "web development",
  "3d art",
  "logo design",
];
