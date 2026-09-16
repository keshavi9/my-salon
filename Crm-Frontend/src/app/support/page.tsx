'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LifeBuoy, Plus, Search, AlertCircle, Clock, CheckCircle, XCircle, MessageSquare, Calendar, Loader } from 'lucide-react'
import api from '@/lib/api'
import type { SupportTicket, TicketStats } from '@/types'

const statusConfig = {
  open: { label: 'Open', color: 'var(--danger)', bg: 'var(--danger-bg)', icon: AlertCircle },
  'in-progress': { label: 'In Progress', color: 'var(--warning)', bg: 'var(--warning-bg)', icon: Clock },
  resolved: { label: 'Resolved', color: 'var(--success)', bg: 'var(--success-bg)', icon: CheckCircle },
  closed: { label: 'Closed', color: 'var(--accent)', bg: 'var(--accent-light)', icon: XCircle },
}

const priorityConfig = {
  critical: { label: 'Critical', color: 'var(--danger)' },
  high: { label: 'High', color: 'var(--warning)' },
  medium: { label: 'Medium', color: 'var(--info)' },
  low: { label: 'Low', color: 'var(--success)' },
}

const categoryConfig = {
  billing: { label: 'Billing', color: 'var(--accent)', bg: 'var(--accent-light)' },
  technical: { label: 'Technical', color: 'var(--info)', bg: 'var(--info-bg)' },
  feature: { label: 'Feature Request', color: 'var(--success)', bg: 'var(--success-bg)' },
  bug: { label: 'Bug Report', color: 'var(--danger)', bg: 'var(--danger-bg)' },
  question: { label: 'Question', color: 'var(--warning)', bg: 'var(--warning-bg)' },
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
    fetchStats()
  }, [statusFilter, searchQuery])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (searchQuery) params.search = searchQuery
      
      const response = await api.get('/support/tickets', { params })
      setTickets(response.data.data)
    } catch (error: any) {
      console.error('Failed to fetch tickets:', error)
      setTickets([])
      if (error.code === 'ERR_NETWORK') {
        console.error('Backend server is not running. Please start the server.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/support/tickets/stats')
      setStats(response.data.data)
    } catch (error: any) {
      console.error('Failed to fetch stats:', error)
      setStats({ open: 0, inProgress: 0, resolved: 0, total: 0, closed: 0, byCategory: [], byPriority: [] })
      if (error.code === 'ERR_NETWORK') {
        console.error('Backend server is not running. Please start the server.')
      }
    }
  }

  return (
    <div className="min-h-full space-y-6 pb-6 text-text-primary dark:bg-transparent dark:text-text-primary">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-accent-dark">
            <LifeBuoy size={12} />
            Support & Help
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] dark:text-text-primary">Support Tickets</h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary">Manage and track your support requests</p>
        </div>

        <Link href="/support/new" className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-accent-dark to-accent px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 sm:self-auto">
          <Plus size={16} />
          New Ticket
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Open Tickets', value: stats.open, color: 'var(--danger)', icon: AlertCircle },
            { label: 'In Progress', value: stats.inProgress, color: 'var(--warning)', icon: Clock },
            { label: 'Resolved', value: stats.resolved, color: 'var(--success)', icon: CheckCircle },
            { label: 'Total Tickets', value: stats.total, color: 'var(--accent)', icon: MessageSquare },
          ].map((stat, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-background-secondary p-5 shadow-sm dark:border-border dark:bg-background-secondary/[0.04]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-text-secondary dark:text-text-secondary">{stat.label}</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${stat.color}18` }}>
                  <stat.icon size={18} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input
            type="text"
            placeholder="Search tickets by ID or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-background-secondary py-2.5 pl-11 pr-4 text-sm transition focus:border-accent-dark focus:outline-none dark:border-border dark:bg-background-secondary/[0.04]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-background-secondary px-4 py-2.5 text-sm font-semibold transition dark:border-border dark:bg-background-secondary/[0.04]"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="rounded-2xl border border-border bg-background-secondary p-12 text-center shadow-sm dark:border-border dark:bg-background-secondary/[0.04]">
          <Loader size={48} className="mx-auto mb-4 animate-spin text-accent-dark" />
          <p className="text-sm text-text-secondary dark:text-text-secondary">Loading tickets...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="rounded-2xl border border-border bg-background-secondary p-12 text-center shadow-sm dark:border-border dark:bg-background-secondary/[0.04]">
              <MessageSquare size={48} className="mx-auto mb-4 text-text-secondary dark:text-text-secondary" />
              <p className="text-sm text-text-secondary dark:text-text-secondary">No tickets found</p>
            </div>
          ) : (
            tickets.map(ticket => {
              const status = statusConfig[ticket.status as keyof typeof statusConfig]
              const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig]
              const category = categoryConfig[ticket.category as keyof typeof categoryConfig]
              const StatusIcon = status.icon

              return (
                <Link
                  key={ticket._id}
                  href={`/support/${ticket.ticketId}`}
                  className="block rounded-2xl border border-border bg-background-secondary p-5 shadow-sm transition hover:shadow-md dark:border-border dark:bg-background-secondary/[0.04]"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Ticket Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: status.bg }}>
                          <StatusIcon size={18} style={{ color: status.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-text-primary dark:text-text-primary truncate">{ticket.subject}</h3>
                            <span className="shrink-0 text-xs font-semibold text-text-secondary dark:text-text-secondary">#{ticket.ticketId}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: category.bg || `${category.color}18`, color: category.color }}>
                              {category.label}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: `${priority.color}18`, color: priority.color }}>
                              {priority.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-6 text-xs text-text-secondary dark:text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={14} />
                        <span className="font-semibold">{ticket.messages?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold" style={{ background: status.bg, color: status.color }}>
                      <StatusIcon size={14} />
                      {status.label}
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
