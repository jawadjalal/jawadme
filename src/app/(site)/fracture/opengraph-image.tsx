import { card } from "@/app/_og/card";

export { contentType, size } from "@/app/_og/card";
export const alt = "fracture, a co-op action mining crawler for roblox: a miner swings at the armoured mole king in a torchlit hall";

export default function Image() {
  return card({ title: "fracture", line: "a co-op action mining crawler for roblox. designed and built by jawad jalal.", bar: ["jawad jalal", "roblox game", "london"], side: { src: "/work/fracture/mole-king.webp", w: 560 } });
}
