import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
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
          background: "#0f1b3d",
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            fontSize: "26px",
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
