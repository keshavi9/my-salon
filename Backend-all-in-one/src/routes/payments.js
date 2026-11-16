const router = require('express').Router()
const { getAll, getOne, create, update, remove } = require('../controllers/paymentController')
const auth = require('../middleware/auth')
const roleGuard = require('../middleware/roleGuard')

const canMutate = roleGuard(['admin', 'manager', 'receptionist'])

/**
 * @openapi
 * tags:
 *   name: Payments
 *   description: Payment records — cash, card, UPI, wallet, and online gateway entries
 */

/**
 * @openapi
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: List all payments (paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200: { description: Paginated list of payments with linked customer and booking }
 *       401: { description: Unauthorized }
 */
router.use(auth)
router.get('/', getAll)

/**
 * @openapi
 * /api/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get a single payment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Payment object with linked customer and booking }
 *       404: { description: Payment not found }
 */
router.get('/:id', getOne)

/**
 * @openapi
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Record a new payment
 *     description: Roles allowed — admin, manager, receptionist.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerId, amount, method]
 *             properties:
 *               customerId: { type: string, format: uuid }
 *               bookingId:  { type: string, format: uuid, description: Optional — omit for walk-in payments }
 *               amount:     { type: number, minimum: 0, example: 850.00 }
 *               method:     { type: string, enum: [cash, card, upi, wallet, other] }
 *               status:     { type: string, enum: [pending, paid, completed, refunded, failed] }
 *     responses:
 *       201: { description: Payment recorded }
 *       400: { description: Validation error }
 */
router.post('/', canMutate, create)

/**
 * @openapi
 * /api/payments/{id}:
 *   put:
 *     tags: [Payments]
 *     summary: Update a payment record
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
 *               amount: { type: number }
 *               method: { type: string, enum: [cash, card, upi, wallet, other] }
 *               status: { type: string, enum: [pending, paid, completed, refunded, failed] }
 *     responses:
 *       200: { description: Payment updated }
 *       404: { description: Payment not found }
 */
router.put('/:id', canMutate, update)

/**
 * @openapi
 * /api/payments/{id}:
 *   delete:
 *     tags: [Payments]
 *     summary: Delete a payment (reverts linked booking to pending)
 *     description: Roles allowed — admin, manager, receptionist.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Payment deleted }
 *       404: { description: Payment not found }
 */
router.delete('/:id', canMutate, remove)

module.exports = router

