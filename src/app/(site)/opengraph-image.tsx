import { card } from "@/app/_og/card";
import { ADS } from "@/content/ads";
export { contentType, size } from "@/app/_og/card";

export const alt = "design mastermind. hi! i'm jawad jalal. i'm 15 and in london, designing and building things.";

export default function Image() {
  return card({ title: "design mastermind", line: "hi! i'm jawad jalal. i'm 15 and in london, designing and building things.", bar: ["jawad jalal", "brands, ads, 3d and roblox", "london"], side: { src: ADS[0].src, w: 458 }, face: true });
}
