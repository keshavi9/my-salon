'use client'

import React, { useState, useCallback } from 'react'
import {
  Phone, Scissors, Clock, UserCheck, ReceiptText,
  Plus, Minus, Trash2, CheckCircle2, AlertCircle,
  Coins, CreditCard, QrCode,
  Search, UserPlus, X, Package, Tag, Gift, Percent,
  CalendarDays, AlarmClock, RotateCcw
} from 'lucide-react'
import api from '@/lib/api'
import {
  UPI_ID, SALON_NAME,
  PACKAGES, OFFERS, PRODUCTS, PLANS,
  type CustomerRecord,
} from '@/lib/bookingData'
import { useQuery } from '@tanstack/react-query'
import { useBookingStore, type PaymentMethod, type BookingType } from '@/store/bookingStore'
import { useLocationStore } from '@/store/locationStore'
import { generateId } from '@/utils/helpers'
import toast from 'react-hot-toast'

/* time slots 10 AM - 9 PM */
const TIME_SLOTS: { value: string; label: string }[] = (() => {
  const slots: { value: string; label: string }[] = []
  for (let h = 10; h <= 21; h++) {
    for (const m of [0, 30]) {
      if (h === 21 && m === 30) break
      const hour12 = h > 12 ? h - 12 : h
      const ampm = h < 12 ? 'AM' : 'PM'
      slots.push({
        value: `${String(h).padStart(2, '0')}:${m === 0 ? '00' : '30'}`,
        label: `${hour12}:${m === 0 ? '00' : '30'} ${ampm}`,
      })
    }
  }
  return slots
})()

/* types */
type ApiService = { id: string; name: string; category: string; price: number; duration: number; isActive: boolean }
type ApiStaff = { id: string; name: string; role: string; specialization?: string[]; isActive: boolean }
type StaffAssignment = { id: string; name: string; role: 'Primary' | 'Assistant' }
type CartItem = {
  service: ApiService
  quantity: number
  staff: StaffAssignment[]
  itemType: 'service' | 'product' | 'package' | 'plan'
}
type Step = 'form' | 'done'
type ServiceTab = 'services' | 'products' | 'packages' | 'offers' | 'plans'
interface Props { mode: BookingType }

