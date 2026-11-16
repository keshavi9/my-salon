const crypto = require('crypto')
const Booking = require('../models/Booking')

exports.handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      return res.status(500).json({ message: 'Webhook secret not configured' })
    }

    const signature = req.headers['x-razorpay-signature']
    if (!signature) {
      return res.status(400).json({ message: 'Missing webhook signature' })
    }

    // req.body is a raw Buffer here (express.raw() is applied in server.js).
    // We MUST sign the buffer directly — NOT JSON.stringify(req.body) —
    // because Razorpay signs the exact bytes it sent, and re-serialization
    // can produce a different byte sequence (key order, whitespace, etc).
    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({ message: 'Invalid body format — expected raw buffer' })
    }

    const digest = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)       // raw bytes, not re-serialized JSON
      .digest('hex')

    if (digest !== signature) {
      return res.status(400).json({ message: 'Webhook signature mismatch' })
    }

    // Signature verified — safe to parse the body now
    let parsed
    try {
      parsed = JSON.parse(req.body.toString('utf8'))
    } catch {
      return res.status(400).json({ message: 'Webhook body is not valid JSON' })
    }

    const event = parsed.event
    const payload = parsed.payload

    if (event === 'payment.captured') {
      const payment = payload?.payment?.entity
      const orderId = payment?.order_id

      if (orderId) {
        const booking = await Booking.findOne({ where: { razorpayOrderId: orderId } })
        if (booking && booking.status === 'pending') {
          booking.status = 'confirmed'
          booking.paymentStatus = 'paid'
          booking.expiresAt = null  // clear draft TTL — field now defined in Booking.js
          await booking.save()
          console.log(`Webhook: Booking ${booking.id} confirmed via payment.captured`)
        }
      }
    } else if (event === 'payment.failed') {
      const payment = payload?.payment?.entity
      const orderId = payment?.order_id

      if (orderId) {
        const booking = await Booking.findOne({ where: { razorpayOrderId: orderId } })
        if (booking && booking.status === 'pending') {
          booking.status = 'cancelled'
          booking.paymentStatus = 'unpaid'
          await booking.save()
          console.log(`Webhook: Booking ${booking.id} cancelled via payment.failed`)
        }
      }
    } else {
      // Log unhandled events so we can extend the handler later
      console.log(`Webhook: unhandled event type "${event}"`)
    }

    res.json({ status: 'ok' })
  } catch (err) {
    console.error('Webhook execution failed:', err.message)
    res.status(500).json({ message: err.message })
  }
}

