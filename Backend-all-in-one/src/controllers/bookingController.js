const { Op } = require('sequelize')
const Booking = require('../models/Booking')
const Customer = require('../models/Customer')
const Staff = require('../models/Staff')
const asyncHandler = require('express-async-handler')
const { z } = require('zod')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// ---------------------------------------------------------------------------
// Sub-schema for each service item inside a booking
// Mirrors the JSONB structure stored in Booking.services
// ---------------------------------------------------------------------------
const serviceItemSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  serviceName: z.string().min(1, 'Service name is required'),
  price: z.number().min(0, 'Price cannot be negative'),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
  quantity: z.number().int().min(1).optional().default(1),
})

// ---------------------------------------------------------------------------
// Booking schema — aligned with Booking model's actual field names.
// Previously had `serviceId` (wrong name, wrong type) — now `services` array.
// Previously had `time` (no matching model field) — now `startTime`/`endTime`.
// ---------------------------------------------------------------------------
const bookingSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  staffId: z.string().uuid('Invalid staff ID').optional(),
  services: z.array(serviceItemSchema).min(1, 'At least one service is required'),
  // Strict YYYY-MM-DD format — rejects garbage strings like "tomorrow" or "25/09/2026"
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number().int().min(1).optional(),
  status: z.enum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']).optional(),
  bookingType: z.enum(['Scheduled', 'Walk_In']).optional(),
  attendanceStatus: z.enum(['Booked', 'Checked_In', 'In_Service', 'Completed']).optional(),
  totalAmount: z.number().min(0).optional(),
  paidAmount: z.number().min(0).optional(),
  paymentMode: z.enum(['Pre-Paid', 'Post-Paid']).optional(),   // renamed from paymentModel
  paymentStatus: z.enum(['unpaid', 'partial', 'paid']).optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'wallet']).optional(),
  notes: z.string().optional(),
})

// ---------------------------------------------------------------------------
// Helper: parse "HH:MM" (24h) or "HH:MM AM/PM" (12h) → minutes since midnight
// Returns null if the string is unparseable.
// ---------------------------------------------------------------------------
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null
  // 24h: "09:30", "14:00"
  let m = timeStr.match(/^(\d{1,2}):(\d{2})$/)
  if (m) return parseInt(m[1]) * 60 + parseInt(m[2])
  // 12h: "09:30 AM", "01:00 PM"
  m = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (m) {
    let h = parseInt(m[1])
    const min = parseInt(m[2])
    if (m[3].toUpperCase() === 'AM' && h === 12) h = 0
    if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12
    return h * 60 + min
  }
  return null
}

// ---------------------------------------------------------------------------
// Conflict check — returns true if the proposed slot overlaps an existing
// booking for the same staff member on the same date.
// Excluded booking ID is passed during updates so a booking doesn't conflict
// with itself.
// ---------------------------------------------------------------------------
const hasStaffConflict = async (staffId, date, startTime, duration, excludeId = null) => {
  if (!staffId || !startTime || !duration) return false

  const newStart = parseTimeToMinutes(startTime)
  if (newStart === null) return false
  const newEnd = newStart + duration

  const where = {
    staffId,
    date,
    // Only check active bookings — cancelled/no-show/completed free the slot
    status: { [Op.notIn]: ['cancelled', 'no-show', 'completed'] },
  }
  if (excludeId) where.id = { [Op.ne]: excludeId }

  const existing = await Booking.findAll({
    where,
    attributes: ['startTime', 'endTime', 'duration'],
    raw: true,
  })

  for (const b of existing) {
    const bStart = parseTimeToMinutes(b.startTime)
    if (bStart === null) continue

    // Prefer endTime if stored; otherwise derive from duration
    const bEnd = b.endTime
      ? parseTimeToMinutes(b.endTime)
      : b.duration
        ? bStart + b.duration
        : null
    if (bEnd === null) continue

    // Ranges [newStart, newEnd) and [bStart, bEnd) overlap when:
    // newStart < bEnd  AND  newEnd > bStart
    if (newStart < bEnd && newEnd > bStart) return true
  }

  return false
}

// ---------------------------------------------------------------------------
// Resolve effective duration for the conflict check.
// Prefer explicit `duration` field; otherwise sum durations across services.
// ---------------------------------------------------------------------------
const resolveDuration = (validated) =>
  validated.duration ||
  (Array.isArray(validated.services)
    ? validated.services.reduce((sum, s) => sum + (s.duration || 0), 0)
    : 0)

