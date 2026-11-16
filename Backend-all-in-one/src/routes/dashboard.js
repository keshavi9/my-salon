const router = require('express').Router()
const { getDashboardData } = require('../controllers/dashboardController')
const auth = require('../middleware/auth')

/**
 * @openapi
 * tags:
 *   name: Dashboard
 *   description: Aggregated KPI data for the CRM home screen
 */

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get all dashboard KPIs in a single call
 *     description: >
 *       Returns today's revenue, total bookings, new customers, upcoming
 *       appointments, top services, and staff utilization. Inventory and
 *       notification sections are currently stubbed (TODO).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Dashboard KPI payload }
 *       401: { description: Unauthorized }
 */
router.use(auth)
router.get('/', getDashboardData)

module.exports = router

