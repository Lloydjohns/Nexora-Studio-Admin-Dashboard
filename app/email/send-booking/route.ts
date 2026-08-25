import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(
  process.env.RESEND_API_KEY,
)

// ============================================================
// POST — SEND DISCOVERY CALL BOOKING EMAIL
// ============================================================

export async function POST(request: Request) {
  try {
    // ==========================================================
    // CHECK RESEND CONFIGURATION
    // ==========================================================

    if (!process.env.RESEND_API_KEY) {
      console.error(
        'RESEND_API_KEY is not configured.',
      )

      return NextResponse.json(
        {
          success: false,
          error:
            'Email service is not configured. Please add RESEND_API_KEY to your environment variables.',
        },
        {
          status: 500,
        },
      )
    }

    // ==========================================================
    // GET REQUEST BODY
    // ==========================================================

    const body = await request.json()

    // IMPORTANT:
    // This matches the exact structure sent by
    // app/discovery-calls/page.tsx
    //
    // {
    //   client: {...},
    //   booking: {...},
    //   calEvent: {...}
    // }

    const {
      client,
      booking,
      calEvent,
    } = body

    // ==========================================================
    // VALIDATE CLIENT DATA
    // ==========================================================

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Client information is required.',
        },
        {
          status: 400,
        },
      )
    }

    if (
      !client.name ||
      !client.email
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Client name and client email are required.',
        },
        {
          status: 400,
        },
      )
    }

    // ==========================================================
    // NORMALIZE BOOKING DATA
    // ==========================================================

    const clientName =
      String(client.name)

    const clientEmail =
      String(client.email)

    const clientPhone =
      client.phone
        ? String(client.phone)
        : ''

    const company =
      client.company
        ? String(client.company)
        : ''

    const website =
      client.website
        ? String(client.website)
        : ''

    const service =
      booking?.serviceName
        ? String(
            booking.serviceName,
          )
        : calEvent?.name
          ? String(calEvent.name)
          : ''

    const servicePrice =
      booking?.servicePrice ??
      calEvent?.price ??
      null

    const date =
      booking?.requestedDate
        ? String(
            booking.requestedDate,
          )
        : ''

    const time =
      booking?.requestedTime
        ? String(
            booking.requestedTime,
          )
        : ''

    const duration =
      calEvent?.duration
        ? String(
            calEvent.duration,
          )
        : ''

    const bookingUrl =
      calEvent?.url
        ? String(
            calEvent.url,
          )
        : ''

    const contactMethod =
      booking?.contactMethod
        ? String(
            booking.contactMethod,
          )
        : ''

    const budget =
      booking?.budget
        ? String(
            booking.budget,
          )
        : ''

    const timeline =
      booking?.timeline
        ? String(
            booking.timeline,
          )
        : ''

    const notes =
      booking?.notes
        ? String(
            booking.notes,
          )
        : ''

    const goals =
      Array.isArray(
        booking?.goals,
      )
        ? booking.goals
        : []

    // ==========================================================
    // SUBJECT
    // ==========================================================

    const subject =
      `Nexora Studio — Your Discovery Call Is Ready to Book${
        service
          ? ` | ${service}`
          : ''
      }`

    // ==========================================================
    // GOALS HTML
    // ==========================================================

    const goalsHtml =
      goals.length > 0
        ? `
          <div
            style="
              margin-top: 18px;
              padding-top: 18px;
              border-top: 1px solid #e4e4e7;
            "
          >

            <div
              style="
                margin-bottom: 10px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #71717a;
              "
            >
              Project Goals
            </div>

            ${goals
              .map(
                (goal: unknown) => `
                  <div
                    style="
                      display: inline-block;
                      margin: 0 6px 6px 0;
                      padding: 6px 10px;
                      background: #f4f4f5;
                      border-radius: 999px;
                      font-size: 12px;
                      color: #3f3f46;
                    "
                  >
                    ${escapeHtml(goal)}
                  </div>
                `,
              )
              .join('')}

          </div>
        `
        : ''

    // ==========================================================
    // EMAIL HTML
    // ==========================================================

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

          <!-- MAIN CONTAINER -->

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

            <!-- =================================================
                 HEADER
            ================================================== -->

            <div
              style="
                padding: 34px 32px;
                background: #18181b;
                color: #ffffff;
              "
            >

              <div
                style="
                  margin-bottom: 12px;
                  font-size: 13px;
                  font-weight: bold;
                  letter-spacing: 2px;
                  text-transform: uppercase;
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
                  color: #ffffff;
                "
              >
                Your discovery call is ready
              </h1>

              <p
                style="
                  margin: 12px 0 0;
                  font-size: 15px;
                  line-height: 1.6;
                  color: #d4d4d8;
                "
              >
                We'd love to continue the conversation
                and learn more about your project.
              </p>

            </div>


            <!-- =================================================
                 BODY
            ================================================== -->

            <div
              style="
                padding: 32px;
              "
            >

              <!-- GREETING -->

              <p
                style="
                  margin: 0 0 18px;
                  font-size: 16px;
                  line-height: 1.7;
                "
              >
                Hi
                <strong>
                  ${escapeHtml(clientName)}
                </strong>,
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
                We've reviewed your inquiry and would
                love to continue the conversation with you.
              </p>


              <p
                style="
                  margin: 0 0 24px;
                  font-size: 15px;
                  line-height: 1.7;
                  color: #52525b;
                "
              >
                Your next step is to choose a date and
                time that works best for you using our
                Cal.com booking page.
              </p>


              <!-- =================================================
                   DISCOVERY CALL DETAILS
              ================================================== -->

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
                    margin-bottom: 18px;
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
                      <div
                        style="
                          margin-bottom: 12px;
                          font-size: 14px;
                          line-height: 1.6;
                        "
                      >
                        <strong>
                          Session:
                        </strong>
                        ${escapeHtml(service)}
                      </div>
                    `
                    : ''
                }


                ${
                  duration
                    ? `
                      <div
                        style="
                          margin-bottom: 12px;
                          font-size: 14px;
                          line-height: 1.6;
                        "
                      >
                        <strong>
                          Duration:
                        </strong>
                        ${escapeHtml(duration)}
                      </div>
                    `
                    : ''
                }


                ${
                  servicePrice !== null &&
                  servicePrice !== undefined
                    ? `
                      <div
                        style="
                          margin-bottom: 12px;
                          font-size: 14px;
                          line-height: 1.6;
                        "
                      >
                        <strong>
                          Session Fee:
                        </strong>
                        ₱${escapeHtml(
                          String(
                            servicePrice,
                          ),
                        )}
                      </div>
                    `
                    : ''
                }


                ${
                  date
                    ? `
                      <div
                        style="
                          margin-bottom: 12px;
                          font-size: 14px;
                          line-height: 1.6;
                        "
                      >
                        <strong>
                          Requested Date:
                        </strong>
                        ${escapeHtml(date)}
                      </div>
                    `
                    : ''
                }


                ${
                  time
                    ? `
                      <div
                        style="
                          margin-bottom: 12px;
                          font-size: 14px;
                          line-height: 1.6;
                        "
                      >
                        <strong>
                          Requested Time:
                        </strong>
                        ${escapeHtml(time)}
                      </div>
                    `
                    : ''
                }


                ${
                  contactMethod
                    ? `
                      <div
                        style="
                          margin-bottom: 12px;
                          font-size: 14px;
                          line-height: 1.6;
                        "
                      >
                        <strong>
                          Preferred Contact:
                        </strong>
                        ${escapeHtml(
                          contactMethod,
                        )}
                      </div>
                    `
                    : ''
                }

              </div>


              <!-- =================================================
                   CAL.COM BUTTON
              ================================================== -->

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
                        href="${escapeHtml(
                          bookingUrl,
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="
                          display: inline-block;
                          padding: 15px 28px;
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


              <!-- =================================================
                   CLIENT / COMPANY INFORMATION
              ================================================== -->

              ${
                company ||
                website ||
                clientPhone
                  ? `
                    <div
                      style="
                        margin-top: 24px;
                        padding: 20px;
                        background: #fafafa;
                        border-radius: 14px;
                        border: 1px solid #e4e4e7;
                      "
                    >

                      <div
                        style="
                          margin-bottom: 14px;
                          font-size: 12px;
                          font-weight: bold;
                          text-transform: uppercase;
                          letter-spacing: 1px;
                          color: #71717a;
                        "
                      >
                        Contact Information
                      </div>


                      ${
                        company
                          ? `
                            <div
                              style="
                                margin-bottom: 9px;
                                font-size: 14px;
                              "
                            >
                              <strong>
                                Company:
                              </strong>
                              ${escapeHtml(company)}
                            </div>
                          `
                          : ''
                      }


                      ${
                        website
                          ? `
                            <div
                              style="
                                margin-bottom: 9px;
                                font-size: 14px;
                              "
                            >
                              <strong>
                                Website:
                              </strong>
                              ${escapeHtml(website)}
                            </div>
                          `
                          : ''
                      }


                      ${
                        clientPhone
                          ? `
                            <div
                              style="
                                font-size: 14px;
                              "
                            >
                              <strong>
                                Phone:
                              </strong>
                              ${escapeHtml(
                                clientPhone,
                              )}
                            </div>
                          `
                          : ''
                      }

                    </div>
                  `
                  : ''
              }


              <!-- =================================================
                   PROJECT INFORMATION
              ================================================== -->

              ${
                budget ||
                timeline ||
                goalsHtml
                  ? `
                    <div
                      style="
                        margin-top: 24px;
                        padding: 20px;
                        background: #fafafa;
                        border-radius: 14px;
                        border: 1px solid #e4e4e7;
                      "
                    >

                      <div
                        style="
                          margin-bottom: 14px;
                          font-size: 12px;
                          font-weight: bold;
                          text-transform: uppercase;
                          letter-spacing: 1px;
                          color: #71717a;
                        "
                      >
                        Project Information
                      </div>


                      ${
                        budget
                          ? `
                            <div
                              style="
                                margin-bottom: 10px;
                                font-size: 14px;
                              "
                            >
                              <strong>
                                Budget:
                              </strong>
                              ${escapeHtml(budget)}
                            </div>
                          `
                          : ''
                      }


                      ${
                        timeline
                          ? `
                            <div
                              style="
                                font-size: 14px;
                              "
                            >
                              <strong>
                                Timeline:
                              </strong>
                              ${escapeHtml(
                                timeline,
                              )}
                            </div>
                          `
                          : ''
                      }


                      ${goalsHtml}

                    </div>
                  `
                  : ''
              }


              <!-- =================================================
                   CLIENT NOTES
              ================================================== -->

              ${
                notes
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
                        Your Notes
                      </div>


                      <p
                        style="
                          margin: 0;
                          white-space: pre-wrap;
                          font-size: 14px;
                          line-height: 1.7;
                          color: #3f3f46;
                        "
                      >
                        ${escapeHtml(notes)}
                      </p>

                    </div>
                  `
                  : ''
              }


              <!-- =================================================
                   FINAL MESSAGE
              ================================================== -->

              <p
                style="
                  margin: 28px 0 0;
                  font-size: 15px;
                  line-height: 1.7;
                  color: #52525b;
                "
              >
                Once you've selected your preferred schedule,
                Cal.com will handle the calendar confirmation
                for you.
              </p>


              <p
                style="
                  margin: 18px 0 0;
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
                Best regards,
                <br />

                <strong>
                  Nexora Studio
                </strong>
              </p>

            </div>


            <!-- =================================================
                 FOOTER
            ================================================== -->

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

              This email was sent by
              <strong>Nexora Studio</strong>
              regarding your discovery call request.

              <br />

              If you did not submit this request,
              you can safely ignore this email.

            </div>

          </div>

        </body>
      </html>
    `

    // ==========================================================
    // SEND EMAIL THROUGH RESEND
    // ==========================================================

    const fromEmail =
      process.env.RESEND_FROM_EMAIL

    if (!fromEmail) {
      console.error(
        'RESEND_FROM_EMAIL is not configured.',
      )

      return NextResponse.json(
        {
          success: false,
          error:
            'Sender email is not configured. Please add RESEND_FROM_EMAIL to your environment variables.',
        },
        {
          status: 500,
        },
      )
    }

    const result =
      await resend.emails.send({
        from: fromEmail,

        to: [clientEmail],

        subject,

        html,
      })

    // ==========================================================
    // CHECK RESEND RESPONSE
    // ==========================================================

    if (result.error) {
      console.error(
        'RESEND EMAIL ERROR:',
        result.error,
      )

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
      )
    }

    // ==========================================================
    // SUCCESS
    // ==========================================================

    console.log(
      'Booking email successfully sent:',
      result.data,
    )

    return NextResponse.json({
      success: true,

      message:
        'Booking email sent successfully.',

      emailId:
        result.data?.id || null,
    })
  } catch (error) {
    // ==========================================================
    // UNEXPECTED ERROR
    // ==========================================================

    console.error(
      'SEND BOOKING EMAIL ERROR:',
      error,
    )

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
    )
  }
}

// ============================================================
// HTML ESCAPE HELPER
// ============================================================

function escapeHtml(
  value: unknown,
): string {
  return String(value ?? '')
    .replace(
      /&/g,
      '&amp;',
    )
    .replace(
      /</g,
      '&lt;',
    )
    .replace(
      />/g,
      '&gt;',
    )
    .replace(
      /"/g,
      '&quot;',
    )
    .replace(
      /'/g,
      '&#039;',
    )
}