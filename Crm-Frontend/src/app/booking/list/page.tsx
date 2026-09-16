'use client'

import { useState, useMemo } from 'react'
import { Search, MapPin, Filter, List, DollarSign, Loader2 } from 'lucide-react'
import DataTable, { type TableRow } from '@/components/ui/DataTable'
import { useLocationStore, BRANCHES } from '@/store/locationStore'
import { formatCurrency } from '@/utils/helpers'
import { downloadInvoice } from '@/utils/invoiceDownload'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Booking {
  id: string
  customer?: { id: string; name: string; phone: string; email?: string }
  serviceId?: string
  staff?: { id: string; name: string }
  date: string
  time?: string
  status: string
  amount: number
  notes?: string
  createdAt: string
}

function toRow(b: Booking): TableRow {
  return {
    id: b.id,
    name: b.customer?.name || 'Walk-in Client',
    phone: b.customer?.phone || '',
    email: b.customer?.email,
    service: b.serviceId || 'Service',
    stylist: b.staff?.name || 'Unassigned',
    date: b.date,
    time: b.time,
    amount: b.amount || 0,
    status: b.status,
    paymentMethod: 'cash',
    notes: b.notes,
  }
}

export default function BookingListPage() {
  const { branchId } = useLocationStore()
  const activeBranch = BRANCHES.find(b => b.id === branchId) ?? BRANCHES[0]
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('all')

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings')
      return res.data.data ?? []
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => api.put(`/bookings/${id}`, { status }),
    onSuccess: () => {
      toast.success('Booking status updated')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update booking')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/bookings/${id}`),
    onSuccess: () => {
      toast.success('Booking deleted')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete booking')
    }
  })

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const name = b.customer?.name || ''
      const phone = b.customer?.phone || ''
      const q = search.toLowerCase()
      if (q && !name.toLowerCase().includes(q) && !phone.includes(q)) return false
      if (filterStatus !== 'all' && b.status.toLowerCase() !== filterStatus) return false
      if (filterDate !== 'all') {
        const d = new Date(b.date), today = new Date()
        if (filterDate === 'today') {
          if (d.toDateString() !== today.toDateString()) return false
        } else if (filterDate === 'week') {
          const week = new Date(); week.setDate(today.getDate() - 7)
          if (d < week || d > today) return false
        }
      }
      return true
    })
  }, [bookings, search, filterStatus, filterDate])

  const metrics = useMemo(() => ({
    total: bookings.length,
    revenue: bookings.reduce((s, b) => s + (b.amount || 0), 0),
  }), [bookings])

  const handleDownload = (row: TableRow) => {
    const b = bookings.find(x => x.id === row.id)
    if (!b) return
    downloadInvoice({
      id: b.id, type: 'walkin', customerName: b.customer?.name || 'Walk-in',
      customerPhone: b.customer?.phone || '', customerEmail: b.customer?.email,
      services: [],
      totalAmount: b.amount || 0, discountAmount: 0, taxAmount: Math.round((b.amount || 0) * 0.18 / 1.18),
      finalAmount: b.amount || 0, totalDuration: 0,
      paymentMethod: 'cash', paymentStatus: 'paid',
      status: 'completed', branchId, createdAt: b.createdAt,
    })
  }

  const rows = filtered.map(toRow)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Billing List</h1>
            <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              <MapPin size={10} />{activeBranch.short}
            </span>
          </div>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            All scheduled bookings and billing records
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Billings', value: metrics.total, icon: <List size={14} />, color: 'text-[var(--accent)] bg-[var(--accent)]/10' },
          { label: 'Total Revenue', value: formatCurrency(metrics.revenue), icon: <DollarSign size={14} />, color: 'text-success bg-success/10' },
        ].map(m => (
          <div key={m.label} className="rounded-2xl border p-4" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${m.color}`}>{m.icon}</div>
            </div>
            <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Search customer, phone, service, stylist..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }} />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: filterDate, set: setFilterDate, opts: [['all', 'Date: All'], ['today', 'Today'], ['week', 'Last 7 Days']] },
            { value: filterStatus, set: setFilterStatus, opts: [['all', 'Status: All'], ['booked', 'Booked'], ['in_service', 'In Service'], ['completed', 'Completed'], ['cancelled', 'Cancelled']] },
          ].map((f, i) => (
            <div key={i} className="relative">
              <select value={f.value} onChange={e => f.set(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-xl text-xs font-semibold outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-[var(--accent)]"
                style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}>
                {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <Filter size={11} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading bookings…</span>
        </div>
      ) : (
        <DataTable
          rows={rows}
          onDownload={handleDownload}
          onSendMsg={row => toast(`Send message to ${row.phone}`, { icon: '💬' })}
          onEdit={(orig, updated) => updateStatusMutation.mutate({ id: orig.id, status: updated.status })}
          onDelete={(row) => deleteMutation.mutate(row.id)}
          extraFields={[
            { key: 'notes', label: 'Notes' },
          ]}
          emptyMessage="No bookings found. Try adjusting your filters."
        />
      )}
    </div>
  )
}
