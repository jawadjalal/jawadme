import { ImageResponse } from "next/og";

// Share card for /design — the studio side: jawadOS, what it sells, how to
// start. Sibling of the homepage card (src/app/opengraph-image.tsx), which
// stays personal.
//
// Same family as that card by design: cream ground, hairline grid, ink panel
// with a green hard-offset shadow, eyebrow rail on top, chips in the body, ink
// footer with the accent line. What differs is the content and the fact that
// this one wears the jawadOS window chrome instead of his face. Tokens are
// duplicated rather than shared — see the note on the homepage card.
//
// next/og limits: flexbox only, explicit `display` on every div, no network
// fetches (no image or font loading here at all — pure CSS shapes).

export const alt =
  "jawadOS — design by Jawad Jalal. Brand identity, UI/UX and full site builds.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CREAM = "#fbf9f1";
const CREAM_DEEP = "#f4f1e6";
const INK = "#141311";
const ACC = "#7ac274";
const MUTED = "#5d5a51";

const VERTICALS = Array.from({ length: 11 });
const HORIZONTALS = Array.from({ length: 6 });

export default function DesignOpengraphImage() {
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
        {/* hairline grid — same ground as the homepage card */}
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
          {/* window title bar — the /design card's tell */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 40px",
              background: ACC,
              borderBottom: `4px solid ${INK}`,
              color: INK,
              fontSize: 21,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  width: 16,
                  height: 16,
                  marginRight: 10,
                  background: INK,
                }}
              />
              <div
                style={{
                  display: "flex",
                  width: 16,
                  height: 16,
                  marginRight: 10,
                  background: INK,
                }}
              />
              <div
                style={{
                  display: "flex",
                  width: 16,
                  height: 16,
                  marginRight: 22,
                  background: INK,
                }}
              />
              jawadOS 1.0
            </div>
            <div style={{ display: "flex" }}>Ready</div>
          </div>

          {/* body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              justifyContent: "center",
              padding: "0 40px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              Design studio · Jawad Jalal
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 16,
                fontSize: 120,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.045em",
                color: INK,
              }}
            >
              jawadOS
            </div>
            {/* Two stacked lines, not two spans in a row: satori's inline layout
                overlaps sibling spans once they wrap. */}
            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: 36,
                fontWeight: 600,
                lineHeight: 1.2,
                color: INK,
              }}
            >
              A desktop you scroll through.
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 8,
                width: 940,
                fontSize: 32,
                lineHeight: 1.25,
                color: MUTED,
              }}
            >
              The work, the prices, and a brief you can send in one sitting.
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 34 }}>
              {["Brand identity", "UI / UX", "Full site builds", "3D"].map(
                (item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginRight: 12,
                      marginBottom: 12,
                      padding: "10px 18px",
                      background: CREAM,
                      border: `3px solid ${INK}`,
                      boxShadow: `4px 4px 0 ${INK}`,
                      fontSize: 26,
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
                    {item}
                  </div>
                )
              )}
            </div>
          </div>

          {/* footer — matches the homepage card, different route */}
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
              jawadjalal.com/design
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
