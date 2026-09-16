'use client'

import { useState } from 'react'
import { Scissors, Plus, Search, Clock, Star, X, Save } from 'lucide-react'
import ImageCapture from '@/components/ui/ImageCapture'
import VerticalCard from '@/components/ui/VerticalCard'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Hair:   { bg: 'var(--accent-light)', text: 'var(--accent)', dot: 'bg-rose-500' },
  Skin:   { bg: 'var(--info-bg)', text: 'var(--info)', dot: 'bg-sky-500' },
  Nails:  { bg: 'var(--success-bg)', text: 'var(--success)', dot: 'bg-success' },
  Body:   { bg: 'var(--warning-bg)', text: 'var(--warning)', dot: 'bg-warning' },
  Makeup: { bg: 'var(--accent-light)', text: 'var(--accent)', dot: 'bg-pink-500' },
}

const CATEGORIES = ['All', 'Hair', 'Skin', 'Nails', 'Body', 'Makeup']

interface Service {
  id: string
  name: string
  duration: number
  price: number
  category: string
  rating?: number
  bookings?: number
  isActive?: boolean
  image?: string
}

export default function ServicesPage() {
  const queryClient = useQueryClient()
  
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', duration: '', price: '', category: 'Hair', image: null as File | null })

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await api.get('/services')
      return res.data.data
    }
  })

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editId !== null) {
        return api.put(`/services/${editId}`, payload)
      } else {
        return api.post('/services', payload)
      }
    },
    onSuccess: () => {
      toast.success(editId !== null ? 'Service updated successfully' : 'Service added successfully')
      queryClient.invalidateQueries({ queryKey: ['services'] })
      handleClose()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save service')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/services/${id}`),
    onSuccess: () => {
      toast.success('Service deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete service')
    }
  })

  const filtered = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = category === 'All' || s.category === category
    return matchSearch && matchCat
  })

  const openEdit = (s: Service) => {
    setEditId(s.id)
    setForm({ name: s.name, duration: String(s.duration), price: String(s.price / 100), category: s.category, image: null })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name || !form.price) return
    const payload = {
      name: form.name,
      duration: Number(form.duration) || 30,
      price: Number(form.price),
      category: form.category,
      isActive: true
    }
    saveMutation.mutate(payload)
  }

  const handleClose = () => {
    setShowModal(false)
    setEditId(null)
    setForm({ name: '', duration: '', price: '', category: 'Hair', image: null })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold transition"
              style={{
                background: category === cat ? 'var(--accent)' : 'transparent',
                color: category === cat ? 'var(--bg-secondary)' : 'var(--text-secondary)',
                border: category === cat ? 'none' : '1px solid var(--border)',
              }}>
              {cat}
            </button>
          ))}
        </div>
        <button onClick={() => {
          setEditId(null)
          setForm({ name: '', duration: '', price: '', category: 'Hair', image: null })
          setShowModal(true)
        }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition shadow-sm shrink-0" style={{ background: 'var(--accent)' }}>
          <Plus size={15} /> Add Service
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20 text-text-secondary">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {filtered.map(s => {
            const cc = CATEGORY_COLORS[s.category] ?? CATEGORY_COLORS.Hair
            return (
              <VerticalCard
                key={s.id}
                image={s.image}
                fallbackIcon={<Scissors size={36} style={{ color: cc.text }} className="opacity-80" />}
                iconBgColor={cc.bg}
                badgeText={s.category}
                badgeColor={cc.text}
                title={s.name}
                onEdit={() => openEdit(s)}
                onDelete={() => deleteMutation.mutate(s.id)}
                deleteConfirmMsg={`Delete service: ${s.name}?`}
                content={
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1"><Clock size={13} className="opacity-70"/>{s.duration} min</span>
                    {s.rating && s.rating > 0 && (
                      <span className="flex items-center gap-1 text-warning"><Star size={12} fill="currentColor"/>{s.rating}</span>
                    )}
                    <span className="opacity-70">{s.bookings || 0} bookings</span>
                  </div>
                }
                footer={
                  <span className="text-[19px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>₹{s.price / 100}</span>
                }
              />
            )
          })}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-2">
          <Scissors size={36} style={{ color: 'var(--border)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No services found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-secondary/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{editId !== null ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={handleClose} className="p-1.5 rounded-lg transition" style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-[200px]">
                  <ImageCapture 
                    onImageChange={(file) => setForm(f => ({ ...f, image: file }))} 
                    value={form.image}
                  />
                </div>
              </div>
              {[
                { label: 'Service Name', key: 'name', placeholder: 'e.g. Deep Conditioning', type: 'text' },
                { label: 'Duration (min)', key: 'duration', placeholder: '60', type: 'number' },
                { label: 'Price (₹)', key: 'price', placeholder: '800', type: 'number' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}>
                  {['Hair', 'Skin', 'Nails', 'Body', 'Makeup'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>Cancel</button>
              <button onClick={handleSave} disabled={saveMutation.isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition" style={{ background: 'var(--accent)' }}>
                <Save size={14} /> {saveMutation.isPending ? 'Saving...' : editId !== null ? 'Update' : 'Save Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
