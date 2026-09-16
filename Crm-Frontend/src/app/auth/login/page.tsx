'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Scissors, Sparkles, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { validateEmail, sanitizeInput } from '@/utils/helpers'

const FEATURES = [
  { icon: '✂️', text: 'Smart booking & walk-in management' },
  { icon: '📊', text: 'Real-time revenue & analytics' },
  { icon: '👥', text: 'Multi-branch staff tracking' },
  { icon: '💜', text: 'Loyalty & membership programs' },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!formData.email.trim()) e.email = 'Email is required'
    else if (!validateEmail(formData.email)) e.email = 'Invalid email format'
    if (!formData.password) e.password = 'Password is required'
    else if (formData.password.length < 6) e.password = 'Minimum 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    if (!validate()) return
    try {
      await login({ email: sanitizeInput(formData.email.trim()), password: formData.password })
      router.push('/dashboard')
    } catch {}
  }

  const handleDemo = async () => {
    clearError()
    try {
      await login({ email: 'admin@hairahmedabad.com', password: 'Admin@123' })
      router.push('/dashboard')
    } catch {}
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #4A2D5E 0%, #7B4F96 45%, #9B6BB3 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--accent-light), transparent)' }} />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--accent-light), transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, var(--bg-secondary), transparent)' }} />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-background-secondary/15 backdrop-blur-sm flex items-center justify-center border border-border">
            <Scissors className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">SalonPro</h1>
            <p className="text-white/60 text-xs">Hair Ahmedabad</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 bg-background-secondary/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/15">
            <Sparkles size={12} className="text-[var(--accent-light)]" />
            <span className="text-white/80 text-xs font-medium">Premium Salon Management</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
            Run your salon<br />
            <span className="text-[var(--accent-light)]">smarter, not harder.</span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Everything you need to manage bookings, staff, inventory, and clients — all in one place.
          </p>
          <div className="space-y-3">
            {FEATURES.map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-base">{f.icon}</span>
                <span className="text-white/75 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-white/40 text-xs">© 2024 Hair Ahmedabad. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#9B6BB3,#6F4A82)' }}
            >
              <Scissors className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>SalonPro</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Hair Ahmedabad</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Welcome back
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sign in to your SalonPro account
            </p>
          </div>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: 'var(--danger)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@hairahmedabad.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Remember me</span>
              </label>
              <button type="button" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Sign In <ArrowRight size={14} />
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleDemo}
              isLoading={isLoading}
            >
              Demo Quick Login
            </Button>
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
            Demo: admin@hairahmedabad.com / Admin@123
          </p>
        </div>
      </div>
    </div>
  )
}
