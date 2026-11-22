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

const LIST = [
  fresh("cisco", "cisco", "the bridge to possible. cisco concept, the golden gate bridge rising through fog over san francisco."),
  fresh("subaru", "subaru", "named after these stars. subaru concept, the pleiades star cluster glowing blue."),
  fresh("asana", "asana", "plan. automate. execute. asana concept, a three-towered castle from above, shaped like the asana mark."),
  fresh("tesla", "tesla", "sustainable abundance. tesla concept, a t-shaped pier in green water, seen from above."),
  fresh("twilio", "twilio", "ask your developer. twilio concept, four trees in a roundabout forming the twilio mark."),
  fresh("strava", "strava", "train, track, share. strava concept, a cyclist's hand on the bars in orange duotone."),
  fresh("on", "on", "run on clouds. on concept, a running shoe mid-stride in blue duotone."),
  fresh("spacex", "spacex", "making life multiplanetary. spacex concept, a rocket climbing on a plume of smoke."),
  fresh("whoop", "whoop", "unlock human performance. whoop concept, a swimmer seen from above in blue duotone."),
  fresh("thauma-moon", "thauma", "thauma: roblox studio brand. a moon cut into a staircase on black.", false),
  fresh("nike-runner", "nike", "nike concept. a motion-blurred runner in duotone with the swoosh crossing the frame."),
  fresh("sam-embrace", "sam", "sam concept. a motion-smeared embrace in grain."),
  fresh("thauma-construction", "thauma", "thauma: roblox studio brand. the moon mark drawn with construction guides on black.", false),
  fresh("linear-street", "linear", "linear concept. a city street zooming away in blue duotone."),
  fresh("sam-running", "sam", "sam concept. two people running, in grain."),
  fresh("thauma-mark", "thauma", "thauma: roblox studio brand. the black stair-moon on a gold field.", false),
  type("midjourney-a", "midjourney", "we are all midjourney. midjourney ad, a sailboat backlit by a low sun on still water."),
  type("vercel-c", "vercel", "keep pushing forward. vercel ad, a triangular skylight repeating into itself like the vercel mark."),
  type("mistral-a", "mistral", "frontier open models you own. mistral ad, a tower of coloured window panels with the mistral mark in its facade."),
  type("lovable-a", "lovable", "build something lovable. lovable ad, a heart-shaped island seen from above."),
  type("linear-a", "linear", "purpose-built for planning. linear ad, centre-pivot fields seen from above, one striped like the linear mark."),
  type("vercel-a", "vercel", "from zero to millions. vercel ad, a mountain's triangular shadow cast on haze at sunrise."),
  type("cursor-a", "cursor", "the new way to build software. cursor ad, lit office windows drawing the cursor mark on a night tower."),
  type("perplexity-a", "perplexity", "where knowledge begins. perplexity ad, the perplexity mark in a stained-glass library skylight."),
  type("elevenlabs-a", "elevenlabs", "create lifelike speech. elevenlabs ad, two jetties over green water forming the elevenlabs mark."),
  type("vercel-b", "vercel", "agentic infrastructure. vercel ad, a triangular courtyard sky seen from below."),
  type("elevenlabs-b", "elevenlabs", "17,500+ voices in 90+ languages. elevenlabs ad, two columns of lit windows on a dark tower."),
  best("shown-told", "shown media", "shown, not told. shown media ad, the word shown lit on a night billboard."),
  best("shown-seen", "shown media", "one job. get you seen. shown media ad, the shown mark in the pupil of an eye."),
  more("hyperspell", "hyperspell", "a brain for your company. hyperspell ad."),
  more("fishaudio-mic", "fish audio", "ai that doesn't sound like ai. fish audio ad, a chrome studio microphone trailing a pink ribbon of sound."),
  more("outpace-scale", "outpace", "ship fast and scale even faster. outpace studios ad, running-track lanes fanning out from the mark."),
  more("whop-build", "whop", "build businesses, run ads, get paid. whop ad, an orange sign on a brick townhouse, in halftone."),
  more("whop-column", "whop", "one place to run your entire business. whop ad, an orange advertising column in an old town square."),
  more("click-routed", "click", "routed intelligently. filled instantly. click ad, blue-lit cars streaking through a night intersection."),
  more("blue-phone", "blue", "your next phone, shipping now. the blue phone ad, a blue banner hung down a manhattan tower."),
  more("hyperspell-why", "hyperspell", "give your agents the why. hyperspell ad, pixel steps climbing through sunset colours."),
  more("launchpoint-fake", "launchpoint", "fake views don't get paid. launchpoint ad, a violet sign on the front of an old hotel."),
  more("dreamstate-favourite", "dreamstate", "chatgpt has a favourite. make it you. dreamstate ad, a blue shop sign over an empty storefront."),
  more("hyperspell-knowledge", "hyperspell", "knowledge leaves when the employee does. hyperspell ad, closed lift doors in a dark lobby."),
  more("outpace-prelaunch", "outpace", "pre-launch or post-raise. outpace studios ad, a running track curving round a green pitch."),
  more("outpace-inhouse", "outpace", "think in-house, but faster. outpace studios ad, a starting block on a red track."),
  palantir("palantir-carrier", "palantir ad: a carrier deck crew forming the palantir mark.", 1080, 1350),
  palantir("palantir-wake", "palantir ad: a ship's wake drawing a ring on the sea.", 1458, 1080),
  more("offense", "offense", "give your agent a swarm. offense ad."),
  best("outpace-corners", "outpace", "no corners cut. outpace studios ad, a running track drawn as an arch."),
  best("shown-scale", "shown media", "get your brand shown at scale. shown media ad, the mark in neon on a night billboard."),
  best("whop-income", "whop", "bet on yourself. whop ad, an orange billboard on a street."),
  more("whop-tower", "whop", "the new economy. whop ad, a tall orange banner down a black tower."),
  more("whop-blimp", "whop", "the fastest path to your next dollar. whop ad, an orange blimp over a crowd, in halftone.", 1600, 900),
  { ...best("outpace-momentum", "outpace", "here's what momentum looks like. outpace studios ad, lanes curving into an arch."), h: 1707 },
  more("outpace-marathon", "outpace", "marathon. outpace studios ad."),
  more("outpace-ideation", "outpace", "from ideation to hand-off. outpace studios ad."),
  best("outpace-team", "outpace", "we work inside your team. not around it. outpace studios ad, a relay baton across a lane line."),
  best("shown-liftoff", "shown media", "liftoff is the easy part. shown media ad, a rocket launch watched by a crowd."),
  best("whop-economy", "whop", "the new economy. whop ad, hand-painted shop-window lettering on archive photography."),
  best("whop-fly", "whop", "your agent runs the business. you fly. whop ad, a pilot's visor reflecting mountains."),
  best("whop-list", "whop", "free to list. 22m+ people a month. whop ad, a garage-sale sign nailed to a tree."),
  best("outpace-ship", "outpace", "ship fast. look credible. outpace studios ad, the mark as a running track round a pitch."),
  best("outpace-headed", "outpace", "tell us where you're headed. outpace studios ad, a red track through a green park."),
  best("outpace-fluff", "outpace", "no fluff. outpace studios ad."),
  best("outpace-raised", "outpace", "our clients raised $200m+. outpace studios ad."),
  best("dreamstate-found", "dreamstate", "found one. dreamstate ad."),
  best("cursor-review", "cursor", "ready for review. cursor ad."),
  more("click-land", "click", "land instantly. click ad."),
  more("click-market", "click", "every market. every screen. click ad."),
  more("simular-walk", "simular", "give it a task, then walk away. simular ad, a zen garden with one acid-green mark."),
  more("simular-click", "simular", "if you can click it, sai can. simular ad."),
  more("serveros", "serveros", "stop babysitting your servers. serveros ad."),
  more("launchpoint", "launchpoint", "copied videos don't get paid. launchpoint ad."),
];

/** The home hall hangs every ad. Thauma, his roblox studio's own brand, hangs there and keeps its /w address, but is
 *  never on the /work wall, its counts or its filters. */
export const HALL: Ad[] = LIST;
export const ADS: Ad[] = LIST.filter((a) => a.campaign !== "thauma");
export const adById = (id: string) => HALL.find((a) => a.id === id);
export const adsOf = (campaign: string) => ADS.filter((a) => a.campaign === campaign);

/** campaigns with two or more pieces get their own filter, case study and title; the rest sit under Other */
export const CAMPAIGNS = [...new Set(ADS.map((a) => a.campaign))].filter((c) => adsOf(c).length > 1);
export const campaignOf = (a: Ad) => (CAMPAIGNS.includes(a.campaign) ? a.campaign : "other");
