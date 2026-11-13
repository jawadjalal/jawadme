// One line of the story, set big across the wall of work like a caption box in a comic: hand-lettered display type,
// tilted a little, printed slightly off register (a red and a cyan pass under the black, overprinted), on a block of
// halftone dots that thin out towards its edges, with a stroke drawn under it by hand. Used rarely, so each one lands
// against the white page. `tone` picks the ink of the dots; `cta` puts the squircle hire button beside the line.

import { useId } from "react";
import { SquircleButton } from "./SquircleButton";

export type Tone = "red" | "cyan" | "yellow";

const UNDERLINES = [
  "M4 14 C 60 6, 140 4, 220 9 S 380 16, 436 7",
  "M6 9 C 80 15, 170 15, 250 8 S 390 3, 434 12",
  "M3 12 C 90 4, 160 13, 240 10 S 360 5, 437 10",
];

/** Dot radius per band, left to right across the block: small, growing to full in the middle, then smaller again. A printed halftone, not a fade. */
const BANDS = [1.1, 1.8, 2.7, 2.7, 2.1, 1.3];

export function StoryLine({ text, cta, href, tone = "red", index = 0 }: { text: string; cta?: boolean; href: string; tone?: Tone; index?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <div className="story" data-tone={tone} data-side={index % 2 ? "right" : "left"}>
      <p className="story-line">
        <svg className="story-dots" aria-hidden="true">
          <defs>
            {BANDS.map((r, i) => (
              <pattern key={i} id={`${id}d${i}`} width="9" height="9" patternUnits="userSpaceOnUse">
                <circle cx="4.5" cy="4.5" r={r} />
              </pattern>
            ))}
          </defs>
          {BANDS.map((_, i) => (
            <rect key={i} x={`${(i * 100) / BANDS.length}%`} y="0" width={`${100 / BANDS.length + 0.5}%`} height="100%" fill={`url(#${id}d${i})`} />
          ))}
        </svg>
        <span className="story-text" data-text={text}>
          {text}
        </span>
        <svg className="story-stroke" viewBox="0 0 440 20" preserveAspectRatio="none" aria-hidden="true">
          <path d={UNDERLINES[index % UNDERLINES.length]} />
        </svg>
      </p>
      {cta ? <SquircleButton href={href} className="story-cta" /> : null}
    </div>
  );
}
