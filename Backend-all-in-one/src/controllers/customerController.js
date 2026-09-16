const { Op } = require('sequelize')
const Customer = require('../models/Customer')
const asyncHandler = require('express-async-handler')
const { z } = require('zod')

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().optional(),
})

exports.getAll = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query
  const where = {}
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { phone: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ]
  }

  const pageNum = parseInt(page) || 1
  const limitNum = parseInt(limit) || 20
  const offset = (pageNum - 1) * limitNum

  const { count, rows } = await Customer.findAndCountAll({ 
    where, 
    limit: limitNum, 
    offset, 
    order: [['createdAt', 'DESC']] 
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
