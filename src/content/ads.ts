// The ad curation: one list feeds the home rail, /ads, the ad case studies and the viewer (/w/<id>).
// Swap the list and everything follows. Source: JAWA-10's curation (every ad Jawad rated 6 or higher), in its order.
// Every piece is spec work: made unasked, not commissioned.

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
  /** on the home rail */
  rail: boolean;
};

const best = (id: string, campaign: string, alt: string): Omit<Ad, "rail"> => ({
  id, campaign, alt, src: `/ads/best/${id}.webp`, sm: `/ads/best/${id}-480.webp`, w: 960, h: 1200, spec: true,
});
const more = (id: string, campaign: string, alt: string, w = 1080, h = 1350): Omit<Ad, "rail"> => ({
  id, campaign, alt, src: `/ads/more/${id}.webp`, sm: `/ads/more/${id}-440.webp`, w, h, spec: true,
});
const palantir = (id: string, alt: string, w: number, h: number): Omit<Ad, "rail"> => ({
  id, campaign: "Palantir", alt, src: `/ads/palantir/${id}.webp`, sm: `/ads/palantir/${id}-sm.webp`, w, h, spec: true,
});

const LIST = [
  best("shown-told", "Shown Media", "Shown, not told. Shown Media spec ad, the word shown lit on a night billboard."),
  best("shown-seen", "Shown Media", "One job. Get you seen. Shown Media spec ad, the Shown mark in the pupil of an eye."),
  more("hyperspell", "Hyperspell", "A brain for your company. Hyperspell spec ad."),
  palantir("palantir-carrier", "Palantir spec ad: a carrier deck crew forming the Palantir mark.", 1080, 1350),
  palantir("palantir-wake", "Palantir spec ad: a ship's wake drawing a ring on the sea.", 1458, 1080),
  more("offense", "Offense", "Give your agent a swarm. Offense spec ad."),
  best("outpace-corners", "Outpace", "No corners cut. Outpace Studios spec ad, a running track drawn as an arch."),
  best("shown-scale", "Shown Media", "Get your brand shown at scale. Shown Media spec ad, the mark in neon on a night billboard."),
  best("whop-income", "Whop", "Bet on yourself. Whop spec ad, an orange billboard on a street."),
  more("whop-tower", "Whop", "The new economy. Whop spec ad, a tall orange banner down a black tower."),
  more("whop-blimp", "Whop", "The fastest path to your next dollar. Whop spec ad, an orange blimp over a crowd, in halftone.", 1600, 900),
  { ...best("outpace-momentum", "Outpace", "Here's what momentum looks like. Outpace Studios spec ad, lanes curving into an arch."), h: 1707 },
  more("outpace-marathon", "Outpace", "Marathon. Outpace Studios spec ad."),
  more("outpace-ideation", "Outpace", "From ideation to hand-off. Outpace Studios spec ad."),
  best("outpace-team", "Outpace", "We work inside your team. Not around it. Outpace Studios spec ad, a relay baton across a lane line."),
  best("shown-liftoff", "Shown Media", "Liftoff is the easy part. Shown Media spec ad, a rocket launch watched by a crowd."),
  best("whop-economy", "Whop", "The new economy. Whop spec ad, hand-painted shop-window lettering on archive photography."),
  best("whop-fly", "Whop", "Your agent runs the business. You fly. Whop spec ad, a pilot's visor reflecting mountains."),
  best("whop-list", "Whop", "Free to list. 22M+ people a month. Whop spec ad, a garage-sale sign nailed to a tree."),
  best("outpace-ship", "Outpace", "Ship fast. Look credible. Outpace Studios spec ad, the mark as a running track round a pitch."),
  best("outpace-headed", "Outpace", "Tell us where you're headed. Outpace Studios spec ad, a red track through a green park."),
  best("outpace-fluff", "Outpace", "No fluff. Outpace Studios spec ad."),
  best("outpace-raised", "Outpace", "Our clients raised $200M+. Outpace Studios spec ad."),
  best("dreamstate-found", "Dreamstate", "Found one. Dreamstate spec ad."),
  best("cursor-review", "Cursor", "Ready for review. Cursor spec ad."),
  more("click-land", "Click", "Land instantly. Click spec ad."),
  more("click-market", "Click", "Every market. Every screen. Click spec ad."),
  more("simular-walk", "Simular", "Give it a task, then walk away. Simular spec ad, a zen garden with one acid-green mark."),
  more("simular-click", "Simular", "If you can click it, Sai can. Simular spec ad."),
  more("serveros", "ServerOS", "Stop babysitting your servers. ServerOS spec ad."),
  more("launchpoint", "Launchpoint", "Copied videos don't get paid. Launchpoint spec ad."),
];

/** the first 12 form the home rail, except the 4:3 Palantir wake, whose ring a 4:5 crop would cut */
const RAIL_SKIP = new Set(["palantir-wake"]);
export const ADS: Ad[] = LIST.map((a) => ({ ...a, rail: false }));
ADS.filter((a) => !RAIL_SKIP.has(a.id)).slice(0, 12).forEach((a) => (a.rail = true));

export const RAIL = ADS.filter((a) => a.rail);
export const adById = (id: string) => ADS.find((a) => a.id === id);
export const adsOf = (campaign: string) => ADS.filter((a) => a.campaign === campaign);

/** campaigns with two or more pieces get their own filter, case study and title; the rest sit under Other */
export const CAMPAIGNS = [...new Set(ADS.map((a) => a.campaign))].filter((c) => adsOf(c).length > 1);
export const campaignOf = (a: Ad) => (CAMPAIGNS.includes(a.campaign) ? a.campaign : "Other");

/** a frame is 4:5 unless the piece is far off it; then it sits whole on a backdrop instead of being cropped */
export const fitsFrame = (a: { w: number; h: number }) => Math.abs(a.w / a.h - 0.8) < 0.04;