// ── Route handlers ────────────────────────────────────────────────────────────

exports.getAll = asyncHandler(async (req, res) => {
  const { status, date, page, limit } = req.query
  const where = {}
  if (status) where.status = status
  if (date) where.date = date

  const pageNum = parseInt(page) || 1
  const limitNum = Math.min(parseInt(limit) || 20, 100)
  const offset = (pageNum - 1) * limitNum

  const { count, rows } = await Booking.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    include: [
      { model: Customer, attributes: ['id', 'name', 'phone'] },
      { model: Staff, attributes: ['id', 'name'] },
    ],
    order: [['date', 'DESC'], ['startTime', 'ASC']],
  })
  res.json({ success: true, data: rows, total: count, page: pageNum, limit: limitNum })
})

exports.getOne = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.id, {
    include: [
      { model: Customer, attributes: ['id', 'name', 'phone'] },
      { model: Staff, attributes: ['id', 'name'] },
    ],
  })
  if (!booking) {
    res.status(404)
    throw new Error('Booking not found')
  }
  res.json({ success: true, data: booking })
})

exports.create = asyncHandler(async (req, res) => {
  const validated = bookingSchema.parse(req.body)

  // ── Double-booking guard ──────────────────────────────────────────────────
  if (validated.staffId && validated.startTime) {
    const duration = resolveDuration(validated)
    if (duration > 0) {
      const conflict = await hasStaffConflict(
        validated.staffId,
        validated.date,
        validated.startTime,
        duration
      )
      if (conflict) {
        res.status(409)
        throw new Error(
          `Staff member is already booked during this time slot on ${validated.date}. ` +
          `Please choose a different time or staff member.`
        )
      }
    }
  }

  const booking = await Booking.create(validated)
  res.status(201).json({ success: true, message: 'Booking created', data: booking })
})

exports.update = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.id)
  if (!booking) {
    res.status(404)
    throw new Error('Booking not found')
  }

  const validated = bookingSchema.partial().parse(req.body)

  // ── Double-booking guard on reschedule ────────────────────────────────────
  // Merge new values over existing so partial updates are checked correctly.
  const staffId    = validated.staffId   ?? booking.staffId
  const date       = validated.date      ?? (booking.date instanceof Date
                       ? booking.date.toISOString().slice(0, 10)
                       : booking.date)
  const startTime  = validated.startTime ?? booking.startTime
  const duration   = resolveDuration(validated) || booking.duration

  if (staffId && startTime && duration > 0) {
    const conflict = await hasStaffConflict(staffId, date, startTime, duration, booking.id)
    if (conflict) {
      res.status(409)
      throw new Error(
        `Staff member is already booked during this time slot on ${date}. ` +
        `Please choose a different time or staff member.`
      )
    }
  }

  await booking.update(validated)
  res.json({ success: true, message: 'Booking updated', data: booking })
})

exports.remove = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.id)
  if (!booking) {
    res.status(404)
    throw new Error('Booking not found')
  }
  await booking.destroy()
  res.json({ success: true, message: 'Booking deleted' })
})

exports.sendReminder = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.id, {
    include: [{ model: Customer, attributes: ['name', 'email'] }]
  })
  
  if (!booking) {
    res.status(404)
    throw new Error('Booking not found')
  }
  
  const customer = booking.Customer
  if (!customer || !customer.email) {
    res.status(400)
    throw new Error('Customer does not have an email address on file')
  }

  // Format the date nicely
  const bookingDate = new Date(booking.date).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    try {
      await transporter.sendMail({
        to: customer.email,
        subject: 'Upcoming Appointment Reminder',
        html: `
          <h3>Hello ${customer.name},</h3>
          <p>This is a quick reminder about your upcoming appointment.</p>
          <p><strong>Date:</strong> ${bookingDate}<br/>
          <strong>Time:</strong> ${booking.startTime || 'TBD'}</p>
          <p>If you need to reschedule, please contact us as soon as possible.</p>
          <p>We look forward to seeing you!</p>
        `,
      })
    } catch (error) {
      console.error('Email send failed:', error.message)
      res.status(500)
      throw new Error('Failed to send reminder email')
    }
  } else {
    console.log(`[DEV ONLY] Reminder email simulated for ${customer.email} (Booking: ${booking.date} at ${booking.startTime})`)
  }

  res.json({ success: true, message: 'Reminder email sent successfully' })
})
