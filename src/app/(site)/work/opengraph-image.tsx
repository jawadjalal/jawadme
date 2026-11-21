import { card } from "@/app/_og/card";
import { ADS } from "@/content/ads";
export { contentType, size } from "@/app/_og/card";

export const alt = "work by jawad jalal: a strip of his ads over the page title";

export default function Image() {
  const strip = ADS.filter((a) => a.w * 5 === a.h * 4).slice(0, 5).map((a) => a.src);
  return card({ title: "work", line: `${ADS.length} ads first. then the websites and the 3d.`, bar: ["jawad jalal", "ads, websites, 3d", "london"], strip });
}
