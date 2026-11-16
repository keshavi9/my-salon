const router = require('express').Router()
const { getRevenue, getStaffPerformance } = require('../controllers/reportsController')
const auth = require('../middleware/auth')
const roleGuard = require('../middleware/roleGuard')

// Only admins and managers can view reports
const canViewReports = roleGuard(['admin', 'manager'])

/**
 * @openapi
 * tags:
 *   name: Reports
 *   description: Business intelligence — revenue and staff performance (admin/manager only)
 */

/**
 * @openapi
 * /api/reports/revenue:
 *   get:
 *     tags: [Reports]
 *     summary: Revenue summary for a given date range
 *     description: Roles allowed — admin, manager.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date, example: '2024-07-01' }
 *         description: Start date (inclusive)
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date, example: '2024-07-31' }
 *         description: End date (inclusive)
 *     responses:
 *       200: { description: Revenue breakdown by day/service/method }
 *       403: { description: Insufficient role }
 */
router.use(auth)
router.use(canViewReports)

router.get('/revenue', getRevenue)

/**
 * @openapi
 * /api/reports/staff-performance:
 *   get:
 *     tags: [Reports]
 *     summary: Staff performance metrics for a given date range
 *     description: Roles allowed — admin, manager.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date, example: '2024-07-01' }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date, example: '2024-07-31' }
 *     responses:
 *       200: { description: Per-staff booking count, revenue, and avg rating }
 *       403: { description: Insufficient role }
 */
router.get('/staff-performance', getStaffPerformance)

module.exports = router

