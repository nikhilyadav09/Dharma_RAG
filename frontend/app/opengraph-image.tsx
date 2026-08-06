import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generates og:image (and twitter:image, via Next's automatic fallback)
// from the same brand tokens as the rest of the app, instead of a static
// PNG that would silently drift out of sync on redesigns.
//
// Rendered by satori, not a browser — every node needs an explicit
// `display: "flex"` (satori has no block-layout default), and text can't
// be mixed with element siblings under the same parent without each run
// wrapped in its own node.
export default function OpengraphImage() {
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
          background: "#0c0c0d",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 88,
              height: 88,
              borderRadius: 20,
              background: "#ff9933",
              color: "#171717",
              fontSize: 48,
              fontWeight: 600,
            }}
          >
            ॐ
          </div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 600, color: "#f4f4f5" }}>
            DHARMA
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 40, gap: 12 }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 600, color: "#f4f4f5" }}>
            Ancient wisdom,
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 600, color: "#ff9933" }}>
            thoughtfully retrieved
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 26,
            color: "#a1a1aa",
            maxWidth: 820,
            textAlign: "center",
          }}
        >
          Grounded, cited answers from the Bhagavad Gita and Yoga Sutras
        </div>
      </div>
    ),
    { ...size },
  );
}
