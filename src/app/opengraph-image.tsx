import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#f4efe4",
          color: "#1c1915",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase" }}>Daily Chess</div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 16 }}>One puzzle a day</div>
        <div style={{ fontSize: 36, marginTop: 20 }}>3–6 moves · share your streak 🟩🟨🟥</div>
      </div>
    ),
    size,
  );
}
