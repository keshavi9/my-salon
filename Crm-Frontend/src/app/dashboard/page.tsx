'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight, CalendarCheck, Clock, DollarSign, Plus,
  Scissors, Sparkles, Users, TrendingUp, Star, Package,
  Bell, MessageSquare, MapPin, ChevronDown, MoreVertical,
  UserPlus, PackagePlus, MessageCircle, AlertCircle
} from 'lucide-react'
import { useLocationStore, BRANCHES } from '@/store/locationStore'
import api from '@/lib/api'
import { KpiCard } from '@/components/ui/KpiCard'
import { cn } from '@/utils/helpers'

const palette = {
  rose:  'var(--accent)', // violet-500
  coral: 'var(--accent)', // fuchsia-500
  sage:  'var(--success)', // emerald-500
  amber: 'var(--warning)', // amber-500
  sky:   'var(--info)', // sky-500
  plum:  '#6366f1', // indigo-500
  pink:  '#ec4899', // pink-500
}

const METRIC_META = [
  { icon: DollarSign,   color: palette.rose,  gradient: 'from-violet-500 to-fuchsia-500', href: '/analytics/transactions' },
  { icon: CalendarCheck,color: palette.sky,   gradient: 'from-sky-500 to-indigo-500', href: '/booking/adv-booking-list' },
  { icon: Users,        color: palette.sage,  gradient: 'from-emerald-500 to-teal-500', href: '/customers' },
  { icon: Sparkles,     color: palette.pink,  gradient: 'from-pink-500 to-rose-500', href: '/services' },
]

const SERVICE_META = [
  { color: palette.rose,  gradient: 'from-violet-500 to-fuchsia-500' },
  { color: palette.pink,  gradient: 'from-pink-500 to-rose-500' },
  { color: palette.sage,  gradient: 'from-emerald-500 to-teal-500' },
  { color: palette.amber, gradient: 'from-amber-400 to-orange-500' },
]

const NOTIF_COLORS: Record<string, string> = {
  booking:   palette.sky,
  inventory: palette.amber,
  review:    palette.pink,
  alert:     '#ef4444' // red-500
}

const NOTIF_ICONS: Record<string, any> = {
  booking:   CalendarCheck,
  inventory: Package,
  review:    Star,
  alert:     AlertCircle
}

const statusStyles: Record<string, string> = {
  Done:   'bg-hover text-text-secondary dark:bg-background-secondary/10 dark:text-text-secondary',
  Active: 'bg-success-bg text-success-text dark:bg-emerald-900/30 dark:text-success-text',
  Next:   'bg-info-bg text-info-text dark:bg-blue-900/30 dark:text-info-text',
  Booked: 'bg-accent-light text-accent dark:bg-purple-900/30 dark:text-purple-300',
}

const statusBorder: Record<string, string> = {
  Done:   'border-l-gray-300',
  Active: 'border-l-emerald-400',
  Next:   'border-l-blue-400',
  Booked: 'border-l-purple-400',
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function avatarColor(name: string) {
  const colors = ['var(--accent)', 'var(--accent)', 'var(--success)', 'var(--info)', 'var(--warning)', '#ec4899']
  return colors[name.charCodeAt(0) % colors.length]
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border/60 bg-background-secondary/70 backdrop-blur-xl shadow-lg dark:border-transparent dark:shadow-md dark:shadow-zinc-700/50 dark:bg-background-secondary/70 ${className}`}>
      {children}
    </section>
  )
}

function StaffLoadBar({ load, active }: { load: number; active: boolean }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className="h-2 flex-1 overflow-hidden rounded-full bg-hover dark:bg-background-secondary">
      <div className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${active ? 'from-emerald-400 to-teal-500' : 'from-amber-400 to-orange-500'}`}
        style={{ width: visible ? `${load}%` : '0%' }} />
    </div>
  )
}

