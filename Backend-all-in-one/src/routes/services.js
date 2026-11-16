const router = require('express').Router()
const { getAll, getOne, create, update, remove } = require('../controllers/serviceController')
const auth = require('../middleware/auth')
const roleGuard = require('../middleware/roleGuard')

const canMutate = roleGuard(['admin', 'manager'])

/**
 * @openapi
 * tags:
 *   name: Services
 *   description: Salon service catalogue management
 */

/**
 * @openapi
 * /api/services:
 *   get:
 *     tags: [Services]
 *     summary: List all services
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Array of service objects }
 */
router.use(auth)
router.get('/', getAll)

/**
 * @openapi
 * /api/services/{id}:
 *   get:
 *     tags: [Services]
 *     summary: Get a single service by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Service object }
 *       404: { description: Service not found }
 */
router.get('/:id', getOne)

/**
 * @openapi
 * /api/services:
 *   post:
 *     tags: [Services]
 *     summary: Create a service
 *     description: Roles allowed — admin, manager.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, duration]
 *             properties:
 *               name:        { type: string, example: Balayage }
 *               description: { type: string }
 *               price:       { type: number, example: 2500 }
 *               duration:    { type: integer, description: Duration in minutes, example: 90 }
 *               category:    { type: string, example: Colouring }
 *     responses:
 *       201: { description: Service created }
 *       400: { description: Validation error }
 */
router.post('/', canMutate, create)

/**
 * @openapi
 * /api/services/{id}:
 *   put:
 *     tags: [Services]
 *     summary: Update a service
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
 *               name:     { type: string }
 *               price:    { type: number }
 *               duration: { type: integer }
 *     responses:
 *       200: { description: Service updated }
 *       404: { description: Service not found }
 */
router.put('/:id', canMutate, update)

/**
 * @openapi
 * /api/services/{id}:
 *   delete:
 *     tags: [Services]
 *     summary: Delete a service
 *     description: Roles allowed — admin, manager.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Service deleted }
 *       404: { description: Service not found }
 */
router.delete('/:id', canMutate, remove)

module.exports = router

