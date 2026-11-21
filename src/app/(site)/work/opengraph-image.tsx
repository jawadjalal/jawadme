import { card } from "@/app/_og/card";
import { ADS } from "@/content/ads";
export { contentType, size } from "@/app/_og/card";

export const alt = "Work by Jawad Jalal: a strip of his ads over the page title";

export default function Image() {
  const strip = ADS.filter((a) => a.w * 5 === a.h * 4).slice(0, 5).map((a) => a.src);
  return card({ title: "Work", line: `${ADS.length} ads, and the brands, sites and games around them.`, bar: ["Jawad Jalal", "Ads, brands, sites, Roblox", "London"], strip });
}
