import { card } from "@/app/_og/card";
import { SITE } from "@/content/site";

export { contentType, size } from "@/app/_og/card";
export const alt = "About Jawad Jalal, a 15-year-old designer and founder in London";

export default function Image() {
  return card({ title: "About Jawad", line: "15, in London, designing and building brands, ads, sites and Roblox games.", bar: ["Jawad Jalal", "Designer and founder", "London"], side: { src: SITE.portrait.src, w: 500 }, face: true });
}
