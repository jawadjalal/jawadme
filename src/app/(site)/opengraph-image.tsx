import { card } from "@/app/_og/card";
import { ADS } from "@/content/ads";
export { contentType, size } from "@/app/_og/card";

export const alt = "Jawad Jalal. Ads, brands, sites, and 3D in London.";

export default function Image() {
  return card({
    title: "Jawad Jalal",
    line: "Designing and building ads, brands, sites, and 3D in London.",
    bar: ["ADS · BRANDS · SITES · 3D", "LONDON, UK", "JAWADJALAL.COM"],
    side: { src: ADS[0].src, w: 460 },
    face: true,
  });
}
