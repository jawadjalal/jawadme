import { ImageResponse } from "next/og";

// Brand "J" monogram favicon, generated to match the jawadOS accent.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 23,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          borderRadius: 7,
        }}
      >
        J
      </div>
    ),
    { ...size }
  );
}
