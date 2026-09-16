const Booking = require('../models/Booking')
const Customer = require('../models/Customer')
const Staff = require('../models/Staff')
const asyncHandler = require('express-async-handler')
const { z } = require('zod')

const bookingSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  staffId: z.string().uuid('Invalid staff ID'),
  serviceId: z.string().uuid('Invalid service ID').optional(),
  date: z.string(),
  time: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']).optional(),
  notes: z.string().optional(),
})

exports.getAll = asyncHandler(async (req, res) => {
  const { status, date, page, limit } = req.query
  const where = {}
  if (status) where.status = status
  if (date) where.date = date
  
  const pageNum = parseInt(page) || 1
  const limitNum = parseInt(limit) || 20
  const offset = (pageNum - 1) * limitNum

  const { count, rows } = await Booking.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    include: [
      { model: Customer, attributes: ['id', 'name', 'phone'] },
      { model: Staff, attributes: ['id', 'name'] },
    ],
    order: [['date', 'DESC']],
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
