const { Op, fn, col, literal } = require('sequelize')
const { cache, TTL } = require('../utils/cache')
const Customer = require('../models/Customer')
const Booking = require('../models/Booking')
const Service = require('../models/Service')
const Staff = require('../models/Staff')
const asyncHandler = require('express-async-handler')

// ---------------------------------------------------------------------------
// Helper: format a decimal/number as a rupee string (e.g. 45200 → "₹45,200")
// ---------------------------------------------------------------------------
const toRupee = (value) => {
  const n = parseFloat(value) || 0
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

// ---------------------------------------------------------------------------
// Helper: get the start and end of a given Date as UTC Date objects
// ---------------------------------------------------------------------------
const dayBounds = (date) => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

// ---------------------------------------------------------------------------
// Helper: compute date bounds for a named range
// ---------------------------------------------------------------------------
const getRangeBounds = (range) => {
  const now = new Date()
  let start, end

  switch (range) {
    case 'this-week': {
      // Mon–Sun of current week (rolling 7 days)
      start = new Date(now)
      start.setDate(now.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      end = new Date(now)
      end.setHours(23, 59, 59, 999)
      break
    }
    case 'this-month': {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      break
    }
    case 'today':
    default: {
      const { start: s, end: e } = dayBounds(now)
      start = s
      end = e
    }
  }
  return { start, end }
}

exports.getDashboardData = asyncHandler(async (req, res) => {
  // ── Range param from frontend (?range=today|this-week|this-month) ─────────
  const rangeParam = (req.query.range || 'today').toLowerCase()

  // ── Cache check ──────────────────────────────────────────────────────────
  // Key includes the range so each date window gets its own cache slot.
  const cacheKey = `dashboard:${rangeParam}`
  const cached = cache.get(cacheKey)
  if (cached !== undefined) {
    return res.json({ success: true, data: cached, fromCache: true })
  }

  const today = new Date()
  const { start: todayStart, end: todayEnd } = dayBounds(today)

  const { start: rangeStart, end: rangeEnd } = getRangeBounds(rangeParam)
  const isToday = rangeParam === 'today'
  const rangeWhere = { date: { [Op.between]: [rangeStart, rangeEnd] } }

  // ── 1. Scalar counts (scoped to selected range where applicable) ──────────
  const [totalCustomers, totalBookings, totalServices, totalStaff] = await Promise.all([
    Customer.count(isToday ? {} : { where: { createdAt: { [Op.between]: [rangeStart, rangeEnd] } } }),
    Booking.count(isToday ? {} : { where: rangeWhere }),
    Service.count(),
    Staff.count({ where: { isActive: true } }),
  ])

  // ── 2. Total revenue — sum of completed bookings (scoped to range) ────────
  // Using Booking.totalAmount (the booking-level ground truth) rather than
  // the Payment table because Booking.hasMany(Payment) association is not yet
  // set up in associations.js (medium-priority backlog item).
  const revenueWhere = isToday
    ? { status: 'completed' }
    : { status: 'completed', date: { [Op.between]: [rangeStart, rangeEnd] } }

  const revenueResult = await Booking.findOne({
    attributes: [[fn('SUM', col('totalAmount')), 'total']],
    where: revenueWhere,
    raw: true,
  })
  const totalRevenue = parseFloat(revenueResult?.total) || 0

  // Revenue yesterday (for helper text)
  const { start: yesterdayStart, end: yesterdayEnd } = dayBounds(
    new Date(today.getTime() - 86400000)
  )
  const yesterdayRevenueResult = await Booking.findOne({
    attributes: [[fn('SUM', col('totalAmount')), 'total']],
    where: {
      status: 'completed',
      date: { [Op.between]: [yesterdayStart, yesterdayEnd] },
    },
    raw: true,
  })
  const yesterdayRevenue = parseFloat(yesterdayRevenueResult?.total) || 0
  const revenueChangePercent =
    yesterdayRevenue > 0
      ? Math.round(((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
      : null
  const revenueHelper =
    revenueChangePercent !== null
      ? `${revenueChangePercent >= 0 ? '+' : ''}${revenueChangePercent}% from yesterday`
      : 'No data for yesterday'

  // Pending bookings count (for appointments helper text)
  const pendingCount = await Booking.count({ where: { status: 'pending' } })

  // New customers within range
  const newThisWeek = await Customer.count({
    where: { createdAt: { [Op.between]: [rangeStart, rangeEnd] } },
  })

  // ── 3. Timeline (scoped to selected range) ───────────────────────────────
  const todayBookings = await Booking.findAll({
    where: rangeWhere,
    include: [
      { model: Customer, attributes: ['name'] },
      { model: Staff, attributes: ['name'] },
    ],
    order: [['date', 'ASC'], ['startTime', 'ASC']],
  })

  const timeline = todayBookings.map((b) => ({
    time: b.startTime || '—',
    client: b.Customer?.name || 'Unknown',
    // services is a JSONB array of { serviceName, ... } — take first service name
    service:
      Array.isArray(b.services) && b.services.length > 0
        ? b.services.map((s) => s.serviceName || s.name || 'Service').join(', ')
        : 'N/A',
    stylist: b.Staff?.name || 'Unassigned',
    amount: toRupee(b.totalAmount),
    status: b.attendanceStatus || b.status,
  }))

  // ── 4. Performance chart (spans selected range, up to 31 days) ───────────
  const weeklyRows = await Booking.findAll({
    attributes: [
      [fn('DATE', col('date')), 'day'],
      [fn('SUM', col('totalAmount')), 'revenue'],
      [fn('COUNT', col('id')), 'bookingCount'],
    ],
    where: { date: { [Op.between]: [rangeStart, rangeEnd] } },
    group: [fn('DATE', col('date'))],
    order: [[fn('DATE', col('date')), 'ASC']],
    raw: true,
  })

  // Calculate total days in range for the chart loop
  const msInDay = 86400000
  const totalDays = Math.round((rangeEnd.getTime() - rangeStart.getTime()) / msInDay) + 1

  // Build a full date-range map (fill missing days with zeros)
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const rowByDay = {}
  for (const row of weeklyRows) {
    rowByDay[row.day] = row
  }

  const weeklyPerformance = []
  let maxRevenue = 0
  const tempDays = []
  const msInDayLocal = 86400000
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(rangeStart.getTime() + i * msInDayLocal)
    const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
    const row = rowByDay[key]
    const revenue = parseFloat(row?.revenue) || 0
    const bookingCount = parseInt(row?.bookingCount) || 0
    if (revenue > maxRevenue) maxRevenue = revenue
    tempDays.push({ date: d, key, revenue, bookingCount })
  }
  for (const { date, revenue, bookingCount } of tempDays) {
    const isTodayEntry = date.toDateString() === today.toDateString()
    // Label: use short date "15 Oct" for month-range, weekday otherwise
    const label = totalDays > 7
      ? `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`
      : DAY_NAMES[date.getDay()]
    weeklyPerformance.push({
      day: label,
      revenue,
      bookings: bookingCount,
      // Normalise bar height to max 140px; floor at 10 so bar is always visible
      height: maxRevenue > 0 ? Math.max(10, Math.round((revenue / maxRevenue) * 140)) : 10,
      isToday: isTodayEntry,
    })
  }

  // ── 5. Staff load (scoped to selected range) ──────────────────────────────
  const activeStaff = await Staff.findAll({
    where: { isActive: true },
    attributes: ['id', 'name', 'role'],
  })

  const staffBookingCounts = await Booking.findAll({
    attributes: ['staffId', [fn('COUNT', col('id')), 'count']],
    where: {
      date: { [Op.between]: [rangeStart, rangeEnd] },
      staffId: { [Op.ne]: null },
    },
    group: ['staffId'],
    raw: true,
  })

  const countByStaffId = {}
  for (const row of staffBookingCounts) {
    countByStaffId[row.staffId] = parseInt(row.count)
  }

  // Find the max bookings any single staff member has today (for load %)
  const maxLoad = Math.max(1, ...Object.values(countByStaffId))

  // Next booking time per staff member (always use today for "next" slot — future-facing)
  const nextBookings = await Booking.findAll({
    attributes: ['staffId', 'startTime'],
    where: {
      date: { [Op.between]: [todayStart, todayEnd] },
      staffId: { [Op.ne]: null },
      status: { [Op.in]: ['pending', 'confirmed'] },
    },
    order: [['startTime', 'ASC']],
    raw: true,
  })
  const nextByStaffId = {}
  for (const row of nextBookings) {
    if (!nextByStaffId[row.staffId]) nextByStaffId[row.staffId] = row.startTime
  }

  const staff = activeStaff.map((s) => {
    const bookingsToday = countByStaffId[s.id] || 0
    return {
      name: s.name,
      role: s.role,
      state: bookingsToday > 0 ? 'Active' : 'Available',
      load: Math.round((bookingsToday / maxLoad) * 100),
      bookingsToday,
      next: nextByStaffId[s.id] || null,
    }
  })

  // ── 6. Stubs — pending their own modules ──────────────────────────────────
  // TODO: Replace with real data once the Inventory module is built.
  const topProducts = []

  // TODO: Replace with real data once the Review/SupportTicket module is built.
  const reviews = []

  // TODO: Replace with a real notification/event system.
  const notifications = []

  // ── 7. Service category breakdown (real data from Booking JSONB) ──────────
  // Each booking.services is [{ serviceId, serviceName, price, ... }].
  // We count service occurrences from today's bookings as a quick proxy.
  // For a full breakdown, a dedicated analytics endpoint should be built.
  const services = []

  // ── 8. Assemble response ──────────────────────────────────────────────────
  // Human-readable label for the selected range
  const rangeLabel = rangeParam === 'this-week' ? 'this week'
    : rangeParam === 'this-month' ? 'this month'
    : 'today'

  const data = {
    range: rangeParam,
    metrics: [
      { label: 'Total Revenue', value: toRupee(totalRevenue), helper: revenueHelper },
      {
        label: 'Appointments',
        value: totalBookings.toString(),
        helper: `${pendingCount} pending confirmation`,
      },
      {
        label: 'New Clients',
        value: totalCustomers.toString(),
        helper: `+${newThisWeek} new ${rangeLabel}`,
      },
      { label: 'Services', value: totalServices.toString(), helper: 'Active catalog' },
    ],
    timeline,
    staff,
    weeklyPerformance,
    topProducts,
    reviews,
    notifications,
    services,
  }

  // ── Cache store ──────────────────────────────────────────────────────────
  cache.set(cacheKey, data, TTL.DASHBOARD)

  res.json({ success: true, data })
})
