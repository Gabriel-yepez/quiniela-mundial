import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Quiniela Mundial";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111111",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <p
          style={{
            color: "white",
            fontSize: 80,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-2px",
          }}
        >
          Quiniela Mundial
        </p>
        <p
          style={{
            color: "#a3a3a3",
            fontSize: 36,
            margin: 0,
          }}
        >
          Mundial 2026 · USA · México · Canadá
        </p>
      </div>
    ),
    { ...size }
  );
}
