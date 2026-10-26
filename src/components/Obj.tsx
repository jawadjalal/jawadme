// A glossy black object from ignura.com's family, at icon size.
//
// They are rendered stills, so each carries a 2x source and nothing else:
// no tile, no ring, no tint. They sit straight on the paper the way they do on
// ignura.com. At night a hairline of light (--ico-lift) keeps a black object
// from sinking into a black page.

export type ObjName =
  | "about" | "now" | "work" | "previously" | "skills" | "elsewhere" | "contact" | "overlaps" | "ball"
  | "chart" | "chat" | "play" | "stack" | "gear" | "funnel" | "find" | "build" | "run" | "fix" | "talk";

const SRC: Record<ObjName, [string, string]> = {
  about: ["/obj/linkedin.png", "/obj/linkedin@2x.png"],
  now: ["/obj/nav-how.png", "/obj/nav-how@2x.png"],
  work: ["/obj/site.png", "/obj/site@2x.png"],
  previously: ["/obj/drop.png", "/obj/drop@2x.png"],
  skills: ["/obj/nav-fix.png", "/obj/nav-fix@2x.png"],
  elsewhere: ["/obj/map.webp", "/obj/map@2x.webp"],
  contact: ["/obj/outbound.png", "/obj/outbound@2x.png"],
  overlaps: ["/obj/ring.webp", "/obj/ring@2x.webp"],
  ball: ["/obj/ball.webp", "/obj/ball@2x.webp"],
  chart: ["/obj/tracking.png", "/obj/tracking@2x.png"],
  chat: ["/obj/content.png", "/obj/content@2x.png"],
  play: ["/obj/creators.png", "/obj/creators@2x.png"],
  stack: ["/obj/list.png", "/obj/list@2x.png"],
  gear: ["/obj/gear.webp", "/obj/gear.webp"],
  funnel: ["/obj/funnel.webp", "/obj/funnel.webp"],
  // ignura's small inline objects, drawn to sit in a line of text
  find: ["/obj/ico-find.webp", "/obj/ico-find.webp"],
  build: ["/obj/ico-build.webp", "/obj/ico-build.webp"],
  run: ["/obj/ico-run.webp", "/obj/ico-run.webp"],
  fix: ["/obj/ico-fix.webp", "/obj/ico-fix.webp"],
  talk: ["/obj/ico-talk.webp", "/obj/ico-talk.webp"],
};

export function Obj({ name, size = 28, className = "" }: { name: ObjName; size?: number; className?: string }) {
  const [one, two] = SRC[name];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={one}
      srcSet={`${one} 1x, ${two} 2x`}
      alt=""
      aria-hidden="true"
      width={size || 72}
      height={size || 72}
      decoding="async"
      className={`obj shrink-0 select-none object-contain ${className}`}
      // 0: sized by CSS in em, for an object sitting in a line of text
      style={size ? { width: size, height: size } : undefined}
    />
  );
}

/** His face, as the mark: in the bar and beside the name in the footer. A
 *  rounded square like ignura's I-in-a-box, so it reads as a logo rather than
 *  as an avatar. With no size it takes the em of the type around it. */
export function Face({ size, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={size && size <= 48 ? "/design/jawad-face-96.webp" : "/design/jawad-face-320.webp"}
      alt=""
      aria-hidden="true"
      width={size || 160}
      height={size || 160}
      decoding="async"
      className={`face ${className}`}
      style={size ? { width: size, height: size } : undefined}
    />
  );
}

/** The mark: a capital J in a black box, ignura's I-in-a-box with his letter.
 *  Drawn in type rather than as a file so it takes the theme: at night the box
 *  is the light ink and the letter the dark paper. */
export function Mark({ size, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`mark ${className}`}
      // No size: it takes the em of the type around it (the footer's wordmark).
      style={size ? { width: size, height: size, fontSize: size * 0.68 } : undefined}
    >
      J
    </span>
  );
}
