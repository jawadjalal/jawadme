// The design work hung on /work beside the ads, by room. Lines and names come from his own site (the work list he
// published, its descriptions kept) and from the owners' sites: Bevel is the 3D art team he founded, so its pieces are
// credited to the team; Cosmos Models is his 3D portfolio from when he was 13. Pictures live in public/work/d.

export type DesignPiece = { id: string; src: string; sm: string; w: number; h: number; group: string; line: string; alt: string; spec: boolean };

const p = (id: string, w: number, h: number, group: string, line: string, alt: string, spec = false): DesignPiece => ({ id, src: `/work/d/${id}.webp`, sm: `/work/d/${id}-sm.webp`, w, h, group, line, alt, spec });

export const SITES: DesignPiece[] = [
  p("site-bevel", 1600, 1000, "Bevel", "Site for the 3D art team he founded", "The bevel.team home page: a dark hero beside a lit dungeon render, with the games the team has worked on along the foot."),
  p("site-mercy", 1600, 1000, "Mercy", "Perps trading that pays back liquidated margin", "The Mercy home page: \"Got liquidated? Have mercy.\" over a green glow, a phone and floating USDC coins."),
  p("site-splittingpoint", 1400, 909, "Splitting Point", "Landing page build", "The Splitting Point landing page: the logo in red over game cards and a strip of pixel art."),
  p("site-menufit", 1440, 900, "MenuFit", "Meal screens, in light and dark", "MenuFit's app screens side by side: meals, protein counts and a lunch log."),
];

export const CONCEPTS: DesignPiece[] = [
  p("site-tavola", 1600, 1000, "Tavola", "Template for a neighbourhood trattoria", "The Tavola template: the name set huge in a serif over a candlelit dining room."),
  p("site-dobig", 1600, 1000, "Do Big Studios", "Pitch site for a studio that builds, runs and buys Roblox games", "The Do Big pitch site: \"We make games millions can't stop playing\" above a row of game tiles.", true),
  p("site-parade", 1600, 1000, "Parade", "Template for a video and marketing studio", "The Parade template: \"We make films people stop to watch\" on cream, with client marks along the foot."),
  p("site-rocquire", 1600, 1000, "Rocquire", "Concept for a marketplace for whole Roblox games", "The Rocquire concept: \"The #1 marketplace for Roblox games\" over a wall of pixel game art.", true),
  p("site-hyperspell", 1600, 1000, "Hyperspell", "Redesign concept for hyperspell.com", "A Hyperspell redesign concept: \"A brain for your company\" over a dusk sky, with the product below.", true),
  p("site-lune", 1600, 1000, "Lune", "Jewellery shop template", "The Lune jewellery template: \"Gold for every phase\" beside a portrait wearing a fine necklace."),
  p("site-treg", 1600, 1000, "treg", "Pitch site for one key to agent tools", "The treg pitch site: \"Every tool, one key.\" over a pale sky, with usage tables below.", true),
  p("site-ruled", 1600, 1000, "Ruled", "Launch template for one product", "The Ruled template: \"Books, closed.\" on deep green, with a ledger of transactions."),
  p("site-fxpheno", 1600, 1000, "Pheno", "Portfolio for a video editor", "Pheno's portfolio: \"Edits that feel smooth\" in a hand-drawn script on violet, with two video frames."),
  p("site-varick", 1600, 1000, "Varick", "Redesign concept for Varick Agents", "A Varick Agents redesign concept: \"Transform your enterprise with AI\" beside a task list.", true),
];

export const IGNARU: DesignPiece[] = [
  p("ignaru-canvas", 1600, 1000, "Ignaru", "The canvas", "The Ignaru canvas: a board of ad frames with layers on the left and properties on the right."),
  p("ignaru-agent", 640, 640, "Ignaru", "Felt agent icon", "A felt flower knotted from purple wool, the agent icon on Ignaru's site, on black."),
  p("ignaru-yarn", 640, 640, "Ignaru", "Felt yarn", "A ball of purple felt yarn with a loose thread, from Ignaru's site, on black."),
  p("ignaru-wall", 1600, 1019, "Ignaru", "The wall of frames", "Ignaru's wall: two rows of ad frames, a blue product shot, a 12K stat and an orange track."),
  p("ignaru-shader", 640, 640, "Ignaru", "Felt shader ball", "A felt sphere in red, white and blue swirls, from Ignaru's site, on black."),
  p("ignaru-darkroom", 1600, 587, "Ignaru", "Darkroom", "Ignaru's darkroom: four takes of one ad, a laptop and a blue robot, side by side."),
  p("ignaru-library", 640, 640, "Ignaru", "Felt library", "Three felt blocks stacked in red, yellow and blue, the library icon on Ignaru's site, on black."),
  p("ignaru-ship", 640, 640, "Ignaru", "Felt ship", "A paper plane in blue and white felt, the ship icon on Ignaru's site, on black."),
];

export const COSMOS: DesignPiece[] = [
  p("blade-ball", 768, 432, "Blade Ball", "3D art for Blade Ball", "Blade Ball art: a hooded fighter swings a pink sword at a red ball over a grey grid."),
  p("fish-it", 768, 432, "Fish It!", "3D art for Fish It!", "Fish It! art: a player on a pier hauls in a glowing armoured sea monster."),
  p("cosmos-spike-blades", 1600, 900, "Cosmos Models", "Spiked blades", "Two 3D blades edged with pale green spikes and wrapped grips, on black."),
  p("cosmos-fan", 1384, 809, "Cosmos Models", "War fan", "A red and gold 3D war fan hung with tassels, on black."),
  p("cosmos-crossed-blades", 1600, 900, "Cosmos Models", "Crossed blades", "Crossed 3D steel blades with hooked guards and two daggers, on black."),
  p("cosmos-gold-dagger", 692, 907, "Cosmos Models", "Gold dagger", "A curved gold 3D dagger, its wireframe showing through, on black."),
  p("cosmos-pink-blades", 1477, 830, "Cosmos Models", "Rose blades", "Two pale pink 3D blades with brass hilts, on black."),
  p("cosmos-lantern", 1521, 926, "Cosmos Models", "Lantern creature", "A hunched 3D creature carrying a glowing lantern in its belly, warm light on dark."),
  p("cosmos-tree-giant", 1600, 1021, "Cosmos Models", "Tree giant", "A 3D giant carved from a tree trunk, reaching out with one hand."),
  p("cosmos-scythe", 1600, 900, "Cosmos Models", "Scythe", "A blue crystalline 3D scythe held by a white figure, on black."),
];

export const BEVEL: DesignPiece[] = [
  p("bevel-cathedral", 1600, 900, "Bevel", "Cathedral demon scene", "A ruined cathedral in green gloom, purple lightning breaking over a demon."),
  p("bevel-throne-hall", 800, 1000, "Bevel", "Ruined throne hall", "A ruined throne hall, light falling through high windows onto a golden throne."),
  p("bevel-library", 1024, 622, "Bevel", "A ruined library", "A ruined library in blue darkness, one figure standing before its shelves."),
  p("bevel-tree-golem", 1280, 1600, "Bevel", "Glowing tree golem", "A tree golem lit from inside in red and blue, standing on a dark floor."),
  p("bevel-mining-rig", 1009, 565, "Bevel", "Mining rig", "A mining rig recovered from a cave, rusted metal among rocks and roots."),
  p("bevel-believer", 740, 742, "Bevel", "The believer", "A robed figure in a tall gold mitre, sculpted and lit against black."),
  p("bevel-rifle", 800, 495, "Bevel", "Rifle", "A scoped rifle on dark cloth, spent cartridges scattered around it."),
];
