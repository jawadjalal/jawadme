// The design work hung on /work beside the ads, by room. Lines and names come from his own site (the work list he
// published, its descriptions kept) and from the owners' sites: Bevel is the 3D art team he founded, so its pieces are
// credited to the team; Cosmos Models is his 3D portfolio from when he was 13. Pictures live in public/work/d.

export type DesignPiece = { id: string; src: string; sm: string; w: number; h: number; group: string; line: string; alt: string; spec: boolean };

const p = (id: string, w: number, h: number, group: string, line: string, alt: string, spec = false): DesignPiece => ({ id, src: `/work/d/${id}.webp`, sm: `/work/d/${id}-sm.webp`, w, h, group, line, alt, spec });

export const SITES: DesignPiece[] = [
  p("site-bevel", 1600, 1000, "bevel", "site for the 3d art team he founded", "the bevel.team home page: a dark hero beside a lit dungeon render, with the games the team has worked on along the foot."),
  p("site-mercy", 1600, 1000, "mercy", "perps trading that pays back liquidated margin", "the mercy home page: \"got liquidated? have mercy.\" over a green glow, a phone and floating usdc coins."),
  p("site-splittingpoint", 1400, 909, "splitting point", "landing page build", "the splitting point landing page: the logo in red over game cards and a strip of pixel art."),
  p("site-menufit", 1440, 900, "menufit", "meal screens, in light and dark", "menufit's app screens side by side: meals, protein counts and a lunch log."),
];

export const CONCEPTS: DesignPiece[] = [
  p("site-tavola", 1600, 1000, "tavola", "template for a neighbourhood trattoria", "the tavola template: the name set huge in a serif over a candlelit dining room."),
  p("site-dobig", 1600, 1000, "do big studios", "pitch site for a studio that builds, runs and buys roblox games", "the do big pitch site: \"we make games millions can't stop playing\" above a row of game tiles.", true),
  p("site-parade", 1600, 1000, "parade", "template for a video and marketing studio", "the parade template: \"we make films people stop to watch\" on cream, with client marks along the foot."),
  p("site-rocquire", 1600, 1000, "rocquire", "concept for a marketplace for whole roblox games", "the rocquire concept: \"the #1 marketplace for roblox games\" over a wall of pixel game art.", true),
  p("site-hyperspell", 1600, 1000, "hyperspell", "redesign concept for hyperspell.com", "a hyperspell redesign concept: \"a brain for your company\" over a dusk sky, with the product below.", true),
  p("site-lune", 1600, 1000, "lune", "jewellery shop template", "the lune jewellery template: \"gold for every phase\" beside a portrait wearing a fine necklace."),
  p("site-treg", 1600, 1000, "treg", "pitch site for one key to agent tools", "the treg pitch site: \"every tool, one key.\" over a pale sky, with usage tables below.", true),
  p("site-ruled", 1600, 1000, "ruled", "launch template for one product", "the ruled template: \"books, closed.\" on deep green, with a ledger of transactions."),
  p("site-fxpheno", 1600, 1000, "pheno", "portfolio for a video editor", "pheno's portfolio: \"edits that feel smooth\" in a hand-drawn script on violet, with two video frames."),
  p("site-varick", 1600, 1000, "varick", "redesign concept for varick agents", "a varick agents redesign concept: \"transform your enterprise with ai\" beside a task list.", true),
];

export const IGNARU: DesignPiece[] = [
  p("ignaru-canvas", 1600, 1000, "ignaru", "the canvas", "the ignaru canvas: a board of ad frames with layers on the left and properties on the right."),
  p("ignaru-agent", 640, 640, "ignaru", "felt agent icon", "a felt flower knotted from purple wool, the agent icon on ignaru's site, on black."),
  p("ignaru-yarn", 640, 640, "ignaru", "felt yarn", "a ball of purple felt yarn with a loose thread, from ignaru's site, on black."),
  p("ignaru-wall", 1600, 1019, "ignaru", "the wall of frames", "ignaru's wall: two rows of ad frames, a blue product shot, a 12k stat and an orange track."),
  p("ignaru-shader", 640, 640, "ignaru", "felt shader ball", "a felt sphere in red, white and blue swirls, from ignaru's site, on black."),
  p("ignaru-darkroom", 1600, 587, "ignaru", "darkroom", "ignaru's darkroom: four takes of one ad, a laptop and a blue robot, side by side."),
  p("ignaru-library", 640, 640, "ignaru", "felt library", "three felt blocks stacked in red, yellow and blue, the library icon on ignaru's site, on black."),
  p("ignaru-ship", 640, 640, "ignaru", "felt ship", "a paper plane in blue and white felt, the ship icon on ignaru's site, on black."),
];

export const COSMOS: DesignPiece[] = [
  p("blade-ball", 768, 432, "blade ball", "3d art for blade ball", "blade ball art: a hooded fighter swings a pink sword at a red ball over a grey grid."),
  p("fish-it", 768, 432, "fish it!", "3d art for fish it!", "fish it! art: a player on a pier hauls in a glowing armoured sea monster."),
  p("cosmos-spike-blades", 1600, 900, "cosmos models", "spiked blades", "two 3d blades edged with pale green spikes and wrapped grips, on black."),
  p("cosmos-fan", 1384, 809, "cosmos models", "war fan", "a red and gold 3d war fan hung with tassels, on black."),
  p("cosmos-crossed-blades", 1600, 900, "cosmos models", "crossed blades", "crossed 3d steel blades with hooked guards and two daggers, on black."),
  p("cosmos-gold-dagger", 692, 907, "cosmos models", "gold dagger", "a curved gold 3d dagger, its wireframe showing through, on black."),
  p("cosmos-pink-blades", 1477, 830, "cosmos models", "rose blades", "two pale pink 3d blades with brass hilts, on black."),
  p("cosmos-lantern", 1521, 926, "cosmos models", "lantern creature", "a hunched 3d creature carrying a glowing lantern in its belly, warm light on dark."),
  p("cosmos-tree-giant", 1600, 1021, "cosmos models", "tree giant", "a 3d giant carved from a tree trunk, reaching out with one hand."),
  p("cosmos-scythe", 1600, 900, "cosmos models", "scythe", "a blue crystalline 3d scythe held by a white figure, on black."),
];

export const BEVEL: DesignPiece[] = [
  p("bevel-cathedral", 1600, 900, "bevel", "cathedral demon scene", "a ruined cathedral in green gloom, purple lightning breaking over a demon."),
  p("bevel-throne-hall", 800, 1000, "bevel", "ruined throne hall", "a ruined throne hall, light falling through high windows onto a golden throne."),
  p("bevel-library", 1024, 622, "bevel", "a ruined library", "a ruined library in blue darkness, one figure standing before its shelves."),
  p("bevel-tree-golem", 1280, 1600, "bevel", "glowing tree golem", "a tree golem lit from inside in red and blue, standing on a dark floor."),
  p("bevel-mining-rig", 1009, 565, "bevel", "mining rig", "a mining rig recovered from a cave, rusted metal among rocks and roots."),
  p("bevel-believer", 740, 742, "bevel", "the believer", "a robed figure in a tall gold mitre, sculpted and lit against black."),
  p("bevel-rifle", 800, 495, "bevel", "rifle", "a scoped rifle on dark cloth, spent cartridges scattered around it."),
];
