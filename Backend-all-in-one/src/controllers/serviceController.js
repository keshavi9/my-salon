const Service = require('../models/Service')
const asyncHandler = require('express-async-handler')
const { z } = require('zod')
const { cache, TTL } = require('../utils/cache')

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  isActive: z.boolean().optional(),
})

// ---------------------------------------------------------------------------
// DB stores price in paise (integer). Every API response must return rupees.
// This helper is the single point of that conversion — apply it to every
// Sequelize instance before sending it to the client.
//
// Defensive: uses .toJSON() when the instance is a real Sequelize model;
// falls back to a plain object spread for raw query results, cached DTOs,
// or test mocks. Without this guard, any non-Sequelize object triggers
//   TypeError: instance.toJSON is not a function
// which — because res.statusCode may already be set — causes the errorHandler
// to forward the wrong HTTP status code to the caller.
// ---------------------------------------------------------------------------
const serializeService = (instance) => {
  const obj = typeof instance.toJSON === 'function'
    ? instance.toJSON()
    : { ...instance }
  obj.price = obj.price / 100   // paise → rupees
  return obj
}

// ---------------------------------------------------------------------------
// Invalidate all services cache keys.
// Called after every mutation so the list and any cached single-item entries
// are refreshed on the next request. node-cache stores keys in a flat map so
// we filter by prefix rather than tracking individual keys.
// ---------------------------------------------------------------------------
const invalidateServicesCache = () => {
  const keys = cache.keys().filter(k => k.startsWith('services:'))
  if (keys.length) cache.del(keys)
}

exports.getAll = asyncHandler(async (req, res) => {
  const { isActive, category, page, limit } = req.query

  // ── Cache check (key includes all query params that affect the result) ──────
  const qs = new URLSearchParams({ isActive, category, page, limit }).toString()
  const cacheKey = `services:list:${qs}`
  const cached = cache.get(cacheKey)
  if (cached !== undefined) {
    return res.json({ success: true, ...cached, fromCache: true })
  }

  const where = {}
  if (isActive !== undefined) where.isActive = isActive === 'true'
  if (category) where.category = category

  const pageNum = parseInt(page) || 1
  const limitNum = Math.min(parseInt(limit) || 50, 100)
  const offset = (pageNum - 1) * limitNum

  const { count, rows } = await Service.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [['name', 'ASC']]
  })
  const payload = { data: rows.map(serializeService), total: count, page: pageNum, limit: limitNum }

  // ── Cache store ──────────────────────────────────────────────────────────
  cache.set(cacheKey, payload, TTL.SERVICES_LIST)

  res.json({ success: true, ...payload })
})

exports.getOne = asyncHandler(async (req, res) => {
  const cacheKey = `services:one:${req.params.id}`
  const cached = cache.get(cacheKey)
  if (cached !== undefined) {
    return res.json({ success: true, data: cached, fromCache: true })
  }

  const service = await Service.findByPk(req.params.id)
  if (!service) {
    res.status(404)
    throw new Error('Service not found')
  }
  const data = serializeService(service)
  cache.set(cacheKey, data, TTL.SERVICES_ONE)
  res.json({ success: true, data })
})

exports.create = asyncHandler(async (req, res) => {
  const validated = serviceSchema.parse(req.body)
  // Caller sends rupees → store paise in DB
  const body = { ...validated, price: Math.round(validated.price * 100) }
  const service = await Service.create(body)
  // Serialize BEFORE calling res.status() — if serializeService throws,
  // errorHandler will correctly default to 500 rather than inheriting 201.
  const data = serializeService(service)
  invalidateServicesCache()  // new service — bust the list cache
  res.status(201).json({ success: true, message: 'Service created', data })
})

exports.update = asyncHandler(async (req, res) => {
  const service = await Service.findByPk(req.params.id)
  if (!service) {
    res.status(404)
    throw new Error('Service not found')
  }
  const validated = serviceSchema.partial().parse(req.body)
  const body = { ...validated }
  // Caller sends rupees → store paise in DB
  if (body.price !== undefined) body.price = Math.round(body.price * 100)
  await service.update(body)
  // reload to get the updated row, then convert back to rupees for response
  await service.reload()
  // Serialize BEFORE res.json() — same reason as in create.
  const data = serializeService(service)
  invalidateServicesCache()  // service changed — bust list + this item's slot
  res.json({ success: true, message: 'Service updated', data })
})

exports.remove = asyncHandler(async (req, res) => {
  const service = await Service.findByPk(req.params.id)
  if (!service) {
    res.status(404)
    throw new Error('Service not found')
  }
  await service.update({ isActive: false })
  invalidateServicesCache()  // service deactivated — bust the list cache
  res.json({ success: true, message: 'Service deactivated' })
})

