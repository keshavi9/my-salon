'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Scissors, Phone, MapPin, Plus, Filter, Save, X } from 'lucide-react'
import { useBookingStore, type BookingEntry } from '@/store/bookingStore'
import { STAFF as BOOKING_STAFF, SERVICES } from '@/lib/bookingData'

const STAFF_COLORS = ['var(--accent)', 'var(--info)', 'var(--success)', 'var(--warning)', 'var(--accent)', '#ec4899']

const STAFF = BOOKING_STAFF.map((s, i) => ({
  id: s.id,
  name: s.name,
  color: STAFF_COLORS[i % STAFF_COLORS.length],
  role: s.speciality
}))

const HOURS = Array.from({ length: 12 }, (_, i) => i + 9) // 9 AM to 8 PM
const SLOT_HEIGHT = 96 // Height per hour slot
const HEADER_HEIGHT = 64

const statusStyles: Record<string, { bg: string; border: string; dot: string }> = {
  confirmed: { bg: 'rgba(139, 92, 246, 0.08)', border: 'var(--accent)', dot: 'var(--accent)' },
  'in-progress': { bg: 'rgba(16, 185, 129, 0.08)', border: 'var(--success)', dot: 'var(--success)' },
  pending: { bg: 'rgba(245, 158, 11, 0.08)', border: 'var(--warning)', dot: 'var(--warning)' },
}

type CalendarBooking = {
  id: string;
  bookingId: string;
  serviceIndex: number;
  staffId: string;
  hour: number;
  duration: number;
  client: string;
  service: string;
  phone: string;
  status: string;
  rawBooking: BookingEntry;
}

