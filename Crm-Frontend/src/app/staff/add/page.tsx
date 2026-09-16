'use client'

import { useState } from 'react'
import { UserPlus, Save, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ImageCapture from '@/components/ui/ImageCapture'

const SPECIALITIES = ['Hair', 'Skin', 'Nails', 'Body', 'Makeup']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function AddStaffPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '', role: '', speciality: 'Hair', phone: '', email: '', aadhaar: '',
    workingHours: { start: '09:00', end: '18:00' },
    workingDays: [] as string[],
    image: null as File | null,
  })

  const toggleDay = (day: string) =>
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day],
    }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/staff')
  }

  return (
    <div className="w-full">
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={20} style={{ color: 'var(--accent)' }} />
            <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary">Add Staff Member</h1>
          </div>
          <Link href="/staff"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border dark:border-border text-sm font-semibold text-text-secondary dark:text-text-secondary hover:bg-background dark:hover:bg-background-secondary transition">
            <X size={15} /> Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-background-secondary p-6 dark:border-border dark:bg-background-secondary shadow-sm">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Left Sidebar: Photo */}
            <div className="w-full md:w-1/3 flex flex-col items-center md:items-start space-y-4 border-b md:border-b-0 md:border-r border-border dark:border-border pb-6 md:pb-0 md:pr-6">
              <label className="block text-sm font-semibold text-text-secondary dark:text-text-secondary">Profile Photo</label>
              <div className="w-full max-w-[200px]">
                <ImageCapture 
                  onImageChange={(file) => setFormData(prev => ({ ...prev, image: file }))} 
                  value={formData.image}
                />
              </div>
              <p className="text-xs text-text-secondary text-center md:text-left mt-2">
                Upload a professional photo for the staff profile.
              </p>
            </div>

            {/* Right Side: Form Details */}
            <div className="w-full md:w-2/3 space-y-6">
              
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {[
                  { label: 'Full Name *', key: 'name', placeholder: 'e.g. Priya Kumar',     type: 'text' },
                  { label: 'Role *',      key: 'role', placeholder: 'e.g. Senior Stylist',  type: 'text' },
                  { label: 'Phone *',     key: 'phone', placeholder: '+91 98765 43210',      type: 'tel'  },
                  { label: 'Email',       key: 'email', placeholder: 'email@example.com',    type: 'email'},
                  { label: 'Aadhaar Card No. *', key: 'aadhaar', placeholder: '1234 5678 9012', type: 'text' },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold mb-1.5 text-text-secondary dark:text-text-secondary">{label}</label>
                    <input type={type} placeholder={placeholder} value={(formData as any)[key]}
                      required={label.includes('*')}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-border dark:border-gray-600 bg-background dark:bg-background-secondary text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-background-secondary transition-colors" />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-text-secondary dark:text-text-secondary">Speciality *</label>
                  <select value={formData.speciality}
                    onChange={e => setFormData({ ...formData, speciality: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border border-border dark:border-gray-600 bg-background dark:bg-background-secondary text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-background-secondary transition-colors">
                    {SPECIALITIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <hr className="border-border dark:border-border" />

              <div>
                <label className="block text-sm font-semibold mb-3 text-text-secondary dark:text-text-secondary">Working Days *</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition"
                      style={{
                        background: formData.workingDays.includes(day) ? 'var(--accent)' : 'transparent',
                        color: formData.workingDays.includes(day) ? 'var(--bg-secondary)' : '',
                        border: formData.workingDays.includes(day) ? '1px solid var(--accent)' : '1px solid #d1d5db',
                      }}>
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                {[
                  { label: 'Start Time', key: 'start' },
                  { label: 'End Time',   key: 'end'   },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold mb-1.5 text-text-secondary dark:text-text-secondary">{label}</label>
                    <input type="time" value={(formData.workingHours as any)[key]}
                      onChange={e => setFormData({ ...formData, workingHours: { ...formData.workingHours, [key]: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm border border-border dark:border-gray-600 bg-background dark:bg-background-secondary text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-background-secondary transition-colors" />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-border dark:border-border">
                <Link href="/staff"
                  className="px-5 py-2.5 rounded-xl border border-border dark:border-gray-600 text-sm font-semibold text-text-secondary dark:text-text-secondary hover:bg-background dark:hover:bg-background-secondary transition">
                  Cancel
                </Link>
                <button type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition hover:opacity-90 shadow-sm" style={{ background: 'var(--accent)' }}>
                  <Save size={18} /> Save Staff
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
