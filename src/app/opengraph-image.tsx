import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import { IDENTITY } from "@/lib/profile";

// Share card for the homepage. White, and his name. That is the whole card.
//
// The name is set in Gochi Hand — a handwriting face, against a page that is
// otherwise Inter — so the card reads as a signature rather than a banner. No
// portrait, no colour, no chrome: the point is the opposite of a busy preview
// tile in a feed full of busy preview tiles.
//
// The font is vendored rather than fetched. next/og cannot make network
// requests while rendering, and satori decodes ttf/otf/woff but not woff2 —
// which is what Google Fonts serves to any modern user agent. The file in
// src/app/fonts is the ttf that fonts.gstatic.com serves to old ones.

export const alt = `${IDENTITY.name} — ${IDENTITY.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#fdfdfc";
const INK = "#0a0a0a";

// Read at module scope: otherwise this hits the disk on every request, and the
// file never changes between them.
const GOCHI = readFileSync(join(process.cwd(), "src/app/fonts/GochiHand-Regular.ttf"));

// Built as a flat array rather than a map returning fragments: satori walks
// the element tree itself and does not flatten React fragments the way the DOM
// renderer would, so anything nested in one can be dropped.
function words() {
  const out: ReactElement[] = [];
  IDENTITY.name.split(" ").forEach((word, i) => {
    // 64 lands ~34px of visible space between the glyphs once their overhangs
    // are accounted for — about a word space at this size. The face's own is 12.
    if (i > 0) out.push(<div key={`gap${i}`} style={{ display: "flex", width: 64 }} />);
    out.push(
      <div key={word} style={{ display: "flex" }}>
        {word}
      </div>,
    );
  });
  return out;
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: PAPER,
          color: INK,
        }}
      >
        {/* Gochi Hand sits high in its em box, so the optical centre is above
            the geometric one — hence the nudge down.

            The words are separated by an empty box of a fixed width. The
            face's own word space is tight enough that the name reads as one
            word, and satori honours neither `gap` nor `margin` here — a real
            element with a width and no shrink is the one thing it cannot drop. */}
        <div
          style={{
            display: "flex",
            fontFamily: "Gochi Hand",
            fontSize: 148,
            paddingTop: 18,
          }}
        >
          {words()}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Gochi Hand", data: GOCHI, weight: 400, style: "normal" }],
    },
  );
}
