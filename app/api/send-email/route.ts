import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend("re_fGvbyaLo_Cu4ma8rk9cUkFMRHbppQVLjV");

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message, html } = await request.json();

    const fromEmail = "info@designagartistry.com";

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
