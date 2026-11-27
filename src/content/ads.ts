// /work carries only Jawad's recorded choices. His 15 Nov rescore put the older concepts at 6.5 or below, so none of those qualifies at 7.
// These eight are the later exceptions: the four with his picks in JAWA-11/new-ads/type.html (21 Nov), and the four from his
// 21 Nov X post (status 2124118088819834999). Those are explicit choices, not numeric scores attributed to Jawad.
// Unscored alternatives, including the Whop variants and the Supermemory study, stay in the generator/render drive for his review rather than on /work.

export type Ad = {
  /** the /w/<id> permalink */
  id: string;
  campaign: string;
  /** headline, brand, and what the picture is */
  alt: string;
  src: string;
  /** a small copy for the rail and the grid */
  sm: string;
  w: number;
  h: number;
  spec: boolean;
};

const type = (id: string, campaign: string, alt: string): Ad => ({
  id, campaign, alt, src: `/ads/type/${id}.webp`, sm: `/ads/type/${id}-480.webp`, w: 960, h: 1200, spec: true,
});

const LIST = [
  type("midjourney-a", "midjourney", "we are all midjourney. midjourney ad, a sailboat backlit by a low sun on still water."),
  type("vercel-c", "vercel", "keep pushing forward. vercel ad, a triangular skylight repeating into itself like the vercel mark."),
  type("mistral-a", "mistral", "frontier open models you own. mistral ad, a tower of coloured window panels with the mistral mark in its facade."),
  type("lovable-a", "lovable", "build something lovable. lovable ad, a heart-shaped island seen from above."),
  type("linear-a", "linear", "purpose-built for planning. linear ad, centre-pivot fields seen from above, one striped like the linear mark."),
  type("cursor-a", "cursor", "the new way to build software. cursor ad, lit office windows drawing the cursor mark on a night tower."),
  type("perplexity-a", "perplexity", "where knowledge begins. perplexity ad, the perplexity mark in a stained-glass library skylight."),
  type("elevenlabs-a", "elevenlabs", "create lifelike speech. elevenlabs ad, two jetties over green water forming the elevenlabs mark."),
];

export const HALL: Ad[] = LIST;
export const ADS: Ad[] = LIST.filter((a) => a.campaign !== "thauma");
export const adById = (id: string) => HALL.find((a) => a.id === id);
export const adsOf = (campaign: string) => ADS.filter((a) => a.campaign === campaign);

/** campaigns with two or more pieces get their own filter, case study and title; the rest sit under Other */
export const CAMPAIGNS = [...new Set(ADS.map((a) => a.campaign))].filter((c) => adsOf(c).length > 1);
export const campaignOf = (a: Ad) => (CAMPAIGNS.includes(a.campaign) ? a.campaign : "other");
