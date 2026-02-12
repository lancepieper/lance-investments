import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const fontData = await fetch(
    "https://fonts.gstatic.com/s/dancingscript/v29/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BMSoHTQ.ttf"
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a1128 0%, #0f1b3d 50%, #162552 100%)",
          borderRadius: "36px",
        }}
      >
        <div
          style={{
            fontSize: "120px",
            fontFamily: "Dancing Script",
            fontWeight: 700,
            color: "#d4a84b",
            display: "flex",
          }}
        >
          L
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Dancing Script",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
