import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

/** Sticker A! del header, en tamaño Apple Touch Icon. */
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
          background: "#FF2D6F",
          border: "12px solid #0A0A0A",
          color: "#0A0A0A",
          fontSize: 100,
          fontWeight: 800,
          letterSpacing: "-0.06em",
          lineHeight: 1,
          fontFamily: "Arial Black, Arial, sans-serif",
        }}
      >
        A!
      </div>
    ),
    { ...size },
  );
}