function DonutChart({ services }: { services: { name: string; value: number }[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const size = 168, radius = 58, stroke = 18
  const circumference = 2 * Math.PI * radius
  let offset = 0
  
  // Find top category
  const topCategory = services.length > 0 ? services.reduce((prev, current) => (prev.value > current.value) ? prev : current) : null

  useEffect(() => {
    setVisible(false)
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.35 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [services])

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full opacity-20 blur-xl bg-violet-500/30" />
        <svg width={size} height={size} className="-rotate-90 relative">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth={stroke} />
          {services.map((s, i) => {
            const meta = SERVICE_META[i % SERVICE_META.length]
            const dash = (s.value / 100) * circumference
            const seg = (
              <circle key={s.name}
                className="transition-[stroke-dasharray,stroke-dashoffset] duration-1000 ease-out"
                cx={size/2} cy={size/2} r={radius} fill="none"
                stroke={meta.color}
                strokeDasharray={visible ? `${dash} ${circumference - dash}` : `0 ${circumference}`}
                strokeDashoffset={visible ? -offset : 0}
                strokeLinecap="round" strokeWidth={stroke}
                style={{ transitionDelay: `${i * 140}ms` }}
              />
            )
            offset += dash
            return seg
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
          {topCategory ? (
            <>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{topCategory.name.split(' ')[0]}</span>
              <span className="text-xl font-bold text-text-primary dark:text-text-primary mt-0.5">{visible ? `${topCategory.value}%` : '0%'}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-text-secondary">No Data</span>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ title, message, actionText, href }: { title: string, message: string, actionText?: string, href?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center h-full">
      <div className="h-12 w-12 rounded-full bg-hover flex items-center justify-center mb-3 dark:bg-background-secondary/50">
        <Package size={20} className="text-text-secondary opacity-50" />
      </div>
      <p className="text-sm font-bold text-text-primary mb-1">{title}</p>
      <p className="text-xs text-text-secondary mb-4 max-w-[200px] leading-relaxed">{message}</p>
      {actionText && href && (
        <Link href={href} className="text-xs font-semibold text-accent hover:underline">
          {actionText}
        </Link>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="h-32 rounded-2xl skeleton" />
      
      {/* Kpi Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => <div key={i} className="h-[88px] rounded-2xl skeleton" />)}
      </div>
      
      {/* Timeline & Staff Skeleton */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="h-[400px] rounded-2xl skeleton" />
        <div className="h-[400px] rounded-2xl skeleton" />
      </div>
      
      {/* Chart Skeleton */}
      <div className="h-[300px] rounded-2xl skeleton" />
    </div>
  )
}

export default function DashboardPage() {
  const { branchId }   = useLocationStore()
  const activeBranch   = BRANCHES.find(b => b.id === branchId) ?? BRANCHES[0]
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('Today')
  const [showQuickActions, setShowQuickActions] = useState(false)

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      try {
        // Pass dateRange to API
        // dateRange is already in correct API format: 'today', 'this-week', 'this-month'
        const res = await api.get(`/dashboard?range=${dateRange}`)
        if (res.data.success) setData(res.data.data)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [dateRange, branchId])

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  // Calculate max revenue for proportional bar chart heights
  const maxRevenue = data?.weeklyPerformance ? Math.max(...data.weeklyPerformance.map((d: any) => d.revenue), 1) : 1

  if (loading && !data) {
    return (
      <main className="min-h-full pb-6 dark:bg-transparent px-2">
        <DashboardSkeleton />
      </main>
    )
  }

  if (!data) return <div className="flex justify-center py-20 text-text-secondary">Failed to load dashboard</div>

  return (
    <main className="min-h-full space-y-6 pb-6 text-text-primary dark:bg-transparent dark:text-text-primary">

      {/* ── Header ── */}
      <div className="relative overflow-visible rounded-2xl border border-border/60 bg-background-secondary/70 backdrop-blur-xl pl-8 pr-6 py-6 shadow-md dark:border-transparent dark:shadow-md dark:shadow-zinc-700/50 dark:bg-background-secondary/70">
        {/* Left purple brand stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-violet-500 rounded-l-2xl" />
        
        {/* Subtle dot pattern background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none rounded-2xl" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-bold tracking-tight text-text-primary dark:text-text-primary">{getGreeting()}, Admin!</h1>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-0.5 text-[10px] font-semibold text-success-text dark:bg-emerald-950/30 dark:text-success-text">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
                </span>
                Live System Connected
              </div>
            </div>
            
            <div className="flex items-center flex-wrap gap-2 mt-1">
              <p className="text-sm font-medium text-text-secondary dark:text-text-secondary">
                Overview for <span className="font-bold text-accent dark:text-[var(--accent-light)]">{today}</span>
              </p>
              
              <span className="text-border hidden sm:block">|</span>
              
              {/* Global Date Filter */}
              <div className="relative">
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none bg-hover border border-border text-xs font-semibold py-1 pl-3 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer dark:bg-background-secondary dark:border-border dark:text-text-primary transition-colors hover:border-text-secondary"
                >
                  <option value="today">Today</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                  <option value="today">Custom (not supported)</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-auto relative">
            <Link href="/booking/walkin"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-dark shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
              <Plus size={16} /> New Booking
            </Link>
            
            {/* Quick Actions Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="h-11 w-11 flex items-center justify-center rounded-xl bg-background border border-border text-text-secondary transition hover:bg-hover hover:text-text-primary dark:bg-background-secondary dark:border-border/60 shadow-sm"
                aria-label="Quick Actions"
              >
                <MoreVertical size={18} />
              </button>
              
              {showQuickActions && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowQuickActions(false)} />
                  <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-background-secondary border border-border rounded-xl shadow-xl z-50 py-1.5 dark:border-border/60 dark:bg-background-secondary overflow-hidden popout-menu">
                    <Link href="/customers" className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-text-primary hover:bg-hover dark:hover:bg-background-secondary/50 transition-colors">
                      <UserPlus size={15} className="text-accent" /> Add Client
                    </Link>
                    <Link href="/inventory" className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-text-primary hover:bg-hover dark:hover:bg-background-secondary/50 transition-colors">
                      <PackagePlus size={15} className="text-warning" /> Check Inventory
                    </Link>
                    <Link href="/staff" className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-text-primary hover:bg-hover dark:hover:bg-background-secondary/50 transition-colors">
                      <MessageCircle size={15} className="text-info" /> Message Staff
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        {data.metrics.map(({ label, value }: any, i: number) => {
          const { icon: Icon, color, href } = METRIC_META[i]
          return (
            <KpiCard
              key={label}
              label={label}
              value={value}
              icon={Icon}
              color={color}
              href={href}
            />
          )
        })}
      </div>

      {/* ── Timeline + Staff ── */}
      <div className={`grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr] transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <Card className="overflow-hidden flex flex-col h-full min-h-[350px]">
          <div className="flex items-center justify-between border-b border-border px-5 py-4 dark:border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-sm">
                  <Clock size={13} className="text-white" />
                </div>
                <h2 className="text-base font-semibold text-text-primary dark:text-text-primary">Today&apos;s Timeline</h2>
              </div>
              <p className="mt-1 text-xs font-medium text-text-secondary dark:text-text-secondary">Scannable client appointments for the day</p>
            </div>
            {data.timeline.length > 0 && (
              <span className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                {data.timeline.length} visits
              </span>
            )}
          </div>
          <div className="divide-y divide-border dark:divide-white/10 flex-1 overflow-y-auto">
            {data.timeline.length > 0 ? data.timeline.map((item: any) => (
              <div key={`${item.time}-${item.client}`}
                className={`grid gap-3 border-l-4 px-5 py-4 transition hover:bg-background dark:hover:bg-background-secondary/[0.04] sm:grid-cols-[4.5rem_1fr_auto] sm:items-center ${statusBorder[item.status] ?? 'border-l-transparent'}`}>
                <div className="text-sm font-bold text-[#24151A] dark:text-text-primary">{item.time}</div>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm sm:flex"
                    style={{ background: avatarColor(item.client) }}>
                    {initials(item.client)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#24151A] dark:text-text-primary">{item.client}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[item.status]}`}>{item.status}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs font-medium text-text-secondary dark:text-text-secondary">{item.service} · {item.stylist}</p>
                  </div>
                </div>
                <div className="text-sm font-bold text-accent dark:text-[var(--accent-light)]">{item.amount}</div>
              </div>
            )) : (
              <EmptyState title="No appointments yet" message="There are no bookings scheduled for today." actionText="Create a booking →" href="/booking/walkin" />
            )}
          </div>
        </Card>

        <Card className="p-5 flex flex-col h-full min-h-[350px]">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm">
              <Users size={13} className="text-white" />
            </div>
            <h2 className="text-base font-semibold text-text-primary dark:text-text-primary">Staff Tracker</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 flex-1 overflow-y-auto pr-1">
            {data.staff.length > 0 ? data.staff.map((member: any) => {
              const active = member.state === 'Active'
              
              // Parse time to calculate a mock start time for context
              let startTime = "9:00 AM"
              if (member.next && member.next.includes(':')) {
                try {
                  const parts = member.next.split(/:| /)
                  const startHour = parseInt(parts[0]) === 12 ? 11 : parseInt(parts[0]) - 1
                  startTime = `${startHour === 0 ? 12 : startHour}:${parts[1]} ${startHour === 11 && parts[2] === 'AM' ? 'PM' : parts[2]}`
                } catch(e) {}
              }

              return (
                <div key={member.name} className="rounded-xl border border-border bg-[#FFFDFC] p-3 transition hover:shadow-md dark:border-border/60 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
                      style={{ background: avatarColor(member.name) }}>
                      {initials(member.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#24151A] dark:text-text-primary">{member.name}</p>
                      <p className="text-[11px] font-medium text-text-secondary dark:text-text-secondary uppercase tracking-wider">{member.role}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${active ? 'bg-[#F2FBF6] text-[#34835B] dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-[#FFF4E6] text-[#9A641F] dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {member.state}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Shift Progress</span>
                      <span className="text-[10px] font-bold text-text-secondary dark:text-text-secondary">{startTime} - {member.next}</span>
                    </div>
                    <StaffLoadBar load={member.load} active={active} />
                  </div>
                </div>
              )
            }) : (
              <EmptyState title="No staff active" message="No staff members are currently clocked in." actionText="Manage staff →" href="/staff" />
            )}
          </div>
        </Card>
      </div>

      {/* ── Weekly Performance ── */}
      <Card className={`overflow-visible transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="border-b border-border px-5 py-4 dark:border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent-dark to-accent">
                  <TrendingUp size={13} className="text-white" />
                </div>
                <h2 className="text-base font-semibold text-[#24151A] dark:text-text-primary">Weekly Performance</h2>
              </div>
              <p className="mt-1 text-xs font-medium text-text-secondary dark:text-text-secondary">Revenue & bookings trend · {activeBranch.short}</p>
            </div>
            {data.weeklyPerformance && data.weeklyPerformance.length > 0 && (
              <span className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm self-start sm:self-auto">
                +12% vs last week
              </span>
            )}
          </div>
        </div>
        <div className="px-5 py-6">
          {data.weeklyPerformance && data.weeklyPerformance.length > 0 ? (
            <div className="flex items-end justify-between gap-2 h-[220px]">
              {data.weeklyPerformance.map((day: any) => {
                const propHeight = Math.max((day.revenue / maxRevenue) * 100, 5)
                
                return (
                  <div key={day.day} className="group flex flex-1 flex-col items-center gap-3 h-full justify-end">
                    <div className="relative w-full flex flex-col justify-end items-center h-full">
                      
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute bottom-[calc(100%+8px)] z-10 rounded-xl border border-border bg-background-secondary px-4 py-2.5 opacity-0 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] transition-all duration-200 group-hover:opacity-100 group-hover:-translate-y-1 dark:border-border/60 dark:bg-background-secondary">
                        <p className="whitespace-nowrap text-[13px] font-bold text-[#24151A] dark:text-text-primary">Rs. {day.revenue.toLocaleString()}</p>
                        <p className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-text-secondary mt-1">{day.bookings} bookings</p>
                        <div className="absolute left-1/2 -bottom-[5px] w-2.5 h-2.5 -translate-x-1/2 rotate-45 border-r border-b border-border bg-background-secondary dark:border-border/60 dark:bg-background-secondary" />
                      </div>
                      
                      {/* Bar */}
                      <div className={cn(
                        "relative mx-auto w-full rounded-t-lg transition-all duration-700 max-w-[48px]",
                        day.isToday 
                          ? "bg-gradient-to-t from-violet-500/10 to-fuchsia-500/10 border-[1.5px] border-b-0 border-accent shadow-[0_0_15px_rgba(124,58,237,0.1)]" 
                          : "bg-gradient-to-t from-zinc-200 to-zinc-300 dark:from-zinc-800/80 dark:to-zinc-700/80"
                      )}
                        style={{ height: `${propHeight}%` }}>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${day.isToday ? 'text-accent dark:text-[var(--accent-light)]' : 'text-text-secondary dark:text-text-secondary'}`}>
                      {day.day}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState title="No performance data" message="No revenue recorded for the selected period." />
          )}
        </div>
      </Card>

      {/* ── Top Products + Reviews ── */}
      <div className={`grid grid-cols-1 gap-6 lg:grid-cols-2 transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <Card className="overflow-hidden flex flex-col h-full min-h-[300px]">
          <div className="border-b border-border px-5 py-4 dark:border-border/60 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#C7923E] to-[#D88385]">
                  <Package size={13} className="text-white" />
                </div>
                <h2 className="text-base font-semibold text-[#24151A] dark:text-text-primary">Top Products</h2>
              </div>
              <p className="mt-1 text-xs font-medium text-text-secondary dark:text-text-secondary">Best-selling retail items this week</p>
            </div>
            {data.topProducts.length > 0 && (
              <Link href="/inventory" className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline dark:text-[var(--accent-light)] flex items-center gap-1">
                View all <ArrowUpRight size={12} />
              </Link>
            )}
          </div>
          <div className="divide-y divide-border dark:divide-zinc-800/60 flex-1 overflow-y-auto">
            {data.topProducts.length > 0 ? data.topProducts.map((product: any, idx: number) => (
              <div key={product.name} className="flex items-center gap-4 px-5 py-4 transition hover:bg-background dark:hover:bg-background-secondary/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow-sm">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#24151A] dark:text-text-primary">{product.name}</p>
                  <p className="text-xs font-medium text-text-secondary dark:text-text-secondary mt-0.5">{product.sales} sold · {product.stock} in stock</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#24151A] dark:text-text-primary">{product.revenue}</p>
                  <p className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-wider text-success-text dark:text-success-text mt-1">
                    <TrendingUp size={10} strokeWidth={3} />{product.trend}
                  </p>
                </div>
              </div>
            )) : (
              <EmptyState title="No products sold" message="No product sales recorded in this period." actionText="Go to inventory →" href="/inventory" />
            )}
          </div>
        </Card>

        <Card className="overflow-hidden flex flex-col h-full min-h-[300px]">
          <div className="border-b border-border px-5 py-4 dark:border-border/60 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent-light)] to-accent-dark">
                  <Star size={13} className="text-white" />
                </div>
                <h2 className="text-base font-semibold text-[#24151A] dark:text-text-primary">Recent Reviews</h2>
              </div>
              <p className="mt-1 text-xs font-medium text-text-secondary dark:text-text-secondary">Latest customer feedback</p>
            </div>
            {data.reviews.length > 0 && (
              <Link href="/analytics" className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline dark:text-[var(--accent-light)] flex items-center gap-1">
                View all <ArrowUpRight size={12} />
              </Link>
            )}
          </div>
          <div className="divide-y divide-border dark:divide-zinc-800/60 flex-1 overflow-y-auto">
            {data.reviews.length > 0 ? data.reviews.map((review: any) => (
              <div key={`${review.client}-${review.time}`} className="px-5 py-4 transition hover:bg-background dark:hover:bg-background-secondary/50">
                <div className="mb-2.5 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-xs font-bold text-white shadow-sm">
                      {initials(review.client)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#24151A] dark:text-text-primary">{review.client}</p>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-text-secondary dark:text-text-secondary mt-0.5">{review.service} · {review.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full border border-amber-100 dark:border-amber-900/50">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[13px] font-medium text-text-secondary dark:text-text-secondary leading-relaxed pl-12">{review.comment}</p>
              </div>
            )) : (
              <EmptyState title="No reviews yet" message="You haven't received any reviews during this period." />
            )}
          </div>
        </Card>
      </div>

      {/* ── Live Activity ── */}
      <Card className={`overflow-hidden transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between border-b border-border px-5 py-4 dark:border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 shadow-sm">
                  <Bell size={13} className="text-white" />
                </div>
                <h2 className="text-base font-semibold text-text-primary dark:text-text-primary">Live Activity</h2>
              </div>
              <p className="mt-1 text-xs font-medium text-text-secondary dark:text-text-secondary">Real-time salon updates · {activeBranch.short}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              {data.notifications.length > 0 && (
                <Link href="/analytics" className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline dark:text-[var(--accent-light)] hidden sm:flex items-center gap-1">
                  View all <ArrowUpRight size={12} />
                </Link>
              )}
            </div>
          </div>
        <div className="divide-y divide-border dark:divide-zinc-800/60">
          {data.notifications.length > 0 ? data.notifications.map((notif: any, idx: number) => {
            const color = NOTIF_COLORS[notif.type] ?? palette.sky
            const Icon = NOTIF_ICONS[notif.type] ?? MessageSquare
            return (
              <div key={idx} className="flex items-start gap-4 px-5 py-4 transition hover:bg-background dark:hover:bg-background-secondary/[0.04]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm border" style={{ background: `${color}15`, borderColor: `${color}30` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#24151A] dark:text-text-primary">{notif.message}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary dark:text-text-secondary">{notif.time}</p>
                </div>
              </div>
            )
          }) : (
            <EmptyState title="No recent activity" message="No live events have been recorded." />
          )}
        </div>
      </Card>

      {/* ── Service Analytics ── */}
      <Card className={`p-5 transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border dark:border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-sm">
                <Scissors size={13} className="text-white" />
              </div>
              <h2 className="text-base font-semibold text-text-primary dark:text-text-primary">Service Analytics</h2>
            </div>
            <p className="mt-1 text-xs font-medium text-text-secondary dark:text-text-secondary">Popular treatments by booking share · {activeBranch.short}</p>
          </div>
          {data.services && data.services.length > 0 && (
            <Link href="/services" className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline dark:text-[var(--accent-light)] flex items-center gap-1">
              Manage services <ArrowUpRight size={12} />
            </Link>
          )}
        </div>
        
        {data.services && data.services.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:items-center">
            <DonutChart services={data.services} />
            <div className="grid gap-4 sm:grid-cols-2">
              {data.services.map((service: any, i: number) => {
                const meta = SERVICE_META[i % SERVICE_META.length]
                return (
                  <div key={service.name} className="group relative overflow-hidden rounded-xl border border-border bg-[#FFFDFC] p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-border/60 dark:bg-white/5">
                    <div className={`absolute inset-y-0 left-0 w-1.5 rounded-l-xl bg-gradient-to-b ${meta.gradient}`} />
                    <div className="mb-3 flex items-center justify-between pl-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-3.5 w-3.5 rounded-full shadow-sm" style={{ background: meta.color }} />
                        <span className="text-sm font-bold text-[#24151A] dark:text-text-primary">{service.name}</span>
                      </div>
                      <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: `${meta.color}18`, color: meta.color }}>{service.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-hover pl-3 dark:bg-background-secondary/10">
                      <div className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`} style={{ width: `${service.value}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <EmptyState title="No service data" message="There is no service analytics data for this period." actionText="View all services →" href="/services" />
        )}
      </Card>
    </main>
  )
}
