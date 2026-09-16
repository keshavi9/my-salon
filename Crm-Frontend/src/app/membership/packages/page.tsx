'use client'

import { useState } from 'react'
import { Gift, Plus, Edit2, Trash2, X, Save, Scissors } from 'lucide-react'
import VerticalCard from '@/components/ui/VerticalCard'
import ImageCapture from '@/components/ui/ImageCapture'

const initialPackages = [
  { id: 1, name: 'Bridal Package',    price: 8999,  services: ['Hair Color', 'Bridal Makeup', 'Facial', 'Manicure', 'Pedicure'], validity: '1 Day',    color: 'var(--accent-light)' },
  { id: 2, name: 'Hair Care Bundle',  price: 2999,  services: ['Hair Cut', 'Hair Spa', 'Hair Color'],                             validity: '1 Month',  color: '#8E7AB5' },
  { id: 3, name: 'Skin Glow Pack',    price: 1999,  services: ['Facial', 'Face Massage', 'Clean-up'],                            validity: '2 Months', color: '#6D91BF' },
]

export default function PackagesPage() {
  const [packages, setPackages] = useState(initialPackages)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', price: '', validity: '', image: null as File | null })

  const openEdit = (pkg: typeof initialPackages[0]) => {
    setEditId(pkg.id)
    setForm({ name: pkg.name, price: String(pkg.price), validity: pkg.validity, image: null })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name || !form.price) return
    const imageUrl = form.image ? URL.createObjectURL(form.image) : null;
    if (editId !== null) {
      setPackages(p => p.map(x => x.id === editId ? { 
        ...x, name: form.name, price: Number(form.price), validity: form.validity || '1 Month', ...(imageUrl ? { image: imageUrl } : {}) 
      } : x))
    } else {
      setPackages(p => [...p, { id: Date.now(), name: form.name, price: Number(form.price), services: [], validity: form.validity || '1 Month', color: '#6D91BF', image: imageUrl }])
    }
    setForm({ name: '', price: '', validity: '', image: null })
    setEditId(null)
    setShowModal(false)
  }

  const handleClose = () => {
    setShowModal(false)
    setEditId(null)
    setForm({ name: '', price: '', validity: '', image: null })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift size={20} className="text-accent dark:text-salon-100" />
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary">Packages</h1>
          <span className="rounded-full bg-accent-light/25 px-2 py-0.5 text-xs font-semibold text-accent dark:bg-salon-900/40 dark:text-salon-100">{packages.length}</span>
        </div>
        <button onClick={() => {
          setEditId(null)
          setForm({ name: '', price: '', validity: '', image: null })
          setShowModal(true)
        }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-salon-900 text-white text-sm font-semibold transition">
          <Plus size={15} /> Add Package
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {packages.map(pkg => (
          <VerticalCard
            key={pkg.id}
            image={(pkg as any).image}
            fallbackIcon={<Gift size={36} style={{ color: pkg.color }} className="opacity-90" />}
            iconBgColor={`${pkg.color}15`}
            title={pkg.name}
            onEdit={() => openEdit(pkg)}
            onDelete={() => setPackages(p => p.filter(x => x.id !== pkg.id))}
            deleteConfirmMsg={`Delete package: ${pkg.name}?`}
            content={
              <div className="flex flex-wrap gap-1.5 mt-1">
                {pkg.services.slice(0, 3).map(s => (
                  <span key={s} className="px-2 py-1 rounded-md bg-background dark:bg-background-secondary/60 text-[10px] font-medium text-text-secondary dark:text-text-secondary border border-border dark:border-border">
                    {s}
                  </span>
                ))}
                {pkg.services.length > 3 && (
                  <span className="px-2 py-1 rounded-md bg-background dark:bg-background-secondary/60 text-[10px] font-medium text-text-secondary border border-border dark:border-border">
                    +{pkg.services.length - 3}
                  </span>
                )}
              </div>
            }
            footer={
              <div>
                <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wider mb-0.5">Valid for {pkg.validity}</p>
                <p className="text-xl font-bold tracking-tight" style={{ color: pkg.color }}>₹{pkg.price.toLocaleString()}</p>
              </div>
            }
          />
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-secondary/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl bg-background-secondary dark:bg-background-secondary border border-border dark:border-border">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-text-primary dark:text-text-primary">{editId !== null ? 'Edit Package' : 'Add Package'}</h2>
              <button onClick={handleClose} className="p-1.5 rounded-lg text-text-secondary hover:bg-hover dark:hover:bg-background-secondary transition"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-[200px]">
                  <ImageCapture 
                    onImageChange={(file) => setForm(f => ({ ...f, image: file }))} 
                    value={form.image}
                  />
                </div>
              </div>
              {[{ label: 'Package Name', key: 'name', placeholder: 'e.g. Bridal Package' }, { label: 'Price (₹)', key: 'price', placeholder: '4999' }, { label: 'Validity', key: 'validity', placeholder: '1 Month' }].map(({ label, key, placeholder }) => (
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
