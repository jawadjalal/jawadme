import { ImageResponse } from "next/og";

// Share card for the homepage. Personal, not a studio pitch: his name leads,
// then what he actually does, then the ventures. The /design route has its own
// card (src/app/design/opengraph-image.tsx) for the studio side.
//
// The two cards are one family on purpose — same cream ground, same hairline
// grid, same ink panel with a green hard-offset shadow, same eyebrow/headline/
// chips/footer rhythm from the jawadOS visual language. The tokens below are
// duplicated in the /design card rather than shared through a helper module:
// next/og convention files are the only files that own this art, so keep the
// two in sync by hand if the palette moves.
//
// next/og limits: flexbox only, explicit `display` on every div, and no network
// fetches — the avatar is inlined as a data URI below, and type falls back to
// satori's bundled sans rather than fetching Space Grotesk.

export const alt =
  "Jawad Jalal — 3D artist, marketer and founder. skribbl.dev, bevel.team, bidframe.org, weld.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CREAM = "#fbf9f1";
const CREAM_DEEP = "#f4f1e6";
const INK = "#141311";
const ACC = "#7ac274";
const MUTED = "#5d5a51";

// Jawad's memoji head on the brand green disc — the same badge as the favicon,
// downscaled and inlined so next/og never has to reach for a file or a host.
const AVATAR = "data:image/png;base64,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";

const VERTICALS = Array.from({ length: 11 });
const HORIZONTALS = Array.from({ length: 6 });

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          background: CREAM,
          padding: 40,
        }}
      >
        {/* hairline grid — the jawadOS graph-paper ground */}
        {VERTICALS.map((_, i) => (
          <div
            key={`v${i}`}
            style={{
              position: "absolute",
              display: "flex",
              top: 0,
              left: (i + 1) * 100,
              width: 1,
              height: 630,
              background: "rgba(20,19,17,0.055)",
            }}
          />
        ))}
        {HORIZONTALS.map((_, i) => (
          <div
            key={`h${i}`}
            style={{
              position: "absolute",
              display: "flex",
              left: 0,
              top: (i + 1) * 100,
              width: 1200,
              height: 1,
              background: "rgba(20,19,17,0.055)",
            }}
          />
        ))}

        {/* the panel */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            background: CREAM_DEEP,
            border: `4px solid ${INK}`,
            boxShadow: `16px 16px 0 ${ACC}`,
          }}
        >
          {/* eyebrow rail */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "22px 40px",
              borderBottom: `2px solid ${INK}`,
              fontSize: 21,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: INK,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  width: 16,
                  height: 16,
                  marginRight: 14,
                  background: ACC,
                  border: `2px solid ${INK}`,
                }}
              />
              Jawad Jalal
            </div>
            <div style={{ display: "flex", color: MUTED }}>
              London, England
            </div>
          </div>

          {/* body */}
          <div
            style={{
              display: "flex",
              flexGrow: 1,
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 40px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: 720,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 96,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  color: INK,
                }}
              >
                Jawad Jalal
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 22,
                  fontSize: 33,
                  lineHeight: 1.3,
                  color: MUTED,
                }}
              >
                3D artist, marketer and founder. Fifteen, operating at industry
                level since thirteen.
              </div>

              {/* the ventures */}
              <div
                style={{
                  display: "flex",
                  marginTop: 32,
                }}
              >
                {["skribbl.dev", "bevel.team", "bidframe.org", "weld."].map(
                  (name) => (
                    <div
                      key={name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginRight: 10,
                        padding: "8px 14px",
                        background: CREAM,
                        border: `3px solid ${INK}`,
                        boxShadow: `4px 4px 0 ${INK}`,
                        fontSize: 23,
                        fontWeight: 600,
                        color: INK,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          width: 12,
                          height: 12,
                          marginRight: 12,
                          background: ACC,
                          border: `2px solid ${INK}`,
                        }}
                      />
                      {name}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* the face */}
            <div
              style={{
                display: "flex",
                width: 252,
                height: 252,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 126,
                background: ACC,
                border: `4px solid ${INK}`,
                boxShadow: `10px 10px 0 ${INK}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={AVATAR}
                alt=""
                width={244}
                height={244}
                style={{ borderRadius: 122 }}
              />
            </div>
          </div>

          {/* footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 40px",
              background: INK,
              color: CREAM,
              fontSize: 24,
              letterSpacing: "0.06em",
            }}
          >
            <div style={{ display: "flex", fontWeight: 600 }}>
              jawadjalal.com
            </div>
            <div style={{ display: "flex", alignItems: "center", color: ACC }}>
              Design, build and ship.
              <div
                style={{
                  display: "flex",
                  width: 14,
                  height: 26,
                  marginLeft: 14,
                  background: ACC,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
