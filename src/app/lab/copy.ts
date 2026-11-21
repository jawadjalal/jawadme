import { ADS } from "@/content/ads";

export const HEAD = "Design Mastermind";
export const SUB = "Hi! I'm Jawad Jalal. I'm 15 and in London, designing and building things.";
export const NAV = [
  { label: "Work", href: "/work" },
  { label: "Ads", href: "/ads" },
  { label: "3D", href: "/work?f=3d" },
  { label: "Roblox", href: "/derelictdepths" },
];
export const CAL = "/cal?src=lab";
export const SHOW = ADS.slice(0, 9).map((a) => ({ id: a.id, src: a.src, w: a.w, h: a.h, alt: a.alt, brand: a.campaign }));
