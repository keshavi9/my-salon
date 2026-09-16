'use client'

import { Bell, CheckCircle2, Clock, AlertTriangle, Star } from 'lucide-react'
import { useState } from 'react'

const initialNotifications = [
  { id: 1, type: 'booking',  title: 'New Booking',       message: 'Priya Sharma booked Hair Spa for tomorrow at 10:00 AM', time: '2 min ago',  read: false },
  { id: 2, type: 'alert',    title: 'Low Stock Alert',    message: 'Hair Color (Blonde) is running low — only 3 left',       time: '15 min ago', read: false },
  { id: 3, type: 'review',   title: 'New Review',         message: 'Riya Patel gave a 5-star review for Facial service',    time: '1 hr ago',   read: false },
  { id: 4, type: 'payment',  title: 'Payment Received',   message: 'Invoice INV-004 paid by Meena Joshi via UPI',           time: '2 hr ago',   read: true  },
  { id: 5, type: 'booking',  title: 'Booking Cancelled',  message: 'Sunita Rao cancelled appointment for today 4:00 PM',    time: '3 hr ago',   read: true  },
  { id: 6, type: 'review',   title: 'New Review',         message: 'Kavita Singh gave a 4-star review for Bridal Makeup',   time: 'Yesterday',  read: true  },
]

const typeConfig: Record<string, { icon: any; bg: string; color: string }> = {
  booking: { icon: Clock,         bg: 'bg-accent-light/25 dark:bg-salon-900/30',       color: 'text-accent dark:text-salon-100' },
  alert:   { icon: AlertTriangle, bg: 'bg-warning-bg dark:bg-warning-bg',            color: 'text-warning' },
  review:  { icon: Star,          bg: 'bg-danger-bg dark:bg-rose-900/20',            color: 'text-danger' },
  payment: { icon: CheckCircle2,  bg: 'bg-success-bg dark:bg-success-bg',        color: 'text-success' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)

  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })))
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-accent dark:text-salon-100" />
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary">Notifications</h1>
          {unread > 0 && <span className="rounded-full bg-danger-bg px-2 py-0.5 text-xs font-semibold text-danger-text dark:bg-red-900/30 dark:text-danger-text">{unread} new</span>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm font-semibold text-accent dark:text-salon-100 hover:underline">Mark all read</button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map(n => {
          const cfg = typeConfig[n.type]
          const Icon = cfg.icon
          return (
            <div key={n.id} onClick={() => setNotifications(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}
              className={`flex items-start gap-4 rounded-2xl border p-4 cursor-pointer transition hover:shadow-sm ${n.read ? 'border-border bg-background-secondary dark:border-border dark:bg-background-secondary' : 'border-accent-light bg-accent-light/30 dark:border-salon-900/40 dark:bg-salon-900/10'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <Icon size={16} className={cfg.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text-primary dark:text-text-primary">{n.title}</p>
                  <span className="text-xs text-text-secondary dark:text-text-secondary shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-text-secondary dark:text-text-secondary mt-0.5">{n.message}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-accent dark:bg-accent-light shrink-0 mt-1" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
