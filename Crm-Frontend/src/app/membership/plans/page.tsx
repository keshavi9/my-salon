'use client'

import { useState } from 'react'
import { CreditCard, Plus, Edit2, Trash2, X, Save } from 'lucide-react'
import VerticalCard from '@/components/ui/VerticalCard'

const initialPlans = [
  { id: 1, name: 'Silver',   price: 999,  duration: '1 Month',  services: 5,  discount: 10, color: '#8A7D8E' },
  { id: 2, name: 'Gold',     price: 2499, duration: '3 Months', services: 15, discount: 20, color: '#C7923E' },
  { id: 3, name: 'Platinum', price: 4999, duration: '6 Months', services: 35, discount: 30, color: '#8E7AB5' },
]

export default function PlansPage() {
  const [plans, setPlans] = useState(initialPlans)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', price: '', duration: '', services: '', discount: '' })

  const openEdit = (plan: typeof initialPlans[0]) => {
    setEditId(plan.id)
    setForm({ name: plan.name, price: String(plan.price), duration: plan.duration, services: String(plan.services), discount: String(plan.discount) })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name || !form.price) return
    if (editId !== null) {
      setPlans(p => p.map(x => x.id === editId ? { ...x, name: form.name, price: Number(form.price), duration: form.duration || '1 Month', services: Number(form.services) || 0, discount: Number(form.discount) || 0 } : x))
    } else {
      setPlans(p => [...p, { id: Date.now(), name: form.name, price: Number(form.price), duration: form.duration || '1 Month', services: Number(form.services) || 0, discount: Number(form.discount) || 0, color: '#6D91BF' }])
    }
    setForm({ name: '', price: '', duration: '', services: '', discount: '' })
    setEditId(null)
    setShowModal(false)
  }

  const handleClose = () => {
    setShowModal(false)
    setEditId(null)
    setForm({ name: '', price: '', duration: '', services: '', discount: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard size={20} className="text-accent dark:text-salon-100" />
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary">Plans</h1>
          <span className="rounded-full bg-accent-light/25 px-2 py-0.5 text-xs font-semibold text-accent dark:bg-salon-900/40 dark:text-salon-100">{plans.length}</span>
        </div>
        <button onClick={() => {
          setEditId(null)
          setForm({ name: '', price: '', duration: '', services: '', discount: '' })
          setShowModal(true)
        }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-salon-900 text-white text-sm font-semibold transition">
          <Plus size={15} /> Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {plans.map(plan => (
          <VerticalCard
            key={plan.id}
            fallbackIcon={<CreditCard size={36} style={{ color: plan.color }} />}
            iconBgColor={`${plan.color}18`}
            badgeText={plan.duration}
            badgeColor={plan.color}
            title={plan.name}
            onEdit={() => openEdit(plan)}
            onDelete={() => setPlans(p => p.filter(x => x.id !== plan.id))}
            deleteConfirmMsg={`Delete plan: ${plan.name}?`}
            content={
              <div className="space-y-2 text-sm mt-1 text-text-secondary dark:text-text-secondary">
                <div className="flex justify-between items-center bg-background dark:bg-background-secondary p-2 rounded-lg border border-border">
                  <span>Services Included</span>
                  <span className="font-semibold text-text-primary dark:text-text-primary">{plan.services}</span>
                </div>
                <div className="flex justify-between items-center bg-background dark:bg-background-secondary p-2 rounded-lg border border-border">
                  <span>Member Discount</span>
                  <span className="font-semibold text-text-primary dark:text-text-primary">{plan.discount}%</span>
                </div>
              </div>
            }
            footer={
              <p className="text-2xl font-bold" style={{ color: plan.color }}>
                ₹{plan.price}
                <span className="text-xs font-normal text-text-secondary dark:text-text-secondary ml-1">/{plan.duration}</span>
              </p>
            }
          />
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-secondary/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl bg-background-secondary dark:bg-background-secondary border border-border dark:border-border">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-text-primary dark:text-text-primary">{editId !== null ? 'Edit Plan' : 'Add Plan'}</h2>
              <button onClick={handleClose} className="p-1.5 rounded-lg text-text-secondary hover:bg-hover dark:hover:bg-background-secondary transition"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {[{ label: 'Plan Name', key: 'name', placeholder: 'e.g. Gold' }, { label: 'Price (₹)', key: 'price', placeholder: '999' }, { label: 'Duration', key: 'duration', placeholder: '1 Month' }, { label: 'No. of Services', key: 'services', placeholder: '10' }, { label: 'Discount (%)', key: 'discount', placeholder: '15' }].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold mb-1 text-text-secondary dark:text-text-secondary">{label}</label>
                  <input placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border border-border dark:border-border bg-background-secondary dark:bg-background-secondary text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-border dark:border-border text-text-secondary dark:text-text-secondary hover:bg-background dark:hover:bg-background-secondary transition">Cancel</button>
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent hover:bg-salon-900 text-white text-sm font-semibold transition"><Save size={14} /> {editId !== null ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
