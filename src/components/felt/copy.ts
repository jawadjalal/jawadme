// The words and art for the felt home (src/app/page.tsx). Four slots, each one thing Jawad does, each opening a
// drawer. Art: public/felt (transparent squares, 320 and 640 wide). Stills: public/work.

export const BOOK = "https://cal.com/jawad-jalal-hesqbk/intro-call-with-ignura";
export const EMAIL = "hijawadjalal@gmail.com";

export const LINE = "I design and build sites for startups, and I'm building Ignaru.";

export const feltSrc = (name: string) => ({
  src: `/felt/${name}-1x.webp`,
  srcSet: `/felt/${name}-1x.webp 320w, /felt/${name}.webp 640w`,
});

export type Slot = {
  id: "agents" | "design" | "sites" | "ship";
  label: string;
  title: string;
  color: string;
  tilt: number;
  shapes: { src: string; alt: string }[];
};

export const SLOTS: Slot[] = [
  {
    id: "agents",
    label: "Ignaru",
    title: "I build Ignaru, with agents",
    color: "#9a4dea",
    tilt: -7,
    shapes: [
      { src: "petal", alt: "A purple felt petal, the Ignaru mark" },
      { src: "claude", alt: "A purple felt asterisk" },
      { src: "openai", alt: "A purple felt knot" },
      { src: "gemini", alt: "A purple felt four-point star" },
      { src: "grok", alt: "A purple felt mark" },
    ],
  },
  {
    id: "design",
    label: "Design",
    title: "I design",
    color: "#f0454f",
    tilt: 5,
    shapes: [
      { src: "pen", alt: "A coral felt pen nib" },
      { src: "bezier", alt: "A coral felt curve with two handles" },
      { src: "palette", alt: "A coral felt palette with four colours" },
    ],
  },
  {
    id: "sites",
    label: "Sites",
    title: "Sites for startups",
    color: "#f5b400",
    tilt: -3,
    shapes: [
      { src: "browser", alt: "A yellow felt browser window" },
      { src: "phone", alt: "A yellow felt phone" },
      { src: "poster", alt: "A yellow felt poster" },
    ],
  },
  {
    id: "ship",
    label: "Build and ship",
    title: "I build and ship",
    color: "#1f7ae0",
    tilt: 8,
    shapes: [
      { src: "code", alt: "Blue felt code brackets" },
      { src: "terminal", alt: "A blue felt terminal" },
      { src: "call", alt: "A blue felt calendar" },
    ],
  },
];

export const SITES: { name: string; url?: string; still: string; line: string }[] = [
  { name: "Rocquire", still: "rocquire", line: "A marketplace for whole Roblox games. Private for now." },
  { name: "Hyperspell", url: "https://hyperspell-concept.vercel.app", still: "hyperspell", line: "A redesign concept for a company brain." },
  { name: "treg", url: "https://treg-pitch.vercel.app", still: "treg", line: "OpenRouter for agent tools: one key, paid per call." },
  { name: "Mercy", url: "https://mercy-perps.vercel.app", still: "mercy", line: "Perps that pay back liquidated margin in USDC." },
  { name: "Do Big", url: "https://dobig-pitch.vercel.app", still: "dobig", line: "They build, run and buy Roblox games." },
  { name: "Paradev", url: "https://paradev-concept.vercel.app", still: "paradev", line: "A concept site." },
  { name: "founders.school", url: "https://founders-school-concept.vercel.app", still: "founders", line: "A concept site." },
];

export const SOCIALS = [
  { label: "X", href: "https://x.com/jawadmakes" },
  { label: "GitHub", href: "https://github.com/jawadjalal" },
  { label: "Email", href: `mailto:${EMAIL}` },
];
