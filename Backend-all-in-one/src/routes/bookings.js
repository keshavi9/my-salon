const router = require('express').Router()
const { getAll, getOne, create, update, remove, sendReminder } = require('../controllers/bookingController')
const auth = require('../middleware/auth')
const roleGuard = require('../middleware/roleGuard')

const canMutate = roleGuard(['admin', 'manager', 'receptionist'])

/**
 * @openapi
 * tags:
 *   name: Bookings
 *   description: Appointment booking — CRUD and customer reminders
 */

/**
 * @openapi
 * /api/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: List all bookings (paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, cancelled, completed] }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date, example: '2024-07-15' }
 *     responses:
 *       200: { description: Paginated list of bookings }
 *       401: { description: Unauthorized }
 */
router.use(auth)
router.get('/', getAll)

/**
 * @openapi
 * /api/bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get a single booking by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Booking object }
 *       404: { description: Booking not found }
 */
router.get('/:id', getOne)

/**
 * @openapi
 * /api/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking
 *     description: Roles allowed — admin, manager, receptionist.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerId, staffId, date, startTime, services]
 *             properties:
 *               customerId: { type: string, format: uuid }
 *               staffId:    { type: string, format: uuid }
 *               date:       { type: string, format: date, example: '2024-07-15' }
 *               startTime:  { type: string, example: '10:00' }
 *               services:   { type: array, items: { type: string, format: uuid } }
 *               notes:      { type: string }
 *     responses:
 *       201: { description: Booking created }
 *       400: { description: Validation error or time-slot conflict }
 *       403: { description: Insufficient role }
 */
router.post('/', canMutate, create)

/**
 * @openapi
 * /api/bookings/{id}/send-reminder:
 *   post:
 *     tags: [Bookings]
 *     summary: Send an email reminder to the customer for this booking
 *     description: Roles allowed — admin, manager, receptionist.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Reminder sent (or simulated in dev) }
 *       404: { description: Booking not found }
 */
router.post('/:id/send-reminder', canMutate, sendReminder)

/**
 * @openapi
 * /api/bookings/{id}:
 *   put:
 *     tags: [Bookings]
 *     summary: Update a booking
 *     description: Roles allowed — admin, manager, receptionist.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:    { type: string, enum: [pending, confirmed, cancelled, completed] }
 *               date:      { type: string, format: date }
 *               startTime: { type: string, example: '11:00' }
 *               notes:     { type: string }
 *     responses:
 *       200: { description: Booking updated }
 *       404: { description: Booking not found }
 */
router.put('/:id', canMutate, update)

/**
 * @openapi
 * /api/bookings/{id}:
 *   delete:
 *     tags: [Bookings]
 *     summary: Cancel/delete a booking
 *     description: Roles allowed — admin, manager, receptionist.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Booking deleted }
 *       404: { description: Booking not found }
 */
router.delete('/:id', canMutate, remove)

module.exports = router

