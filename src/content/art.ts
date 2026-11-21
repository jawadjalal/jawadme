// The site's painted Greek-myth art. Each piece lives at public/art/<key>.webp; until a file is there its slot shows a
// marked stand-in at the same size and crop, so adding the art is dropping one file in.

export const ART = {
  hero: {
    name: "Hero",
    alt: "A young Greek maker at work in an underworld forge, painted in ink, ember and bronze",
    pos: "60% 50%",
    spec: "public/art/hero.webp · 1536×1024 or larger · a 21:9 band on desktop, 4:5 on phones · subject in the middle band",
  },
  break: {
    name: "Section break",
    alt: "An underworld river glowing ember between black cliffs and broken columns",
    pos: "50% 50%",
    spec: "public/art/break.webp · 1536×1024 or larger · a 3:1 band · interest in the middle third",
  },
  sign: {
    name: "Signpost",
    alt: "",
    pos: "50% 100%",
    spec: "public/art/sign.webp · 1024×1536 with transparency · the painted post only, no boards",
  },
} as const;

export type ArtKey = keyof typeof ART;
