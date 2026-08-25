import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(
  process.env.RESEND_API_KEY,
);

export async function POST(request: Request) {
  try {
    // ============================================================
    // CHECK RESEND CONFIGURATION
    // ============================================================

    if (!process.env.RESEND_API_KEY) {
      console.error(
        'RESEND_API_KEY is not configured.',
      );

      return NextResponse.json(
        {
          success: false,
          error:
            'Email service is not configured. Please add RESEND_API_KEY to the environment variables.',
        },
        {
          status: 500,
        },
      );
    }

    // ============================================================
    // GET BOOKING DATA
    // ============================================================

    const body = await request.json();

    const {
      clientName,
      clientEmail,
      clientPhone,
      company,
      service,
      date,
      time,
      duration,
      bookingUrl,
      notes,
      message,
    } = body;

    // ============================================================
    // VALIDATION
    // ============================================================

    if (!clientName || !clientEmail) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Client name and client email are required.',
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // EMAIL CONTENT
    // ============================================================

    const subject =
      `Nexora Studio — Discovery Call Invitation${service ? ` | ${service}` : ''}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <title>
            Discovery Call Invitation
          </title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
            color: #18181b;
          "
        >

          <div
            style="
              max-width: 680px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 18px;
              overflow: hidden;
              border: 1px solid #e4e4e7;
            "
          >

            <!-- HEADER -->

            <div
              style="
                padding: 32px;
                background: #18181b;
                color: #ffffff;
              "
            >
              <div
                style="
                  font-size: 13px;
                  font-weight: bold;
                  letter-spacing: 2px;
                  text-transform: uppercase;
                  margin-bottom: 12px;
                  color: #a1a1aa;
                "
              >
                Nexora Studio
              </div>

              <h1
                style="
                  margin: 0;
                  font-size: 28px;
                  line-height: 1.3;
                "
              >
                You're invited to a discovery call
              </h1>

              <p
                style="
                  margin: 12px 0 0;
                  font-size: 15px;
                  line-height: 1.6;
                  color: #d4d4d8;
                "
              >
                We've reviewed your inquiry and would love
                to continue the conversation.
              </p>
            </div>


            <!-- BODY -->

            <div
              style="
                padding: 32px;
              "
            >

              <p
                style="
                  margin: 0 0 18px;
                  font-size: 16px;
                  line-height: 1.7;
                "
              >
                Hi
                <strong>${escapeHtml(clientName)}</strong>,
              </p>

              <p
                style="
                  margin: 0 0 18px;
                  font-size: 15px;
                  line-height: 1.7;
                  color: #52525b;
                "
              >
                Thank you for reaching out to
                <strong>Nexora Studio</strong>.
                We'd like to invite you to continue with
                a discovery call so we can better understand
                your goals, answer your questions, and
                determine the best next step for your project.
              </p>


              <!-- BOOKING DETAILS -->

              <div
                style="
                  margin: 24px 0;
                  padding: 22px;
                  background: #fafafa;
                  border: 1px solid #e4e4e7;
                  border-radius: 14px;
                "
              >

                <div
                  style="
                    margin-bottom: 16px;
                    font-size: 13px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #71717a;
                  "
                >
                  Discovery Call Details
                </div>


                ${
                  service
                    ? `
                      <div style="margin-bottom: 12px;">
                        <strong>Session:</strong>
                        ${escapeHtml(service)}
                      </div>
                    `
                    : ''
                }


                ${
                  duration
                    ? `
                      <div style="margin-bottom: 12px;">
                        <strong>Duration:</strong>
                        ${escapeHtml(String(duration))} minutes
                      </div>
                    `
                    : ''
                }


                ${
                  date
                    ? `
                      <div style="margin-bottom: 12px;">
                        <strong>Preferred Date:</strong>
                        ${escapeHtml(String(date))}
                      </div>
                    `
                    : ''
                }


                ${
                  time
                    ? `
                      <div style="margin-bottom: 12px;">
                        <strong>Preferred Time:</strong>
                        ${escapeHtml(String(time))}
                      </div>
                    `
                    : ''
                }


                ${
                  company
                    ? `
                      <div style="margin-bottom: 12px;">
                        <strong>Company:</strong>
                        ${escapeHtml(company)}
                      </div>
                    `
                    : ''
                }


                ${
                  clientPhone
                    ? `
                      <div>
                        <strong>Phone:</strong>
                        ${escapeHtml(clientPhone)}
                      </div>
                    `
                    : ''
                }

              </div>


              <!-- CAL.COM BUTTON -->

              ${
                bookingUrl
                  ? `
                    <div
                      style="
                        margin: 30px 0;
                        text-align: center;
                      "
                    >

                      <a
                        href="${escapeHtml(bookingUrl)}"
                        target="_blank"
                        style="
                          display: inline-block;
                          padding: 14px 26px;
                          background: #18181b;
                          color: #ffffff;
                          text-decoration: none;
                          border-radius: 999px;
                          font-size: 15px;
                          font-weight: bold;
                        "
                      >
                        Choose Your Discovery Call Time
                      </a>

                      <p
                        style="
                          margin: 14px 0 0;
                          font-size: 12px;
                          line-height: 1.5;
                          color: #71717a;
                        "
                      >
                        Click the button above to view
                        available dates and times.
                      </p>

                    </div>
                  `
                  : ''
              }


              <!-- PERSONAL MESSAGE -->

              ${
                message
                  ? `
                    <div
                      style="
                        margin-top: 24px;
                        padding: 20px;
                        border-left: 3px solid #18181b;
                        background: #fafafa;
                      "
                    >

                      <div
                        style="
                          margin-bottom: 8px;
                          font-size: 12px;
                          font-weight: bold;
                          text-transform: uppercase;
                          letter-spacing: 1px;
                          color: #71717a;
                        "
                      >
                        Message from Nexora Studio
                      </div>

                      <p
                        style="
                          margin: 0;
                          white-space: pre-wrap;
                          font-size: 14px;
                          line-height: 1.7;
                        "
                      >
                        ${escapeHtml(message)}
                      </p>

                    </div>
                  `
                  : ''
              }


              ${
                notes
                  ? `
                    <div
                      style="
                        margin-top: 20px;
                        padding: 18px;
                        background: #fafafa;
                        border-radius: 12px;
                      "
                    >

                      <div
                        style="
                          margin-bottom: 6px;
                          font-size: 12px;
                          font-weight: bold;
                          color: #71717a;
                        "
                      >
                        Notes
                      </div>

                      <p
                        style="
                          margin: 0;
                          white-space: pre-wrap;
                          font-size: 14px;
                          line-height: 1.6;
                        "
                      >
                        ${escapeHtml(notes)}
                      </p>

                    </div>
                  `
                  : ''
              }


              <p
                style="
                  margin: 28px 0 0;
                  font-size: 15px;
                  line-height: 1.7;
                  color: #52525b;
                "
              >
                We look forward to speaking with you and
                learning more about your project.
              </p>


              <p
                style="
                  margin: 22px 0 0;
                  font-size: 15px;
                  line-height: 1.7;
                "
              >
                Best regards,<br />

                <strong>
                  Nexora Studio
                </strong>
              </p>

            </div>


            <!-- FOOTER -->

            <div
              style="
                padding: 22px 32px;
                border-top: 1px solid #e4e4e7;
                background: #fafafa;
                font-size: 12px;
                line-height: 1.6;
                color: #71717a;
              "
            >
              This email was sent by Nexora Studio regarding
              your discovery call request.
            </div>

          </div>

        </body>
      </html>
    `;

    // ============================================================
    // SEND EMAIL USING RESEND
    // ============================================================

    const result = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        'Nexora Studio <onboarding@resend.dev>',

      to: [clientEmail],

      subject,

      html,
    });

    // ============================================================
    // CHECK RESEND RESPONSE
    // ============================================================

    if (result.error) {
      console.error(
        'RESEND EMAIL ERROR:',
        result.error,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            result.error.message ||
            'Failed to send email.',
        },
        {
          status: 500,
        },
      );
    }

    console.log(
      'Booking email successfully sent:',
      result.data,
    );

    return NextResponse.json({
      success: true,
      message:
        'Booking email sent successfully.',
      emailId:
        result.data?.id || null,
    });
  } catch (error) {
    console.error(
      'SEND BOOKING EMAIL ERROR:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unexpected error while sending booking email.',
      },
      {
        status: 500,
      },
    );
  }
}


// ============================================================
// HTML ESCAPE HELPER
// ============================================================

function escapeHtml(
  value: unknown,
): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}