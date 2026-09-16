import type { InvoiceItem } from '@/store/locationStore'
import type { BookingEntry } from '@/store/bookingStore'

// ── shared PDF builder ────────────────────────────────────────────────────────
async function buildPDF(
  id: string,
  client: string,
  phone: string,
  email: string,
  date: string,
  services: string,
  subtotal: number,
  gst: number,
  total: number,
  status: string,
  branchName: string,
  branchAddress: string,
) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const M = 56

  const INK     = '#1A1A2E'
  const INK_MID = '#4A4A6A'
  const INK_LT  = '#9090AA'
  const BG_DARK = '#1A1A2E'
  const BG_ROW  = '#F5F5F8'
  const WHITE   = '#FFFFFF'

  const toRgb  = (h: string) => { const n = parseInt(h.replace('#', ''), 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 } }
  const fill   = (h: string) => { const c = toRgb(h); doc.setFillColor(c.r, c.g, c.b) }
  const stroke = (h: string) => { const c = toRgb(h); doc.setDrawColor(c.r, c.g, c.b) }
  const color  = (h: string) => { const c = toRgb(h); doc.setTextColor(c.r, c.g, c.b) }
  const bold   = (s: number) => { doc.setFont('times', 'bold');   doc.setFontSize(s) }
  const normal = (s: number) => { doc.setFont('times', 'normal'); doc.setFontSize(s) }
  const italic = (s: number) => { doc.setFont('times', 'italic'); doc.setFontSize(s) }
  const safe   = (v: unknown) => String(v ?? '')

  // Header
  fill(BG_DARK); doc.rect(0, 0, W, 100, 'F')
  bold(26); color(WHITE); doc.text('HAIR AHMEDABAD', M, 44)
  italic(11); color('#AAAACC'); doc.text('Hair  ·  Beauty  ·  Aesthetic Wellness', M, 64)
  bold(36); color(WHITE); doc.text('INVOICE', W - M, 58, { align: 'right' })
  stroke('#3A3A5E'); doc.setLineWidth(1); doc.line(0, 100, W, 100)

  // Billed to + details
  const S = 120; const RX = W / 2 + 20
  bold(8); color(INK_LT); doc.text('BILLED TO', M, S)
  bold(16); color(INK); doc.text(safe(client), M, S + 22)
  normal(11); color(INK_MID); doc.text(safe(phone), M, S + 42)
  normal(11); color(INK_MID); doc.text(safe(email), M, S + 60)

  bold(8); color(INK_LT); doc.text('INVOICE DETAILS', RX, S)
  const meta: [string, string][] = [['Invoice No', `# ${safe(id)}`], ['Date', safe(date)], ['Status', safe(status)]]
  let ry = S + 22
  meta.forEach(([label, val]) => {
    normal(10); color(INK_LT); doc.text(label, RX, ry)
    bold(11); color(INK); doc.text(val, W - M, ry, { align: 'right' })
    ry += 22
  })

  // Divider
  const divY = S + 84
  stroke(INK); doc.setLineWidth(1.2); doc.line(M, divY, W - M, divY)

  // Table
  const tY = divY + 20; const tHH = 30; const rH = 52
  const cD = M + 10; const cQ = M + (W - M * 2) * 0.58; const cR = M + (W - M * 2) * 0.75; const cA = W - M
  stroke(INK); doc.setLineWidth(1.2); doc.line(M, tY + tHH, W - M, tY + tHH)
  bold(8.5); color(INK_LT)
  doc.text('SERVICE / DESCRIPTION', cD, tY + 20)
  doc.text('QTY', cQ, tY + 20, { align: 'center' })
  doc.text('RATE', cR, tY + 20, { align: 'right' })
  doc.text('AMOUNT', cA, tY + 20, { align: 'right' })

  const dY = tY + tHH
  fill(BG_ROW); doc.rect(M, dY, W - M * 2, rH, 'F')
  bold(12); color(INK); doc.text(safe(services), cD, dY + 20)
  italic(9.5); color(INK_MID); doc.text('Professional Salon Service', cD, dY + 36)
  normal(11); color(INK_MID)
  doc.text('1', cQ, dY + 20, { align: 'center' })
  doc.text(`Rs. ${subtotal.toLocaleString()}`, cR, dY + 20, { align: 'right' })
  bold(12); color(INK); doc.text(`Rs. ${subtotal.toLocaleString()}`, cA, dY + 20, { align: 'right' })
  stroke(INK); doc.setLineWidth(0.6); doc.line(M, dY + rH, W - M, dY + rH)

  // Totals + notes
  const bY = dY + rH + 32
  bold(8); color(INK_LT); doc.text('NOTES', M, bY)
  normal(10); color(INK_MID)
  const noteLines = doc.splitTextToSize(
    "Thank you for visiting Hair Ahmedabad. Please follow your stylist's aftercare instructions for the best results. We look forward to welcoming you again.",
    (W / 2) - M - 14,
  )
  doc.text(noteLines, M, bY + 18)

  const tLX = W / 2 + 20; const tRX = W - M
  normal(11); color(INK_MID); doc.text('Subtotal', tLX, bY)
  normal(11); color(INK); doc.text(`Rs. ${subtotal.toLocaleString()}`, tRX, bY, { align: 'right' })
  stroke(INK); doc.setLineWidth(0.6); doc.line(tLX, bY + 16, tRX, bY + 16)
  bold(14); color(INK); doc.text('Total Amount', tLX, bY + 34)
  bold(14); color(INK); doc.text(`Rs. ${total.toLocaleString()}`, tRX, bY + 34, { align: 'right' })

  // Footer
  const fY = Math.max(bY + noteLines.length * 16 + 20, bY + 60) + 28
  stroke(INK_LT); doc.setLineWidth(0.6); doc.line(M, fY, W - M, fY)
  italic(11); color(INK_MID); doc.text('Thank you for your beautiful presence.', W / 2, fY + 20, { align: 'center' })
  normal(9); color(INK_LT); doc.text(`${branchName}  ·  ${branchAddress}`, W / 2, fY + 38, { align: 'center' })
  fill(BG_DARK); doc.rect(M, fY + 52, W - M * 2, 2, 'F')

  doc.save(`${safe(id)}-${safe(client).replace(/\s+/g, '_')}.pdf`)
}

// ── public API ────────────────────────────────────────────────────────────────

export async function downloadInvoicePDF(
  invoice: InvoiceItem,
  branchName: string,
  branchAddress: string,
) {
  const subtotal = invoice.amount - invoice.gst
  await buildPDF(
    invoice.id, invoice.client, invoice.phone, invoice.email ?? '',
    invoice.date, invoice.services, subtotal, invoice.gst, invoice.amount,
    invoice.status, branchName, branchAddress,
  )
}

export async function downloadBookingInvoicePDF(
  booking: BookingEntry,
  branchName: string,
  branchAddress: string,
) {
  const serviceNames = booking.services.map(s => s.name).join(', ')
  const date = booking.date ?? new Date(booking.createdAt).toLocaleDateString('en-IN')
  await buildPDF(
    booking.id, booking.customerName, booking.customerPhone, booking.customerEmail ?? '',
    date, serviceNames, booking.totalAmount, booking.taxAmount, booking.finalAmount,
    booking.paymentStatus === 'paid' ? 'Paid' : 'Pending',
    branchName, branchAddress,
  )
}
