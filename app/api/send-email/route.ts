import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(
  request: Request,
) {
  try {
    // ============================================================
    // CHECK ENVIRONMENT VARIABLES
    // ============================================================

    const apiKey =
      process.env.RESEND_API_KEY;

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      'onboarding@resend.dev';

    if (!apiKey) {
      console.error(
        'RESEND_API_KEY is not configured.',
      );

      return NextResponse.json(
        {
          error:
            'Email service is not configured. Please add RESEND_API_KEY to the environment variables.',
        },
        {
          status: 500,
        },
      );
    }

    // ============================================================
    // CREATE RESEND CLIENT
    // ============================================================

    const resend =
      new Resend(apiKey);

    // ============================================================
    // READ REQUEST
    // ============================================================

    const body =
      await request.json();

    const {
      to,
      subject,
      message,
    } = body;

    // ============================================================
    // VALIDATION
    // ============================================================

    if (
      !to ||
      typeof to !== 'string' ||
      !to.trim()
    ) {
      return NextResponse.json(
        {
          error:
            'Recipient email is required.',
        },
        {
          status: 400,
        },
      );
    }

    if (
      !subject ||
      typeof subject !== 'string' ||
      !subject.trim()
    ) {
      return NextResponse.json(
        {
          error:
            'Email subject is required.',
        },
        {
          status: 400,
        },
      );
    }

    if (
      !message ||
      typeof message !== 'string' ||
      !message.trim()
    ) {
      return NextResponse.json(
        {
          error:
            'Email message is required.',
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // PREPARE EMAIL
    // ============================================================

    const escapedMessage =
      message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br />');

    const html = `
      <div
        style="
          font-family:
            Arial,
            Helvetica,
            sans-serif;
          line-height: 1.6;
          color: #222;
          white-space: normal;
        "
      >
        ${escapedMessage}
      </div>
    `;

    // ============================================================
    // SEND EMAIL
    // ============================================================

    const {
      data,
      error,
    } = await resend.emails.send({
      from: fromEmail,
      to: [to.trim()],
      subject: subject.trim(),
      html,
    });

    // ============================================================
    // RESEND ERROR
    // ============================================================

    if (error) {
      console.error(
        'Resend API error:',
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            'Failed to send email.',
        },
        {
          status: 500,
        },
      );
    }

    // ============================================================
    // SUCCESS
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message:
          'Email sent successfully.',
        data,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    // ============================================================
    // UNEXPECTED ERROR
    // ============================================================

    console.error(
      'Send email error:',
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Something went wrong while sending the email.',
      },
      {
        status: 500,
      },
    );
  }
}