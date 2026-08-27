import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(
  process.env.RESEND_API_KEY,
);

export async function POST(request: Request) {
  try {
    // Check Resend configuration
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error:
            'Email service is not configured. Please add RESEND_API_KEY to the environment variables.',
        },
        { status: 500 },
      );
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      return NextResponse.json(
        {
          error:
            'Email sender is not configured. Please add RESEND_FROM_EMAIL to the environment variables.',
        },
        { status: 500 },
      );
    }

    // Read request body
    const body = await request.json();

    const {
      to,
      subject,
      message,
    } = body;

    // Validate recipient
    if (!to || !to.trim()) {
      return NextResponse.json(
        {
          error: 'Recipient email is required.',
        },
        { status: 400 },
      );
    }

    // Validate subject
    if (!subject || !subject.trim()) {
      return NextResponse.json(
        {
          error: 'Email subject is required.',
        },
        { status: 400 },
      );
    }

    // Validate message
    if (!message || !message.trim()) {
      return NextResponse.json(
        {
          error: 'Email message is required.',
        },
        { status: 400 },
      );
    }

    // Convert plain text message into simple HTML
    const htmlMessage = message
      .trim()
      .replace(/\n/g, '<br />');

    // Send email through Resend
    const { data, error } =
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: [to.trim()],
        subject: subject.trim(),
        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #222;
              max-width: 650px;
              margin: 0 auto;
            "
          >
            ${htmlMessage}
          </div>
        `,
      });

    // Resend returned an error
    if (error) {
      console.error(
        'Resend error:',
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            'Failed to send email through Resend.',
        },
        { status: 500 },
      );
    }

    // Success
    return NextResponse.json(
      {
        success: true,
        message:
          'Email sent successfully.',
        id: data?.id ?? null,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(
      'Send email API error:',
      error,
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Something went wrong while sending the email.',
      },
      { status: 500 },
    );
  }
}