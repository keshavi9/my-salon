'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const isAuthPage = pathname?.startsWith('/auth')
  const [hydrated, setHydrated] = useState(false)

  // Wait for Zustand to rehydrate from localStorage before making any auth decision
  useEffect(() => { setHydrated(true) }, [])

  const { theme } = useThemeStore()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthPage && !isAuthenticated) {
      router.replace('/auth/login')
    }
    if (isAuthPage && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [hydrated, isAuthenticated, isAuthPage, router])

  // Don't render anything until hydration is confirmed — prevents flash redirect
  if (!hydrated) return null

  if (isAuthPage) {
    if (isAuthenticated) return null
    return <>{children}</>
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        <main
          className="flex-1 px-6 py-6"
          style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
