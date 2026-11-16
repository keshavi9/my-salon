const router = require('express').Router()
const { getAll, getOne, getSchedule, create, update, remove } = require('../controllers/staffController')
const auth = require('../middleware/auth')
const roleGuard = require('../middleware/roleGuard')

const canMutate = roleGuard(['admin', 'manager'])

/**
 * @openapi
 * tags:
 *   name: Staff
 *   description: Staff member profiles and schedule management
 */

/**
 * @openapi
 * /api/staff:
 *   get:
 *     tags: [Staff]
 *     summary: List all staff members
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Array of staff objects }
 */
router.use(auth)
router.get('/', getAll)

/**
 * @openapi
 * /api/staff/{id}:
 *   get:
 *     tags: [Staff]
 *     summary: Get a single staff member by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Staff object }
 *       404: { description: Staff not found }
 */
router.get('/:id', getOne)

/**
 * @openapi
 * /api/staff/{id}/schedule:
 *   get:
 *     tags: [Staff]
 *     summary: Get bookings scheduled for a specific staff member
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date, example: '2024-07-15' }
 *         description: Filter schedule to a specific date
 *     responses:
 *       200: { description: Array of bookings for the given staff and date }
 *       404: { description: Staff not found }
 */
router.get('/:id/schedule', getSchedule)

/**
 * @openapi
 * /api/staff:
 *   post:
 *     tags: [Staff]
 *     summary: Create a new staff member
 *     description: Roles allowed — admin, manager.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone, role]
 *             properties:
 *               name:       { type: string, example: Raj Sharma }
 *               phone:      { type: string, example: '+919876543210' }
 *               role:       { type: string, example: stylist }
 *               speciality: { type: string, example: Colouring }
 *     responses:
 *       201: { description: Staff created }
 *       400: { description: Validation error }
 */
router.post('/', canMutate, create)

/**
 * @openapi
 * /api/staff/{id}:
 *   put:
 *     tags: [Staff]
 *     summary: Update a staff member's profile
 *     description: Roles allowed — admin, manager.
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
 *               name:       { type: string }
 *               phone:      { type: string }
 *               speciality: { type: string }
 *               isActive:   { type: boolean }
 *     responses:
 *       200: { description: Staff updated }
 *       404: { description: Staff not found }
 */
router.put('/:id', canMutate, update)

/**
 * @openapi
 * /api/staff/{id}:
 *   delete:
 *     tags: [Staff]
 *     summary: Remove a staff member
 *     description: Roles allowed — admin, manager.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Staff removed }
 *       404: { description: Staff not found }
 */
router.delete('/:id', canMutate, remove)

module.exports = router