export default function CalendarPage() {
  const { bookings, updateBooking } = useBookingStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editCustomerName, setEditCustomerName] = useState('')
  const [editCustomerPhone, setEditCustomerPhone] = useState('')
  const [editStatus, setEditStatus] = useState<BookingEntry['status']>('checked-in')
  const [editStaffId, setEditStaffId] = useState('')
  const [editServiceId, setEditServiceId] = useState('')

  const yyyy = selectedDate.getFullYear()
  const mm = String(selectedDate.getMonth() + 1).padStart(2, '0')
  const dd = String(selectedDate.getDate()).padStart(2, '0')
  const dateString = `${yyyy}-${mm}-${dd}`

  const todaysAppointments = bookings.filter(b => b.type === 'appointment' && b.date === dateString)

  const calendarBookings: CalendarBooking[] = todaysAppointments.flatMap(b => {
    let currentHour = (() => {
      const [h, m] = (b.time || "10:00").split(':').map(Number);
      return h + (m / 60);
    })();

    return b.services.map((svc, index) => {
      const svcDurationHours = (svc.duration * svc.quantity) / 60;
      const startHour = currentHour;
      currentHour += svcDurationHours;

      return {
        id: `${b.id}-${index}`,
        bookingId: b.id,
        serviceIndex: index,
        staffId: svc.staffId,
        hour: startHour,
        duration: svcDurationHours || 1,
        client: b.customerName,
        service: svc.name,
        phone: b.customerPhone,
        status: b.status === 'completed' ? 'confirmed' : 'pending',
        rawBooking: b
      }
    })
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  return (
    <div className="min-h-full space-y-6 pb-6 text-text-primary dark:bg-transparent dark:text-text-primary">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-accent dark:text-[var(--accent-light)]">
            <Calendar size={12} />
            Booking Calendar
          </div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary">Schedule Management</h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary">Manage appointments across all stylists</p>
        </div>

        <Link href="/booking/walkin" className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-accent to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 sm:self-auto">
          <Plus size={16} />
          New Booking
        </Link>
      </div>

      {/* Date Navigation + Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background-secondary transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-border dark:bg-background-secondary/50"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background-secondary px-4 py-2.5 font-semibold shadow-sm dark:border-border dark:bg-background-secondary/50">
            <Calendar size={16} className="text-accent" />
            <span className="text-sm">{formatDate(selectedDate)}</span>
            {isToday && (
              <span className="ml-1 rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-bold text-success-text dark:bg-emerald-900/30 dark:text-success-text">
                TODAY
              </span>
            )}
          </div>
          <button
            onClick={() => changeDate(1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background-secondary transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-border dark:bg-background-secondary/50"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="rounded-xl border border-border bg-background-secondary px-4 py-2.5 text-sm font-semibold transition-all hover:border-accent hover:bg-accent hover:text-white dark:border-border dark:bg-background-secondary/50"
          >
            Today
          </button>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-3">
          <div className="rounded-xl border border-border bg-background-secondary px-4 py-2 dark:border-border dark:bg-background-secondary/50">
            <div className="text-xs text-text-secondary dark:text-text-secondary">Total Bookings</div>
            <div className="text-lg font-bold text-text-primary dark:text-text-primary">{calendarBookings.length}</div>
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-border bg-background-secondary px-4 py-2 text-sm font-semibold transition-all hover:border-accent dark:border-border dark:bg-background-secondary/50 dark:hover:border-[var(--accent-light)]">
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-background-secondary/70 backdrop-blur-xl shadow-lg dark:border-border/60 dark:bg-background-secondary/70">
        <div className="grid grid-cols-5 divide-x divide-border dark:divide-zinc-800/60">
          {/* Time Column */}
          <div className="col-span-1 bg-background/50 dark:bg-background/20">
            <div className="flex h-16 items-center justify-center border-b border-border font-semibold text-xs text-text-secondary dark:border-border/60 dark:text-text-secondary">
              Time
            </div>
            {HOURS.map(hour => {
              const displayHour = hour > 12 ? hour - 12 : hour
              const period = hour >= 12 ? 'PM' : 'AM'
              return (
                <div
                  key={hour}
                  className="flex h-24 items-center justify-center border-b border-border dark:border-border/60"
                >
                  <div className="text-center">
                    <div className="text-sm font-semibold text-text-secondary dark:text-zinc-300">{displayHour}:00</div>
                    <div className="text-[10px] text-text-secondary dark:text-text-secondary">{period}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Staff Columns */}
          {STAFF.map(staff => (
            <div key={staff.id} className="relative col-span-1">
              {/* Staff Header */}
              <div
                className="flex h-16 flex-col items-center justify-center gap-1 border-b border-border dark:border-border/60"
                style={{ background: `${staff.color}08` }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-md"
                  style={{ background: `linear-gradient(135deg, ${staff.color}, ${staff.color}dd)` }}
                >
                  {staff.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold" style={{ color: staff.color }}>
                    {staff.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-text-secondary dark:text-text-secondary">{staff.role}</div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="relative">
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    className="group relative h-24 cursor-pointer border-b border-border transition hover:bg-background dark:border-border/60 dark:hover:bg-background-secondary/30"
                  >
                    {/* 30-minute divider line */}
                    <div className="absolute left-0 right-0 border-t border-dashed border-border dark:border-border/60" style={{ top: '50%' }} />
                    <div className="flex h-full items-center justify-center opacity-0 transition group-hover:opacity-100">
                      <Plus size={14} className="text-text-secondary" />
                    </div>
                  </div>
                ))}

                {/* Booking Cards */}
                {calendarBookings.filter(b => b.staffId === staff.id).map(booking => {
                  const styles = statusStyles[booking.status] || statusStyles.confirmed
                  const startMinutes = (booking.hour % 1) * 60
                  const formattedTime = `${Math.floor(booking.hour)}:${startMinutes.toString().padStart(2, '0')}`
                  const durationHours = Math.floor(booking.duration)
                  const durationMinutes = Math.round((booking.duration % 1) * 60)
                  const durationText = durationHours > 0
                    ? durationMinutes > 0
                      ? `${durationHours}h ${durationMinutes}m`
                      : `${durationHours}h`
                    : `${durationMinutes}m`

                  // Calculate precise positioning
                  const topPosition = HEADER_HEIGHT + (booking.hour - 9) * SLOT_HEIGHT + 4
                  const cardHeight = booking.duration * SLOT_HEIGHT - 8
                  const minHeight = 60 // Minimum height for readability

                  return (
                    <button
                      key={booking.id}
                      onClick={() => {
                        setSelectedBooking(booking)
                        setIsEditing(false)
                      }}
                      className="absolute left-1 right-1 overflow-hidden rounded-xl p-2.5 text-left shadow-md transition-all hover:scale-[1.02] hover:shadow-xl hover:z-50"
                      style={{
                        top: `${topPosition}px`,
                        height: `${Math.max(cardHeight, minHeight)}px`,
                        background: styles.bg,
                        border: `2px solid ${styles.border}`,
                        zIndex: 20,
                      }}
                    >
                      {/* Status dot */}
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          {booking.status === 'in-progress' && (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: styles.dot }} />
                          )}
                          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: styles.dot }} />
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: styles.border }}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="truncate text-sm font-bold text-[#24151A] dark:text-text-primary">{booking.client}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-text-secondary dark:text-text-secondary">
                        <Scissors size={10} />
                        <span className="truncate">{booking.service}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-text-secondary dark:text-text-secondary">
                        <Clock size={10} />
                        {formattedTime} · {durationText}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background-secondary/60 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="relative mx-4 w-full max-w-md space-y-5 rounded-2xl border border-border/60 bg-background-secondary/70 backdrop-blur-xl p-6 shadow-2xl dark:border-border/60 dark:bg-background/80"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-text-primary dark:text-text-primary">Booking Details</h3>
                <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary">View and manage appointment</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-hover text-xl font-bold text-text-secondary transition hover:bg-border dark:bg-background-secondary dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                ×
              </button>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold uppercase" style={{ background: statusStyles[selectedBooking.status].bg, color: statusStyles[selectedBooking.status].border }}>
              <span className="h-2 w-2 rounded-full" style={{ background: statusStyles[selectedBooking.status].dot }} />
              {selectedBooking.status}
            </div>

            {/* Details or Edit Form */}
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-dark to-accent">
                    <User size={18} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-text-secondary dark:text-text-secondary">Client</div>
                    <div className="text-sm font-semibold text-[#24151A] dark:text-text-primary">{selectedBooking.client}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-light)] to-[#D88385]">
                    <Scissors size={18} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-text-secondary dark:text-text-secondary">Service</div>
                    <div className="text-sm font-semibold text-[#24151A] dark:text-text-primary">{selectedBooking.service}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D91BF] to-[#5F4C86]">
                    <Clock size={18} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-text-secondary dark:text-text-secondary">Time & Duration</div>
                    <div className="text-sm font-semibold text-[#24151A] dark:text-text-primary">
                      {(() => {
                        const startMinutes = (selectedBooking.hour % 1) * 60
                        const formattedTime = `${Math.floor(selectedBooking.hour)}:${startMinutes.toString().padStart(2, '0')}`
                        const durationHours = Math.floor(selectedBooking.duration)
                        const durationMinutes = Math.round((selectedBooking.duration % 1) * 60)
                        const durationText = durationHours > 0
                          ? durationMinutes > 0
                            ? `${durationHours}h ${durationMinutes}m`
                            : `${durationHours}h`
                          : `${durationMinutes}m`
                        return `${formattedTime} (${durationText})`
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                    style={{ background: STAFF.find(s => s.id === selectedBooking.staffId)?.color }}
                  >
                    {STAFF.find(s => s.id === selectedBooking.staffId)?.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-text-secondary dark:text-text-secondary">Stylist</div>
                    <div className="text-sm font-semibold text-[#24151A] dark:text-text-primary">
                      {STAFF.find(s => s.id === selectedBooking.staffId)?.name}
                    </div>
                    <div className="text-xs text-text-secondary dark:text-text-secondary">
                      {STAFF.find(s => s.id === selectedBooking.staffId)?.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6F9F8F] to-[#6D91BF]">
                    <Phone size={18} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-text-secondary dark:text-text-secondary">Contact</div>
                    <div className="text-sm font-semibold text-[#24151A] dark:text-text-primary">{selectedBooking.phone}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-text-secondary dark:text-text-secondary">Client Name</label>
                    <input type="text" value={editCustomerName} onChange={e => setEditCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent-dark dark:border-border dark:bg-background-secondary/[0.04] dark:text-text-primary" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-text-secondary dark:text-text-secondary">Phone</label>
                    <input type="text" value={editCustomerPhone} onChange={e => setEditCustomerPhone(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent-dark dark:border-border dark:bg-background-secondary/[0.04] dark:text-text-primary" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-text-secondary dark:text-text-secondary">Date</label>
                    <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent-dark dark:border-border dark:bg-background-secondary/[0.04] dark:text-text-primary" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-text-secondary dark:text-text-secondary">Time</label>
                    <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent-dark dark:border-border dark:bg-background-secondary/[0.04] dark:text-text-primary" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-text-secondary dark:text-text-secondary">Stylist</label>
                    <select value={editStaffId} onChange={e => setEditStaffId(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent-dark dark:border-border dark:bg-background-secondary/[0.04] dark:text-text-primary">
                      <option value="">Select stylist</option>
                      {STAFF.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-text-secondary dark:text-text-secondary">Service</label>
                    <select value={editServiceId} onChange={e => setEditServiceId(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent-dark dark:border-border dark:bg-background-secondary/[0.04] dark:text-text-primary">
                      <option value="">Select service</option>
                      {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-1">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-text-secondary dark:text-text-secondary">Status</label>
                    <select value={editStatus} onChange={e => setEditStatus(e.target.value as BookingEntry['status'])}
                      className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent-dark dark:border-border dark:bg-background-secondary/[0.04] dark:text-text-primary">
                      <option value="checked-in">Pending</option>
                      <option value="in-service">In-Progress</option>
                      <option value="completed">Confirmed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true)
                      setEditDate(selectedBooking.rawBooking.date || '')
                      setEditTime(selectedBooking.rawBooking.time || '')
                      setEditCustomerName(selectedBooking.rawBooking.customerName || '')
                      setEditCustomerPhone(selectedBooking.rawBooking.customerPhone || '')
                      setEditStatus(selectedBooking.rawBooking.status || 'checked-in')
                      setEditStaffId(selectedBooking.staffId || '')
                      setEditServiceId(selectedBooking.rawBooking.services[selectedBooking.serviceIndex]?.id || '')
                    }}
                    className="flex-1 rounded-xl bg-gradient-to-r from-accent to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg">
                    Edit Booking
                  </button>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="flex-1 rounded-xl border-2 border-border bg-background-secondary py-3 text-sm font-semibold text-text-secondary transition hover:border-danger-border hover:bg-danger-bg hover:text-danger-text dark:border-border dark:bg-background-secondary dark:text-zinc-300 dark:hover:border-red-500/50 dark:hover:bg-danger/10">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      const updatedServices = [...selectedBooking.rawBooking.services]
                      if (selectedBooking.serviceIndex !== undefined) {
                        const selectedStaff = STAFF.find(s => s.id === editStaffId)
                        const selectedServiceData = SERVICES.find(s => s.id === editServiceId)

                        updatedServices[selectedBooking.serviceIndex] = {
                          ...updatedServices[selectedBooking.serviceIndex],
                          staffId: editStaffId,
                          staffName: selectedStaff?.name || '',
                          ...(selectedServiceData && {
                            id: selectedServiceData.id,
                            name: selectedServiceData.name,
                            price: selectedServiceData.price,
                            duration: selectedServiceData.duration,
                          })
                        }
                      }

                      const newTotal = updatedServices.reduce((sum, s) => sum + (s.price * s.quantity), 0)
                      const discountAmount = selectedBooking.rawBooking.discountAmount || 0
                      const taxAmount = (newTotal - discountAmount) * 0.18
                      const finalAmount = newTotal - discountAmount + taxAmount
                      const totalDuration = updatedServices.reduce((sum, s) => sum + (s.duration * s.quantity), 0)

                      updateBooking(selectedBooking.bookingId, {
                        date: editDate,
                        time: editTime,
                        customerName: editCustomerName,
                        customerPhone: editCustomerPhone,
                        status: editStatus,
                        services: updatedServices,
                        totalAmount: newTotal,
                        taxAmount,
                        finalAmount,
                        totalDuration
                      })
                      setSelectedBooking(null)
                      setIsEditing(false)
                    }}
                    className="flex-1 rounded-xl bg-gradient-to-r from-accent to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg">
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 rounded-xl border-2 border-border bg-background-secondary py-3 text-sm font-semibold text-text-secondary transition hover:border-danger-border hover:bg-danger-bg hover:text-danger-text dark:border-border dark:bg-background-secondary dark:text-zinc-300 dark:hover:border-red-500/50 dark:hover:bg-danger/10">
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
