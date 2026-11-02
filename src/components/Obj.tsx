// A small ink drawing, at icon size, straight on the paper with no tile,
// ring or tint. At night the ink is inverted to chalk.

export type ObjName =
  | "about" | "now" | "work" | "projects" | "previously" | "skills" | "elsewhere" | "contact" | "overlaps" | "ball"
  | "chart" | "chat" | "play" | "stack" | "gear" | "funnel" | "find" | "build" | "run" | "fix" | "talk";

// Each name is an ink drawing from the same sheet, in the fineliner style of
// his hand-drawn memoji. One file serves both densities: they are drawn at
// 256px and never shown above 128.
const SRC: Record<ObjName, [string, string]> = {
  about: ["/ink/wave.webp", "/ink/wave.webp"],
  now: ["/ink/sun.webp", "/ink/sun.webp"],
  work: ["/ink/pen.webp", "/ink/pen.webp"],
  projects: ["/ink/folder.webp", "/ink/folder.webp"],
  previously: ["/ink/archive.webp", "/ink/archive.webp"],
  skills: ["/ink/toolbox.webp", "/ink/toolbox.webp"],
  elsewhere: ["/ink/map.webp", "/ink/map.webp"],
  contact: ["/ink/plane.webp", "/ink/plane.webp"],
  overlaps: ["/ink/venn.webp", "/ink/venn.webp"],
  ball: ["/ink/sun.webp", "/ink/sun.webp"],
  chart: ["/ink/chart.webp", "/ink/chart.webp"],
  chat: ["/ink/chat.webp", "/ink/chat.webp"],
  play: ["/ink/video.webp", "/ink/video.webp"],
  stack: ["/ink/stack.webp", "/ink/stack.webp"],
  gear: ["/ink/gear.webp", "/ink/gear.webp"],
  funnel: ["/ink/chart.webp", "/ink/chart.webp"],
  find: ["/ink/map.webp", "/ink/map.webp"],
  build: ["/ink/gear.webp", "/ink/gear.webp"],
  run: ["/ink/plane.webp", "/ink/plane.webp"],
  fix: ["/ink/toolbox.webp", "/ink/toolbox.webp"],
  talk: ["/ink/chat.webp", "/ink/chat.webp"],
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
      src={size && size <= 48 ? "/design/jawad-ink-simple.webp" : "/design/jawad-ink-320.webp"}
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
