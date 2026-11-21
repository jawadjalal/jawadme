import { card } from "@/app/_og/card";
import { SITE } from "@/content/site";
export { contentType, size } from "@/app/_og/card";

export const alt = "Book a 15 minute call with Jawad Jalal";

export default function Image() {
  return card({ title: "Book a call", line: "15 minutes on video, free. Brands, ads, 3D and Roblox games.", bar: ["Jawad Jalal", "15 min", "Video", "Free"], side: { src: SITE.portrait.src, w: 500 }, face: true });
}
