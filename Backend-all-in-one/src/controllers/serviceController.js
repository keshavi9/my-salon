const Service = require('../models/Service')
const asyncHandler = require('express-async-handler')
const { z } = require('zod')

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  isActive: z.boolean().optional(),
})

exports.getAll = asyncHandler(async (req, res) => {
  const { isActive, category, page, limit } = req.query
  const where = {}
  if (isActive !== undefined) where.isActive = isActive === 'true'
  if (category) where.category = category
  
  const pageNum = parseInt(page) || 1
  const limitNum = parseInt(limit) || 50
  const offset = (pageNum - 1) * limitNum

  const { count, rows } = await Service.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [['name', 'ASC']]
  })
  res.json({ success: true, data: rows, total: count, page: pageNum, limit: limitNum })
})

exports.getOne = asyncHandler(async (req, res) => {
  const service = await Service.findByPk(req.params.id)
  if (!service) {
    res.status(404)
    throw new Error('Service not found')
  }
  res.json({ success: true, data: service })
})

exports.create = asyncHandler(async (req, res) => {
  const validated = serviceSchema.parse(req.body)
  const body = { ...validated, price: Math.round(validated.price * 100) }
  const service = await Service.create(body)
  res.status(201).json({ success: true, message: 'Service created', data: service })
})

exports.update = asyncHandler(async (req, res) => {
  const service = await Service.findByPk(req.params.id)
  if (!service) {
    res.status(404)
    throw new Error('Service not found')
  }
  const validated = serviceSchema.partial().parse(req.body)
  const body = { ...validated }
  if (body.price !== undefined) body.price = Math.round(body.price * 100)
  await service.update(body)
  res.json({ success: true, message: 'Service updated', data: service })
})

exports.remove = asyncHandler(async (req, res) => {
  const service = await Service.findByPk(req.params.id)
  if (!service) {
    res.status(404)
    throw new Error('Service not found')
  }
  await service.update({ isActive: false })
  res.json({ success: true, message: 'Service deactivated' })
})
