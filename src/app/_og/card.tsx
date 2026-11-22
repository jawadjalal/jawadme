import { ACCENT } from "@/lib/accent";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

// Ultra-clean Brass Hands industrial dark OG card (1200x630):
// Matte #1e1e1e ground, crisp 1px hairlines, #f2f2f0 type, tactical orange (#ff6200) accents, and uncropped work frames.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BAR = 56;
const dir = path.join(process.cwd(), "src/app/_og");

async function pic(src: string, w: number, h: number) {
  const img = sharp(path.join(process.cwd(), "public", src));
  const { width = 1, height = 1 } = await img.metadata();
  const buf = await img
    .flatten({ background: "#1e1e1e" })
    .resize(w, h, { fit: "cover", position: width / height > w / h + 0.3 ? "left" : "attention" })
    .jpeg({ quality: 88 })
    .toBuffer();
  return "data:image/jpeg;base64," + buf.toString("base64");
}

type Card = {
  title: string;
  line: string;
  bar: string[];
  /** one picture beside the words, at this width */
  side?: { src: string; w: number };
  /** a run of pictures across the top */
  strip?: string[];
  face?: boolean;
};

export async function card({ title, line, bar, side, strip, face }: Card) {
  const [font, me] = await Promise.all([
    readFile(path.join(dir, "Geist-Bold.ttf")),
    readFile(path.join(dir, "jawad.png")),
  ]);
  const H = size.height - BAR;
  const stripH = 296;
  const [sidePic, stripPics] = await Promise.all([
    side ? pic(side.src, side.w, H) : null,
    strip ? Promise.all(strip.map((s) => pic(s, Math.round(size.width / strip.length), stripH))) : null,
  ]);
  const textW = size.width - (side?.w ?? 0) - 112;
  const big = strip ? 112 : title.length > 16 ? 78 : title.length > 11 ? 92 : 108;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#1e1e1e",
          color: "#f2f2f0",
          fontFamily: "Geist",
        }}
      >
        {stripPics ? (
          <div style={{ display: "flex", height: stripH, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
            {stripPics.map((s, i) => (
              <img
                key={i}
                src={s}
                width={Math.round(size.width / stripPics.length)}
                height={stripH}
                alt=""
                style={{ borderRight: i < stripPics.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}
              />
            ))}
          </div>
        ) : null}

        <div style={{ flexGrow: 1, display: "flex" }}>
          <div
            style={{
              width: textW + 112,
              display: "flex",
              flexDirection: "column",
              justifyContent: strip ? "flex-end" : "space-between",
              padding: strip ? "0 56px 28px" : "48px 56px 40px",
            }}
          >
            {face && !strip ? (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <img src={"data:image/png;base64," + me.toString("base64")} width={46} height={52} alt="" />
                <span style={{ fontSize: 22, letterSpacing: 2.4, color: "#adb3b7" }}>JAWAD JALAL</span>
              </div>
            ) : null}

            <div style={{ display: "flex", flexDirection: "column", gap: strip ? 10 : 18 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: big,
                  lineHeight: 0.96,
                  letterSpacing: -big * 0.04,
                  maxWidth: textW,
                  color: "#f2f2f0",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: strip ? 26 : 30,
                  lineHeight: 1.24,
                  letterSpacing: -0.6,
                  maxWidth: textW,
                  color: "#adb3b7",
                }}
              >
                {line}
              </div>
            </div>
          </div>

          {sidePic ? (
            <div
              style={{
                display: "flex",
                marginLeft: "auto",
                borderLeft: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <img src={sidePic} width={side!.w} height={H} alt="" />
            </div>
          ) : null}
        </div>

        <div
          style={{
            height: BAR,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#242424",
            borderTop: `1px solid ${ACCENT.accent}`,
            padding: "0 56px",
            fontSize: 18,
            letterSpacing: 1.8,
            color: "#adb3b7",
          }}
        >
          {bar.map((b, i) => (
            <span key={b} style={{ color: i === bar.length - 1 ? ACCENT.accent : "#adb3b7" }}>
              {b.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: font, weight: 700, style: "normal" }] },
  );
}
