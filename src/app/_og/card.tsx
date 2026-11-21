import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// The share card for every page in the site group: the page's name in Public Sans 700 on the ground, its one line
// under it, the memoji, and the ember info bar along the foot, the same parts the page itself is made of.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function card({ title, line, bar }: { title: string; line: string; bar: string[] }) {
  const dir = path.join(process.cwd(), "src/app/_og");
  const [font, face] = await Promise.all([readFile(path.join(dir, "PublicSans-Bold.ttf")), readFile(path.join(dir, "jawad.png"))]);
  const big = title.length > 14 ? 104 : 128;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#e6e5e1", color: "#0b0b0b", fontFamily: "Public Sans" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "52px 60px 0" }}>
          <div style={{ display: "flex", fontSize: big, lineHeight: 0.94, letterSpacing: -big * 0.04, maxWidth: 900 }}>{title}</div>
          <img src={"data:image/png;base64," + face.toString("base64")} width={120} height={134} alt="" />
        </div>
        <div style={{ display: "flex", padding: "30px 60px 0", fontSize: 40, lineHeight: 1.04, letterSpacing: -1.3, maxWidth: 1000, color: "rgba(11,11,11,0.6)" }}>{line}</div>
        <div style={{ flexGrow: 1, display: "flex" }} />
        <div style={{ display: "flex", justifyContent: "space-between", background: "#ff5314", padding: "14px 60px 12px", fontSize: 30, letterSpacing: -0.9 }}>
          {bar.map((b) => (
            <span key={b}>{b}</span>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Public Sans", data: font, weight: 700, style: "normal" }] },
  );
}
