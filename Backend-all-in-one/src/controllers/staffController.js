const Staff = require('../models/Staff')
const asyncHandler = require('express-async-handler')
const { z } = require('zod')

const staffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  role: z.string().min(1, 'Role is required'),
  isActive: z.boolean().optional(),
})

exports.getAll = asyncHandler(async (req, res) => {
  const { page, limit } = req.query
  const pageNum = parseInt(page) || 1
  const limitNum = parseInt(limit) || 20
  const offset = (pageNum - 1) * limitNum

  const { count, rows } = await Staff.findAndCountAll({
    limit: limitNum,
    offset,
    order: [['createdAt', 'DESC']]
  })
  res.json({ success: true, data: rows, total: count, page: pageNum, limit: limitNum })
})

exports.getOne = asyncHandler(async (req, res) => {
  const member = await Staff.findByPk(req.params.id)
  if (!member) {
    res.status(404)
    throw new Error('Staff not found')
  }
  res.json({ success: true, data: member })
})

exports.create = asyncHandler(async (req, res) => {
  const validated = staffSchema.parse(req.body)
  const member = await Staff.create(validated)
  res.status(201).json({ success: true, message: 'Staff created', data: member })
})

exports.update = asyncHandler(async (req, res) => {
  const member = await Staff.findByPk(req.params.id)
  if (!member) {
    res.status(404)
    throw new Error('Staff not found')
  }
  const validated = staffSchema.partial().parse(req.body)
  await member.update(validated)
  res.json({ success: true, message: 'Staff updated', data: member })
})

exports.remove = asyncHandler(async (req, res) => {
  const member = await Staff.findByPk(req.params.id)
  if (!member) {
    res.status(404)
    throw new Error('Staff not found')
  }
  await member.update({ isActive: false })
  res.json({ success: true, message: 'Staff deactivated' })
})
