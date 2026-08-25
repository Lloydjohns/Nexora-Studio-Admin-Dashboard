import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// ============================================================
// RESEND
// ============================================================

const resend = new Resend(
  process.env.RESEND_API_KEY,
)

// ============================================================
// TYPES
// ============================================================

type ClientData = {
  id?: string
  name?: string
  email?: string
  phone?: string | null
  company?: string | null
  website?: string | null
}

type BookingData = {
  serviceName?: string | null
  servicePrice?: number | string | null

  requestedDate?: string | null
  requestedTime?: string | null

  contactMethod?: string | null

  budget?: string | null
  timeline?: string | null

  goals?: string[] | string | null

  notes?: string | null
}

type CalEventData = {
  id?: string
  name?: string
  duration?: string | number | null
  url?: string
  price?: number | string | null
}

type BookingEmailPayload = {
  client?: ClientData
  booking?: BookingData
  calEvent?: CalEventData
}

// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(
  value: unknown,
): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ============================================================
// GOALS FORMATTER
// ============================================================

function formatGoals(
  goals?: string[] | string | null,
): string[] {
  if (!goals) {
    return []
  }

  if (Array.isArray(goals)) {
    return goals
      .map((goal) => String(goal).trim())
      .filter(Boolean)
  }

  if (typeof goals === 'string') {
    try {
      const parsed = JSON.parse(goals)

      if (Array.isArray(parsed)) {
        return parsed
          .map((goal) =>
            String(goal).trim(),
          )
          .filter(Boolean)
      }
    } catch {
      // Not JSON.
    }

    return goals
      .split(',')
      .map((goal) => goal.trim())
      .filter(Boolean)
  }

  return []
}

// ============================================================
// DATE FORMATTER
// ============================================================

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return 'Not specified'
  }

  const parsed = new Date(value)

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return value
  }

  return parsed.toLocaleDateString(
    'en-PH',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    },
  )
}

// ============================================================
// TIME FORMATTER
// ============================================================

function formatTime(
  value?: string | null,
): string {
  if (!value) {
    return 'Not specified'
  }

  const parsed = new Date(value)

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return value
  }

  return parsed.toLocaleTimeString(
    'en-PH',
    {
      hour: 'numeric',
      minute: '2-digit',
    },
  )
}

// ============================================================
// POST
// ============================================================

