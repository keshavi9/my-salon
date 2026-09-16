const Payment = require('../models/Payment')
const Customer = require('../models/Customer')
const Booking = require('../models/Booking')
const asyncHandler = require('express-async-handler')
const { z } = require('zod')

const paymentSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  bookingId: z.string().uuid('Invalid booking ID').optional(),
  amount: z.number().min(0, 'Amount cannot be negative'),
  method: z.string(),
  status: z.string().optional(),
})

exports.getAll = asyncHandler(async (req, res) => {
  const { page, limit } = req.query
  const pageNum = parseInt(page) || 1
  const limitNum = parseInt(limit) || 20
  const offset = (pageNum - 1) * limitNum

  const { count, rows } = await Payment.findAndCountAll({
    limit: limitNum,
    offset,
    include: [
      { model: Customer, attributes: ['id', 'name', 'phone'] },
      { model: Booking, attributes: ['id', 'services', 'date'] },
    ],
    order: [['createdAt', 'DESC']],
  })
  res.json({ success: true, data: rows, total: count, page: pageNum, limit: limitNum })
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
