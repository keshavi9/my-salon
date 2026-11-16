const router = require('express').Router()
const { handleRazorpayWebhook } = require('../controllers/webhookController')

/**
 * @openapi
 * tags:
 *   name: Webhooks
 *   description: Inbound webhook receivers — not for client use
 */

/**
 * @openapi
 * /api/webhooks/razorpay:
 *   post:
 *     tags: [Webhooks]
 *     summary: Razorpay payment event receiver
 *     description: >
 *       Called by Razorpay when a payment is captured or failed.
 *       **Not for direct client use.** The request must be sent as a raw
 *       JSON body and must include a valid `X-Razorpay-Signature` header.
 *       Signature verification is performed via HMAC-SHA256 against
 *       `RAZORPAY_WEBHOOK_SECRET`. No JWT required.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Raw Razorpay event payload
 *     parameters:
 *       - in: header
 *         name: X-Razorpay-Signature
 *         required: true
 *         schema: { type: string }
 *         description: HMAC-SHA256 signature from Razorpay
 *     responses:
 *       200: { description: Event processed successfully }
 *       400: { description: Missing or invalid signature / bad payload }
 *       500: { description: Webhook secret not configured }
 */
router.post('/razorpay', handleRazorpayWebhook)

module.exports = router

