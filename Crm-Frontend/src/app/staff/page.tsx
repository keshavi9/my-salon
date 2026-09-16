'use client'

import { useState } from 'react'
import { Users, Plus, X, Loader2, AlertCircle, Save } from 'lucide-react'
import Link from 'next/link'
import DataTable from '@/components/ui/DataTable'
import api from '@/lib/api'
import type { Staff } from '@/types'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const SPECIALITIES = ['Hair', 'Skin', 'Nails', 'Body', 'Makeup']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const BLANK = {
  name: '', role: 'stylist' as Staff['role'], specialization: [] as string[],
  phone: '', email: '', aadhaar: '', workingDays: [] as string[], commissionRate: 0, isActive: true,
}

export default function StaffPage() {
  const queryClient = useQueryClient()
  
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(BLANK)

  const { data: staff = [], isLoading, error } = useQuery<Staff[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await api.get('/staff')
      return res.data.data ?? []
    }
  })

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editId) {
        return api.put(`/staff/${editId}`, payload)
      } else {
        return api.post('/staff', payload)
      }
    },
    onSuccess: () => {
      toast.success(editId ? 'Staff member updated' : 'Staff member added')
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      setShowForm(false)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save staff member')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/staff/${id}`),
    onSuccess: () => {
      toast.success('Staff member deactivated')
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to deactivate staff member')
    }
  })

  const openEdit = (member: Staff) => {
    setEditId(member.id)
    setForm({
      name: member.name,
      role: member.role,
      specialization: member.specialization ?? [],
      phone: member.phone,
      email: member.email,
      aadhaar: member.aadhaar ?? '',
      workingDays: (member as any).workingDays ?? [],
      commissionRate: member.commissionRate,
      isActive: member.isActive,
    })
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(form)
  }

  const handleRemove = (id: string, name: string) => {
    if (!confirm(`Deactivate ${name}?`)) return
    deleteMutation.mutate(id)
  }

  const toggleDay = (day: string) =>
    setForm(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day],
    }))

  const toggleSpecialization = (spec: string) =>
    setForm(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec],
    }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} style={{ color: 'var(--accent)' }} />
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Staff Management</h1>
        </div>
        <Link href="/staff/add"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition"
          style={{ background: 'var(--accent)' }}>
          <Plus size={16} /> Add Staff
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger-text dark:border-red-900/40 dark:bg-danger-bg dark:text-danger-text">
          <AlertCircle size={16} />
          {error.message || 'Failed to load staff'}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-background-secondary/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Edit Staff Member
              </h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--hover)' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {([
                  { label: 'Name *',  key: 'name',  type: 'text',  placeholder: 'Full name' },
                  { label: 'Phone',   key: 'phone', type: 'tel',   placeholder: '+91 98765 43210' },
                  { label: 'Email',   key: 'email', type: 'email', placeholder: 'email@example.com' },
                  { label: 'Aadhaar Card No. *', key: 'aadhaar', type: 'text', placeholder: '1234 5678 9012' },
                ] as const).map(({ label, key, type, placeholder }) => (
                  <div key={key} className={key === 'email' || key === 'aadhaar' ? 'col-span-2' : ''}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                    <input type={type} required={label.includes('*')} placeholder={placeholder} value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Staff['role'] }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    <option value="stylist">Stylist</option>
                    <option value="assistant">Assistant</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Commission Rate (%)</label>
                  <input type="number" min="0" max="100" step="0.01" value={form.commissionRate}
                    onChange={e => setForm(f => ({ ...f, commissionRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="isActive" checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded" />
                  <label htmlFor="isActive" className="text-sm" style={{ color: 'var(--text-primary)' }}>Active</label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Specialization</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALITIES.map(spec => (
                    <button key={spec} type="button" onClick={() => toggleSpecialization(spec)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      style={{
                        background: form.specialization.includes(spec) ? 'var(--accent)' : 'var(--hover)',
                        color: form.specialization.includes(spec) ? 'var(--bg-secondary)' : 'var(--text-secondary)',
                        border: form.specialization.includes(spec) ? 'none' : '1px solid var(--border)',
                      }}>
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      style={{
                        background: form.workingDays.includes(day) ? 'var(--accent)' : 'var(--hover)',
                        color: form.workingDays.includes(day) ? 'var(--bg-secondary)' : 'var(--text-secondary)',
                        border: form.workingDays.includes(day) ? 'none' : '1px solid var(--border)',
                      }}>
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saveMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                  style={{ background: 'var(--accent)' }}>
                  {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Update Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-accent" />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading staff…</span>
        </div>
      ) : (
        <DataTable
          rows={staff.map(member => ({
            id: member.id,
            name: member.name,
            phone: member.phone || '—',
            email: member.email || '—',
            service: member.role,
            stylist: member.specialization?.join(', ') || '—',
            date: (member as any).workingDays?.join(', ') || '—',
            amount: member.commissionRate,
            amountLabel: `${member.commissionRate}%`,
            status: member.isActive ? 'active' : 'inactive',
            rawStaff: member
          }))}
          headers={[
            'Name',
            'Contact',
            'Role',
            'Specialization',
            'Working Days',
            'Commission',
            'Status',
            'Actions'
          ]}
          emptyMessage="No staff members found"
          onCustomEdit={(row) => openEdit(row.rawStaff as Staff)}
          onDelete={(row) => handleRemove(row.id, row.name)}
        />
      )}
    </div>
  )
}
