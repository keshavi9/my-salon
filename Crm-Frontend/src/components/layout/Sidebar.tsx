'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Calendar, CalendarDays, ChevronDown, Users, UserPlus,
  UserCog, Scissors, Package, TrendingUp, BarChart2, CreditCard, Tag,
  Percent, Bell, Settings, List, LayoutGrid, UserCircle, Gift, Star,
  UserSearch, Wallet, FileText, LifeBuoy, HelpCircle, type LucideIcon,
} from 'lucide-react'
import { cn } from '@/utils/helpers'

type SubItem = { name: string; href: string; icon: LucideIcon }
type NavItem = { name: string; icon: LucideIcon; prefix: string; items: SubItem[] }

const navItems: NavItem[] = [
  {
    name: 'Bookings', icon: Calendar, prefix: '/booking',
    items: [
      { name: 'Invoices', href: '/booking/walkin', icon: UserPlus },
      { name: 'Calendar', href: '/booking/calendar', icon: CalendarDays },
      { name: 'Billing History', href: '/booking/list', icon: List },
      { name: 'Booking List', href: '/booking/adv-booking-list', icon: LayoutGrid },
    ],
  },
  {
    name: 'Service', icon: Scissors, prefix: '/services',
    items: [{ name: 'All Services', href: '/services', icon: List }],
  },
  {
    name: 'Staff', icon: UserCog, prefix: '/staff',
    items: [
      { name: 'Staff List', href: '/staff', icon: UserCog },
      { name: 'Add Staff', href: '/staff/add', icon: UserCircle },
    ],
  },
  {
    name: 'Client', icon: Users, prefix: '/customers',
    items: [{ name: 'Client List', href: '/customers', icon: Users }],
  },
  {
    name: 'Membership', icon: CreditCard, prefix: '/membership',
    items: [
      { name: 'Plans', href: '/membership/plans', icon: CreditCard },
      { name: 'Packages', href: '/membership/packages', icon: Gift },
      { name: 'Loyalty', href: '/membership/loyalty', icon: Star },
    ],
  },
  {
    name: 'Discount', icon: Tag, prefix: '/discounts',
    items: [
      { name: 'All Discounts', href: '/discounts', icon: Tag },
      { name: 'Offers', href: '/discounts/offers', icon: Percent },
    ],
  },
  {
    name: 'Inventory', icon: Package, prefix: '/inventory',
    items: [
      { name: 'Stock', href: '/inventory', icon: Package },
      { name: 'Reorder', href: '/inventory/reorder', icon: List },
    ],
  },
  {
    name: 'Expense', icon: Wallet, prefix: '/expense',
    items: [
      { name: 'All Expenses', href: '/expense', icon: Wallet },
      { name: 'Add Expense', href: '/expense/add', icon: FileText },
    ],
  },
  {
    name: 'Analytics', icon: BarChart2, prefix: '/analytics',
    items: [
      { name: 'Daily Reconciliation', href: '/analytics/daily-reconciliation', icon: TrendingUp },
      { name: 'Transactions', href: '/analytics/transactions', icon: FileText },
      { name: 'Business Trend', href: '/analytics/business-trend', icon: BarChart2 },
      { name: 'Stylist Progress', href: '/analytics/stylist-progress', icon: UserCog },
      { name: 'Client Insights', href: '/analytics/client-insights', icon: UserSearch },
    ],
  },
  {
    name: 'Support', icon: LifeBuoy, prefix: '/support',
    items: [
      { name: 'Support Tickets', href: '/support', icon: LifeBuoy },
      { name: 'New Ticket', href: '/support/new', icon: HelpCircle },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navItems.map(n => [n.name, pathname.startsWith(n.prefix)]))
  )

  const toggle = (name: string) =>
    setOpenMap(prev => ({ ...prev, [name]: !prev[name] }))

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-50"
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Logo */}
      <div
        className="h-16 flex items-center px-5 shrink-0"
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--sidebar-border)',
        }}
      >
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}
          >
            <Scissors style={{ color: 'var(--bg-secondary)' }} size={17} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--logo-text)' }}>
              SalonPro
            </h1>
            <p className="text-[10px] font-medium tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              Salon Management
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">

        {/* Dashboard */}
        <NavLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard'} />

        {/* Grouped nav */}
        {navItems.map(nav => {
          const isActive = pathname.startsWith(nav.prefix)
          const isOpen = openMap[nav.name]

          return (
            <div key={nav.name}>
              <button
                type="button"
                onClick={() => toggle(nav.name)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
                  (isActive || isOpen)
                    ? 'text-[var(--sidebar-active-text)]'
                    : 'text-[var(--sidebar-text)] hover:text-[var(--sidebar-active-text)]'
                )}
                style={{
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                {/* Icon container */}
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150"
                  style={{
                    background: 'transparent',
                  }}
                >
                  <nav.icon
                    size={14}
                    style={{ color: (isActive || isOpen) ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)' }}
                  />
                </span>

                <span className="flex-1 text-left">{nav.name}</span>

                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full active-dot"
                    style={{ background: 'var(--accent)' }}
                  />
                )}

                <ChevronDown
                  size={13}
                  className={cn(
                    'transition-transform duration-200 shrink-0',
                    isOpen ? 'rotate-180' : ''
                  )}
                  style={{ color: 'var(--text-secondary)' }}
                />
              </button>

              {isOpen && (
                <div
                  className="sub-nav-expand mt-0.5 ml-3 pl-3 space-y-0.5"
                  style={{ borderLeft: '1.5px solid var(--border)' }}
                >
                  {nav.items.map((item, idx) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'nav-sub-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
                        pathname === item.href
                          ? 'text-[var(--sidebar-active-text)]'
                          : 'text-[var(--sidebar-text)] hover:text-[var(--sidebar-active-text)]'
                      )}
                      style={{
                        background: pathname === item.href ? 'var(--sidebar-active-bg)' : 'transparent',
                        animationDelay: `${idx * 30}ms`,
                      }}
                      onMouseEnter={e => {
                        if (pathname !== item.href)
                          (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover)'
                      }}
                      onMouseLeave={e => {
                        if (pathname !== item.href)
                          (e.currentTarget as HTMLElement).style.background = 'transparent'
                      }}
                    >
                      <item.icon size={13} style={{ opacity: 0.75 }} />
                      <span>{item.name}</span>
                      {pathname === item.href && (
                        <span
                          className="ml-auto w-1 h-1 rounded-full"
                          style={{ background: 'var(--accent)' }}
                        />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom — Settings */}
      <div
        className="shrink-0 px-2.5 py-3"
        style={{ borderTop: '1px solid var(--sidebar-border)' }}
      >
        <NavLink
          href="/settings"
          icon={Settings}
          label="Settings"
          active={pathname.startsWith('/settings') || pathname.startsWith('/notifications')}
        />
      </div>
    </aside>
  )
}

/* ── Reusable nav link ── */
function NavLink({
  href, icon: Icon, label, active,
}: { href: string; icon: LucideIcon; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
        active
          ? 'text-[var(--sidebar-active-text)]'
          : 'text-[var(--sidebar-text)] hover:text-[var(--sidebar-active-text)]'
      )}
      style={{ background: active ? 'var(--sidebar-active-bg)' : 'transparent' }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover)'
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      <span
        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150"
        style={{ background: active ? 'var(--accent)' : 'transparent' }}
      >
        <Icon size={14} style={{ color: active ? 'var(--bg-secondary)' : 'var(--sidebar-text)' }} />
      </span>
      <span className="flex-1">{label}</span>
      {active && (
        <span
          className="w-1.5 h-1.5 rounded-full active-dot"
          style={{ background: 'var(--accent)' }}
        />
      )}
    </Link>
  )
}
