// Invoice download — no external PDF library needed, uses browser print
import type { BookingEntry } from '@/store/bookingStore'
import { SALON_NAME, UPI_ID } from '@/lib/bookingData'

export function downloadInvoice(booking: BookingEntry) {
  const invoiceNo = `INV-${booking.id.slice(0, 8).toUpperCase()}`
  const date = new Date(booking.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  const rows = booking.services.map((s) =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8ff">${s.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8ff;text-align:center">${s.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8ff;text-align:right">₹${s.price}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8ff;text-align:right">₹${s.price * s.quantity}</td>
    </tr>`
  ).join('')

  const discount = booking.discountAmount ?? 0
  const tax = booking.taxAmount ?? 0
  const final = booking.finalAmount ?? booking.totalAmount

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Invoice ${invoiceNo}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #111; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .brand { font-size: 22px; font-weight: 800; color: var(--accent); }
    .brand-sub { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .invoice-meta { text-align: right; font-size: 13px; color: #374151; }
    .invoice-meta .inv-no { font-size: 18px; font-weight: 700; color: var(--accent); }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9CA3AF; letter-spacing: 1px; margin-bottom: 6px; }
    .customer-box { background: #FAFAFC; border: 1px solid #E9D5FF; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    thead tr { background: var(--accent); color: #fff; }
    thead th { padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; }
    thead th:last-child, thead th:nth-child(3), thead th:nth-child(2) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    tbody tr:last-child td { border-bottom: none; }
    .totals { margin-left: auto; width: 260px; }
    .totals tr td { padding: 5px 12px; font-size: 13px; }
    .totals tr td:last-child { text-align: right; font-weight: 600; }
    .totals .total-row td { font-size: 16px; font-weight: 800; color: var(--accent); border-top: 2px solid #E9D5FF; padding-top: 10px; }
    .discount-row td { color: #16A34A; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E9D5FF; padding-top: 16px; }
    .paid-badge { display: inline-block; background: #DCFCE7; color: #16A34A; font-weight: 700; font-size: 12px; padding: 4px 14px; border-radius: 99px; margin-top: 8px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">✂ ${SALON_NAME}</div>
      <div class="brand-sub">Hair Ahmedabad · Premium Salon</div>
      <div class="brand-sub" style="margin-top:4px">UPI: ${UPI_ID}</div>
    </div>
    <div class="invoice-meta">
      <div class="inv-no">${invoiceNo}</div>
      <div>Date: ${date}</div>
      <div>Mode: ${booking.paymentMethod.toUpperCase()}</div>
      <div class="paid-badge">✓ PAID</div>
    </div>
  </div>

  <div class="section-title">Bill To</div>
  <div class="customer-box">
    <strong>${booking.customerName}</strong><br/>
    <span style="font-size:13px;color:#6B7280">+91 ${booking.customerPhone}</span>
    ${booking.customerEmail ? `<br/><span style="font-size:13px;color:#6B7280">${booking.customerEmail}</span>` : ''}
  </div>

  <div class="section-title">Services</div>
  <table>
    <thead>
      <tr>
        <th>Service</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Rate</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <table class="totals">
    <tr><td>Subtotal</td><td>₹${booking.totalAmount}</td></tr>
    ${discount > 0 ? `<tr class="discount-row"><td>Discount${booking.discountCode ? ` (${booking.discountCode})` : ''}</td><td>- ₹${discount}</td></tr>` : ''}
    <tr><td>GST (18%)</td><td>+ ₹${tax}</td></tr>
    <tr class="total-row"><td>Total Paid</td><td>₹${final}</td></tr>
  </table>

  <div class="footer">
    Thank you for visiting ${SALON_NAME}! · We look forward to seeing you again.<br/>
    ${invoiceNo} · Generated on ${date}
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}
