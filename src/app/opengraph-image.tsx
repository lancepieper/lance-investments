import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "lance.investments — Investment Insights by Lance Pieper";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a1128 0%, #0f1b3d 50%, #162552 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Gold accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #c9952e 0%, #d4a84b 50%, #c9952e 100%)",
            display: "flex",
          }}
        />

        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,149,46,0.08) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Label */}
        <div
          style={{
            fontSize: "18px",
            fontWeight: 600,
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#d4a84b",
            marginBottom: "24px",
            display: "flex",
          }}
        >
          Investment Insights & Analysis
        </div>

        {/* Site name */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.1,
            marginBottom: "20px",
            display: "flex",
          }}
        >
          lance.investments
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "26px",
            color: "#9ca3af",
            lineHeight: 1.5,
            maxWidth: "700px",
            display: "flex",
          }}
        >
          Frameworks and analysis on macroeconomics, technology, and long-term
          investing.
        </div>

        {/* Author line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "48px",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "3px",
              background: "#c9952e",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: "20px",
              color: "#d4a84b",
              fontWeight: 500,
              display: "flex",
            }}
          >
            Lance Pieper, CFP®
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