export async function POST(
  request: Request,
) {
  try {
    // ========================================================
    // CHECK RESEND CONFIGURATION
    // ========================================================

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

    // ========================================================
    // CHECK FROM EMAIL
    // ========================================================

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
            'RESEND_FROM_EMAIL is not configured. Please add your verified Resend sender email.',
        },
        {
          status: 500,
        },
      )
    }

    // ========================================================
    // READ REQUEST BODY
    // ========================================================

    const body =
      (await request.json()) as BookingEmailPayload

    console.log(
      'SEND BOOKING EMAIL REQUEST:',
      JSON.stringify(
        body,
        null,
        2,
      ),
    )

    // ========================================================
    // EXTRACT DATA
    // ========================================================

    const client =
      body.client ?? {}

    const booking =
      body.booking ?? {}

    const calEvent =
      body.calEvent ?? {}

    // ========================================================
    // CLIENT DATA
    // ========================================================

    const clientName =
      client.name?.trim() || ''

    const clientEmail =
      client.email?.trim() || ''

    const clientPhone =
      client.phone?.trim() || ''

    const company =
      client.company?.trim() || ''

    const website =
      client.website?.trim() || ''

    // ========================================================
    // BOOKING DATA
    // ========================================================

    const serviceName =
      booking.serviceName?.toString().trim() ||
      calEvent.name?.trim() ||
      'Discovery Call'

    const servicePrice =
      booking.servicePrice ??
      calEvent.price ??
      null

    const requestedDate =
      booking.requestedDate ?? null

    const requestedTime =
      booking.requestedTime ?? null

    const contactMethod =
      booking.contactMethod?.trim() || ''

    const budget =
      booking.budget?.trim() || ''

    const timeline =
      booking.timeline?.trim() || ''

    const notes =
      booking.notes?.trim() || ''

    const goals =
      formatGoals(
        booking.goals,
      )

    // ========================================================
    // CAL.COM DATA
    // ========================================================

    const calEventName =
      calEvent.name?.trim() ||
      serviceName

    const calEventDuration =
      calEvent.duration ??
      '30 min'

    const calEventUrl =
      calEvent.url?.trim() || ''

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!clientName) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Client name is required.',
        },
        {
          status: 400,
        },
      )
    }

    if (!clientEmail) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Client email is required.',
        },
        {
          status: 400,
        },
      )
    }

    // ========================================================
    // EMAIL SUBJECT
    // ========================================================

    const subject =
      `Nexora Studio — Your ${serviceName} Is Ready to Book`

    // ========================================================
    // GOALS HTML
    // ========================================================

    const goalsHtml =
      goals.length > 0
        ? `
          <div
            style="
              margin-top: 22px;
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
              Your Goals
            </div>

            <div>
              ${goals
                .map(
                  (goal) => `
                    <span
                      style="
                        display: inline-block;
                        margin: 0 6px 6px 0;
                        padding: 7px 11px;
                        background: #f4f4f5;
                        border: 1px solid #e4e4e7;
                        border-radius: 999px;
                        font-size: 12px;
                        color: #3f3f46;
                      "
                    >
                      ${escapeHtml(goal)}
                    </span>
                  `,
                )
                .join('')}
            </div>
          </div>
        `
        : ''

    // ========================================================
    // CAL.COM BUTTON
    // ========================================================

    const bookingButtonHtml =
      calEventUrl
        ? `
          <div
            style="
              margin: 30px 0;
              text-align: center;
            "
          >
            <a
              href="${escapeHtml(calEventUrl)}"
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
              Choose Your Date &amp; Time
            </a>

            <p
              style="
                margin: 12px 0 0;
                font-size: 12px;
                line-height: 1.5;
                color: #71717a;
              "
            >
              Click the button above to open your
              Cal.com scheduling page.
            </p>
          </div>
        `
        : `
          <div
            style="
              margin: 30px 0;
              padding: 18px;
              background: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 12px;
              color: #991b1b;
              font-size: 13px;
              line-height: 1.6;
            "
          >
            The scheduling link is currently unavailable.
            Please contact Nexora Studio directly to arrange
            your discovery call.
          </div>
        `

    // ========================================================
    // CLIENT INFORMATION HTML
    // ========================================================

    const clientInformationHtml = `
      <div
        style="
          margin-top: 24px;
          padding: 20px;
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 14px;
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
          Your Information
        </div>

        <div
          style="
            margin-bottom: 9px;
            font-size: 14px;
          "
        >
          <strong>Name:</strong>
          ${escapeHtml(clientName)}
        </div>

        <div
          style="
            margin-bottom: 9px;
            font-size: 14px;
          "
        >
          <strong>Email:</strong>
          ${escapeHtml(clientEmail)}
        </div>

        ${
          clientPhone
            ? `
              <div
                style="
                  margin-bottom: 9px;
                  font-size: 14px;
                "
              >
                <strong>Phone:</strong>
                ${escapeHtml(clientPhone)}
              </div>
            `
            : ''
        }

        ${
          company
            ? `
              <div
                style="
                  margin-bottom: 9px;
                  font-size: 14px;
                "
              >
                <strong>Company:</strong>
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
                  font-size: 14px;
                "
              >
                <strong>Website:</strong>
                ${escapeHtml(website)}
              </div>
            `
            : ''
        }
      </div>
    `

    // ========================================================
    // BOOKING DETAILS HTML
    // ========================================================

    const bookingDetailsHtml = `
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

        <div
          style="
            margin-bottom: 12px;
            font-size: 14px;
          "
        >
          <strong>Session:</strong>
          ${escapeHtml(calEventName)}
        </div>

        <div
          style="
            margin-bottom: 12px;
            font-size: 14px;
          "
        >
          <strong>Duration:</strong>
          ${escapeHtml(
            String(calEventDuration),
          )}
        </div>

        ${
          servicePrice !== null &&
          servicePrice !== undefined &&
          String(servicePrice) !== ''
            ? `
              <div
                style="
                  margin-bottom: 12px;
                  font-size: 14px;
                "
              >
                <strong>Session Fee:</strong>
                ₱${escapeHtml(
                  String(servicePrice),
                )}
              </div>
            `
            : ''
        }

        ${
          requestedDate
            ? `
              <div
                style="
                  margin-bottom: 12px;
                  font-size: 14px;
                "
              >
                <strong>Requested Date:</strong>
                ${escapeHtml(
                  formatDate(
                    requestedDate,
                  ),
                )}
              </div>
            `
            : ''
        }

        ${
          requestedTime
            ? `
              <div
                style="
                  margin-bottom: 12px;
                  font-size: 14px;
                "
              >
                <strong>Requested Time:</strong>
                ${escapeHtml(
                  formatTime(
                    requestedTime,
                  ),
                )}
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
                "
              >
                <strong>Preferred Contact:</strong>
                ${escapeHtml(
                  contactMethod,
                )}
              </div>
            `
            : ''
        }

        ${
          budget
            ? `
              <div
                style="
                  margin-bottom: 12px;
                  font-size: 14px;
                "
              >
                <strong>Budget:</strong>
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
                <strong>Timeline:</strong>
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

    // ========================================================
    // NOTES HTML
    // ========================================================

    const notesHtml =
      notes
        ? `
          <div
            style="
              margin-top: 20px;
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

    // ========================================================
    // COMPLETE EMAIL HTML
    // ========================================================

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
            ${escapeHtml(
              subject,
            )}
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

            <!-- ================================================= -->
            <!-- HEADER -->
            <!-- ================================================= -->

            <div
              style="
                padding: 34px;
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
                We've reviewed your inquiry and
                we're ready to continue the conversation.
              </p>

            </div>

            <!-- ================================================= -->
            <!-- BODY -->
            <!-- ================================================= -->

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
                We've reviewed the information you
                submitted through our website and would
                love to continue with a discovery call.
              </p>

              <p
                style="
                  margin: 0 0 18px;
                  font-size: 15px;
                  line-height: 1.7;
                  color: #52525b;
                "
              >
                Your selected session is
                <strong>
                  ${escapeHtml(
                    calEventName,
                  )}
                </strong>.
                Please use the button below to choose
                the date and time that works best for you.
              </p>

              <!-- BOOKING DETAILS -->

              ${bookingDetailsHtml}

              <!-- CLIENT INFORMATION -->

              ${clientInformationHtml}

              <!-- NOTES -->

              ${notesHtml}

              <!-- CAL.COM BUTTON -->

              ${bookingButtonHtml}

              <!-- NEXT STEP -->

              <div
                style="
                  margin-top: 28px;
                  padding: 20px;
                  background: #f4f4f5;
                  border-radius: 14px;
                "
              >

                <div
                  style="
                    font-size: 13px;
                    font-weight: bold;
                    color: #18181b;
                    margin-bottom: 8px;
                  "
                >
                  What happens next?
                </div>

                <p
                  style="
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.7;
                    color: #52525b;
                  "
                >
                  Choose your preferred schedule through
                  Cal.com. Once your booking is confirmed,
                  you'll receive the calendar confirmation
                  automatically.
                </p>

              </div>

              <p
                style="
                  margin: 28px 0 0;
                  font-size: 15px;
                  line-height: 1.7;
                  color: #52525b;
                "
              >
                We look forward to meeting you, learning
                more about your goals, and exploring how
                Nexora Studio can help bring your ideas
                to life.
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

            <!-- ================================================= -->
            <!-- FOOTER -->
            <!-- ================================================= -->

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

              This email was sent by Nexora Studio
              regarding your discovery call request.

              <br />

              If you did not submit this request,
              you can safely ignore this email.

            </div>

          </div>

        </body>
      </html>
    `

    // ========================================================
    // SEND EMAIL WITH RESEND
    // ========================================================

    const result =
      await resend.emails.send({
        from: fromEmail,

        to: [clientEmail],

        subject,

        html,
      })

    // ========================================================
    // RESEND ERROR
    // ========================================================

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
            'Resend failed to send the email.',
        },
        {
          status: 500,
        },
      )
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    console.log(
      'BOOKING EMAIL SUCCESSFULLY SENT:',
      {
        emailId:
          result.data?.id || null,

        clientEmail,

        clientName,

        serviceName,

        calEventUrl,
      },
    )

    return NextResponse.json(
      {
        success: true,

        message:
          'Booking email sent successfully.',

        emailId:
          result.data?.id || null,

        clientEmail,

        clientName,

        serviceName,

        bookingUrl:
          calEventUrl || null,
      },
      {
        status: 200,
      },
    )
  } catch (error) {
    // ========================================================
    // UNEXPECTED ERROR
    // ========================================================

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