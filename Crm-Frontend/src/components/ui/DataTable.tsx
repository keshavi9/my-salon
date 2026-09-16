'use client'

import { useState, useRef, useEffect } from 'react'
import {
  MoreVertical, Download, Eye, Edit2, MessageSquare, Trash2,
  Phone, Mail, X, ChevronDown, AlertTriangle,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/helpers'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TableRow {
  id: string
  // Customer column
  name: string
  phone: string
  email?: string
  // Service column
  service: string
  // Stylist column
  stylist: string
  // Date & Time column
  date: string
  time?: string
  // Amount column
  amount: number
  // Status column
  status: string
  // Payment method column
  paymentMethod?: string
  // Custom amount label
  amountLabel?: string
  // Extra fields shown in View/Edit modals
  [key: string]: unknown
}

export interface TableColumn {
  key: string
  label: string
}

interface DataTableProps {
  rows: TableRow[]
  loading?: boolean
  headers?: string[]
  onDownload?: (row: TableRow) => void
  onSendMsg?: (row: TableRow) => void
  onEdit?: (row: TableRow, updated: TableRow) => void
  onCustomEdit?: (row: TableRow) => void
  onDelete?: (row: TableRow) => void
  /** Extra fields to show in View/Edit modals beyond the standard columns */
  extraFields?: { key: string; label: string; type?: 'text' | 'select'; options?: string[] }[]
  emptyMessage?: string
}

// ─── Status badge helper ───────────────────────────────────────────────────────

function statusClass(status: string) {
  const s = status.toLowerCase()
  if (['completed', 'done', 'paid', 'active', 'approved'].includes(s))
    return 'bg-success-bg text-success-text border border-success-border dark:bg-success-bg dark:text-success-text dark:border-success-border'
  if (['booked', 'confirmed', 'info'].includes(s))
    return 'bg-info-bg text-info-text border border-info-border dark:bg-info-bg dark:text-info-text dark:border-info-border'
  if (['in_service', 'in-progress', 'in service'].includes(s))
    return 'bg-accent-light text-accent border border-border dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800'
  if (['pending', 'partial', 'partially_paid', 'break'].includes(s))
    return 'bg-warning-bg text-warning-text border border-warning-border dark:bg-warning-bg dark:text-warning-text dark:border-warning-border'
  if (['cancelled', 'failed', 'error', 'refunded'].includes(s))
    return 'bg-danger-bg text-danger border border-danger-border dark:bg-danger-bg dark:text-danger-text dark:border-danger-border'
  return 'bg-hover text-text-secondary border border-border dark:bg-background-secondary/50 dark:text-text-secondary dark:border-border'
}

function Avatar({ name }: { name: string }) {
  const colors = ['var(--accent)', 'var(--accent)', 'var(--success)', 'var(--info)', 'var(--warning)']
  const bg = colors[name.charCodeAt(0) % colors.length]
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ background: bg }}>
      {initials}
    </div>
  )
}

// ─── 3-dot Action Menu ────────────────────────────────────────────────────────

