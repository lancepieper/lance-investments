import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // MVP: Log to server console (visible in Vercel function logs)
    console.log(`[ATLAS SUBSCRIBE] ${new Date().toISOString()} — ${email}`);

    // TODO: Connect to Formspree, Mailchimp, or other email service
    // Example with Formspree:
    // await fetch("https://formspree.io/f/YOUR_FORM_ID", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email, _subject: "Atlas Dashboard Signup" }),
    // });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
