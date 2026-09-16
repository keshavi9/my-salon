'use client'

import { useState } from 'react'
import { Percent, Plus, Edit2, Trash2, X, Save, Tag, Clock, Zap, Gift, Star, Users } from 'lucide-react'
import ImageCapture from '@/components/ui/ImageCapture'
import VerticalCard from '@/components/ui/VerticalCard'

type OfferType = 'flash' | 'seasonal' | 'referral' | 'birthday' | 'combo' | 'loyalty'

interface Offer {
  id: number
  title: string
  description: string
  code: string
  discount: number
  type: OfferType
  validFrom: string
  validTo: string
  usageLimit: number
  usedCount: number
  isActive: boolean
  image?: string | null
}

const TYPE_META: Record<OfferType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  flash:    { label: 'Flash Sale',    icon: <Zap size={14} />,   color: 'var(--warning)', bg: 'var(--warning-bg)' },
  seasonal: { label: 'Seasonal',      icon: <Star size={14} />,  color: 'var(--accent)', bg: 'var(--accent-light)' },
  referral: { label: 'Referral',      icon: <Users size={14} />, color: 'var(--info)', bg: 'var(--info-bg)' },
  birthday: { label: 'Birthday',      icon: <Gift size={14} />,  color: 'var(--accent)', bg: 'var(--accent-light)' },
  combo:    { label: 'Combo Deal',    icon: <Tag size={14} />,   color: 'var(--success)', bg: 'var(--success-bg)' },
  loyalty:  { label: 'Loyalty',       icon: <Clock size={14} />, color: 'var(--accent)', bg: 'var(--accent-light)' },
}

const INITIAL_OFFERS: Offer[] = [
  { id: 1, title: 'New Year Flash Sale',    description: 'Flat 25% off on all hair services this New Year!',         code: 'NY25',      discount: 25, type: 'flash',    validFrom: '2025-01-01', validTo: '2025-01-07', usageLimit: 100, usedCount: 42,  isActive: true  },
  { id: 2, title: 'Summer Glow Package',    description: '20% off on facials and skin treatments this summer.',       code: 'SUMMER20',  discount: 20, type: 'seasonal', validFrom: '2025-04-01', validTo: '2025-06-30', usageLimit: 200, usedCount: 88,  isActive: true  },
  { id: 3, title: 'Refer a Friend',         description: 'Get 15% off when you refer a friend who books a service.', code: 'REFER15',   discount: 15, type: 'referral', validFrom: '2025-01-01', validTo: '2025-12-31', usageLimit: 500, usedCount: 134, isActive: true  },
  { id: 4, title: 'Birthday Special',       description: 'Celebrate your birthday with 30% off any service!',        code: 'BDAY30',    discount: 30, type: 'birthday', validFrom: '2025-01-01', validTo: '2025-12-31', usageLimit: 999, usedCount: 67,  isActive: true  },
  { id: 5, title: 'Hair + Facial Combo',    description: 'Book haircut + facial together and save 18%.',             code: 'COMBO18',   discount: 18, type: 'combo',    validFrom: '2025-03-01', validTo: '2025-05-31', usageLimit: 150, usedCount: 29,  isActive: true  },
  { id: 6, title: 'Loyalty Reward',         description: 'Exclusive 10% off for our loyal customers (5+ visits).',   code: 'LOYAL10',   discount: 10, type: 'loyalty',  validFrom: '2025-01-01', validTo: '2025-12-31', usageLimit: 999, usedCount: 210, isActive: false },
]

const EMPTY_FORM = { title: '', description: '', code: '', discount: '', type: 'flash' as OfferType, validFrom: '', validTo: '', usageLimit: '', isActive: true, image: null as File | null }

