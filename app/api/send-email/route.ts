import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message, html } = await request.json();

    if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Zoho email credentials not configured" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.ZOHO_EMAIL,
      to,
      subject,
      text: message,
      html: html || undefined,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
