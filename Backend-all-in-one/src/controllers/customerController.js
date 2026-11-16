const { Op } = require('sequelize')
const Customer = require('../models/Customer')
const Booking = require('../models/Booking')
const Payment = require('../models/Payment')
const asyncHandler = require('express-async-handler')
const { z } = require('zod')

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().optional(),
})

// Columns the caller is allowed to sort by (whitelist to prevent injection)
const SORTABLE_COLUMNS = ['createdAt', 'name', 'loyaltyPoints', 'totalSpent', 'totalVisits']

exports.getAll = asyncHandler(async (req, res) => {
  const { search, page, limit, sortBy, sortOrder } = req.query
  const where = {}
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { phone: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ]
  }

  const pageNum = parseInt(page) || 1
  const limitNum = Math.min(parseInt(limit) || 20, 100)
  const offset = (pageNum - 1) * limitNum

  // Honor sortBy / sortOrder from query params (used by loyalty page)
  const orderColumn = SORTABLE_COLUMNS.includes(sortBy) ? sortBy : 'createdAt'
  const orderDir = (sortOrder || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC'

  const { count, rows } = await Customer.findAndCountAll({ 
    where, 
    limit: limitNum, 
    offset, 
    order: [[orderColumn, orderDir]] 
  })
  
  res.json({ success: true, data: rows, total: count, page: pageNum, limit: limitNum })
})

exports.getOne = asyncHandler(async (req, res) => {
  const customer = await Customer.findByPk(req.params.id)
  if (!customer) {
    res.status(404)
    throw new Error('Customer not found')
  }
  res.json({ success: true, data: customer })
})

exports.create = asyncHandler(async (req, res) => {
  const validated = customerSchema.parse(req.body)
  const customer = await Customer.create(validated)
  res.status(201).json({ success: true, message: 'Customer created', data: customer })
})

exports.update = asyncHandler(async (req, res) => {
  const customer = await Customer.findByPk(req.params.id)
  if (!customer) {
    res.status(404)
    throw new Error('Customer not found')
  }
  const validated = customerSchema.partial().parse(req.body)
  await customer.update(validated)
  res.json({ success: true, message: 'Customer updated', data: customer })
})

exports.remove = asyncHandler(async (req, res) => {
  const customer = await Customer.findByPk(req.params.id)
  if (!customer) {
    res.status(404)
    throw new Error('Customer not found')
  }
  await customer.destroy()
  res.json({ success: true, message: 'Customer deleted' })
})

exports.getHistory = asyncHandler(async (req, res) => {
  const customer = await Customer.findByPk(req.params.id)
  if (!customer) {
    res.status(404)
    throw new Error('Customer not found')
  }

  const [bookings, payments] = await Promise.all([
    Booking.findAll({
      where: { customerId: customer.id },
      order: [['date', 'DESC'], ['startTime', 'DESC']],
    }),
    Payment.findAll({
      where: { customerId: customer.id },
      order: [['createdAt', 'DESC']],
    })
  ])

  res.json({
    success: true,
    data: {
      customer,
      bookings,
      payments
    }
  })
})

exports.updateLoyalty = asyncHandler(async (req, res) => {
  const customer = await Customer.findByPk(req.params.id)
  if (!customer) {
    res.status(404)
    throw new Error('Customer not found')
  }

  // Frontend sends { points: number, action: 'add' | 'redeem' }
  // Also allow direct { loyaltyPoints, membershipTier } for admin overrides
  const loyaltySchema = z.union([
    z.object({
      points: z.number().int().positive(),
      action: z.enum(['add', 'redeem']),
    }),
    z.object({
      loyaltyPoints: z.number().int().min(0).optional(),
      membershipTier: z.enum(['silver', 'gold', 'platinum']).nullable().optional(),
    }),
  ])

  const validated = loyaltySchema.parse(req.body)

  if ('action' in validated) {
    const { points, action } = validated
    const current = customer.loyaltyPoints || 0
    const updated = action === 'add' ? current + points : Math.max(0, current - points)
    await customer.update({ loyaltyPoints: updated })
  } else {
    await customer.update(validated)
  }

  res.json({ success: true, message: 'Loyalty updated successfully', data: customer })
})
