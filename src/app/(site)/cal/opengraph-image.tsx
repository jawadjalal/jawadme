import { card } from "@/app/_og/card";
import { SITE } from "@/content/site";
export { contentType, size } from "@/app/_og/card";

export const alt = "book a 15 minute call with jawad jalal";

export default function Image() {
  return card({ title: "book a call", line: "15 minutes on video, free. brands, ads, 3d and roblox games.", bar: ["jawad jalal", "15 min", "video", "free"], side: { src: SITE.portrait.src, w: 500 }, face: true });
}
