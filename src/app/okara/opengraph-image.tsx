import { ImageResponse } from "next/og";
import { IDENTITY } from "@/lib/profile";
import { CHANGES } from "./data";

// Share card for /okara. The odd one out of the family on purpose: the other
// three cards sit on cream because the rest of the site does, and this page
// does not. It borrows the walkthrough's own tokens instead, so a link pasted
// into Slack unfurls looking like the page it opens.
//
// The job is narrow. One reader is expected to forward this link, and an
// unfurl with no art reads as spam next to the ones that have it. So the card
// says what the page is and who sent it, and stops there.
//
// Fonts: the page is DM Sans and JetBrains Mono, and neither is on disk. next/og
// cannot fetch while rendering, and satori decodes ttf/otf/woff but not the woff2
// Google serves any modern user agent — see src/app/opengraph-image.tsx for why
// the one face this repo does use is vendored. The only vendored file is
// GochiHand-Regular.ttf, and passing it here would set the whole card in a
// handwriting face: satori has no system fallback, so whatever you pass becomes
// the font for every glyph, and a `fontFamily` on one child cannot escape it.
// A signature in Jawad's hand is not worth setting the headline, the numbers and
// the labels in it too, so this card takes /writing's branch of the convention
// and passes no fonts at all, leaving satori's bundled sans. If DM Sans is ever
// vendored as ttf, this is the card that wants it.
//
// Tokens are duplicated from okara.css rather than shared: next/og convention
// files own their art, and this one has to match .ok if the palette moves.

export const alt = "3 changes to the Okara dashboard — Jawad Jalal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GROUND = "#121110";
const PANEL = "#191817";
const HAIR = "#302d28";
const INK = "#f6f2e9";
const MUTED = "#8d857a";
const GOLD = "#d9b26a";

// The page's ground is a dot grid. satori has no radial-gradient, so the dots
// are drawn: 30px pitch, same as the CSS, thinned to the top band where nothing
// else sits.
const DOTS = Array.from({ length: 40 * 7 });

export default function OkaraOpengraphImage() {
  // Read from the page's own content, so the card cannot end up advertising
  // three changes the walkthrough no longer makes.
  const titles = CHANGES.slice(0, 3).map((c) => c.title);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          background: GROUND,
          padding: 48,
        }}
      >
        {DOTS.map((_, i) => (
          <div
            key={`d${i}`}
            style={{
              position: "absolute",
              display: "flex",
              left: (i % 40) * 30 + 15,
              top: Math.floor(i / 40) * 30 + 15,
              width: 2,
              height: 2,
              background: "#231f1b",
            }}
          />
        ))}

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            background: PANEL,
            border: `1px solid ${HAIR}`,
            padding: "44px 56px",
          }}
        >
          {/* eyebrow */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", width: 10, height: 10, background: GOLD, marginRight: 18 }} />
            <div style={{ display: "flex", fontSize: 25, letterSpacing: 5, color: GOLD }}>
              OKARA
            </div>
            <div style={{ display: "flex", width: 1, height: 26, background: HAIR, margin: "0 22px" }} />
            <div style={{ display: "flex", fontSize: 25, letterSpacing: 5, color: MUTED }}>
              DASHBOARD WALKTHROUGH
            </div>
          </div>

          {/* headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 32,
              fontSize: 72,
              lineHeight: 1.08,
              color: INK,
            }}
          >
            <div style={{ display: "flex" }}>3 changes to the</div>
            <div style={{ display: "flex" }}>Okara dashboard.</div>
          </div>

          <div style={{ display: "flex", fontSize: 30, color: MUTED, marginTop: 20 }}>
            With the evidence behind each.
          </div>

          {/* the three, named */}
          <div style={{ display: "flex", marginTop: 32 }}>
            {titles.map((t, i) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: `1px solid ${HAIR}`,
                  background: GROUND,
                  padding: "12px 22px",
                  marginRight: 14,
                }}
              >
                <div style={{ display: "flex", fontSize: 26, color: GOLD, marginRight: 14 }}>
                  {`0${i + 1}`}
                </div>
                <div style={{ display: "flex", fontSize: 26, color: INK }}>{t}</div>
              </div>
            ))}
          </div>

          {/* signature rail, pinned to the bottom of the panel */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginTop: "auto",
              borderTop: `1px solid ${HAIR}`,
              paddingTop: 26,
            }}
          >
            <div style={{ display: "flex", fontSize: 34, color: INK }}>
              {IDENTITY.properName}
            </div>
            <div style={{ display: "flex", fontSize: 24, letterSpacing: 3, color: MUTED }}>
              PRIVATE LINK
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
