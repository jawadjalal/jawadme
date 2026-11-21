import { card } from "@/app/_og/card";

export { contentType, size } from "@/app/_og/card";
export const alt = "Design Mastermind: Jawad Jalal, designing and building things in London";

export default function Image() {
  return card({ title: "Design Mastermind", line: "Hi! I'm Jawad Jalal. I'm 15 and in London, designing and building things.", bar: ["Jawad Jalal","Brands, ads, 3D and Roblox","London"] });
}
