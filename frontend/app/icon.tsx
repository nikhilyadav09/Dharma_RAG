import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Matches the navbar's logo badge exactly: accent-orange rounded square
// with the ॐ glyph, so the browser tab icon and in-app logo stay in sync.
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
          background: "#e8890c",
          borderRadius: 14,
          color: "#171717",
          fontSize: 38,
          fontWeight: 600,
        }}
      >
        ॐ
      </div>
    ),
    { ...size },
  );
}
