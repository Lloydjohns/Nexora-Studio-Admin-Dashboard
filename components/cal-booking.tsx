'use client'

import Cal from '@calcom/embed-react'

type CalBookingProps = {
  calLink?: string
}

export default function CalBooking({
  calLink = 'nexora-studio-bookstatus',
}: CalBookingProps) {
  return (
    <div className="w-full min-h-[700px] overflow-hidden rounded-2xl border border-border">
      <Cal
        calLink={calLink}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
        config={{
          layout: 'month_view',
          theme: 'light',
        }}
      />
    </div>
  )
}