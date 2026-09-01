// The one icon system, carried over from ripwebsite.
//
// A single stroked-SVG component keyed by name. No emoji, no filled
// decorative blobs, no second set. Every glyph is drawn on a 16x16 grid at a
// 1.5 stroke with round caps and joins, in `currentColor`, so an icon is the
// same object whether it sits in a paragraph, on a section heading or inside
// a button. Add a path here to add an icon.
//
// The rules that keep the set reading as one system:
//
//  1. **One grid, one weight.** 16 units, 1.5 stroke, round caps. A glyph
//     that needs a heavier weight to work at 16px is drawn wrong.
//  2. **Centred, covering about 11 of the 16 units.** A glyph whose ink
//     covers 8 reads a size smaller than its neighbours; one that covers 14
//     reads bolder. Both break the row.
//  3. **No two glyphs in one view share a silhouette.**
//  4. **Decorative means decorative.** Every node is aria-hidden. Nothing
//     here is ever the sole carrier of meaning.

export type IconName =
  | "sparkle" | "code" | "game" | "check" | "send" | "gem" | "bolt"
  | "trend" | "team" | "list" | "quote" | "clock" | "target"
  | "pen" | "cube" | "block" | "globe" | "mail" | "doc" | "chev" | "play" | "rocket" | "shapes";

