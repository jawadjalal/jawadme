// The ad curation: one list feeds the home hero and gallery, /ads, the ad case studies and the viewer (/w/<id>).
// Swap the list and everything follows. Source: JAWA-10's curation (every ad Jawad rated 6 or higher), in its order.
// Every piece is independent work, not commissioned. Order: the four from his 21 Nov X post (Vercel, Midjourney, Mistral,
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
const palantir = (id: string, alt: string, w: number, h: number): Ad => ({
  id, campaign: "Palantir", alt, src: `/ads/palantir/${id}.webp`, sm: `/ads/palantir/${id}-sm.webp`, w, h, spec: true,
});

const LIST = [
  type("midjourney-a", "Midjourney", "We are all midjourney. Midjourney ad, a sailboat backlit by a low sun on still water."),
  type("vercel-c", "Vercel", "Keep pushing forward. Vercel ad, a triangular skylight repeating into itself like the Vercel mark."),
  type("mistral-a", "Mistral", "Frontier open models you own. Mistral ad, a tower of coloured window panels with the Mistral mark in its facade."),
  type("lovable-a", "Lovable", "Build something Lovable. Lovable ad, a heart-shaped island seen from above."),
  type("linear-a", "Linear", "Purpose-built for planning. Linear ad, centre-pivot fields seen from above, one striped like the Linear mark."),
  type("vercel-a", "Vercel", "From zero to millions. Vercel ad, a mountain's triangular shadow cast on haze at sunrise."),
  type("cursor-a", "Cursor", "The new way to build software. Cursor ad, lit office windows drawing the Cursor mark on a night tower."),
  type("perplexity-a", "Perplexity", "Where knowledge begins. Perplexity ad, the Perplexity mark in a stained-glass library skylight."),
  type("elevenlabs-a", "ElevenLabs", "Create lifelike speech. ElevenLabs ad, two jetties over green water forming the ElevenLabs mark."),
  type("vercel-b", "Vercel", "Agentic Infrastructure. Vercel ad, a triangular courtyard sky seen from below."),
  type("elevenlabs-b", "ElevenLabs", "17,500+ voices in 90+ languages. ElevenLabs ad, two columns of lit windows on a dark tower."),
  best("shown-told", "Shown Media", "Shown, not told. Shown Media ad, the word shown lit on a night billboard."),
  best("shown-seen", "Shown Media", "One job. Get you seen. Shown Media ad, the Shown mark in the pupil of an eye."),
  more("hyperspell", "Hyperspell", "A brain for your company. Hyperspell ad."),
  more("fishaudio-mic", "Fish Audio", "AI that doesn't sound like AI. Fish Audio ad, a chrome studio microphone trailing a pink ribbon of sound."),
  more("outpace-scale", "Outpace", "Ship fast and scale even faster. Outpace Studios ad, running-track lanes fanning out from the mark."),
  more("whop-build", "Whop", "Build businesses, run ads, get paid. Whop ad, an orange sign on a brick townhouse, in halftone."),
  more("whop-column", "Whop", "One place to run your entire business. Whop ad, an orange advertising column in an old town square."),
  more("click-routed", "Click", "Routed intelligently. Filled instantly. Click ad, blue-lit cars streaking through a night intersection."),
  more("blue-phone", "Blue", "Your next phone, shipping now. The Blue Phone ad, a blue banner hung down a Manhattan tower."),
  more("hyperspell-why", "Hyperspell", "Give your agents the why. Hyperspell ad, pixel steps climbing through sunset colours."),
  more("launchpoint-fake", "Launchpoint", "Fake views don't get paid. Launchpoint ad, a violet sign on the front of an old hotel."),
  more("dreamstate-favourite", "Dreamstate", "ChatGPT has a favourite. Make it you. Dreamstate ad, a blue shop sign over an empty storefront."),
  more("hyperspell-knowledge", "Hyperspell", "Knowledge leaves when the employee does. Hyperspell ad, closed lift doors in a dark lobby."),
  more("outpace-prelaunch", "Outpace", "Pre-launch or post-raise. Outpace Studios ad, a running track curving round a green pitch."),
  more("outpace-inhouse", "Outpace", "Think in-house, but faster. Outpace Studios ad, a starting block on a red track."),
  palantir("palantir-carrier", "Palantir ad: a carrier deck crew forming the Palantir mark.", 1080, 1350),
  palantir("palantir-wake", "Palantir ad: a ship's wake drawing a ring on the sea.", 1458, 1080),
  more("offense", "Offense", "Give your agent a swarm. Offense ad."),
  best("outpace-corners", "Outpace", "No corners cut. Outpace Studios ad, a running track drawn as an arch."),
  best("shown-scale", "Shown Media", "Get your brand shown at scale. Shown Media ad, the mark in neon on a night billboard."),
  best("whop-income", "Whop", "Bet on yourself. Whop ad, an orange billboard on a street."),
  more("whop-tower", "Whop", "The new economy. Whop ad, a tall orange banner down a black tower."),
  more("whop-blimp", "Whop", "The fastest path to your next dollar. Whop ad, an orange blimp over a crowd, in halftone.", 1600, 900),
  { ...best("outpace-momentum", "Outpace", "Here's what momentum looks like. Outpace Studios ad, lanes curving into an arch."), h: 1707 },
  more("outpace-marathon", "Outpace", "Marathon. Outpace Studios ad."),
  more("outpace-ideation", "Outpace", "From ideation to hand-off. Outpace Studios ad."),
  best("outpace-team", "Outpace", "We work inside your team. Not around it. Outpace Studios ad, a relay baton across a lane line."),
  best("shown-liftoff", "Shown Media", "Liftoff is the easy part. Shown Media ad, a rocket launch watched by a crowd."),
  best("whop-economy", "Whop", "The new economy. Whop ad, hand-painted shop-window lettering on archive photography."),
  best("whop-fly", "Whop", "Your agent runs the business. You fly. Whop ad, a pilot's visor reflecting mountains."),
  best("whop-list", "Whop", "Free to list. 22M+ people a month. Whop ad, a garage-sale sign nailed to a tree."),
  best("outpace-ship", "Outpace", "Ship fast. Look credible. Outpace Studios ad, the mark as a running track round a pitch."),
  best("outpace-headed", "Outpace", "Tell us where you're headed. Outpace Studios ad, a red track through a green park."),
  best("outpace-fluff", "Outpace", "No fluff. Outpace Studios ad."),
  best("outpace-raised", "Outpace", "Our clients raised $200M+. Outpace Studios ad."),
  best("dreamstate-found", "Dreamstate", "Found one. Dreamstate ad."),
  best("cursor-review", "Cursor", "Ready for review. Cursor ad."),
  more("click-land", "Click", "Land instantly. Click ad."),
  more("click-market", "Click", "Every market. Every screen. Click ad."),
  more("simular-walk", "Simular", "Give it a task, then walk away. Simular ad, a zen garden with one acid-green mark."),
  more("simular-click", "Simular", "If you can click it, Sai can. Simular ad."),
  more("serveros", "ServerOS", "Stop babysitting your servers. ServerOS ad."),
  more("launchpoint", "Launchpoint", "Copied videos don't get paid. Launchpoint ad."),
];

export const ADS: Ad[] = LIST;
export const adById = (id: string) => ADS.find((a) => a.id === id);
export const adsOf = (campaign: string) => ADS.filter((a) => a.campaign === campaign);

/** campaigns with two or more pieces get their own filter, case study and title; the rest sit under Other */
export const CAMPAIGNS = [...new Set(ADS.map((a) => a.campaign))].filter((c) => adsOf(c).length > 1);
export const campaignOf = (a: Ad) => (CAMPAIGNS.includes(a.campaign) ? a.campaign : "Other");
