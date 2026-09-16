'use client'

import { useState } from 'react'
import { UserPlus, CalendarCheck } from 'lucide-react'
import BookingForm from '@/components/forms/BookingForm'

type Tab = 'walkin' | 'appointment'

export default function WalkInPage() {
  const [tab, setTab] = useState<Tab>('walkin')

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {tab === 'walkin' ? 'Billing' : 'Booking'}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {tab === 'walkin'
              ? 'Register a guest, assign services and staff, then process payment.'
              : 'Schedule a future booking with date, time, and service selection.'}
          </p>
        </div>

        {/* Tabs moved to where Booking List was */}
        <div className="flex gap-1 rounded-xl border border-border bg-background-secondary p-1 w-fit">
          <button
            onClick={() => setTab('walkin')}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition"
            style={{
              background: tab === 'walkin' ? 'var(--accent)' : 'transparent',
              color: tab === 'walkin' ? 'var(--bg-secondary)' : 'var(--text-secondary)',
            }}
          >
            <UserPlus size={15} />
            Billing
          </button>
          <button
            onClick={() => setTab('appointment')}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition"
            style={{
              background: tab === 'appointment' ? 'var(--accent)' : 'transparent',
              color: tab === 'appointment' ? 'var(--bg-secondary)' : 'var(--text-secondary)',
            }}
          >
            <CalendarCheck size={15} />
            Booking
          </button>
        </div>
      </div>

      {/* Form — key forces full remount on tab switch so state resets */}
      <BookingForm key={tab} mode={tab} />
    </div>
  )
}
