import { card } from "@/app/_og/card";
import { SITE } from "@/content/site";

export { contentType, size } from "@/app/_og/card";
export const alt = "about jawad jalal, a 15-year-old designer and founder in london";

export default function Image() {
  return card({ title: "about jawad", line: "15, in london, designing and building brands, ads, sites and roblox games.", bar: ["jawad jalal", "designer and founder", "london"], side: { src: SITE.portrait.src, w: 500 }, face: true });
}