const PATHS: Record<IconName, React.ReactElement> = {
  // Verbatim from the ripwebsite set: these already measure correctly on this
  // grid, and redrawing them would only introduce drift between the sites.
  sparkle: <path d="M8 3.5l1.2 3.3L12.5 8l-3.3 1.2L8 12.5 6.8 9.2 3.5 8l3.3-1.2z" />,
  code: (
    <>
      <path d="M5.9 5.1 3 8l2.9 2.9" />
      <path d="M10.1 5.1 13 8l-2.9 2.9" />
      <path d="M8.9 3.7 7.1 12.3" />
    </>
  ),
  game: (
    <>
      <rect x="1.6" y="3.8" width="12.8" height="8.4" rx="2.9" />
      <path d="M4.5 6.9v2.2M3.4 8h2.2" />
      <circle cx="10.8" cy="7.3" r="0.75" />
      <circle cx="12.1" cy="9.1" r="0.75" />
    </>
  ),
  check: (
    <>
      <path d="M13.7 8a5.7 5.7 0 1 1-2.4-4.65" />
      <path d="M5.6 7.9 7.7 10 14 3.6" />
    </>
  ),
  send: <path d="M8 12.8V3.4M4.3 7.1 8 3.4l3.7 3.7" />,
  gem: (
    <>
      <path d="M4.3 3.2h7.4l2.3 3.3L8 13.1 2 6.5z" />
      <path d="M2 6.5h12" />
      <path d="M5.6 6.5 8 13.1l2.4-6.6" />
    </>
  ),
  bolt: <path d="M9.1 2.6 4.4 8.9h3.2l-.7 4.5 4.7-6.4H8.4z" />,
  trend: (
    <>
      <path d="M2.6 13.1V3.4" />
      <path d="M2.6 13.1h10.8" />
      <path d="M4.8 10.6 7.3 7.9l2 2 3.1-3.6" />
      <path d="M12.4 6.3h-2.2M12.4 6.3v2.2" />
    </>
  ),
  team: (
    <>
      <circle cx="6.2" cy="5.5" r="2.3" />
      <path d="M2.3 13.1a3.9 3.9 0 0 1 7.8 0" />
      <path d="M10.8 4a2.3 2.3 0 0 1 0 4.4" />
      <path d="M11.9 9.7a3.9 3.9 0 0 1 1.8 3.4" />
    </>
  ),
  list: (
    <>
      <path d="M2.6 4.4 4 5.8l2.4-2.6" />
      <path d="M2.6 10.4 4 11.8l2.4-2.6" />
      <path d="M8.4 4.9h5M8.4 11h5" />
    </>
  ),
  quote: (
    <>
      <path d="M6.2 4.4c-1.9 0-3.2 1.4-3.2 3.2s1.2 2.9 2.7 2.9c.3 0 .5 0 .5-.1 0 1-.7 1.8-1.7 2.1" />
      <path d="M13.4 4.4c-1.9 0-3.2 1.4-3.2 3.2s1.2 2.9 2.7 2.9c.3 0 .5 0 .5-.1 0 1-.7 1.8-1.7 2.1" />
    </>
  ),
  clock: (
    <>
      <circle cx="8" cy="8" r="5.7" />
      <path d="M8 4.8V8l2.3 1.5" />
    </>
  ),
  target: (
    <>
      <circle cx="8" cy="8" r="5.5" />
      <circle cx="8" cy="8" r="2.4" />
    </>
  ),

  // Drawn for this site, to the same rules.
  //
  // Design work. A nib: the barrel on the diagonal, the slit, and the tip
  // resting where the stroke would start.
  pen: (
    <>
      <path d="M11.4 2.6 13.4 4.6 6.1 11.9 3.2 12.8l.9-2.9z" />
      <path d="M9.9 4.1 11.9 6.1" />
    </>
  ),
  // 3D art. An isometric box: three visible faces sharing one centre vertex,
  // which is the only way a cube reads as a cube at 16px.
  cube: (
    <>
      <path d="M8 2.4 13.4 5.2v5.6L8 13.6 2.6 10.8V5.2z" />
      <path d="M2.6 5.2 8 8l5.4-2.8" />
      <path d="M8 8v5.6" />
    </>
  ),
  // Product. Stacked planes, seen edge on: what a roadmap looks like when it
  // is layers rather than a list.
  block: (
    <>
      <path d="M8 2.4 13.6 5.3 8 8.2 2.4 5.3z" />
      <path d="M2.4 8.6 8 11.5l5.6-2.9" />
      <path d="M2.4 11.3 8 14.2l5.6-2.9" />
    </>
  ),
  globe: (
    <>
      <circle cx="8" cy="8" r="5.7" />
      <path d="M2.3 8h11.4" />
      <path d="M8 2.3a9 9 0 0 1 0 11.4a9 9 0 0 1 0-11.4" />
    </>
  ),
  mail: (
    <>
      <rect x="2" y="3.6" width="12" height="8.8" rx="1.7" />
      <path d="m2.6 5.2 4.6 3.2a1.4 1.4 0 0 0 1.6 0l4.6-3.2" />
    </>
  ),
  // The disclosure arrow on the Elsewhere fold. Rotates 90deg when open.
  chev: <path d="M6.2 3.4 10.8 8l-4.6 4.6" />,
  play: (
    <>
      <circle cx="8" cy="8" r="5.7" />
      <path d="M6.6 5.6 10.6 8l-4 2.4z" />
    </>
  ),
  // Ahead of itself. A nose cone with two fins and the exhaust under it,
  // which is the one shape that says "about to launch" without a rocket's
  // full body at 16px.
  rocket: (
    <>
      <path d="M8 1.9c2.1 1.7 3.2 4 3.2 6.6l-1.3 2.6H6.1L4.8 8.5C4.8 5.9 5.9 3.6 8 1.9z" />
      <circle cx="8" cy="6.6" r="1.3" />
      <path d="M4.9 9.4 3.2 11l.5 2.3 2.2-.9" />
      <path d="M11.1 9.4 12.8 11l-.5 2.3-2.2-.9" />
    </>
  ),
  // Logo design. A circle, a triangle and a square, which is the shortest
  // way to say "marks" without drawing a specific one. Overlapped rather
  // than lined up: three shapes in a row reads as a toolbar, three that sit
  // over each other reads as something being composed.
  shapes: (
    <>
      <circle cx="5.9" cy="6.1" r="3.4" />
      <rect x="7.1" y="7.3" width="6.4" height="6.4" rx="1.1" />
      <path d="M10.9 2.3 13.7 6.7H8.1z" />
    </>
  ),
  doc: (
    <>
      <path d="M9 2.4H4.6a1.4 1.4 0 0 0-1.4 1.4v8.4a1.4 1.4 0 0 0 1.4 1.4h6.8a1.4 1.4 0 0 0 1.4-1.4V5.8z" />
      <path d="M9 2.4v3.4h3.8" />
      <path d="M5.8 9.2h4.4M5.8 11.2h3" />
    </>
  ),
};

/** Whether a `:token:` names one of these. */
export function isIconName(name: string): name is IconName {
  return Object.prototype.hasOwnProperty.call(PATHS, name);
}

export function Icon({
  name,
  size = 15,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
