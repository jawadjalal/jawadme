import { card } from "@/app/_og/card";
import { ADS } from "@/content/ads";
export { contentType, size } from "@/app/_og/card";

export const alt = "Design Mastermind. Hi! I'm Jawad Jalal. I'm 15 and in London, designing and building things.";

export default function Image() {
  return card({ title: "Design Mastermind", line: "Hi! I'm Jawad Jalal. I'm 15 and in London, designing and building things.", bar: ["Jawad Jalal", "Brands, ads, 3D and Roblox", "London"], side: { src: ADS[0].src, w: 458 }, face: true });
}
