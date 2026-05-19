import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message, html } = await request.json();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Resend API key not configured" },
        { status: 500 }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "info@designagartistry.com";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html: html || message,
    });

    if (error) {
      console.error("Resend email error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log("Email sent successfully via Resend:", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
