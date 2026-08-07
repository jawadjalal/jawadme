import { ImageResponse } from "next/og";
import { allPosts } from "@/lib/posts";

// Share card for /writing. Third member of the family started by
// src/app/opengraph-image.tsx (personal) and src/app/design/opengraph-image.tsx
// (the studio): same cream ground, same hairline grid, same ink panel with a
// green hard-offset shadow, same eyebrow / headline / chips / footer rhythm.
//
// The tokens are duplicated across the three cards rather than shared through a
// helper — next/og convention files are the only files that own this art — so if
// the palette moves, move it in all three.
//
// next/og limits: flexbox only, explicit `display` on every div, and no network
// fetches, so type falls back to satori's bundled sans rather than Space Grotesk.

export const alt = "Writing — Jawad Jalal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CREAM = "#fbf9f1";
const CREAM_DEEP = "#f4f1e6";
const INK = "#141311";
const ACC = "#7ac274";
const MUTED = "#5d5a51";

const VERTICALS = Array.from({ length: 11 });
const HORIZONTALS = Array.from({ length: 5 });

export default function WritingOpengraphImage() {
  // Runs at build time, so the card advertises whatever is actually published.
  const posts = allPosts().slice(0, 3);
  const count = allPosts().length;

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
            border: `3px solid ${INK}`,
            background: CREAM_DEEP,
            boxShadow: `16px 16px 0 ${ACC}`,
          }}
        >
          {/* eyebrow rail */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "26px 40px",
              borderBottom: `3px solid ${INK}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", width: 18, height: 18, background: ACC, marginRight: 16 }} />
              <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: INK }}>
                JAWAD JALAL
              </div>
            </div>
            <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: MUTED }}>
              {count === 1 ? "1 POST" : `${count} POSTS`}
            </div>
          </div>

          {/* body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              padding: "44px 40px 0 40px",
            }}
          >
            <div style={{ display: "flex", fontSize: 104, color: INK, lineHeight: 1 }}>
              Writing.
            </div>
            <div style={{ display: "flex", fontSize: 34, color: MUTED, marginTop: 22 }}>
              Notes on interface craft, building and shipping.
            </div>

            {/* latest titles as chips — or an honest empty state */}
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 34 }}>
              {posts.length === 0 ? (
                <div style={{ display: "flex", fontSize: 28, color: MUTED }}>
                  Nothing published yet.
                </div>
              ) : (
                posts.map((p) => (
                  <div
                    key={p.slug}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: CREAM,
                      border: `3px solid ${INK}`,
                      boxShadow: `4px 4px 0 ${INK}`,
                      padding: "12px 20px",
                      marginRight: 16,
                      marginBottom: 16,
                      maxWidth: 520,
                    }}
                  >
                    <div style={{ display: "flex", width: 12, height: 12, background: ACC, marginRight: 14 }} />
                    <div style={{ display: "flex", fontSize: 27, color: INK }}>{p.title}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: INK,
              padding: "22px 40px",
            }}
          >
            <div style={{ display: "flex", fontSize: 28, color: CREAM }}>
              jawadjalal.com/writing
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", fontSize: 28, color: ACC, marginRight: 14 }}>
                Design, build and ship.
              </div>
              <div style={{ display: "flex", width: 14, height: 22, background: ACC }} />
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