/* input style helper */
const inputCls = 'w-full rounded-xl border bg-background-secondary px-3 py-2.5 text-sm outline-none transition focus:ring-2'
const inputStyle = { borderColor: 'var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties


export default function BookingForm({ mode }: Props) {
  const { addBooking } = useBookingStore()
  const { branchId } = useLocationStore()

  // Fetch live services and staff from API
  const { data: apiServices = [] } = useQuery<ApiService[]>({
    queryKey: ['services', 'active'],
    queryFn: async () => {
      const res = await api.get('/services?isActive=true')
      return res.data.data ?? []
    }
  })
  const { data: apiStaff = [] } = useQuery<ApiStaff[]>({
    queryKey: ['staff', 'active'],
    queryFn: async () => {
      const res = await api.get('/staff?isActive=true')
      return res.data.data ?? []
    }
  })

  // API-based customer search state
  const [apiCustomers, setApiCustomers] = useState<CustomerRecord[]>([])

  /* step & loading */
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  /* ── customer search ── */
  const [phone, setPhone] = useState('')
  const [searchName, setSearchName] = useState('')
  const [serviceSearch, setServiceSearch] = useState('')
  const [customer, setCustomer] = useState<CustomerRecord | null>(null)

  /* phone-match dropdown — now sourced from API results */
  const phoneMatches: CustomerRecord[] = apiCustomers
  const exactInDB = apiCustomers.find(c => c.phone === phone || c.name.toLowerCase() === searchName.toLowerCase()) ?? null
  const showAddBtn = ((phone.length === 10) || (searchName.length >= 3)) && !exactInDB && !customer

  /* ── add-customer modal ── */
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDob, setNewDob] = useState('')
  const [newGender, setNewGender] = useState<'male' | 'female' | 'other' | ''>('')
  const [modalErr, setModalErr] = useState('')
  const [saving, setSaving] = useState(false)

  /* ── appointment fields ── */
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  /* ── cart ── */
  const [cart, setCart] = useState<CartItem[]>([])
  const [serviceTab, setServiceTab] = useState<ServiceTab>('services')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [bookingId, setBookingId] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountPct, setDiscountPct] = useState(0)

  /* ── derived totals ── */
  const subtotal = cart.reduce((s, i) => s + i.service.price * i.quantity, 0)
  const discountAmount = discountApplied ? Math.round(subtotal * discountPct / 100) : 0
  const taxableAmount = subtotal - discountAmount
  const cgst = Math.round(taxableAmount * 0.09)
  const sgst = Math.round(taxableAmount * 0.09)
  const taxAmount = cgst + sgst
  const total = taxableAmount + taxAmount
  const totalDuration = cart.reduce((s, i) => s + i.service.duration * i.quantity, 0)
  const staffRequiredItems = cart.filter(i => i.itemType === 'service')
  const allAssigned = staffRequiredItems.length === 0 || staffRequiredItems.every(i => i.staff.length > 0)

  /* HANDLERS */

  const handlePhoneChange = async (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 10)
    setPhone(digits)
    if (customer && customer.phone !== digits) setCustomer(null)
    if (digits.length >= 3) {
      try {
        const res = await api.get(`/customers?search=${digits}`)
        setApiCustomers(res.data.data ?? [])
      } catch { setApiCustomers([]) }
    } else {
      setApiCustomers([])
    }
  }

  const selectCustomer = (c: CustomerRecord) => {
    setCustomer(c)
    setPhone(c.phone)
    setSearchName(c.name)
  }

  /* save new customer — API only */
  const handleSaveNewCustomer = async () => {
    if (!newName.trim()) { setModalErr('Name is required.'); return }
    if (phone.length !== 10) { setModalErr('Enter a valid 10-digit phone number.'); return }
    setSaving(true)
    setModalErr('')
    try {
      const res = await api.post('/customers', {
        name: newName.trim(),
        phone,
        gender: newGender || undefined,
        dateOfBirth: newDob || undefined,
      })
      const saved: CustomerRecord = {
        id: res.data.data?.id ?? generateId(),
        name: res.data.data?.name ?? newName.trim(),
        phone: res.data.data?.phone ?? phone,
        gender: res.data.data?.gender,
        dob: res.data.data?.dateOfBirth,
      }
      setApiCustomers(prev => [saved, ...prev])
      selectCustomer(saved)
    } catch (err: unknown) {
      const axiosMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? ''
      if (axiosMsg.toLowerCase().includes('unique') || axiosMsg.toLowerCase().includes('duplicate')) {
        setModalErr('This phone number is already registered.')
      } else {
        setModalErr(axiosMsg || 'Failed to save customer. Please try again.')
      }
    }
    setSaving(false)
    setShowModal(false)
    setNewName(''); setNewDob(''); setNewGender(''); setModalErr('')
  }

  /* cart helpers */
  const addService = useCallback((svc: ApiService, type: CartItem['itemType'] = 'service') => {
    setCart(prev =>
      prev.some(i => i.service.id === svc.id) ? prev
        : [...prev, { service: svc, quantity: 1, staff: [], itemType: type }]
    )
  }, [])

  const addPackage = (pkg: (typeof PACKAGES)[0]) => {
    const synth: ApiService = { id: pkg.id, name: pkg.name, category: 'Package', price: pkg.price, duration: 60, isActive: true }
    setCart(prev =>
      prev.some(i => i.service.id === synth.id) ? prev
        : [...prev, { service: synth, quantity: 1, staff: [], itemType: 'package' as const }]
    )
  }

  const applyOffer = (offer: (typeof OFFERS)[0]) => {
    setDiscountCode(offer.code); setDiscountPct(offer.discount); setDiscountApplied(true)
  }

  const removeDiscount = () => { setDiscountApplied(false); setDiscountPct(0); setDiscountCode('') }

  const applyDiscountCode = () => {
    const map: Record<string, number> = { SAVE10: 10, SALON20: 20, FLAT15: 15 }
    const pct = map[discountCode.toUpperCase()]
    if (pct) { setDiscountPct(pct); setDiscountApplied(true) }
    else alert('Invalid discount code.')
  }

  const updateQty = useCallback((id: string, delta: number) =>
    setCart(prev => prev.map(i => i.service.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
    , [])

  const removeItem = useCallback((id: string) =>
    setCart(prev => prev.filter(i => i.service.id !== id))
    , [])

  const assignStaff = useCallback((idx: number, s: ApiStaff) =>
    setCart(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const existing = item.staff.find(st => st.id === s.id);
      if (existing) {
        const newStaff = item.staff.filter(st => st.id !== s.id);
        if (newStaff.length > 0 && !newStaff.some(st => st.role === 'Primary')) newStaff[0].role = 'Primary';
        return { ...item, staff: newStaff };
      } else {
        const role = item.staff.length === 0 ? 'Primary' : 'Assistant';
        return { ...item, staff: [...item.staff, { id: s.id, name: s.name, role }] };
      }
    }))
    , [])

  /* validation — full (requires staff assignment) */
  const validate = () => {
    if (!customer) return 'Search and select a customer first.'
    if (cart.length === 0) return 'Add at least one service or product.'
    if (!allAssigned) return 'Assign a staff member to every item.'
    if (mode === 'appointment') {
      if (!date) return 'Select appointment date.'
      if (!time) return 'Select appointment time.'
    }
    return null
  }

  /* validation — relaxed for Pay Later (staff assignment optional) */
  const validatePayLater = () => {
    if (!customer) return 'Search and select a customer first.'
    if (cart.length === 0) return 'Add at least one service or product.'
    if (mode === 'appointment') {
      if (!date) return 'Select appointment date.'
      if (!time) return 'Select appointment time.'
    }
    return null
  }

  const handleCheckIn = async () => {
    if (loading) return
    const err = validate()
    if (err) { toast.error(err); return }
    if (!customer) return
    setLoading(true)
    try {
      const res = await api.post('/bookings', {
        customerId: customer.id,
        staffId: cart.find(i => i.staff.length > 0)?.staff[0]?.id,
        services: cart.map(i => ({
          serviceId: i.service.id, serviceName: i.service.name,
          price: i.service.price, duration: i.service.duration, quantity: i.quantity,
          staffIds: i.staff.map(st => st.id),
        })),
        date: mode === 'appointment' ? date : new Date().toISOString().split('T')[0],
        time: mode === 'appointment' ? time : new Date().toTimeString().split(' ')[0].substring(0, 5),
        totalAmount: total,
        paidAmount: total,
        paymentStatus: 'paid',
        paymentMethod,
        status: 'completed',
        notes: discountApplied ? `Discount: ${discountCode} (${discountPct}%)` : undefined,
      })
      const id = res.data.data?.id ?? generateId()
      setBookingId(id)
      addBooking({
        id,
        type: mode,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        customerGender: customer.gender as 'male' | 'female' | 'other' | undefined,
        services: cart.map(i => ({
          id: i.service.id, name: i.service.name, price: i.service.price,
          duration: i.service.duration, quantity: i.quantity,
          staffId: i.staff[0]?.id, staffName: i.staff[0]?.name, staffIds: i.staff.map(st => st.id)
        })),
        totalAmount: subtotal,
        discountCode: discountApplied ? discountCode.toUpperCase() : undefined,
        discountAmount, taxAmount, finalAmount: total, totalDuration,
        paymentMethod, paymentStatus: 'paid', status: 'completed',
        ...(mode === 'appointment' && { date, time }),
        branchId,
        createdAt: new Date().toISOString(),
      })
      setStep('done')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save booking')
    } finally {
      setLoading(false)
    }
  }

  /* Pay Later — book without payment (staff optional) */
  const handlePayLater = () => {
    if (loading) return
    const err = validatePayLater()
    if (err) { toast.error(err); return }
    const id = generateId()
    setBookingId(id)
    if (!customer) return
    setLoading(true)
    try {
      addBooking({
        id,
        type: mode,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        customerGender: customer.gender as 'male' | 'female' | 'other' | undefined,
        services: cart.map(i => ({
          id: i.service.id, name: i.service.name, price: i.service.price,
          duration: i.service.duration, quantity: i.quantity,
          staffId: i.staff[0]?.id, staffName: i.staff[0]?.name, staffIds: i.staff.map(st => st.id)
        })),
        totalAmount: subtotal,
        discountCode: discountApplied ? discountCode.toUpperCase() : undefined,
        discountAmount, taxAmount, finalAmount: total, totalDuration,
        paymentMethod: 'pay-later',
        paymentStatus: 'unpaid',
        status: 'completed',
        ...(mode === 'appointment' && { date, time }),
        branchId,
        createdAt: new Date().toISOString(),
      })
      setStep('done')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = () => { }

  const handleReset = () => {
    setStep('form'); setPhone(''); setCustomer(null)
    setDate(''); setTime(''); setCart([])
    setPaymentMethod('cash'); setBookingId('')
    setDiscountCode(''); setDiscountApplied(false); setDiscountPct(0); setServiceTab('services')
    setShowCancelModal(false)
  }

  /* STEP: DONE */
  if (step === 'done') return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-xl border border-border bg-background-secondary py-14 px-8 text-center dark:bg-background">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-bg ring-4 ring-green-100">
        <CheckCircle2 size={24} className="text-success-text" />
      </div>
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Booking Confirmed</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {customer?.name} &middot; +91 {customer?.phone} &middot; ₹ {total}
        </p>
        {paymentMethod === 'pay-later'
          ? <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-warning-border bg-warning-bg px-3 py-1 text-xs font-semibold text-warning-text"><AlertCircle size={12} /> Payment Pending — Collect after service</span>
          : <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-success-border bg-success-bg px-3 py-1 text-xs font-semibold text-success-text"><CheckCircle2 size={12} /> Paid via {paymentMethod.toUpperCase()}</span>
        }
      </div>
      <div className="mt-2 w-full max-w-sm rounded-xl border border-border bg-background-secondary p-4 text-left space-y-1">
        {cart.map(i => (
          <div key={i.service.id} className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>{i.service.name} x{i.quantity}</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹ {i.service.price * i.quantity}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
          <span>Total Paid</span>
          <span style={{ color: 'var(--accent)' }}>₹ {total}</span>
        </div>
      </div>
      <button onClick={handleReset} className="mt-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white" style={{ background: 'var(--accent)' }}>
        New Booking
      </button>
    </div>
  )

  /* STEP: FORM */
  return (
    <>
      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background-secondary/50 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-background-secondary shadow-2xl dark:bg-background">
              <div className="h-1 rounded-t-2xl" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))' }} />
              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Add New Customer</h3>
                  <button onClick={() => { setShowModal(false); setModalErr('') }}
                    className="rounded-lg p-1 transition hover:bg-hover" style={{ color: 'var(--text-secondary)' }}>
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* phone */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Phone Number</label>
                    <input value={phone} onChange={e => handlePhoneChange(e.target.value)} className={inputCls} style={inputStyle} />
                  </div>

                  {/* name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Full Name *</label>
                    <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Customer name"
                      className={inputCls} style={inputStyle} />
                  </div>

                  {/* dob */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Date of Birth</label>
                    <input type="date" value={newDob} onChange={e => setNewDob(e.target.value)}
                      className={inputCls} style={inputStyle} />
                  </div>

                  {/* gender */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Gender</label>
                    <div className="flex gap-2">
                      {(['male', 'female', 'other'] as const).map(g => (
                        <button key={g} type="button" onClick={() => setNewGender(g)}
                          className="flex-1 rounded-xl border py-2 text-xs font-semibold capitalize transition"
                          style={{
                            borderColor: newGender === g ? 'var(--accent)' : 'var(--border)',
                            background: newGender === g ? 'var(--accent)' : 'var(--bg-secondary)',
                            color: newGender === g ? 'var(--bg-secondary)' : 'var(--text-primary)',
                          }}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {modalErr && (
                    <div className="flex items-center gap-2 rounded-xl border border-danger-border bg-danger-bg px-3 py-2 text-xs font-semibold text-danger-text dark:border-danger-border dark:bg-danger-bg">
                      <AlertCircle size={13} /> {modalErr}
                    </div>
                  )}

                  <button onClick={handleSaveNewCustomer} disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'var(--accent)' }}>
                    <UserPlus size={15} /> {saving ? 'Saving…' : 'Save Customer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
            <div className="space-y-5">

              {/* Customer Search */}
              <section className="rounded-2xl border border-border bg-background-secondary p-5 dark:bg-background">
                <div className="mb-4 flex items-center gap-2">
                  <Search size={17} style={{ color: 'var(--accent)' }} />
                  <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Find Customer</h2>
                </div>

                {/* phone and name search input */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      <Phone size={13} /><span>+91</span>
                      <span className="h-3.5 w-px ml-1" style={{ background: 'var(--border)' }} />
                    </div>
                    <input
                      value={phone}
                      onChange={e => handlePhoneChange(e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full rounded-xl border bg-background-secondary py-2.5 pl-16 pr-3 text-sm outline-none transition focus:ring-2"
                      style={{ borderColor: customer ? 'var(--accent)' : 'var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                    />
                  </div>
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      <UserPlus size={13} />
                      <span className="h-3.5 w-px ml-1" style={{ background: 'var(--border)' }} />
                    </div>
                    <input
                      value={searchName}
                      onChange={e => setSearchName(e.target.value)}
                      placeholder="Search by name"
                      className="w-full rounded-xl border bg-background-secondary py-2.5 pl-10 pr-8 text-sm outline-none transition focus:ring-2"
                      style={{ borderColor: customer ? 'var(--accent)' : 'var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                    />
                    {customer && (
                      <button onClick={() => { setCustomer(null); setPhone(''); setSearchName('') }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-0.5 hover:bg-hover"
                        style={{ color: 'var(--text-secondary)' }}>
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* dropdown matches */}
                {!customer && phoneMatches.length > 0 && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-border bg-background-secondary shadow-lg dark:bg-background-secondary">
                    {phoneMatches.map(c => (
                      <button key={c.id} onClick={() => selectCustomer(c)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-hover">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ background: 'var(--accent)' }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.phone}{c.gender ? ` · ${c.gender}` : ''}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* add customer button */}
                {showAddBtn && (
                  <button onClick={() => setShowModal(true)}
                    className="mt-3 flex items-center gap-2 rounded-xl border border-dashed px-4 py-2.5 text-sm font-semibold transition hover:bg-hover"
                    style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                    <UserPlus size={15} /> No customer found — Add New Customer
                  </button>
                )}

                {/* selected customer card */}
                {customer && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border p-3"
                    style={{ borderColor: 'var(--accent)', background: 'var(--accent-light)' }}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: 'var(--accent)' }}>
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{customer.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        +91 {customer.phone}{customer.gender ? ` · ${customer.gender}` : ''}{customer.dob ? ` · DOB: ${customer.dob}` : ''}
                      </p>
                    </div>
                    <CheckCircle2 size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  </div>
                )}
              </section>

              {/* Appointment date/time - appointment mode only */}
              {mode === 'appointment' && (
                <section className="rounded-2xl border border-border bg-background-secondary p-5 dark:bg-background">
                  <div className="mb-4 flex items-center gap-2">
                    <CalendarDays size={17} style={{ color: 'var(--accent)' }} />
                    <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Schedule</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Date *</label>
                      <div className="relative">
                        <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
                        <input type="date" value={date} min={new Date().toISOString().split('T')[0]}
                          onChange={e => setDate(e.target.value)}
                          className="w-full rounded-xl border bg-background-secondary py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties} />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Time *</label>
                      <div className="relative">
                        <AlarmClock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
                        <select value={time} onChange={e => setTime(e.target.value)}
                          className="w-full appearance-none rounded-xl border bg-background-secondary py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2"
                          style={{ borderColor: 'var(--border)', color: time ? 'var(--text-primary)' : 'var(--text-secondary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}>
                          <option value="">Select time</option>
                          {TIME_SLOTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Add to Booking tabs */}
              <section className="rounded-2xl border border-border bg-background-secondary p-5 dark:bg-background">
                <div className="mb-4 flex items-center gap-2">
                  <Scissors size={17} style={{ color: 'var(--accent)' }} />
                  <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Add to Booking</h2>
                </div>

                {/* tab bar */}
                <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-border bg-background-secondary p-1">
                  {([
                    { key: 'services', label: 'Services', icon: <Scissors size={13} /> },
                    { key: 'products', label: 'Products', icon: <Package size={13} /> },
                    { key: 'packages', label: 'Packages', icon: <Gift size={13} /> },
                    ...(mode === 'walkin' ? [] : [{ key: 'offers' as ServiceTab, label: 'Offers', icon: <Percent size={13} /> }]),
                    { key: 'plans', label: 'Plans', icon: <Tag size={13} /> },
                  ] as { key: ServiceTab; label: string; icon: React.ReactNode }[]).map(({ key, label, icon }) => (
                    <button key={key} onClick={() => setServiceTab(key)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition"
                      style={{ background: serviceTab === key ? 'var(--accent)' : 'transparent', color: serviceTab === key ? 'var(--bg-secondary)' : 'var(--text-secondary)' }}>
                      {icon}{label}
                    </button>
                  ))}
                </div>

                {/* SERVICES */}
                {serviceTab === 'services' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
                      <input
                        type="text"
                        placeholder="Search services..."
                        value={serviceSearch}
                        onChange={e => setServiceSearch(e.target.value)}
                        className="w-full rounded-xl border bg-background-secondary py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                      />
                    </div>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      {apiServices.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase())).map(svc => {
                        const inCart = cart.some(i => i.service.id === svc.id)
                        // price is stored in paise, convert to rupees for display
                        const displayPrice = svc.price >= 100 ? svc.price / 100 : svc.price
                        return (
                          <button key={svc.id} onClick={() => addService({ ...svc, price: displayPrice }, 'service')}
                            className="rounded-xl border p-4 text-left transition"
                            style={{ borderColor: inCart ? 'var(--accent)' : 'var(--border)', background: inCart ? 'var(--accent-light)' : 'var(--bg-secondary)' }}>
                            <div className="flex flex-col items-start gap-1">
                              <span className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{svc.name}</span>
                              <span className="block text-xs font-semibold" style={{ color: 'var(--accent)' }}>{svc.category}</span>
                              <span className="mt-1 flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                <Clock size={12} />{svc.duration} min
                              </span>
                              <span className="mt-1 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>₹ {displayPrice}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* PRODUCTS */}
                {serviceTab === 'products' && (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                    {PRODUCTS.map(prod => {
                      const inCart = cart.some(i => i.service.id === prod.id)
                      return (
                        <button key={prod.id}
                          onClick={() => addService({ id: prod.id, name: prod.name, category: prod.category, price: prod.price, duration: 0, isActive: true }, 'product')}
                          className="rounded-xl border p-4 text-left transition"
                          style={{ borderColor: inCart ? 'var(--accent)' : 'var(--border)', background: inCart ? 'var(--accent-light)' : 'var(--bg-secondary)' }}>
                          <div className="flex flex-col items-start gap-1">
                            <span className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{prod.name}</span>
                            <span className="block text-xs font-semibold" style={{ color: 'var(--accent)' }}>{prod.category}</span>
                            <span className="mt-1 block text-xs" style={{ color: 'var(--text-secondary)' }}>{prod.note}</span>
                            <span className="mt-1 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>₹ {prod.price}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* PACKAGES */}
                {serviceTab === 'packages' && (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                    {PACKAGES.map(pkg => {
                      const inCart = cart.some(i => i.service.id === pkg.id)
                      return (
                        <button key={pkg.id} onClick={() => addPackage(pkg)}
                          className="rounded-xl border p-4 text-left transition"
                          style={{ borderColor: inCart ? 'var(--accent)' : 'var(--border)', background: inCart ? 'var(--accent-light)' : 'var(--bg-secondary)' }}>
                          <div className="flex flex-col items-start gap-1">
                            <span className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{pkg.name}</span>
                            <span className="block text-xs" style={{ color: 'var(--text-secondary)' }}>{pkg.description}</span>
                            <span className="mt-1 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>₹ {pkg.price}</span>
                          </div>
                          {inCart && <span className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: 'var(--accent)' }}><CheckCircle2 size={10} /> Added</span>}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* OFFERS */}
                {serviceTab === 'offers' && (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                    {OFFERS.map(offer => {
                      const active = discountApplied && discountCode.toUpperCase() === offer.code
                      return (
                        <button key={offer.id} onClick={() => applyOffer(offer)}
                          className="rounded-xl border p-4 text-center transition"
                          style={{ borderColor: active ? 'var(--accent)' : 'var(--border)', background: active ? 'var(--accent-light)' : 'var(--bg-secondary)' }}>
                          <span className="block text-2xl font-bold" style={{ color: 'var(--accent)' }}>{offer.label}</span>
                          <span className="mt-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Code: {offer.code}</span>
                          {active && <span className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: 'var(--accent)' }}><CheckCircle2 size={10} /> Applied</span>}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* PLANS */}
                {serviceTab === 'plans' && (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                    {PLANS.map(plan => {
                      const inCart = cart.some(i => i.service.id === plan.id)
                      return (
                        <button key={plan.id}
                          onClick={() => addService({ id: plan.id, name: plan.name, category: 'Plan', price: plan.price, duration: 0, isActive: true }, 'plan')}
                          className="rounded-xl border p-4 text-left transition"
                          style={{ borderColor: inCart ? 'var(--accent)' : 'var(--border)', background: inCart ? 'var(--accent-light)' : 'var(--bg-secondary)' }}>
                          <div className="flex flex-col items-start gap-1">
                            <span className="block text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{plan.name}</span>
                            <span className="block text-xs" style={{ color: 'var(--text-secondary)' }}>{plan.duration} days · {plan.discount}% off</span>
                            <span className="mt-1 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>₹ {plan.price}</span>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {plan.benefits.map(b => (
                              <li key={b} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                                <CheckCircle2 size={10} style={{ color: 'var(--accent)', flexShrink: 0 }} />{b}
                              </li>
                            ))}
                          </ul>
                          {inCart && <span className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: 'var(--accent)' }}><CheckCircle2 size={10} /> Added</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Assign Staff */}
              {staffRequiredItems.length > 0 && (
                <section className="rounded-2xl border border-border bg-background-secondary p-5 dark:bg-background">
                  <div className="mb-4 flex items-center gap-2">
                    <UserCheck size={17} style={{ color: 'var(--accent)' }} />
                    <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Assign Professional</h2>
                  </div>
                  <div className="space-y-3">
                    {cart.map((item, idx) => {
                      if (item.itemType !== 'service') return null;
                      return (
                        <div key={`${item.service.id}-${idx}`} className="rounded-xl border border-border bg-background-secondary p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.service.name}</p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.service.duration > 0 ? `${item.service.duration} min` : 'Product / Plan'}</p>
                            </div>
                          </div>
                          {apiStaff.length === 0 ? (
                            <div className="flex items-center gap-2 rounded-xl border border-warning-border bg-warning-bg px-3 py-3 text-xs font-semibold text-warning-text">
                              <AlertCircle size={13} /> No staff found — add staff members first, or use <em className="ml-1">Pay Later</em> to skip.
                            </div>
                          ) : (
                            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                              {apiStaff.map(s => {
                                const st = item.staff.find(x => x.id === s.id);
                                const sel = !!st;
                                const isFree = s.isActive;
                                return (
                                  <button key={s.id} onClick={() => assignStaff(idx, s)}
                                    className="relative flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition"
                                    style={{ borderColor: sel ? 'var(--accent)' : 'var(--border)', background: sel ? 'var(--accent)' : 'var(--bg-secondary)', color: sel ? 'var(--bg-secondary)' : 'var(--text-primary)' }}>
                                    <div className="relative shrink-0">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-white font-bold" style={{ background: sel ? 'rgba(255,255,255,0.2)' : 'var(--accent)' }}>
                                        {s.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${isFree ? 'bg-green-500' : 'bg-red-500'}`} style={{ borderColor: sel ? 'var(--accent)' : 'var(--bg-secondary)' }} />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="block font-bold truncate">{s.name}</span>
                                      <span className="block opacity-80 capitalize">{st ? st.role : s.role}</span>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

            </div>{/* end left column */}

            {/* Summary Sidebar */}
            <aside className="h-fit rounded-2xl border border-border bg-background-secondary p-5 dark:bg-background xl:sticky xl:top-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ReceiptText size={17} style={{ color: 'var(--accent)' }} />
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Summary</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    {mode === 'walkin' ? 'Billing' : 'Booking'}
                  </span>
                  <button onClick={() => setShowCancelModal(true)} className="flex items-center justify-center rounded-lg p-1.5 text-danger-text hover:bg-danger-bg transition" title="Cancel Booking">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
                  <Scissors size={24} className="mx-auto" style={{ color: 'var(--text-secondary)' }} />
                  <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No items added</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Pick a service to start.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                    {cart.map((item, idx) => (
                      <div key={`${item.service.id}-${idx}`} className="rounded-xl border border-border bg-background-secondary p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{item.service.name}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{item.staff.length > 0 ? item.staff.map(s => `${s.name} (${s.role})`).join(', ') : 'No staff assigned'}</p>
                          </div>
                          <button onClick={() => removeItem(item.service.id)} className="rounded-lg p-1 text-danger-text hover:bg-danger-bg shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          {item.itemType === 'service' || item.itemType === 'plan' ? (
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Qty: 1</span>
                          ) : (
                            <div className="flex items-center gap-1 rounded-lg border border-border bg-background-secondary p-1 dark:bg-background-secondary/5">
                              <button onClick={() => updateQty(item.service.id, -1)} className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-hover"><Minus size={12} /></button>
                              <span className="w-6 text-center text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.quantity}</span>
                              <button onClick={() => updateQty(item.service.id, 1)} className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-hover"><Plus size={12} /></button>
                            </div>
                          )}
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>₹ {item.service.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* totals */}
                  <div className="rounded-xl p-4 text-white" style={{ background: 'var(--accent)' }}>
                    <div className="flex justify-between text-xs opacity-70"><span>Est. duration</span><span>{totalDuration} min</span></div>
                    <div className="mt-1.5 flex justify-between text-xs opacity-70"><span>Subtotal</span><span>₹ {subtotal}</span></div>
                    <div className="mt-1.5 flex items-center justify-between text-xs opacity-90">
                      <span>Discount (%)</span>
                      <div className="flex items-center gap-1 border-b border-white/40 pb-0.5">
                        <input 
                          type="text" 
                          value={discountPct || ''}
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            const num = Math.max(0, Math.min(30, Number(val)));
                            setDiscountPct(num);
                            setDiscountApplied(num > 0);
                          }}
                          className="w-8 bg-transparent text-right text-white placeholder-white/50 outline-none"
                          placeholder="0"
                        />
                        <span>%</span>
                      </div>
                    </div>
                    {discountAmount > 0 && <div className="mt-1.5 flex justify-between text-xs opacity-70"><span>Discount Amount</span><span>- ₹ {discountAmount}</span></div>}
                    <div className="mt-1.5 flex justify-between text-xs opacity-70"><span>Taxable Amount</span><span>₹ {taxableAmount}</span></div>
                    <div className="mt-1.5 flex justify-between text-xs opacity-70"><span>CGST (9%)</span><span>₹ {cgst}</span></div>
                    <div className="mt-1.5 flex justify-between text-xs opacity-70"><span>SGST (9%)</span><span>₹ {sgst}</span></div>
                    <div className="mt-1.5 flex items-end justify-between border-t border-white/20 pt-1.5">
                      <span className="text-sm opacity-70">Total</span>
                      <span className="text-2xl font-bold">₹ {total}</span>
                    </div>
                  </div>

                  {/* payment method — walk-in only */}
                  {mode === 'walkin' && (
                    <div>
                      <p className="mb-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Payment method</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(['cash', 'card', 'upi'] as PaymentMethod[]).map(m => (
                          <button key={m} type="button" onClick={() => setPaymentMethod(m)}
                            className="flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-bold transition"
                            style={{ background: paymentMethod === m ? 'var(--accent)' : 'var(--bg-secondary)', borderColor: paymentMethod === m ? 'var(--accent)' : 'var(--border)', color: paymentMethod === m ? 'var(--bg-secondary)' : 'var(--text-primary)' }}>
                            {m === 'cash' && <Coins size={15} />}{m === 'card' && <CreditCard size={15} />}{m === 'upi' && <QrCode size={15} />}
                            {m === 'cash' ? 'Cash' : m === 'card' ? 'Card' : 'UPI'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* inline UPI QR — walk-in only */}
                  {mode === 'walkin' && paymentMethod === 'upi' && subtotal > 0 && (() => {
                    const upiInline = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(SALON_NAME)}&am=${total}&cu=INR`
                    return (
                      <div className="overflow-hidden rounded-2xl border border-border">
                        <div className="flex items-center justify-between px-4 py-3" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
                          <div><p className="text-[10px] font-semibold text-white/70">Scan &amp; Pay</p><p className="text-xl font-bold text-white">₹ {total}</p></div>
                          <QrCode size={26} className="text-white/80" />
                        </div>
                        <div className="bg-background-secondary p-4 text-center dark:bg-background-secondary">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&bgcolor=ffffff&color=3B0764&data=${encodeURIComponent(upiInline)}`} alt="UPI QR" width={180} height={180} className="mx-auto rounded-xl" />
                          <p className="mt-2 text-xs font-bold" style={{ color: 'var(--accent)' }}>{UPI_ID}</p>
                        </div>
                      </div>
                    )
                  })()}

                  {!allAssigned && (
                    <div className="flex items-center gap-2 rounded-xl border border-warning-border bg-warning-bg p-3 text-xs font-semibold text-warning-text dark:border-warning-border dark:bg-warning-bg dark:text-amber-300">
                      <AlertCircle size={14} /> Assign staff to all items.
                    </div>
                  )}

                  {/* Walk-in: Complete Billing + Pay Later */}
                  {mode === 'walkin' && (
                    <div className="space-y-2">
                      <button type="button" onClick={handleCheckIn}
                        disabled={loading || !!validate()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ background: 'var(--accent)' }}>
                        <CheckCircle2 size={16} /> Complete Billing
                      </button>
                      <button type="button" onClick={handlePayLater}
                        disabled={loading || !!validatePayLater()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition hover:bg-warning-bg disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ borderColor: 'var(--warning, #D97706)', color: '#B45309' }}>
                        <AlertCircle size={15} /> Pay Later
                      </button>
                    </div>
                  )}

                  {/* Appointment: Confirm Booking (pay now) + Pay Later */}
                  {mode === 'appointment' && (
                    <div className="space-y-2">
                      <button type="button" onClick={handleCheckIn}
                        disabled={loading || !!validate()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ background: 'var(--accent)' }}>
                        <CheckCircle2 size={15} /> Confirm Booking
                      </button>
                      <button type="button" onClick={handlePayLater}
                        disabled={loading || !!validatePayLater()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition hover:bg-warning-bg disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ borderColor: 'var(--warning, #D97706)', color: '#B45309' }}>
                        <AlertCircle size={15} /> Pay Later
                      </button>
                    </div>
                  )}
                </div>
              )}
            </aside>
          </div>

          {/* Cancel Booking Modal */}
          {showCancelModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-background-secondary/50 backdrop-blur-sm">
              <div className="flex min-h-full items-center justify-center p-4">
                <div className="w-full max-w-sm rounded-2xl border border-border bg-background-secondary p-6 shadow-2xl dark:bg-background">
                  <h3 className="text-lg font-bold mb-2 text-danger-text">Cancel Booking?</h3>
                  <p className="text-sm text-text-secondary mb-5">
                    Are you sure you want to cancel this booking? All selected services, assigned staff, and customer data will be cleared.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowCancelModal(false)} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-text-primary transition hover:bg-hover">
                      Go Back
                    </button>
                    <button onClick={handleReset} className="flex-1 rounded-xl bg-danger-bg py-2.5 text-sm font-bold text-danger-text transition hover:opacity-90 border border-danger-border">
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )
}
