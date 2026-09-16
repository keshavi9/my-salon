'use client'

import { useState, useEffect } from 'react'
import { Trash2, DollarSign, CreditCard, Smartphone, Wallet, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCurrency } from '@/utils/helpers'
import api from '@/lib/api'
import type { Service, Staff } from '@/types'

export default function POSPage() {
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [selectedServices, setSelectedServices] = useState<Array<{ service: Service; quantity: number }>>([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'wallet'>('cash')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('All')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [servicesRes, staffRes] = await Promise.all([
        api.get('/services?isActive=true'),
        api.get('/staff?isActive=true'),
      ])
      // Prices are stored in paise — convert to rupees for display
      const rawServices: Service[] = servicesRes.data.data || servicesRes.data || []
      const normalised = rawServices.map(s => ({ ...s, price: s.price >= 100 ? s.price / 100 : s.price }))
      setServices(normalised)
      setStaff(staffRes.data.data || staffRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const addService = (service: Service) => {
    const existing = selectedServices.find(s => s.service.id === service.id)
    if (existing) {
      setSelectedServices(selectedServices.map(s =>
        s.service.id === service.id ? { ...s, quantity: s.quantity + 1 } : s
      ))
    } else {
      setSelectedServices([...selectedServices, { service, quantity: 1 }])
    }
  }

  const removeService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(s => s.service.id !== serviceId))
  }

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity < 1) return
    setSelectedServices(selectedServices.map(s =>
      s.service.id === serviceId ? { ...s, quantity } : s
    ))
  }

  const subtotal = selectedServices.reduce((sum, item) => sum + (item.service.price * item.quantity), 0)
  const discountAmount = (subtotal * discount) / 100
  const total = subtotal - discountAmount

  // Unique categories for filter tabs
  const categories = ['All', ...Array.from(new Set(services.map(s => s.category)))]
  const filteredServices = categoryFilter === 'All'
    ? services
    : services.filter(s => s.category === categoryFilter)

  const handleCheckout = async (isPayLater = false) => {
    if (loading) return
    
    if (!customerName || !customerPhone || selectedServices.length === 0) {
      alert('Please fill customer details and select at least one service')
      return
    }

    if (!isPayLater && !selectedStaff) {
      alert('Please assign a staff member to complete billing')
      return
    }

    setLoading(true)
    try {
      // Step 1: resolve or create the customer to get a valid UUID
      let customerId: string
      const searchRes = await api.get(`/customers?search=${customerPhone}`)
      const existingCustomer = searchRes.data.data?.[0]
      if (existingCustomer) {
        customerId = existingCustomer.id
      } else {
        const createRes = await api.post('/customers', { name: customerName, phone: customerPhone })
        customerId = createRes.data.data.id
      }

      // Step 2: create the booking with the resolved customerId
      await api.post('/bookings', {
        customerId,
        staffId: selectedStaff || null,
        services: selectedServices.map(s => ({
          serviceId: s.service.id,
          serviceName: s.service.name,
          price: s.service.price,
          duration: s.service.duration,
          quantity: s.quantity,
        })),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        totalAmount: total,
        paidAmount: isPayLater ? 0 : total,
        paymentStatus: isPayLater ? 'unpaid' : 'paid',
        paymentMethod: isPayLater ? 'cash' : paymentMethod,
        paymentModel: 'Post-Paid',
        status: isPayLater ? 'confirmed' : 'completed',
      })

      alert(isPayLater ? 'Booking recorded! Collect payment after service.' : 'Billing completed successfully!')
      resetForm()
    } catch (error: any) {
      console.error('Failed to complete billing:', error)
      alert(error?.response?.data?.message || 'Failed to complete billing')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedServices([])
    setCustomerName('')
    setCustomerPhone('')
    setSelectedStaff('')
    setDiscount(0)
    setPaymentMethod('cash')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary">POS Billing</h1>
        <p className="text-text-secondary dark:text-text-secondary mt-1">Quick billing for walk-in customers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* Customer Details */}
          <Card>
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary mb-4">Customer Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Customer Name" value={customerName}
                onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter name" required />
              <Input label="Phone Number" type="tel" value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Enter phone" required />
            </div>
          </Card>

          {/* Select Services */}
          <Card>
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary mb-4">Select Services</h2>

            {/* Category filter tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: categoryFilter === cat ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: categoryFilter === cat ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${categoryFilter === cat ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                  {cat}
                </button>
              ))}
            </div>

            {filteredServices.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <AlertCircle size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-semibold">No services found</p>
                <p className="text-xs mt-1">Add services from the Services section</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredServices.map((service) => {
                  const inCart = selectedServices.some(s => s.service.id === service.id)
                  return (
                    <button key={service.id} onClick={() => addService(service)}
                      className="p-4 rounded-xl border-2 transition-all text-left"
                      style={{
                        borderColor: inCart ? 'var(--accent)' : 'var(--border)',
                        background: inCart ? 'var(--accent-light)' : 'var(--bg-secondary)',
                      }}>
                      <div className="font-semibold text-text-primary text-sm">{service.name}</div>
                      <div className="text-xs mt-0.5 font-semibold" style={{ color: 'var(--accent)' }}>{service.category}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-text-secondary flex items-center gap-1">
                          <Clock size={11} />{service.duration} min
                        </span>
                        <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                      {inCart && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                          style={{ background: 'var(--accent)' }}>
                          <CheckCircle2 size={10} /> Added
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Selected Services */}
          <Card>
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary mb-4">Selected Services</h2>
            {selectedServices.length === 0 ? (
              <p className="text-text-secondary text-center py-8">No services selected</p>
            ) : (
              <div className="space-y-3">
                {selectedServices.map((item) => (
                  <div key={item.service.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-background dark:bg-background-secondary">
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary">{item.service.name}</div>
                      <div className="text-sm text-text-secondary">{formatCurrency(item.service.price)} × {item.quantity}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg border border-border bg-background-secondary hover:bg-hover flex items-center justify-center">-</button>
                        <span className="w-8 text-center font-semibold text-text-primary">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg border border-border bg-background-secondary hover:bg-hover flex items-center justify-center">+</button>
                      </div>
                      <div className="font-semibold text-text-primary w-24 text-right">
                        {formatCurrency(item.service.price * item.quantity)}
                      </div>
                      <button onClick={() => removeService(item.service.id)}
                        className="w-8 h-8 rounded-lg hover:bg-danger-bg flex items-center justify-center">
                        <Trash2 size={16} className="text-danger-text" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">

          {/* Assign Staff */}
          <Card>
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary mb-4">Assign Staff</h2>
            <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-violet-500"
              required>
              <option value="">Select staff member</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>{member.name} - {member.role}</option>
              ))}
            </select>
            {staff.length === 0 && (
              <p className="text-xs text-warning-text mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> No staff found. Add staff first.
              </p>
            )}
          </Card>

          {/* Payment Method */}
          <Card>
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary mb-4">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'cash',   label: 'Cash',   icon: DollarSign },
                { value: 'card',   label: 'Card',   icon: CreditCard },
                { value: 'upi',    label: 'UPI',    icon: Smartphone },
                { value: 'wallet', label: 'Wallet', icon: Wallet },
              ].map((method) => (
                <button key={method.value} onClick={() => setPaymentMethod(method.value as any)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    paymentMethod === method.value
                      ? 'border-violet-500 bg-accent-light dark:bg-violet-900/20'
                      : 'border-border hover:border-violet-400'
                  }`}>
                  <method.icon size={20} className="mx-auto mb-1 text-text-secondary" />
                  <div className="text-sm font-semibold text-text-primary">{method.label}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Bill Summary */}
          <Card>
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary mb-4">Bill Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Discount</span>
                <div className="flex items-center gap-2">
                  <input type="text" value={discount || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setDiscount(Math.max(0, Math.min(100, Number(val))));
                    }}
                    className="w-16 px-2 py-1 rounded-lg border border-border bg-background-secondary text-text-primary text-right"
                    placeholder="0" />
                  <span className="text-text-secondary">%</span>
                </div>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-danger-text">
                  <span>Discount Amount</span><span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between text-xl font-bold text-text-primary">
                  <span>Total</span><span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Pay Later tip (removed) */}

          {/* Complete Billing */}
          <Button onClick={() => handleCheckout(false)} className="w-full" size="lg" isLoading={loading}>
            Complete Billing
          </Button>

          {/* Pay Later */}
          <button type="button" onClick={() => handleCheckout(true)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition hover:bg-warning-bg disabled:cursor-not-allowed disabled:opacity-50"
            style={{ borderColor: '#D97706', color: '#B45309' }}>
            <AlertCircle size={15} /> Pay Later
          </button>

        </div>
      </div>
    </div>
  )
}
