// The ad curation: one list feeds the home hero and gallery, /ads, the ad case studies and the viewer (/w/<id>).
// Swap the list and everything follows. Source: JAWA-10's curation (every ad Jawad rated 6 or higher), in its order.
// The nine brand concepts of 22 Nov (cisco to whoop) lead; they are spec work like the rest. Every piece is independent work, not commissioned, except thauma, which is captioned only as its brand and hangs only in
// the home hall (HALL below), never on /work. Order: the seven
// from his 21 Nov ads drop (blind-ranked, handoffs/JAWA-11/new-ads), then the four from his 21 Nov X post (Vercel, Midjourney, Mistral,
// Lovable; x.com/jawadjalal/status/2124118088819834999), then the type-pass set (handoffs/JAWA-11/new-ads, his picks in
// type.html), then the JAWA-10 curation, then the rest of his 6s from ~/night/real/ad-replay/replay-manifest.json
// (21 Nov: deduped against earlier passes and the set above; one with a spec footnote in the art left out).

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

const best = (id: string, campaign: string, alt: string): Ad => ({
  id, campaign, alt, src: `/ads/best/${id}.webp`, sm: `/ads/best/${id}-480.webp`, w: 960, h: 1200, spec: true,
});
const more = (id: string, campaign: string, alt: string, w = 1080, h = 1350): Ad => ({
  id, campaign, alt, src: `/ads/more/${id}.webp`, sm: `/ads/more/${id}-440.webp`, w, h, spec: true,
});
const type = (id: string, campaign: string, alt: string): Ad => ({
  id, campaign, alt, src: `/ads/type/${id}.webp`, sm: `/ads/type/${id}-480.webp`, w: 960, h: 1200, spec: true,
});
const fresh = (id: string, campaign: string, alt: string, spec = true): Ad => ({
  id, campaign, alt, src: `/ads/new/${id}.webp`, sm: `/ads/new/${id}-480.webp`, w: 960, h: 1200, spec,
});
const palantir = (id: string, alt: string, w: number, h: number): Ad => ({
  id, campaign: "palantir", alt, src: `/ads/palantir/${id}.webp`, sm: `/ads/palantir/${id}-sm.webp`, w, h, spec: true,
});

const CuratedWhop = (id: string, alt: string, w = 1600, h = 2000): Ad => ({
  id, campaign: "whop", alt, src: `/ads/canvas/${id}.webp`, sm: `/ads/canvas/${id}-480.webp`, w, h, spec: true,
});
const Supermemory: Ad = {
  id: "supermemory-remember", campaign: "supermemory", alt: "Your AI should remember this. supermemory concept, a paper note holding the important things.",
  src: "/ads/canvas/supermemory-remember.webp", sm: "/ads/canvas/supermemory-remember-480.webp", w: 1080, h: 1350, spec: true,
};

const LIST = [
  Supermemory,
  CuratedWhop("whop-nile", "paid in 185 countries. whop concept, a rich blue river landscape crossed by small orange boats.", 3000, 1000),
  CuratedWhop("whop-earth", "forget the fortune 500. whop concept, a surreal orange world in a blue sky."),
  fresh("asana", "asana", "plan. automate. execute. asana concept, a three-towered castle from above, shaped like the asana mark."),
  fresh("tesla", "tesla", "sustainable abundance. tesla concept, a t-shaped pier in green water, seen from above."),
  fresh("twilio", "twilio", "ask your developer. twilio concept, four trees in a roundabout forming the twilio mark."),
  fresh("on", "on", "run on clouds. on concept, a running shoe mid-stride in blue duotone."),
  fresh("spacex", "spacex", "making life multiplanetary. spacex concept, a rocket climbing on a plume of smoke."),
  type("midjourney-a", "midjourney", "we are all midjourney. midjourney ad, a sailboat backlit by a low sun on still water."),
  type("vercel-c", "vercel", "keep pushing forward. vercel ad, a triangular skylight repeating into itself like the vercel mark."),
  type("mistral-a", "mistral", "frontier open models you own. mistral ad, a tower of coloured window panels with the mistral mark in its facade."),
  type("lovable-a", "lovable", "build something lovable. lovable ad, a heart-shaped island seen from above."),
  type("linear-a", "linear", "purpose-built for planning. linear ad, centre-pivot fields seen from above, one striped like the linear mark."),
  type("cursor-a", "cursor", "the new way to build software. cursor ad, lit office windows drawing the cursor mark on a night tower."),
  type("perplexity-a", "perplexity", "where knowledge begins. perplexity ad, the perplexity mark in a stained-glass library skylight."),
  type("elevenlabs-a", "elevenlabs", "create lifelike speech. elevenlabs ad, two jetties over green water forming the elevenlabs mark."),
  best("shown-seen", "shown media", "one job. get you seen. shown media ad, the shown mark in the pupil of an eye."),
  best("shown-told", "shown media", "shown, not told. shown media ad, the word shown lit on a night billboard."),
  more("fishaudio-mic", "fish audio", "ai that doesn't sound like ai. fish audio ad, a chrome studio microphone trailing a pink ribbon of sound."),
  more("whop-column", "whop", "one place to run your entire business. whop ad, an orange advertising column in an old town square."),
  best("whop-fly", "whop", "your agent runs the business. you fly. whop ad, a pilot's visor reflecting mountains."),
  best("whop-economy", "whop", "the new economy. whop ad, hand-painted shop-window lettering on archive photography."),
  best("outpace-corners", "outpace", "no corners cut. outpace studios ad, a running track drawn as an arch."),
  best("outpace-team", "outpace", "we work inside your team. not around it. outpace studios ad, a relay baton across a lane line."),
  best("outpace-ship", "outpace", "ship fast. look credible. outpace studios ad, the mark as a running track round a pitch."),
];

/** The home hall hangs every ad. Thauma, his roblox studio's own brand, hangs there and keeps its /w address, but is
 *  never on the /work wall, its counts or its filters. */
export const HALL: Ad[] = LIST;

export const AD_CURATED_2026_11_27 = { rubric: "taste calibration, 12 Nov", floor: 7 };
export const ADS: Ad[] = LIST.filter((a) => a.campaign !== "thauma");
export const adById = (id: string) => HALL.find((a) => a.id === id);
export const adsOf = (campaign: string) => ADS.filter((a) => a.campaign === campaign);

/** campaigns with two or more pieces get their own filter, case study and title; the rest sit under Other */
export const CAMPAIGNS = [...new Set(ADS.map((a) => a.campaign))].filter((c) => adsOf(c).length > 1);
export const campaignOf = (a: Ad) => (CAMPAIGNS.includes(a.campaign) ? a.campaign : "other");