interface ActionMenuProps {
  row: TableRow
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

function ActionMenu({ row, onView, onEdit, onDelete }: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const items = [
    { icon: <Eye size={13} />, label: 'View Details', action: onView, show: true },
    { icon: <Edit2 size={13} />, label: 'Edit', action: onEdit, show: true },
    { icon: <Trash2 size={13} />, label: 'Delete', action: onDelete, show: true, danger: true },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-hover"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Actions"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-1 w-44 rounded-xl shadow-lg overflow-hidden"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          {items.filter(i => i.show).map(item => (
            <button
              key={item.label}
              onClick={() => { setOpen(false); item.action?.() }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors hover:bg-hover ${item.danger ? 'text-danger' : ''}`}
              style={item.danger ? undefined : { color: 'var(--text-primary)' }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── View Modal ───────────────────────────────────────────────────────────────

function ViewModal({ row, extraFields, onClose }: { row: TableRow; extraFields?: DataTableProps['extraFields']; onClose: () => void }) {
  const standard = [
    { label: 'Name', value: row.name },
    { label: 'Phone', value: row.phone },
    { label: 'Email', value: row.email || '—' },
    { label: 'Service', value: row.service },
    { label: 'Stylist', value: row.stylist },
    { label: 'Date', value: row.date }, // changed from formatDate to row.date so caller can decide format if needed
    { label: 'Time', value: row.time || '—' },
    { label: 'Amount', value: row.amountLabel ?? formatCurrency(row.amount) },
    { label: 'Status', value: row.status },
    { label: 'Payment Method', value: row.paymentMethod || '—' },
  ]

  return (
    <ModalShell title="Customer Details" onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {standard.map(f => (
          <div key={f.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-secondary)' }}>{f.label}</p>
            {f.label === 'Status' ? (
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass(String(f.value))}`}>
                {String(f.value).replace(/_/g, ' ')}
              </span>
            ) : (
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
            )}
          </div>
        ))}
        {extraFields?.map(f => (
          <div key={f.key}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-secondary)' }}>{f.label}</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{String(row[f.key] ?? '—')}</p>
          </div>
        ))}
      </div>
    </ModalShell>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ row, extraFields, onClose, onSave }: {
  row: TableRow
  extraFields?: DataTableProps['extraFields']
  onClose: () => void
  onSave: (updated: TableRow) => void
}) {
  const [form, setForm] = useState<TableRow>({ ...row })

  const set = (key: string, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const fields: { key: keyof TableRow; label: string; type?: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'service', label: 'Service' },
    { key: 'stylist', label: 'Stylist' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'time', label: 'Time', type: 'time' },
    { key: 'amount', label: 'Amount', type: 'number' },
    { key: 'status', label: 'Status' },
    { key: 'paymentMethod', label: 'Payment Method' },
  ]

  return (
    <ModalShell title="Edit Details" onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key as string}>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
              {f.label}
            </label>
            <input
              type={f.type || 'text'}
              value={String(form[f.key] ?? '')}
              onChange={e => set(f.key as string, f.type === 'number' ? Number(e.target.value) : e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-[var(--accent-light)]"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
            />
          </div>
        ))}
        {extraFields?.map(f => (
          <div key={f.key}>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
              {f.label}
            </label>
            {f.type === 'select' && f.options ? (
              <div className="relative">
                <select
                  value={String(form[f.key] ?? '')}
                  onChange={e => set(f.key, e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-[var(--accent-light)]"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                >
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} />
              </div>
            ) : (
              <input
                type="text"
                value={String(form[f.key] ?? '')}
                onChange={e => set(f.key, e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-[var(--accent-light)]"
                style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-hover"
          style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          Cancel
        </button>
        <button onClick={() => { onSave(form); onClose() }}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors hover:bg-accent-dark bg-accent dark:hover:bg-violet-500">
          Save Changes
        </button>
      </div>
    </ModalShell>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ row, onClose, onConfirm }: { row: TableRow; onClose: () => void; onConfirm: () => void }) {
  return (
    <ModalShell title="Delete Record" onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-12 h-12 rounded-full bg-danger-bg dark:bg-danger-bg flex items-center justify-center">
          <AlertTriangle size={22} className="text-danger" />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Delete record for <span className="text-accent dark:text-[var(--accent-light)]">{row.name}</span>?
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-hover"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose() }}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-danger hover:bg-danger transition-colors">
            Delete
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────

function ModalShell({ title, onClose, children, size = 'md' }: {
  title: string; onClose: () => void; children: React.ReactNode; size?: 'sm' | 'md' | 'lg'
}) {
  const maxW = { sm: 'max-w-sm', md: 'max-w-xl', lg: 'max-w-2xl' }[size]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', esc) }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background-secondary/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxW} rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}>
        <div className="h-0.5 bg-gradient-to-r from-accent to-fuchsia-600" />
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-hover"
            style={{ color: 'var(--text-secondary)' }}>
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Main DataTable ───────────────────────────────────────────────────────────

type ModalState = { type: 'view' | 'edit' | 'delete'; row: TableRow } | null

export default function DataTable(props: DataTableProps) {
  const {
    rows,
    loading = false,
    onDownload,
    onSendMsg,
    onEdit,
    onDelete,
    extraFields,
    emptyMessage = 'No records found',
    headers,
  } = props
  const [modal, setModal] = useState<ModalState>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const itemsPerPage = 10
  const totalPages = Math.ceil(rows.length / itemsPerPage)

  // Reset page if rows length changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages)
  }, [rows.length, currentPage, totalPages])

  const currentRows = rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleDelete = (row: TableRow) => {
    onDelete?.(row)
  }

  const handleEdit = (row: TableRow, updated: TableRow) => {
    onEdit?.(row, updated)
  }

  const handleExportCSV = () => {
    if (!rows.length) return
    const allKeys = new Set<string>()
    rows.forEach(row => Object.keys(row).forEach(k => {
      if (k !== 'id' && typeof row[k] !== 'object' && typeof row[k] !== 'function') {
        allKeys.add(k)
      }
    }))
    const keysToExport = Array.from(allKeys)
    const csvContent = [
      keysToExport.map(k => `"${k.toUpperCase()}"`).join(','),
      ...rows.map(row => keysToExport.map(k => {
        let val = row[k]
        if (typeof val === 'string') val = val.replace(/"/g, '""')
        return `"${val ?? ''}"`
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = async () => {
    if (!rows.length) return
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF('landscape')

    const allKeys = new Set<string>()
    rows.forEach(row => Object.keys(row).forEach(k => {
      if (k !== 'id' && typeof row[k] !== 'object' && typeof row[k] !== 'function') {
        allKeys.add(k)
      }
    }))
    const keys = Array.from(allKeys)

    doc.setFontSize(16)
    doc.text('Data Export', 14, 15)

    doc.setFontSize(9)
    let y = 25
    const pageWidth = doc.internal.pageSize.getWidth()
    const colWidth = (pageWidth - 28) / Math.max(keys.length, 1)

    // Header
    doc.setFont('helvetica', 'bold')
    keys.forEach((k, i) => {
      doc.text(k.toUpperCase().substring(0, 15), 14 + (i * colWidth), y)
    })

    y += 5
    doc.line(14, y - 3, pageWidth - 14, y - 3)

    doc.setFont('helvetica', 'normal')
    rows.forEach(row => {
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage()
        y = 20
      }
      keys.forEach((k, i) => {
        const val = String(row[k] ?? '').substring(0, 20)
        doc.text(val, 14 + (i * colWidth), y)
      })
      y += 6
    })

    doc.save('export.pdf')
  }

  const handleExportExcel = () => {
    if (!rows.length) return
    const allKeys = new Set<string>()
    rows.forEach(row => Object.keys(row).forEach(k => {
      if (k !== 'id' && typeof row[k] !== 'object' && typeof row[k] !== 'function') {
        allKeys.add(k)
      }
    }))
    const keysToExport = Array.from(allKeys)
    
    let table = '<table><thead><tr>'
    keysToExport.forEach(k => { table += `<th>${k.toUpperCase()}</th>` })
    table += '</tr></thead><tbody>'
    
    rows.forEach(row => {
      table += '<tr>'
      keysToExport.forEach(k => {
        let val = String(row[k] ?? '')
        table += `<td>${val}</td>`
      })
      table += '</tr>'
    })
    table += '</tbody></table>'

    const blob = new Blob([table], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'export.xls')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    if (!rows.length) return
    const allKeys = new Set<string>()
    rows.forEach(row => Object.keys(row).forEach(k => {
      if (k !== 'id' && typeof row[k] !== 'object' && typeof row[k] !== 'function') {
        allKeys.add(k)
      }
    }))
    const keysToExport = Array.from(allKeys)

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    let html = `
      <html>
        <head>
          <title>Data Print</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <h2>Data Export</h2>
          <table>
            <thead>
              <tr>${keysToExport.map(k => `<th>${k.toUpperCase()}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>${keysToExport.map(k => `<td>${String(row[k] ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
  }

  const HEADERS = headers || ['Name', 'Contact', 'Service', 'Stylist', 'Date & Time', 'Amount', 'Status', 'Payment', 'Actions']
  const hasPaymentColumn = HEADERS.some(h => h.toLowerCase().includes('payment'))

  return (
    <>
      {/* Action Bar */}
      <div className="flex justify-end mb-4 relative z-20">
        <div className="relative">
          <button onClick={() => setShowExportMenu(prev => !prev)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            <Download size={16} className="text-accent dark:text-[var(--accent-light)]" />
            Export
            <ChevronDown size={14} className={showExportMenu ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>

          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
              <div className="absolute right-0 mt-2 w-40 rounded-xl shadow-lg border z-50 overflow-hidden" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                <button
                  onClick={() => { setShowExportMenu(false); handleExportCSV() }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-hover"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => { setShowExportMenu(false); handleExportPDF() }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-hover"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => { setShowExportMenu(false); handleExportExcel() }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-hover"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => { setShowExportMenu(false); handlePrint() }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-hover"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Print
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin dark:border-[var(--accent-light)] dark:border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10" style={{ background: 'var(--bg)' }}>
                <tr
                  className="text-[10px] uppercase tracking-wider"
                  style={{ background: 'var(--hover)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  {HEADERS.map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold tracking-wider whitespace-nowrap bg-hover">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan={HEADERS.length} className="px-5 py-14 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {emptyMessage}
                    </td>
                  </tr>
                ) : currentRows.map(row => (
                  <tr key={row.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={row.name} />
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{row.name}</p>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-5 py-3.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
                          <Phone size={11} />
                          <span>{row.phone}</span>
                        </div>
                        {row.email && (
                          <div className="flex items-center gap-1 text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            <Mail size={11} />
                            <span className="truncate max-w-[140px]">{row.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium max-w-[160px] truncate" style={{ color: 'var(--text-primary)' }}>{row.service}</p>
                    </td>

                    {/* Stylist */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{row.stylist}</p>
                    </td>

                    {/* Date & Time — date on top, time below */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{row.date.includes('-') && !row.date.includes(' ') && !row.date.includes(',') ? formatDate(row.date) : row.date}</p>
                      {row.time && (
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{row.time}</p>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{row.amountLabel ?? formatCurrency(row.amount)}</p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusClass(row.status)}`}>
                        {row.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Payment Method */}
                    {hasPaymentColumn && (
                      <td className="px-5 py-3.5">
                        <span className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>
                          {row.paymentMethod || '—'}
                        </span>
                      </td>
                    )}

                    {/* Actions — Download, Msg, 3-dot menu */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onDownload?.(row)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-hover text-text-secondary" aria-label="Download">
                          <Download size={15} />
                        </button>
                        <button onClick={() => onSendMsg?.(row)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-hover text-text-secondary" aria-label="Send Message">
                          <MessageSquare size={15} />
                        </button>
                        <ActionMenu
                          row={row}
                          onView={() => setModal({ type: 'view', row })}
                          onEdit={() => {
                            if (props.onCustomEdit) {
                              props.onCustomEdit(row)
                            } else {
                              setModal({ type: 'edit', row })
                            }
                          }}
                          onDelete={() => setModal({ type: 'delete', row })}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            <span className="text-xs text-text-secondary">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, rows.length)} of {rows.length} entries
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded text-xs font-semibold"
                  style={{
                    background: currentPage === i + 1 ? 'var(--accent)' : 'transparent',
                    color: currentPage === i + 1 ? 'var(--bg-secondary)' : 'var(--text-primary)',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === 'view' && (
        <ViewModal row={modal.row} extraFields={extraFields} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit' && (
        <EditModal
          row={modal.row}
          extraFields={extraFields}
          onClose={() => setModal(null)}
          onSave={updated => handleEdit(modal.row, updated)}
        />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal
          row={modal.row}
          onClose={() => setModal(null)}
          onConfirm={() => handleDelete(modal.row)}
        />
      )}
    </>
  )
}
