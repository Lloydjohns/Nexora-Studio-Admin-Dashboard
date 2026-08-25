'use client';

import * as React from 'react';
import Cal from '@calcom/embed-react';

export default function CalBooking() {
  return (
    <div className="w-full min-h-[700px]">
      <Cal
        calLink="https://cal.com/nexora-studio-bookstatus"
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
  );
}