'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings, Save, Building, Clock, DollarSign, Bell, CheckCircle2, ChevronRight, MessageCircle, List } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    salon: {
      name: 'Hair Ahmedabad',
      address: '123 MG Road, Ahmedabad, Gujarat 380001',
      phone: '+91 79 1234 5678',
      email: 'info@hairahmedabad.com',
      gst: '24XXXXX1234X1ZX',
      logo: ''
    },
    business: {
      openTime: '09:00',
      closeTime: '20:00',
      slotDuration: 30,
      currency: 'INR',
      taxRate: 18,
      timezone: 'Asia/Kolkata'
    },
    loyalty: {
      enabled: true,
      pointsPerRupee: 1,
      pointsValue: 1,
      minRedemption: 100
    },
    notifications: {
      whatsappEnabled: true,
      emailEnabled: false,
      smsEnabled: false,
      reminderHours: 24
    },
    booking: {
      advanceBookingDays: 30,
      cancellationHours: 24,
      allowOnlineBooking: true,
      requireDeposit: false,
      depositAmount: 0
    }
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-danger" />
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
          style={{ background: '#6F5AA3' }}
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-success-text bg-success-bg border border-success-border dark:bg-success-bg dark:border-emerald-900/50 dark:text-success-text">
          <CheckCircle2 size={16} /> Settings saved successfully.
        </div>
      )}

      {/* Salon Information */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Building size={16} className="text-danger" />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Salon Information</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Salon Name</label>
            <input
              type="text"
              value={settings.salon.name}
              onChange={e => setSettings({ ...settings, salon: { ...settings.salon, name: e.target.value } })}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>GST Number</label>
            <input
              type="text"
              value={settings.salon.gst}
              onChange={e => setSettings({ ...settings, salon: { ...settings.salon, gst: e.target.value } })}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Address</label>
            <textarea
              value={settings.salon.address}
              onChange={e => setSettings({ ...settings, salon: { ...settings.salon, address: e.target.value } })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone</label>
            <input
              type="tel"
              value={settings.salon.phone}
              onChange={e => setSettings({ ...settings, salon: { ...settings.salon, phone: e.target.value } })}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input
              type="email"
              value={settings.salon.email}
              onChange={e => setSettings({ ...settings, salon: { ...settings.salon, email: e.target.value } })}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-danger" />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Business Hours &amp; Pricing</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Opening Time</label>
            <input
              type="time"
              value={settings.business.openTime}
              onChange={e => setSettings({ ...settings, business: { ...settings.business, openTime: e.target.value } })}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Closing Time</label>
            <input
              type="time"
              value={settings.business.closeTime}
              onChange={e => setSettings({ ...settings, business: { ...settings.business, closeTime: e.target.value } })}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Slot Duration (min)</label>
            <input
              type="number"
              value={settings.business.slotDuration}
              onChange={e => setSettings({ ...settings, business: { ...settings.business, slotDuration: Number(e.target.value) } })}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tax Rate (%)</label>
            <input
              type="number"
              value={settings.business.taxRate}
              onChange={e => setSettings({ ...settings, business: { ...settings.business, taxRate: Number(e.target.value) } })}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Currency</label>
            <select
              value={settings.business.currency}
              onChange={e => setSettings({ ...settings, business: { ...settings.business, currency: e.target.value } })}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loyalty Program */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-danger" />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Loyalty Program</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="loyaltyEnabled"
              checked={settings.loyalty.enabled}
              onChange={e => setSettings({ ...settings, loyalty: { ...settings.loyalty, enabled: e.target.checked } })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="loyaltyEnabled" className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Enable Loyalty Program
            </label>
          </div>
          {settings.loyalty.enabled && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Points per ₹100</label>
                <input
                  type="number"
                  value={settings.loyalty.pointsPerRupee}
                  onChange={e => setSettings({ ...settings, loyalty: { ...settings.loyalty, pointsPerRupee: Number(e.target.value) } })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Point Value (₹)</label>
                <input
                  type="number"
                  value={settings.loyalty.pointsValue}
                  onChange={e => setSettings({ ...settings, loyalty: { ...settings.loyalty, pointsValue: Number(e.target.value) } })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Min Redemption</label>
                <input
                  type="number"
                  value={settings.loyalty.minRedemption}
                  onChange={e => setSettings({ ...settings, loyalty: { ...settings.loyalty, minRedemption: Number(e.target.value) } })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications & Logs Links */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <List size={16} className="text-danger" />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Notifications & Logs</h2>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/settings/notifications" className="flex items-center justify-between p-3 rounded-xl border transition-colors hover:bg-background-secondary/5 dark:hover:bg-background-secondary/5" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10 text-danger"><Settings size={16} /></div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Notification Settings</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Configure WhatsApp, email, and push</div>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
          </Link>
          
          <Link href="/notifications" className="flex items-center justify-between p-3 rounded-xl border transition-colors hover:bg-background-secondary/5 dark:hover:bg-background-secondary/5" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-info/10 text-info"><Bell size={16} /></div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>All Notifications</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>View recent system alerts and updates</div>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
          </Link>

          <Link href="/notifications/whatsapp-logs" className="flex items-center justify-between p-3 rounded-xl border transition-colors hover:bg-background-secondary/5 dark:hover:bg-background-secondary/5" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-success/10 text-success"><MessageCircle size={16} /></div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>WhatsApp Logs</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>History of automated WhatsApp messages</div>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
          </Link>
        </div>
      </div>
    </div>
  )
}
