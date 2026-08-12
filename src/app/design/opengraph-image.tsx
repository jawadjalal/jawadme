import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { STUDIO } from "@/lib/studio";

// The studio's share card, in the same hand as the homepage's — white, and the
// words, and nothing else. See src/app/opengraph-image.tsx for why the font is
// vendored and why the word gap is a box rather than a space.

export const alt = `${STUDIO.title} — ${STUDIO.lede}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOCHI = readFileSync(join(process.cwd(), "src/app/fonts/GochiHand-Regular.ttf"));

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fdfdfc",
          color: "#0a0a0a",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Gochi Hand", fontSize: 132, paddingTop: 16 }}>
          <div style={{ display: "flex" }}>design</div>
          <div style={{ display: "flex", width: 58 }} />
          <div style={{ display: "flex" }}>studio</div>
        </div>
        <div style={{ display: "flex", fontSize: 32, marginTop: 26, color: "#6b6b66" }}>
          {STUDIO.lede}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Gochi Hand", data: GOCHI, weight: 400, style: "normal" }] },
  );
}
