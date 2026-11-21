import { card } from "@/app/_og/card";

export { contentType, size } from "@/app/_og/card";
export const alt = "Book a 15 minute call with Jawad Jalal";

export default function Image() {
  return card({ title: "Book a call", line: "A 15 minute video call about brands, ads, 3D and Roblox games.", bar: ["Jawad Jalal","15 min","Video","Free"] });
}