const inputCls = 'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2'
const inputStyle = { borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filterType, setFilterType] = useState<'all' | OfferType>('all')

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (o: Offer) => {
    setEditId(o.id)
    setForm({ title: o.title, description: o.description, code: o.code, discount: String(o.discount), type: o.type, validFrom: o.validFrom, validTo: o.validTo, usageLimit: String(o.usageLimit), isActive: o.isActive, image: null })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.title || !form.code || !form.discount) return
    const imageUrl = form.image ? URL.createObjectURL(form.image) : null;
    if (editId !== null) {
      setOffers(p => p.map(o => o.id === editId ? { ...o, title: form.title, description: form.description, code: form.code.toUpperCase(), discount: Number(form.discount), type: form.type, validFrom: form.validFrom, validTo: form.validTo, usageLimit: Number(form.usageLimit) || 999, isActive: form.isActive, image: imageUrl || o.image } : o))
    } else {
      setOffers(p => [...p, { id: Date.now(), title: form.title, description: form.description, code: form.code.toUpperCase(), discount: Number(form.discount), type: form.type, validFrom: form.validFrom, validTo: form.validTo, usageLimit: Number(form.usageLimit) || 999, usedCount: 0, isActive: form.isActive, image: imageUrl }])
    }
    setShowModal(false)
  }

  const toggleActive = (id: number) => setOffers(p => p.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o))
  const deleteOffer = (id: number) => { if (confirm('Delete this offer?')) setOffers(p => p.filter(o => o.id !== id)) }

  const filtered = filterType === 'all' ? offers : offers.filter(o => o.type === filterType)
  const activeCount = offers.filter(o => o.isActive).length
  const totalUsed = offers.reduce((s, o) => s + o.usedCount, 0)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))' }}>
              <Percent size={15} className="text-white" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Offers & Promotions</h1>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Manage all promotional offers and discount campaigns</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition hover:opacity-90 shrink-0"
          style={{ background: 'var(--accent)' }}>
          <Plus size={15} /> Add Offer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Offers',   value: offers.length,                                    color: 'var(--accent)', bg: 'var(--accent-light)' },
          { label: 'Active Offers',  value: activeCount,                                      color: 'var(--success)', bg: 'var(--success-bg)' },
          { label: 'Total Redeemed', value: totalUsed,                                        color: 'var(--info)', bg: 'var(--info-bg)' },
          { label: 'Inactive',       value: offers.length - activeCount,                      color: 'var(--danger)', bg: 'var(--danger-bg)' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border p-4" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
              <div className="h-6 w-6 rounded-lg" style={{ background: s.bg }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', ...Object.keys(TYPE_META)] as ('all' | OfferType)[]).map(t => {
          const meta = t !== 'all' ? TYPE_META[t] : null
          const active = filterType === t
          return (
            <button key={t} onClick={() => setFilterType(t)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border"
              style={{
                background: active ? 'var(--accent)' : 'var(--bg)',
                color: active ? 'var(--bg-secondary)' : 'var(--text-secondary)',
                borderColor: active ? 'var(--accent)' : 'var(--border)',
              }}>
              {meta && meta.icon}
              {t === 'all' ? 'All Offers' : meta!.label}
            </button>
          )
        })}
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {filtered.map(offer => {
          const meta = TYPE_META[offer.type]
          const usagePct = Math.min(100, Math.round((offer.usedCount / offer.usageLimit) * 100))
          const isExpired = offer.validTo && new Date(offer.validTo) < new Date()
          return (
            <VerticalCard
              key={offer.id}
              image={offer.image}
              style={{ opacity: offer.isActive ? 1 : 0.65 }}
              fallbackIcon={
                <div className="h-16 w-16 rounded-full flex items-center justify-center bg-background-secondary/60 dark:bg-background-secondary/20 backdrop-blur-sm" style={{ color: meta.color }}>
                  {meta.icon}
                </div>
              }
              iconBgColor={meta.bg}
              badgeText={isExpired ? 'Expired' : offer.isActive ? 'Active' : 'Inactive'}
              badgeClassName={offer.isActive && !isExpired ? 'bg-background-secondary/80 text-success-text dark:bg-background-secondary/50 dark:text-success-text' : 'bg-background-secondary/80 text-danger-text dark:bg-background-secondary/50 dark:text-danger-text'}
              statusBadge={
                <div className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm flex items-center gap-1 text-white/90 shadow-sm">
                  <Tag size={10}/>
                  <span className="text-[10px] font-bold tracking-widest">{offer.code}</span>
                </div>
              }
              title={offer.title}
              onEdit={() => openEdit(offer)}
              onDelete={() => deleteOffer(offer.id)}
              deleteConfirmMsg={`Delete offer: ${offer.title}?`}
              content={
                <div className="flex flex-col mt-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: meta.color }}>{meta.label}</span>
                  <p className="text-[12px] text-text-secondary dark:text-text-secondary line-clamp-2 mb-3 leading-relaxed">{offer.description}</p>
                  <div className="flex items-baseline gap-0.5" style={{ color: meta.color }}>
                    <span className="text-3xl font-bold tracking-tighter">{offer.discount}%</span>
                    <span className="text-xs font-bold uppercase">Off</span>
                  </div>
                </div>
              }
              footer={
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-left">
                       <p className="text-[10px] font-medium text-text-secondary uppercase tracking-wider mb-0.5">Redeemed</p>
                       <p className="text-[12px] font-semibold text-text-secondary dark:text-text-secondary">{offer.usedCount} / {offer.usageLimit}</p>
                    </div>
                  </div>
                  {/* Progress bar minimalist */}
                  <div className="h-1.5 w-full bg-hover dark:bg-background-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${usagePct}%`, background: meta.color }} />
                  </div>
                </div>
              }
            />
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-2">
          <Percent size={36} style={{ color: 'var(--border)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No offers found</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Try a different filter or add a new offer.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-secondary/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="h-1" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))' }} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{editId !== null ? 'Edit Offer' : 'Add New Offer'}</h2>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 transition hover:bg-hover" style={{ color: 'var(--text-secondary)' }}>
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                <div className="flex flex-col items-center mb-4">
                  <label className="mb-1.5 block text-xs font-semibold w-full text-left" style={{ color: 'var(--text-secondary)' }}>Offer Banner / Image</label>
                  <div className="w-full max-w-[200px]">
                    <ImageCapture 
                      onImageChange={(file) => setForm(f => ({ ...f, image: file }))} 
                      value={form.image}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Offer Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Summer Glow Sale" className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the offer..." rows={2}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 resize-none" style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Offer Code *</label>
                    <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Discount % *</label>
                    <input type="number" min={1} max={100} value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} placeholder="20" className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Offer Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as OfferType }))} className={inputCls} style={inputStyle}>
                      {(Object.keys(TYPE_META) as OfferType[]).map(t => <option key={t} value={t}>{TYPE_META[t].label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Usage Limit</label>
                    <input type="number" min={1} value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="100" className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Valid From</label>
                    <input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Valid To</label>
                    <input type="date" value={form.validTo} onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))} className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="offerActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded accent-[var(--accent)]" />
                  <label htmlFor="offerActive" className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Active</label>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition hover:bg-hover"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Cancel</button>
                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold transition hover:opacity-90"
                  style={{ background: 'var(--accent)' }}>
                  <Save size={14} /> {editId !== null ? 'Update Offer' : 'Save Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
