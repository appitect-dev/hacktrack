import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HACKTRACK";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          background: "#0a0a0a",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: "#00ff41",
              letterSpacing: "0.1em",
              textShadow: "0 0 40px #00ff41, 0 0 80px #00ff4166",
            }}
          >
            HACKTRACK
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#6aaa6a",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            FUEL YOUR CODE /// TRACK YOUR TEAM
          </div>
          <div
            style={{
              display: "flex",
              gap: "32px",
              marginTop: "24px",
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#f87171",
                letterSpacing: "0.1em",
              }}
            >
              RED BULL
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#6aaa6a",
              }}
            >
              ///
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#facc15",
                letterSpacing: "0.1em",
              }}
            >
              COFFEE
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#6aaa6a",
              }}
            >
              ///
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#a855f7",
                letterSpacing: "0.1em",
              }}
            >
              SLEEP
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
