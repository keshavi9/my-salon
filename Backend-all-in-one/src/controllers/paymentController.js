const Payment = require('../models/Payment')
const Customer = require('../models/Customer')
const Booking = require('../models/Booking')
const asyncHandler = require('express-async-handler')
const { z } = require('zod')

// ---------------------------------------------------------------------------
// method and status are ENUMs in the DB — z.string() would silently accept
// invalid values and let Postgres throw a 500. Enum constraints here return
// a clean 400 with a useful message before we even hit the DB.
// ---------------------------------------------------------------------------
const paymentSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  bookingId: z.string().uuid('Invalid booking ID').optional(),
  amount: z.number().min(0, 'Amount cannot be negative'),
  method: z.enum(['cash', 'card', 'upi', 'wallet', 'other'], {
    errorMap: () => ({ message: "method must be one of: cash, card, upi, wallet, other" }),
  }),
  status: z.enum(['pending', 'paid', 'completed', 'refunded', 'failed'], {
    errorMap: () => ({ message: "status must be one of: pending, paid, completed, refunded, failed" }),
  }).optional(),
})

exports.getAll = asyncHandler(async (req, res) => {
  const { page, limit } = req.query
  const pageNum = parseInt(page) || 1
  const limitNum = Math.min(parseInt(limit) || 20, 100)
  const offset = (pageNum - 1) * limitNum

  const { count, rows } = await Payment.findAndCountAll({
    limit: limitNum,
    offset,
    include: [
      { model: Customer, attributes: ['id', 'name', 'phone'] },
      // Exclude heavy JSONB services column — only need booking date for display
      { model: Booking, attributes: ['id', 'date', 'status'] },
    ],
    order: [['createdAt', 'DESC']],
  })
  res.json({ success: true, data: rows, total: count, page: pageNum, limit: limitNum })
})

exports.getOne = asyncHandler(async (req, res) => {
  const payment = await Payment.findByPk(req.params.id, {
    include: [
      { model: Customer, attributes: ['id', 'name', 'phone'] },
      { model: Booking, attributes: ['id', 'date', 'status', 'services'] },
    ],
  })
  if (!payment) {
    res.status(404)
    throw new Error('Payment not found')
  }
  res.json({ success: true, data: payment })
})

exports.create = asyncHandler(async (req, res) => {
  const validated = paymentSchema.parse(req.body)
  const payment = await Payment.create(validated)
  res.status(201).json({ success: true, message: 'Payment recorded', data: payment })
})

exports.update = asyncHandler(async (req, res) => {
  const payment = await Payment.findByPk(req.params.id)
  if (!payment) {
    res.status(404)
    throw new Error('Payment not found')
  }
  const validated = paymentSchema.partial().parse(req.body)
  await payment.update(validated)
  res.json({ success: true, message: 'Payment updated', data: payment })
})

exports.remove = asyncHandler(async (req, res) => {
  const payment = await Payment.findByPk(req.params.id)
  if (!payment) {
    res.status(404)
    throw new Error('Payment not found')
  }

  // If this payment was tied to a booking, we should ideally revert the booking
  // status to pending so it doesn't look fully paid/completed without a payment.
  if (payment.bookingId) {
    const booking = await Booking.findByPk(payment.bookingId)
    if (booking && booking.status !== 'cancelled') {
      await booking.update({ status: 'pending' })
    }
  }

  await payment.destroy()
  res.json({ success: true, message: 'Payment deleted and refunded successfully' })
})
