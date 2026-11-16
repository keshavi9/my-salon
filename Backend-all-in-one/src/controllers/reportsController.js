const { Op, fn, col, literal } = require('sequelize')
const Booking = require('../models/Booking')
const Staff = require('../models/Staff')
const asyncHandler = require('express-async-handler')
const { cache, TTL } = require('../utils/cache')

exports.getRevenue = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query

  // ── Cache check ──────────────────────────────────────────────────────────
  const cacheKey = `reports:revenue:${startDate || 'all'}:${endDate || 'all'}`
  const cached = cache.get(cacheKey)
  if (cached !== undefined) {
    return res.json({ success: true, data: cached, fromCache: true })
  }

  const where = { status: 'completed' }
  if (startDate && endDate) {
    where.date = { [Op.between]: [startDate, endDate] }
  }

  // Aggregate revenue grouped by date
  const dailyRevenue = await Booking.findAll({
    attributes: [
      [fn('DATE', col('date')), 'day'],
      [fn('SUM', col('totalAmount')), 'revenue'],
      [fn('COUNT', col('id')), 'bookingCount']
    ],
    where,
    group: [fn('DATE', col('date'))],
    order: [[fn('DATE', col('date')), 'ASC']],
    raw: true,
  })

  // Format to numbers
  const formatted = dailyRevenue.map(row => ({
    day: row.day,
    revenue: parseFloat(row.revenue) || 0,
    bookingCount: parseInt(row.bookingCount, 10) || 0
  }))

  const totalRevenue = formatted.reduce((sum, row) => sum + row.revenue, 0)
  const payload = { totalRevenue, dailyRevenue: formatted }

  // ── Cache store ──────────────────────────────────────────────────────────
  cache.set(cacheKey, payload, TTL.REPORTS)

  res.json({ success: true, data: payload })
})

exports.getStaffPerformance = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query

  // ── Cache check ──────────────────────────────────────────────────────────
  const cacheKey = `reports:staff:${startDate || 'all'}:${endDate || 'all'}`
  const cached = cache.get(cacheKey)
  if (cached !== undefined) {
    return res.json({ success: true, data: cached, fromCache: true })
  }

  const where = { status: 'completed', staffId: { [Op.ne]: null } }
  if (startDate && endDate) {
    where.date = { [Op.between]: [startDate, endDate] }
  }

  const performance = await Booking.findAll({
    attributes: [
      'staffId',
      [fn('SUM', col('totalAmount')), 'generatedRevenue'],
      [fn('COUNT', col('id')), 'completedBookings']
    ],
    where,
    include: [{ model: Staff, attributes: ['name', 'role'] }],
    group: ['staffId', 'Staff.id', 'Staff.name', 'Staff.role'],
    order: [[literal('"generatedRevenue"'), 'DESC']],
    raw: true,
    nest: true
  })

  const formatted = performance.map(row => ({
    staffId: row.staffId,
    name: row.Staff.name,
    role: row.Staff.role,
    generatedRevenue: parseFloat(row.generatedRevenue) || 0,
    completedBookings: parseInt(row.completedBookings, 10) || 0
  }))

  // ── Cache store ──────────────────────────────────────────────────────────
  cache.set(cacheKey, formatted, TTL.REPORTS)

  res.json({ success: true, data: formatted })
})
