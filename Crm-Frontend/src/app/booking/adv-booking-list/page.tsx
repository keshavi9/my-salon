'use client'

import { useState } from 'react'
import { CalendarCheck, Search, Filter } from 'lucide-react'
import { useBookingStore } from '@/store/bookingStore'
import { useLocationStore, BRANCHES } from '@/store/locationStore'
import Link from 'next/link'
import DataTable, { type TableRow } from '@/components/ui/DataTable'
import { downloadInvoice } from '@/utils/invoiceDownload'

export default function AdvBookingListPage() {
  const { bookings, removeBooking, updateBooking } = useBookingStore()
  const { branchId } = useLocationStore()
  const branch = BRANCHES.find(b => b.id === branchId) ?? BRANCHES[0]
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all')

  const filtered = bookings.filter((b) => {
    if (b.type !== 'appointment') return false;
    
    const matchSearch =
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.customerPhone.includes(search)
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && b.status === 'completed') ||
      (filterStatus === 'pending' && b.status !== 'completed')
    return matchSearch && matchStatus
  })

  const totalRevenue = filtered
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((s, b) => s + b.totalAmount, 0)

  const rows: TableRow[] = filtered.map((b) => ({
    id: b.id,
    name: b.customerName || 'Unknown',
    phone: b.customerPhone || '—',
    email: b.customerEmail,
    service: b.services.map((s) => s.name).join(', ') || '—',
    stylist: b.services[0]?.staffName || 'Unassigned',
    date: b.date || b.createdAt,
    time: b.time,
    amount: b.totalAmount,
    status: b.status,
    paymentMethod: b.paymentMethod,
    // Extra fields
    bookingType: b.type,
    duration: b.totalDuration,
    notes: b.notes,
  }))

  const handleDownload = (row: TableRow) => {
    const b = bookings.find((x) => x.id === row.id)
    if (!b) return
    downloadInvoice({
      id: b.id,
      type: b.type,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      customerEmail: b.customerEmail,
      services: b.services.map(s => ({
        id: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration,
        quantity: s.quantity,
        staffId: s.staffId,
        staffName: s.staffName,
      })),
      totalAmount: b.totalAmount,
      discountAmount: b.discountAmount,
      taxAmount: b.taxAmount,
      finalAmount: b.finalAmount,
      totalDuration: b.totalDuration,
      paymentMethod: b.paymentMethod,
      paymentStatus: b.paymentStatus,
      status: b.status,
      branchId,
      createdAt: b.createdAt,
    })
  }

  const handleEdit = (original: TableRow, updated: TableRow) => {
    updateBooking(original.id, {
      customerName: updated.name,
      customerPhone: updated.phone,
      customerEmail: updated.email,
      status: updated.status as any,
    })
  }

  const handleDelete = (row: TableRow) => {
    removeBooking(row.id)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Booking List
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            All scheduled bookings — update payment status after service.
          </p>
        </div>
        <Link
          href="/booking/walkin"
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: 'var(--accent)' }}
        >
          <CalendarCheck size={15} /> New Booking
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total', value: filtered.length, color: 'var(--accent)' },
          { label: 'Completed', value: filtered.filter((b) => b.status === 'completed').length, color: 'var(--success)' },
          { label: 'Pending', value: filtered.filter((b) => b.status !== 'completed').length, color: 'var(--warning)' },
          { label: 'Revenue', value: `Rs. ${totalRevenue.toLocaleString('en-IN')}`, color: '#3B82F6' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-background-secondary p-4 dark:bg-background">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            <p className="mt-1 text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone…"
            className="w-full rounded-xl border bg-background-secondary py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 dark:bg-background"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-border bg-background-secondary p-1 dark:bg-background">
          <Filter size={13} className="ml-2" style={{ color: 'var(--text-secondary)' }} />
          {(['all', 'completed', 'pending'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition"
              style={{
                background: filterStatus === s ? 'var(--accent)' : 'transparent',
                color: filterStatus === s ? 'var(--bg-secondary)' : 'var(--text-secondary)',
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable
        rows={rows}
        onDownload={handleDownload}
        onSendMsg={row => alert(`Send message to ${row.phone}`)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        extraFields={[
          { key: 'bookingType', label: 'Booking Type' },
          { key: 'duration', label: 'Duration (min)' },
          { key: 'notes', label: 'Notes' },
        ]}
        emptyMessage="No bookings found. Try adjusting your filters."
      />
    </div>
  )
}
