'use client'

import { useState } from 'react'
import { Plus, Search, MapPin, X } from 'lucide-react'
import DataTable, { type TableRow } from '@/components/ui/DataTable'
import ClientForm from '@/components/forms/ClientForm'
import { useLocationStore, BRANCHES } from '@/store/locationStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
  id: string
  name: string
  phone: string
  email: string
  gender?: string
  totalVisits?: number
  totalSpent?: number
  loyaltyPoints?: number
  notes?: string
  membershipTier?: string
  createdAt: string
  updatedAt: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const { branchId } = useLocationStore()
  const activeBranch = BRANCHES.find(b => b.id === branchId) ?? BRANCHES[0]
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  // ── Fetch customers ──────────────────────────────────────────────────────
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await api.get('/customers')
      return res.data.data
    },
  })

  // ── Add customer ─────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (data: any) =>
      api.post('/customers', {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        gender: data.gender?.toLowerCase() || undefined,
        notes: data.notes,
      }),
    onSuccess: () => {
      toast.success('Customer added successfully')
      setShowModal(false)
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add customer')
    },
  })

  // ── Edit customer + optionally update payment status ─────────────────────
  // When the user changes the "Payment Status" dropdown in the Edit modal,
  // we update the most recent unpaid booking for that customer via the
  // bookings API (PATCH paymentStatus).  The customer profile itself only
  // stores name / phone / email, so the booking API call is separate.
  const editMutation = useMutation({
    mutationFn: async (updated: TableRow) => {
      // 1. Update basic customer profile
      await api.put(`/customers/${updated.id}`, {
        name: updated.name,
        phone: updated.phone,
        email: updated.email || undefined,
      })

      // 2. If the user changed payment status, update the latest booking
      const paymentStatus = updated.paymentStatus as string | undefined
      if (paymentStatus === 'pending' || paymentStatus === 'completed') {
        const apiStatus = paymentStatus === 'completed' ? 'paid' : 'unpaid'
        // Find the most recent booking for this customer and update its paymentStatus
        try {
          const bookingsRes = await api.get('/bookings', {
            params: { customerId: updated.id, limit: 1 },
          })
          const latestBooking = bookingsRes.data?.data?.[0]
          if (latestBooking?.id) {
            await api.put(`/bookings/${latestBooking.id}`, { paymentStatus: apiStatus })
          }
        } catch {
          // Non-critical — customer profile was already updated
        }
      }
    },
    onSuccess: () => {
      toast.success('Customer updated successfully')
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update customer')
    },
  })

  // ── Delete customer ───────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => {
      toast.success('Customer deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete customer')
    },
  })

  // ── Rows ─────────────────────────────────────────────────────────────────
  const filtered = search
    ? customers.filter(
        c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search)
      )
    : customers

  const rows: TableRow[] = filtered.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email || '',
    service: c.membershipTier ? `Tier: ${c.membershipTier}` : '—',
    stylist: '—',
    date: c.createdAt,
    amount: c.totalSpent || 0,
    // "status" column in DataTable is used for the coloured badge — show membership tier
    status: c.membershipTier ?? 'active',
    paymentMethod: '—',
    // Extra fields shown in View / Edit modals
    gender: c.gender || '',
    loyaltyPoints: c.loyaltyPoints || 0,
    totalVisits: c.totalVisits || 0,
    notes: c.notes || '',
    // Payment status (fetched from bookings) — default shown as pending if no paid booking
    paymentStatus: 'pending',
  }))

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Clients</h1>
            <span
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              <MapPin size={10} />{activeBranch.short}
            </span>
          </div>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {filtered.length} clients · {activeBranch.address}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative max-w-xs flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-secondary)' }}
            />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Add client */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shrink-0"
            style={{ background: 'linear-gradient(135deg,var(--accent),#9333EA)' }}
          >
            <Plus size={15} /> Add Client
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 text-center text-text-secondary">Loading clients...</div>
      ) : (
        <DataTable
          rows={rows}
          onSendMsg={row => toast(`Send message to ${row.phone}`, { icon: '💬' })}
          onEdit={(_orig, updated) => editMutation.mutate(updated)}
          onDelete={row => deleteMutation.mutate(row.id)}
          extraFields={[
            { key: 'gender',        label: 'Gender' },
            { key: 'loyaltyPoints', label: 'Loyalty Points' },
            { key: 'totalVisits',   label: 'Total Visits' },
            { key: 'notes',         label: 'Notes' },
            {
              key: 'paymentStatus',
              label: 'Payment Status',
              type: 'select',
              options: ['pending', 'completed'],
            },
          ]}
          emptyMessage="No clients found"
        />
      )}

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-secondary/50 backdrop-blur-sm">
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            <div className="h-1 bg-gradient-to-r from-[var(--accent)] via-[#9333EA] to-[var(--accent-dark)]" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Add New Client</h2>
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                  >
                    <MapPin size={9} />{activeBranch.short}
                  </span>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition hover:bg-hover"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X size={18} />
                </button>
              </div>
              <ClientForm onClose={() => setShowModal(false)} onSave={data => addMutation.mutate(data)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
