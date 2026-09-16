'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, ChevronDown, CheckCircle2, ArrowLeft, Receipt, Tag, CreditCard, CalendarDays, FileText, Image as ImageIcon } from 'lucide-react'
import ImageCapture from '@/components/ui/ImageCapture'

const CATEGORIES      = ['Products', 'Utilities', 'Maintenance', 'Salary', 'Other']
const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Bank Transfer']

const CAT_META: Record<string, { gradient: string; color: string }> = {
  Products:    { gradient: 'from-[var(--info)] to-[var(--accent-dark)]', color: 'var(--info)' },
  Utilities:   { gradient: 'from-[var(--warning)] to-[var(--danger)]', color: 'var(--warning)' },
  Maintenance: { gradient: 'from-[var(--success)] to-[var(--info)]', color: 'var(--success)' },
  Salary:      { gradient: 'from-accent-dark to-accent', color: 'var(--accent-dark)' },
  Other:       { gradient: 'from-[var(--accent)] to-[var(--danger)]', color: 'var(--accent)' },
}

export default function AddExpensePage() {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<{ title: string, category: string, amount: string, paymentMethod: string, date: string, notes: string, image: File | null }>({ title: '', category: '', amount: '', paymentMethod: '', date: '', notes: '', image: null })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const isValid = form.title && form.category && form.amount && form.date

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setSaved(true)
    setTimeout(() => router.push('/expense'), 1800)
  }

  const selectedMeta = form.category ? CAT_META[form.category] : null

  if (saved) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent-dark to-accent shadow-[0_0_40px_rgba(111,90,163,0.4)]">
        <div className="absolute inset-0 animate-ping rounded-full bg-accent opacity-20" />
        <CheckCircle2 size={36} className="relative text-white" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] dark:text-text-primary">Expense Saved!</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Redirecting to expense list...</p>
      </div>
      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-hover dark:bg-background-secondary/10">
        <div className="h-full animate-[fill_1.8s_ease-in-out_forwards] rounded-full bg-gradient-to-r from-accent-dark to-accent"
          style={{ animation: 'width 1.8s ease-in-out forwards', width: '100%' }} />
      </div>
    </div>
  )

  return (
    <main className="min-h-full space-y-6 pb-6 pt-4">
      <div className="w-full space-y-6">
        {/* ── Page Header ── */}
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.push('/expense')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background-secondary text-text-secondary transition hover:bg-background dark:border-border dark:bg-background-secondary/[0.04] dark:text-text-secondary dark:hover:bg-background-secondary/10">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="mb-1 inline-flex items-center gap-2 text-xs font-semibold text-accent">
              <Wallet size={12} /> Add New Expense
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] dark:text-text-primary">Record Expense</h1>
          </div>
        </div>

        {/* ── Form Card ── */}
        <div className="overflow-hidden rounded-2xl border border-border bg-background-secondary shadow-[0_18px_45px_rgba(36,21,26,0.07)] dark:border-border dark:bg-background-secondary/[0.04]">
          <div className="h-1 bg-gradient-to-r from-accent-dark via-accent to-[var(--accent)]" />
          
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
              
              {/* Title */}
              <div className="lg:col-span-2">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  <Receipt size={12} /> Expense Title *
                </label>
                <input
                  placeholder="e.g. Hair Color Products"
                  value={form.title} onChange={e => set('title', e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Category */}
              <div className="lg:col-span-1">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  <Tag size={12} /> Category *
                </label>
                <div className="relative">
                  <select value={form.category} onChange={e => set('category', e.target.value)}
                    className="w-full appearance-none rounded-xl px-4 py-3 pr-9 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                </div>
                {selectedMeta && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${selectedMeta.color}cc, ${selectedMeta.color})` }}>
                    {form.category}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="lg:col-span-1">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  <Wallet size={12} /> Amount (₹) *
                </label>
                <input type="number" placeholder="0"
                  value={form.amount} onChange={e => set('amount', e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Date */}
              <div className="lg:col-span-1">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  <CalendarDays size={12} /> Date *
                </label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Payment Method */}
              <div className="lg:col-span-1">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  <CreditCard size={12} /> Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {PAYMENT_METHODS.map(m => (
                    <button type="button" key={m} onClick={() => set('paymentMethod', m)}
                      className="rounded-xl py-2.5 text-xs font-semibold transition"
                      style={form.paymentMethod === m
                        ? { background: 'linear-gradient(135deg,var(--accent-dark),var(--accent))', color: '#fff', boxShadow: '0 4px 12px rgba(111,90,163,0.3)' }
                        : { border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="lg:col-span-2">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  <FileText size={12} /> Notes (optional)
                </label>
                <textarea rows={3} placeholder="Any additional details..."
                  value={form.notes} onChange={e => set('notes', e.target.value)}
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Receipt Image */}
              <div className="lg:col-span-1">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  <ImageIcon size={12} /> Receipt / Bill Image (optional)
                </label>
                <div className="mt-1 flex justify-start">
                  <div className="w-full max-w-[160px]">
                    <ImageCapture 
                      onImageChange={(file) => setForm(f => ({ ...f, image: file }))} 
                      value={form.image}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button type="button" onClick={() => router.push('/expense')}
                className="flex-1 rounded-xl py-3.5 text-sm font-semibold transition"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                Cancel
              </button>
              <button type="submit" disabled={!isValid}
                className="flex-1 rounded-xl py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(111,90,163,0.35)] transition hover:opacity-90 disabled:opacity-40 disabled:shadow-none"
                style={{ background: 'linear-gradient(135deg,var(--accent-dark),var(--accent))' }}>
                Save Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
