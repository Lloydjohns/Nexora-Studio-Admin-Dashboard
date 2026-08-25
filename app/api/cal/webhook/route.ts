import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY

const webhookSecret =
  process.env.CALCOM_WEBHOOK_SECRET

export async function POST(request: Request) {
  try {
    /*
     * ---------------------------------------------------------
     * 1. Make sure Supabase is configured
     * ---------------------------------------------------------
     */

    if (
      !supabaseUrl ||
      !supabaseServiceRoleKey
    ) {
      console.error(
        'Supabase environment variables are missing.',
      )

      return NextResponse.json(
        {
          success: false,
          error:
            'Supabase server configuration is missing.',
        },
        { status: 500 },
      )
    }

    /*
     * ---------------------------------------------------------
     * 2. Read Cal.com webhook payload
     * ---------------------------------------------------------
     */

    const booking = await request.json()

    console.log(
      'Cal.com webhook received:',
      booking,
    )

    /*
     * ---------------------------------------------------------
     * 3. Optional webhook secret verification
     * ---------------------------------------------------------
     */

    if (webhookSecret) {
      const receivedSecret =
        request.headers.get(
          'x-calcom-webhook-secret',
        )

      if (
        receivedSecret &&
        receivedSecret !== webhookSecret
      ) {
        console.error(
          'Invalid Cal.com webhook secret.',
        )

        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized webhook.',
          },
          { status: 401 },
        )
      }
    }

    /*
     * ---------------------------------------------------------
     * 4. Get booking data
     *
     * Cal.com payloads can contain the booking
     * inside "payload".
     * ---------------------------------------------------------
     */

    const payload =
      booking?.payload ?? booking

    /*
     * ---------------------------------------------------------
     * 5. Extract attendee
     * ---------------------------------------------------------
     */

    const attendee =
      payload?.attendees?.[0] ??
      payload?.attendee ??
      null

    const attendeeName =
      attendee?.name ??
      payload?.attendeeName ??
      ''

    const attendeeEmail =
      attendee?.email ??
      payload?.attendeeEmail ??
      ''

    /*
     * ---------------------------------------------------------
     * 6. Extract event information
     * ---------------------------------------------------------
     */

    const eventTitle =
      payload?.eventType?.title ??
      payload?.eventType?.name ??
      payload?.title ??
      'Discovery Call'

    const eventSlug =
      payload?.eventType?.slug ??
      payload?.eventType?.uid ??
      ''

    const startTime =
      payload?.startTime ??
      payload?.start ??
      null

    const endTime =
      payload?.endTime ??
      payload?.end ??
      null

    const meetingUrl =
      payload?.meetingUrl ??
      payload?.location ??
      null

    const bookingUid =
      payload?.uid ??
      payload?.bookingUid ??
      payload?.id ??
      null

    /*
     * ---------------------------------------------------------
     * 7. Determine our service
     * ---------------------------------------------------------
     */

    let serviceId = 'discovery-call'
    let serviceName = eventTitle
    let servicePrice = 0

    if (
      eventSlug ===
      'social-growth-sprint-30-min'
    ) {
      serviceId = 'social-growth'
      serviceName = 'Social Growth Sprint'
      servicePrice = 300
    }

    if (
      eventSlug ===
      'brand-clarity-session-45-min'
    ) {
      serviceId = 'brand-clarity'
      serviceName = 'Brand Clarity Session'
      servicePrice = 500
    }

    if (
      eventSlug ===
      'website-roadmap-call-60-min'
    ) {
      serviceId = 'website-roadmap'
      serviceName = 'Website Roadmap Call'
      servicePrice = 800
    }

    /*
     * ---------------------------------------------------------
     * 8. Create Supabase server client
     *
     * SERVICE ROLE KEY must NEVER be exposed
     * in browser/client-side code.
     * ---------------------------------------------------------
     */

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    /*
     * ---------------------------------------------------------
     * 9. Save Cal.com booking to Supabase
     * ---------------------------------------------------------
     */

    const { data, error } =
      await supabase
        .from('discovery_bookings')
        .insert({
          service_id: serviceId,
          service_name: serviceName,
          service_price: servicePrice,

          name:
            attendeeName ||
            'Cal.com attendee',

          email:
            attendeeEmail ||
            null,

          date: startTime
            ? new Date(startTime)
                .toISOString()
                .split('T')[0]
            : null,

          time: startTime
            ? new Date(startTime)
                .toISOString()
                .split('T')[1]
                .slice(0, 5)
            : null,

          contact_method:
            'Video call',

          status: 'confirmed',

          notes: [
            'Booked through Cal.com.',
            bookingUid
              ? `Cal.com Booking UID: ${bookingUid}`
              : '',
            meetingUrl
              ? `Meeting: ${meetingUrl}`
              : '',
            endTime
              ? `End: ${endTime}`
              : '',
          ]
            .filter(Boolean)
            .join('\n'),
        })
        .select()
        .single()

    if (error) {
      console.error(
        'Failed to save Cal.com booking:',
        error,
      )

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    /*
     * ---------------------------------------------------------
     * 10. Success
     * ---------------------------------------------------------
     */

    console.log(
      'Cal.com booking saved successfully:',
      data,
    )

    return NextResponse.json({
      success: true,
      booking: data,
    })
  } catch (error) {
    console.error(
      'Cal.com webhook error:',
      error,
    )

    return NextResponse.json(
      {
        success: false,
        error:
          'Unable to process Cal.com webhook.',
      },
      { status: 500 },
    )
  }
}