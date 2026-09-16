'use client'

import { useEffect, useState } from 'react'
import { Search, DollarSign, CreditCard, Smartphone, TrendingUp } from 'lucide-react'
import DataTable, { type TableRow } from '@/components/ui/DataTable'
import Card from '@/components/ui/Card'
import Loader from '@/components/ui/Loader'
import { formatCurrency, formatDate, debounce } from '@/utils/helpers'
import api from '@/lib/api'
import type { Payment } from '@/types'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => { fetchPayments() }, [methodFilter, statusFilter, dateFrom, dateTo])

  const fetchPayments = async (search?: string) => {
    try {
      let params = `?dateFrom=${dateFrom}&dateTo=${dateTo}&`
      if (search) params += `search=${encodeURIComponent(search)}&`
      if (methodFilter !== 'all') params += `method=${methodFilter}&`
      if (statusFilter !== 'all') params += `status=${statusFilter}&`
      const res = await api.get(`/payments${params}`)
      setPayments(res.data.data || res.data || [])
    } catch {
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = debounce((v: string) => fetchPayments(v), 500)

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)
  const methodTotals = {
    cash: payments.filter(p => p.method === 'cash' && p.status === 'completed').reduce((s, p) => s + p.amount, 0),
    card: payments.filter(p => p.method === 'card' && p.status === 'completed').reduce((s, p) => s + p.amount, 0),
    upi: payments.filter(p => p.method === 'upi' && p.status === 'completed').reduce((s, p) => s + p.amount, 0),
  }

  const rows: TableRow[] = payments.map(p => ({
    id: p.id,
    name: p.customerId || 'Customer',
    phone: '—',
    service: '—',
    stylist: '—',
    date: p.createdAt,
    amount: p.amount,
    status: p.status,
    paymentMethod: p.method,
    // extra
    bookingId: p.bookingId,
    transactionId: p.transactionId,
    notes: p.notes,
  }))

  const handleDelete = async (row: TableRow) => {
    try {
      await api.delete(`/payments/${row.id}`)
    } catch { /* silent */ }
    setPayments(prev => prev.filter(p => p.id !== row.id))
  }

  if (loading) return <div className="flex items-center justify-center h-96"><Loader size="lg" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Payments</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Track all payment transactions</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent)]/10' },
          { label: 'Cash', value: formatCurrency(methodTotals.cash), icon: DollarSign, color: 'text-success-text', bg: 'bg-success-bg dark:bg-success-bg' },
          { label: 'Card', value: formatCurrency(methodTotals.card), icon: CreditCard, color: 'text-info-text', bg: 'bg-info-bg dark:bg-info-bg' },
          { label: 'UPI', value: formatCurrency(methodTotals.upi), icon: Smartphone, color: 'text-warning-text', bg: 'bg-warning-bg dark:bg-warning-bg' },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={18} className={stat.color} />
              </div>
            </div>
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-secondary)' }} />
          <input type="text" placeholder="Search payments..." value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); handleSearch(e.target.value) }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }} />
        </div>
        {[
          { value: methodFilter, set: setMethodFilter, opts: [['all', 'All Methods'], ['cash', 'Cash'], ['card', 'Card'], ['upi', 'UPI']] },
          { value: statusFilter, set: setStatusFilter, opts: [['all', 'All Status'], ['completed', 'Completed'], ['pending', 'Pending'], ['failed', 'Failed'], ['refunded', 'Refunded']] },
        ].map((f, i) => (
          <select key={i} value={f.value} onChange={e => f.set(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}>
            {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <div className="flex items-center gap-2">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>–</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }} />
        </div>
      </div>

      {/* Table */}
      <DataTable
        rows={rows}
        onSendMsg={row => alert(`Send message to ${row.name}`)}
        onDelete={handleDelete}
        extraFields={[
          { key: 'bookingId', label: 'Booking ID' },
          { key: 'transactionId', label: 'Transaction ID' },
          { key: 'notes', label: 'Notes' },
        ]}
        emptyMessage="No payments found"
      />
    </div>
  )
}
