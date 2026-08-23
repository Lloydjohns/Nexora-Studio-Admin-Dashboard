import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(
  process.env.RESEND_API_KEY,
);

export async function POST(
  request: Request,
) {
  try {
    const body = await request.json();

    const {
      to,
      subject,
      message,
    } = body;

    if (!to) {
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

    if (!subject) {
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

    if (!message) {
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

    const {
      data,
      error,
    } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        'onboarding@resend.dev',

      to: [to],

      subject,

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          ${message
            .replace(/\n/g, '<br />')}
        </div>
      `,
    });

    if (error) {
      console.error(
        'Resend error:',
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

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      'Send email error:',
      error,
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Something went wrong while sending the email.',
      },
      {
        status: 500,
      },
    );
  }
}