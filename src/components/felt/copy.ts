// The words and art for the felt home (src/app/page.tsx). Four slots, each one thing Jawad does, each opening a
// drawer. Art: public/felt (transparent squares, 320 and 640 wide). Stills: public/work.

export const BOOK = "https://cal.com/jawad-jalal-hesqbk/intro-call-with-ignura";
export const EMAIL = "hijawadjalal@gmail.com";

export const LINE = "I'm a design engineer. I build sites for startups, and I'm building Ignaru.";

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

export type Site = { key: string; name: string; host: string; group: "Products" | "Pitch sites" | "Concepts" | "Templates"; line: string };

/** Every live site, newest work first within each group. Stills: public/sites/<key>.webp and <key>-tall.webp (three
 *  screens, scrolled through on hover), shot at 1440 on a box on 5 Nov 2026. */
export const SITES: Site[] = [
  { key: "ignaru", name: "Ignaru", host: "ignaru.com", group: "Products", line: "A design canvas that opens your repo. Circle what's wrong and your agent fixes it." },
  { key: "wayari", name: "Wayari", host: "wayari.com", group: "Products", line: "Coding agents that go from a prompt to a reviewed pull request." },
  { key: "rocquire", name: "Rocquire", host: "rocquire-concept.vercel.app", group: "Pitch sites", line: "A verified marketplace for buying whole Roblox games." },
  { key: "treg", name: "treg", host: "treg-pitch.vercel.app", group: "Pitch sites", line: "OpenRouter for agent tools: one key, 4,100+ endpoints, paid per call." },
  { key: "dobig", name: "Do Big Studios", host: "dobig-pitch.vercel.app", group: "Pitch sites", line: "They build, run and buy Roblox games millions play." },
  { key: "ropilot", name: "Ropilot", host: "ropilot-site.vercel.app", group: "Pitch sites", line: "Make Roblox games by asking: it writes, models and playtests." },
  { key: "mercy", name: "Mercy", host: "mercy-perps.vercel.app", group: "Pitch sites", line: "Perps that pay back 25 to 100% of liquidated margin. A prototype." },
  { key: "fxpheno", name: "Pheno", host: "fxpheno-portfolio.vercel.app", group: "Pitch sites", line: "A portfolio for a video editor and motion designer." },
  { key: "founders", name: "Founders School", host: "founders-school-concept.vercel.app", group: "Concepts", line: "A redesign concept for founders.school. Not affiliated." },
  { key: "paradev", name: "Paradev", host: "paradev-concept.vercel.app", group: "Concepts", line: "A design concept for paradev.com. Not affiliated." },
  { key: "hyperspell", name: "Hyperspell", host: "hyperspell-concept.vercel.app", group: "Concepts", line: "A redesign concept for hyperspell.com. Not affiliated." },
  { key: "varick", name: "Varick Agents", host: "varick-concept.vercel.app", group: "Concepts", line: "A redesign concept for Varick Agents. Not affiliated." },
  { key: "ruled", name: "Ruled", host: "ruled-template.vercel.app", group: "Templates", line: "An AI bookkeeper for small businesses." },
  { key: "tavola", name: "Tavola", host: "tavola-template.vercel.app", group: "Templates", line: "A trattoria and wine bar on a London street." },
  { key: "parade", name: "Parade", host: "parade-template.vercel.app", group: "Templates", line: "A studio for launch films and short-form video." },
];

export const SOCIALS = [
  { label: "X", href: "https://x.com/jawadmakes" },
  { label: "GitHub", href: "https://github.com/jawadjalal" },
  { label: "Email", href: `mailto:${EMAIL}` },
];
