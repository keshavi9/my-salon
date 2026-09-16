'use client'

import { useState } from 'react'
import { UserPlus, CalendarDays } from 'lucide-react'
import WalkinBooking from './walkin/page'
import CalendarView from './calendar/page'

const TABS = [
  {
    key: 'walkin',
    label: 'Billing',
    sub: 'Instant booking at counter',
    icon: UserPlus,
    color: '#9B6BB3',
    bg: 'from-salon-400 to-salon-900',
  },
  {
    key: 'calendar',
    label: 'Calendar',
    sub: 'Stylist-wise schedule',
    icon: CalendarDays,
    color: '#6F9F8F',
    bg: 'from-emerald-500 to-green-600',
  },
] as const

type BookingTab = (typeof TABS)[number]['key']

export default function BookingPage() {
  const [tab, setTab] = useState<BookingTab>('walkin')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarDays size={17} className="text-accent dark:text-salon-400" />
        <h1 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Booking</h1>
      </div>

      <div className="grid max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
        {TABS.map((item) => {
          const active = tab === item.key
          const Icon = item.icon

          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`relative flex flex-col items-start gap-2 overflow-hidden rounded-xl p-4 text-left transition-all duration-200 ${
                active
                  ? ''
                  : 'border border-border bg-background-secondary hover:bg-hover dark:bg-background-secondary dark:hover:bg-hover'
              }`}
              style={{
                border: active ? `1.5px solid ${item.color}` : undefined,
                background: active ? `${item.color}0E` : undefined,
                boxShadow: active ? `0 0 0 3px ${item.color}18` : undefined,
              }}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white ${item.bg}`}>
                <Icon size={15} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: active ? item.color : 'var(--text-primary)' }}>
                  {item.label}
                </div>
                <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.sub}</div>
              </div>
              {active && <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />}
            </button>
          )
        })}
      </div>

      <div className="border-t border-border" />

      <div className={tab === 'walkin' ? '' : 'hidden'}><WalkinBooking /></div>
      <div className={tab === 'calendar' ? '' : 'hidden'}><CalendarView /></div>
    </div>
  )
}
