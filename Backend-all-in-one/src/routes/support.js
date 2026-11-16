const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const canManageTickets = roleGuard(['admin', 'manager']);

/**
 * @openapi
 * tags:
 *   name: Support
 *   description: Internal support ticket system for staff/management
 */

/**
 * @openapi
 * /api/support/tickets:
 *   post:
 *     tags: [Support]
 *     summary: Create a support ticket
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject, message]
 *             properties:
 *               subject:  { type: string, example: POS not working }
 *               message:  { type: string }
 *               priority: { type: string, enum: [low, medium, high], default: medium }
 *     responses:
 *       201: { description: Ticket created }
 *       400: { description: Validation error }
 */
// All routes require authentication
router.post('/tickets', auth, supportController.createTicket);

/**
 * @openapi
 * /api/support/tickets:
 *   get:
 *     tags: [Support]
 *     summary: List all support tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [open, in_progress, resolved, closed] }
 *     responses:
 *       200: { description: Array of tickets }
 */
router.get('/tickets', auth, supportController.getAllTickets);

/**
 * @openapi
 * /api/support/tickets/stats:
 *   get:
 *     tags: [Support]
 *     summary: Get ticket count stats grouped by status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Ticket counts by status }
 */
router.get('/tickets/stats', auth, supportController.getTicketStats);

/**
 * @openapi
 * /api/support/tickets/{ticketId}:
 *   get:
 *     tags: [Support]
 *     summary: Get a single ticket with its message thread
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Ticket with messages }
 *       404: { description: Ticket not found }
 */
router.get('/tickets/:ticketId', auth, supportController.getTicketById);

/**
 * @openapi
 * /api/support/tickets/{ticketId}/status:
 *   patch:
 *     tags: [Support]
 *     summary: Update ticket status
 *     description: Roles allowed — admin, manager.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [open, in_progress, resolved, closed] }
 *     responses:
 *       200: { description: Ticket status updated }
 *       403: { description: Insufficient role }
 */
router.patch('/tickets/:ticketId/status', auth, canManageTickets, supportController.updateTicketStatus);

/**
 * @openapi
 * /api/support/tickets/{ticketId}/messages:
 *   post:
 *     tags: [Support]
 *     summary: Add a reply message to a ticket
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *     responses:
 *       201: { description: Message added to ticket thread }
 *       404: { description: Ticket not found }
 */
router.post('/tickets/:ticketId/messages', auth, supportController.addMessage);

module.exports = router;

