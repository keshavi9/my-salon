'use client'

import {
  Bell, Search, Moon, Sun, LogOut, MapPin, ChevronDown,
  Check, UserPlus, Settings,
} from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useLocationStore, BRANCHES } from '@/store/locationStore'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { theme, toggleTheme } = useThemeStore()
  const { user, logout }       = useAuthStore()
  const { branchId, setBranch } = useLocationStore()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLocMenu,  setShowLocMenu]  = useState(false)

  const activeBranch = BRANCHES.find(b => b.id === branchId) ?? BRANCHES[0]
  const initials = (user?.name ?? 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header
      className="h-16 px-5 flex items-center justify-between sticky top-0 z-40 gap-4"
      style={{
        background: 'var(--header-bg)',
        borderBottom: '1px solid var(--header-border)',
        boxShadow: 'var(--shadow-sm)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Search */}
      <div className="relative w-64 shrink-0">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          size={14}
          style={{ color: 'var(--text-secondary)' }}
        />
        <input
          type="text"
          placeholder="Search clients, bookings…"
          className="w-full pl-9 pr-4 py-2 rounded-xl text-sm transition-all duration-200 input-glow focus:outline-none"
          style={{
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">

        {/* Branch picker */}
        <div className="relative">
          <button
            onClick={() => setShowLocMenu(p => !p)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 hover:-translate-y-px"
            style={{
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              border: '1px solid var(--border)',
            }}
          >
            <MapPin size={13} />
            <span className="hidden sm:block max-w-[120px] truncate">{activeBranch.short}</span>
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${showLocMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {showLocMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowLocMenu(false)} />
              <div
                className="dropdown-menu absolute right-0 z-50 mt-2 w-68 overflow-hidden rounded-2xl shadow-xl"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-lg)',
                  minWidth: '260px',
                }}
              >
                <div className="h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
                <div className="px-4 pt-3 pb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                    Select Branch
                  </p>
                </div>
                <div className="pb-2">
                  {BRANCHES.map(branch => (
                    <button
                      key={branch.id}
                      onClick={() => { setBranch(branch.id); setShowLocMenu(false) }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100"
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all"
                        style={{
                          background: branchId === branch.id
                            ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))'
                            : 'var(--accent-light)',
                        }}
                      >
                        <MapPin size={13} style={{ color: branchId === branch.id ? 'var(--bg-secondary)' : 'var(--accent)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {branch.name}
                        </div>
                        <div className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                          {branch.address}
                        </div>
                      </div>
                      {branchId === branch.id && (
                        <Check size={14} style={{ color: 'var(--accent)' }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* New Billing CTA */}
        <Link
          href="/booking/walkin"
          className="btn-press flex items-center gap-1.5 rounded-xl px-3.5 h-9 text-xs font-bold text-white transition-all duration-150 hover:-translate-y-px"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <UserPlus size={13} />
          <span className="hidden sm:block">Billing</span>
        </Link>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 hover:-translate-y-px hover:shadow-sm"
          style={{ background: 'var(--hover)', color: 'var(--accent)', border: '1px solid var(--border)' }}
          aria-label="Toggle theme"
        >
          {theme === 'light'
            ? <Moon size={15} />
            : <Sun size={15} />
          }
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all duration-150 hover:-translate-y-px hover:shadow-sm"
          style={{ background: 'var(--hover)', color: 'var(--accent)', border: '1px solid var(--border)' }}
          aria-label="Notifications"
        >
          <Bell size={15} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full notif-badge"
            style={{ background: 'var(--success)', boxShadow: '0 0 0 2px var(--header-bg)' }}
          />
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl transition-all duration-150 hover:shadow-sm"
            style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}
            >
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {user?.name || 'Admin'}
              </div>
              <div className="text-[10px] capitalize" style={{ color: 'var(--text-secondary)' }}>
                {user?.role || 'Administrator'}
              </div>
            </div>
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-secondary)' }}
            />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div
                className="dropdown-menu absolute right-0 mt-2 w-44 rounded-2xl overflow-hidden z-50"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div className="h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                <div className="py-1.5">
                  <button
                    type="button"
                    onClick={() => { setShowUserMenu(false); router.push('/settings') }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm font-medium transition-colors duration-100"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Settings size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span>Profile</span>
                  </button>
                  <div style={{ height: '1px', background: 'var(--border)', margin: '2px 12px' }} />
                  <button
                    type="button"
                    onClick={() => { setShowUserMenu(false); logout(); router.push('/auth/login') }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm font-medium transition-colors duration-100"
                    style={{ color: 'var(--danger)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
