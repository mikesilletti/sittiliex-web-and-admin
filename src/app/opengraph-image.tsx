import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#07090c",
          backgroundImage:
            "radial-gradient(circle at 50% 30%, rgba(26,180,255,0.25), transparent 60%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 72,
            fontWeight: 700,
            color: "#f4f6f8",
            letterSpacing: "-0.02em",
          }}
        >
          <span>SILLETTI</span>
          <span style={{ color: "#1ab4ff" }}>X</span>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#9aa4b2" }}>
          Acquiring Businesses Built to Last
        </div>
      </div>
    ),
    { ...size }
  );
}
