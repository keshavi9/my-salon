const router = require('express').Router()
const { getAll, getOne, getHistory, create, update, remove, updateLoyalty } = require('../controllers/customerController')
const auth = require('../middleware/auth')
const roleGuard = require('../middleware/roleGuard')

const canMutate = roleGuard(['admin', 'manager', 'receptionist'])

/**
 * @openapi
 * tags:
 *   name: Customers
 *   description: Customer profiles, booking history, and loyalty points
 */

/**
 * @openapi
 * /api/customers:
 *   get:
 *     tags: [Customers]
 *     summary: List all customers (paginated, searchable)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Filter by name or phone number
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200: { description: Paginated customer list }
 *       401: { description: Unauthorized }
 */
router.use(auth)
router.get('/', getAll)

/**
 * @openapi
 * /api/customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Get a single customer by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Customer object }
 *       404: { description: Customer not found }
 */
router.get('/:id', getOne)

/**
 * @openapi
 * /api/customers/{id}/history:
 *   get:
 *     tags: [Customers]
 *     summary: Get full booking and payment history for a customer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: List of past bookings and payments }
 *       404: { description: Customer not found }
 */
router.get('/:id/history', getHistory)

/**
 * @openapi
 * /api/customers:
 *   post:
 *     tags: [Customers]
 *     summary: Create a new customer profile
 *     description: Roles allowed — admin, manager, receptionist.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone]
 *             properties:
 *               name:  { type: string, example: Ananya Mehta }
 *               phone: { type: string, example: '+919876543210' }
 *               email: { type: string, format: email }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Customer created }
 *       400: { description: Validation error or duplicate phone }
 */
router.post('/', canMutate, create)

/**
 * @openapi
 * /api/customers/{id}:
 *   put:
 *     tags: [Customers]
 *     summary: Update a customer profile
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
 *               name:  { type: string }
 *               phone: { type: string }
 *               email: { type: string, format: email }
 *               notes: { type: string }
 *     responses:
 *       200: { description: Customer updated }
 *       404: { description: Customer not found }
 */
router.put('/:id', canMutate, update)

/**
 * @openapi
 * /api/customers/{id}/loyalty:
 *   patch:
 *     tags: [Customers]
 *     summary: Update a customer's loyalty points
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
 *             required: [points]
 *             properties:
 *               points: { type: integer, example: 150, description: New absolute loyalty point value }
 *     responses:
 *       200: { description: Loyalty points updated }
 *       404: { description: Customer not found }
 */
router.patch('/:id/loyalty', canMutate, updateLoyalty)

/**
 * @openapi
 * /api/customers/{id}:
 *   delete:
 *     tags: [Customers]
 *     summary: Delete a customer profile
 *     description: Roles allowed — admin, manager, receptionist.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Customer deleted }
 *       404: { description: Customer not found }
 */
router.delete('/:id', canMutate, remove)

module.exports = router

