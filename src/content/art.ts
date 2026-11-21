// The site's painted Greek-myth art. Each piece lives at public/art/<key>.webp: hero (1536x1024 or larger, a 21:9
// band on desktop and 4:5 on phones), break (a 3:1 band) and sign (1024x1536 with transparency, the post only).
// Until a file is there its place on the page closes up, so adding the art is dropping one file in.

export const ART = {
  hero: { alt: "A young Greek maker at work in an underworld forge, painted in ink, ember and bronze", pos: "60% 50%" },
  break: { alt: "An underworld river glowing ember between black cliffs and broken columns", pos: "50% 50%" },
  sign: { alt: "", pos: "50% 100%" },
} as const;

export type ArtKey = keyof typeof ART;
