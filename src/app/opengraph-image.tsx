import { ImageResponse } from "next/og";

// Social card for the homepage: the jawadOS window on a CRT, name first.
// Pure CSS/flex only — no fetched fonts or images, per next/og's limits.
export const alt = "Jawad Jalal — designer, running jawadOS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACC = "#7ac274";
const INK = "#0a0d0a";

// Faux CRT scanlines, built from stacked divs (safer than repeating gradients).
const SCANLINES = Array.from({ length: 105 });

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(105% 105% at 22% 0%, #16241a 0%, #0d1410 48%, #070a08 100%)",
          padding: 56,
        }}
      >
        {/* the OS window */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: 18,
            border: "2px solid rgba(122,194,116,0.55)",
            background: "rgba(8,13,10,0.86)",
            boxShadow: "0 0 120px -30px rgba(122,194,116,0.35)",
            overflow: "hidden",
          }}
        >
          {/* title bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 24px",
              background: ACC,
              color: INK,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  width: 16,
                  height: 16,
                  background: INK,
                  marginRight: 8,
                }}
              />
              <div
                style={{
                  display: "flex",
                  width: 16,
                  height: 16,
                  background: INK,
                  marginRight: 8,
                }}
              />
              <div
                style={{
                  display: "flex",
                  width: 16,
                  height: 16,
                  background: INK,
                  marginRight: 20,
                }}
              />
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              >
                jawadOS 1.0
              </div>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Ready
            </div>
          </div>

          {/* body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              justifyContent: "center",
              padding: "0 56px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: ACC,
              }}
            >
              Designer · Founder · 3D
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: 116,
                fontWeight: 700,
                letterSpacing: "-0.035em",
                lineHeight: 1,
                color: "#f2f6f1",
              }}
            >
              Jawad Jalal
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 26,
                fontSize: 36,
                color: "#c3cfc2",
              }}
            >
              <span style={{ color: "#f2f6f1", fontWeight: 600 }}>
                Design, build and ship.
              </span>
              <span style={{ marginLeft: 12 }}>This site is an OS.</span>
              <div
                style={{
                  display: "flex",
                  width: 18,
                  height: 34,
                  marginLeft: 14,
                  background: ACC,
                }}
              />
            </div>
          </div>

          {/* dock / status bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "20px 56px",
              borderTop: "2px solid rgba(122,194,116,0.35)",
              fontSize: 24,
              letterSpacing: "0.06em",
              color: "#9fb39d",
            }}
          >
            {["Work", "CV", "Prices", "Brief"].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: 34,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 10,
                    height: 10,
                    marginRight: 12,
                    background: ACC,
                  }}
                />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* scanline overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {SCANLINES.map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                width: "100%",
                height: 2,
                marginBottom: 4,
                background: "rgba(122,194,116,0.055)",
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
