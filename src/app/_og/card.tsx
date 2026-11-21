import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

// The share card for every page in the site group, in the page's own parts: Public Sans 700 on the warm ground, the
// page's one line in the dim ink, the ember info bar along the foot, and the page's own pictures (an ad, a cover, a
// strip of the gallery) cut edge to edge. Satori reads PNG and JPEG only, so the WebP pictures pass through sharp.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BAR = 58;
const dir = path.join(process.cwd(), "src/app/_og");

async function pic(src: string, w: number, h: number) {
  const img = sharp(path.join(process.cwd(), "public", src));
  const { width = 1, height = 1 } = await img.metadata();
  const buf = await img
    .flatten({ background: "#d6d5d0" })
    .resize(w, h, { fit: "cover", position: width / height > w / h + 0.3 ? "left" : "attention" })
    .jpeg({ quality: 84 })
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
  const [font, me] = await Promise.all([readFile(path.join(dir, "PublicSans-Bold.ttf")), readFile(path.join(dir, "jawad.png"))]);
  const H = size.height - BAR;
  const stripH = 300;
  const [sidePic, stripPics] = await Promise.all([
    side ? pic(side.src, side.w, H) : null,
    strip ? Promise.all(strip.map((s) => pic(s, Math.round(size.width / strip.length), stripH))) : null,
  ]);
  const textW = size.width - (side?.w ?? 0) - 112;
  const big = strip ? 150 : title.length > 16 ? 92 : title.length > 10 ? 108 : 132;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#e6e5e1", color: "#0b0b0b", fontFamily: "Public Sans" }}>
        {stripPics ? (
          <div style={{ display: "flex", height: stripH }}>
            {stripPics.map((s, i) => (
              <img key={i} src={s} width={Math.round(size.width / stripPics.length)} height={stripH} alt="" />
            ))}
          </div>
        ) : null}
        <div style={{ flexGrow: 1, display: "flex" }}>
          <div style={{ width: textW + 112, display: "flex", flexDirection: "column", justifyContent: strip ? "flex-end" : "space-between", padding: strip ? "0 56px 26px" : "48px 56px 34px" }}>
            {face && !strip ? (
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, letterSpacing: -0.8 }}>
                <img src={"data:image/png;base64," + me.toString("base64")} width={54} height={60} alt="" />
                Jawad Jalal
              </div>
            ) : null}
            <div style={{ display: "flex", flexDirection: "column", gap: strip ? 10 : 22 }}>
              <div style={{ display: "flex", fontSize: big, lineHeight: 0.9, letterSpacing: -big * 0.045, maxWidth: textW }}>{title}</div>
              <div style={{ display: "flex", fontSize: strip ? 30 : 34, lineHeight: 1.12, letterSpacing: -1, maxWidth: textW, color: "rgba(11,11,11,0.62)" }}>{line}</div>
            </div>
          </div>
          {sidePic ? <img src={sidePic} width={side!.w} height={H} alt="" style={{ marginLeft: "auto" }} /> : null}
        </div>
        <div style={{ height: BAR, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ff5314", padding: "0 56px", fontSize: 28, letterSpacing: -0.8 }}>
          {bar.map((b) => (
            <span key={b}>{b}</span>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Public Sans", data: font, weight: 700, style: "normal" }] },
  );
}
