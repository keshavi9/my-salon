const { Op } = require('sequelize')
const { sequelize } = require('../config/db')   // moved from inside getTicketStats
const SupportTicket = require('../models/SupportTicket')
const nodemailer = require('nodemailer')
const asyncHandler = require('express-async-handler')
const { z } = require('zod')
const { v4: uuidv4 } = require('uuid')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// ---------------------------------------------------------------------------
// Escape HTML special characters before embedding user input in email HTML.
// Without this, ticket.description could inject arbitrary HTML/scripts into
// the dev team's email client.
// ---------------------------------------------------------------------------
const escapeHtml = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const sendTicketEmail = async (ticket) => {
  if (!process.env.DEV_TEAM_EMAIL) return
  await transporter.sendMail({
    from: ticket.adminEmail,
    to: process.env.DEV_TEAM_EMAIL,
    subject: `[${ticket.category.toUpperCase()}] [${ticket.priority.toUpperCase()}] ${ticket.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #9D679F, #6F5AA3); padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0;">New Support Ticket</h2>
        </div>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px;">
          <p><strong>Ticket ID:</strong> ${escapeHtml(ticket.ticketId)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(ticket.subject)}</p>
          <p><strong>Category:</strong> ${escapeHtml(ticket.category)}</p>
          <p><strong>Priority:</strong> ${escapeHtml(ticket.priority)}</p>
          <p><strong>From:</strong> ${escapeHtml(ticket.adminEmail)}</p>
          <p><strong>Description:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(ticket.description)}</p>
        </div>
      </div>
    `,
  })
}

const ticketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  category: z.string().min(1, 'Category is required').transform(v => v.toLowerCase()),
  priority: z.string().min(1, 'Priority is required').transform(v => v.toLowerCase()),
  description: z.string().min(1, 'Description is required'),
  adminEmail: z.string().email('Invalid email'),
  attachments: z.array(z.string()).optional(),
})

const messageSchema = z.object({
  sender: z.string().min(1, 'Sender is required'),
  message: z.string().min(1, 'Message cannot be empty'),
  isAdmin: z.boolean().optional(),
})

// Valid ticket statuses — mirrors the SupportTicket model ENUM
const TICKET_STATUSES = ['open', 'in-progress', 'resolved', 'closed']

const ticketStatusSchema = z.object({
  status: z.enum(TICKET_STATUSES, {
    errorMap: () => ({ message: `status must be one of: ${TICKET_STATUSES.join(', ')}` }),
  }),
})

exports.createTicket = asyncHandler(async (req, res) => {
  const validated = ticketSchema.parse(req.body)
  const ticketId = `TKT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${uuidv4().slice(0, 8).toUpperCase()}`

  const ticket = await SupportTicket.create({
    ...validated,
    ticketId,
    status: 'open',
  })

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await sendTicketEmail(ticket)
      await ticket.update({ emailSent: true, emailSentAt: new Date() })
    }
  } catch (emailErr) {
    console.error('Email send failed:', emailErr.message)
  }

  res.status(201).json({ success: true, message: 'Support ticket created successfully', data: ticket })
})

exports.getAllTickets = asyncHandler(async (req, res) => {
  const { status, category, priority, search, page, limit } = req.query
  const where = {}
  if (status && status !== 'all') where.status = status
  if (category) where.category = category
  if (priority) where.priority = priority
  if (search) {
    where[Op.or] = [
      { ticketId: { [Op.iLike]: `%${search}%` } },
      { subject: { [Op.iLike]: `%${search}%` } },
    ]
  }

  const pageNum = parseInt(page) || 1
  const limitNum = Math.min(parseInt(limit) || 20, 100)
  const offset = (pageNum - 1) * limitNum

  const { count, rows } = await SupportTicket.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [['createdAt', 'DESC']]
  })
  res.json({ success: true, data: rows, total: count, page: pageNum, limit: limitNum })
})

exports.getTicketById = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findOne({ where: { ticketId: req.params.ticketId } })
  if (!ticket) {
    res.status(404)
    throw new Error('Ticket not found')
  }
  res.json({ success: true, data: ticket })
})

exports.updateTicketStatus = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findOne({ where: { ticketId: req.params.ticketId } })
  if (!ticket) {
    res.status(404)
    throw new Error('Ticket not found')
  }

  // Validate status via Zod enum — raw req.body.status would cause a Postgres
  // ENUM constraint 500 on invalid values instead of a clean 400.
  const { status } = ticketStatusSchema.parse(req.body)

  const updates = { status }
  if (status === 'resolved' || status === 'closed') updates.resolvedAt = new Date()
  await ticket.update(updates)
  res.json({ success: true, message: 'Ticket status updated successfully', data: ticket })
})

exports.addMessage = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findOne({ where: { ticketId: req.params.ticketId } })
  if (!ticket) {
    res.status(404)
    throw new Error('Ticket not found')
  }
  const validated = messageSchema.parse(req.body)
  const messages = [...(ticket.messages || []), { ...validated, createdAt: new Date() }]
  await ticket.update({ messages })
  res.json({ success: true, message: 'Message added successfully', data: ticket })
})

exports.getTicketStats = asyncHandler(async (req, res) => {
  const [total, open, inProgress, resolved, closed] = await Promise.all([
    SupportTicket.count(),
    SupportTicket.count({ where: { status: 'open' } }),
    SupportTicket.count({ where: { status: 'in-progress' } }),
    SupportTicket.count({ where: { status: 'resolved' } }),
    SupportTicket.count({ where: { status: 'closed' } }),
  ])

  const byCategoryRaw = await SupportTicket.findAll({
    attributes: [['category', '_id'], [sequelize.fn('COUNT', '*'), 'count']],
    group: ['category'],
    raw: true,
  })
  const byPriorityRaw = await SupportTicket.findAll({
    attributes: [['priority', '_id'], [sequelize.fn('COUNT', '*'), 'count']],
    group: ['priority'],
    raw: true,
  })

  // Ensure 'count' is parsed as an integer since raw pg responses often return strings for count
  const byCategory = byCategoryRaw.map(r => ({ _id: r._id, count: parseInt(r.count, 10) }))
  const byPriority = byPriorityRaw.map(r => ({ _id: r._id, count: parseInt(r.count, 10) }))

  res.json({
    success: true,
    data: { total, open, inProgress, resolved, closed, byCategory, byPriority },
  })
})

