import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AppShell from '@/components/layout/AppShell'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/Providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SalonPro CRM - Salon Management System',
  description: 'Complete salon management solution for Hair Ahmedabad',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body suppressHydrationWarning>
        <Providers>
          <Toaster position="top-right" />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
