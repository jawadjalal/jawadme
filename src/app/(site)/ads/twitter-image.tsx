import { card } from "@/app/_og/card";

export { contentType, size } from "@/app/_og/card";
export const alt = "Ads by Jawad Jalal";

export default function Image() {
  return card({ title: "Ads", line: "Ads for Shown Media, Palantir, Whop, Outpace and more. Spec work.", bar: ["Jawad Jalal","Ads","jawadjalal.com"] });
}
