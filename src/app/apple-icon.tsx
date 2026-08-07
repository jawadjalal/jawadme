import { ImageResponse } from "next/og";

// Apple touch icon — same "J" monogram at 180×180.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7ac274 0%, #4f9b52 100%)",
          color: "#0a0d0a",
          fontSize: 120,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          borderRadius: 40,
        }}
      >
        J
      </div>
    ),
    { ...size }
  );
}
