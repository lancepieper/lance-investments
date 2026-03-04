import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SHEET_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbxIQbAIvn5RqIqDKimRTbf580CsrSuGwa91hqHjCBGYt-oJBgnghlRWnr9HeX4I_YPXVQ/exec";

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Send to Google Sheet (fire-and-forget — Apps Script redirects but saves data)
    fetch(GOOGLE_SHEET_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || "", email }),
      redirect: "follow",
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
