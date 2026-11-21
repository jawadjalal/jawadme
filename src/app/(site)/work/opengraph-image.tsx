import { card } from "@/app/_og/card";
import { ADS } from "@/content/ads";
export { contentType, size } from "@/app/_og/card";

export const alt = "Work by Jawad Jalal: a strip of his ads over the page title";

export default function Image() {
  const strip = ADS.filter((a) => a.w * 5 === a.h * 4).slice(0, 5).map((a) => a.src);
  return card({ title: "Work", line: `${ADS.length} ads first. Then the websites and the 3D.`, bar: ["Jawad Jalal", "Ads, websites, 3D", "London"], strip });
}
