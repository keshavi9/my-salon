const { Op } = require('sequelize')
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

const sendTicketEmail = async (ticket) => {
  if (!process.env.DEV_TEAM_EMAIL) return; // avoid crashing if not configured
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
          <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
          <p><strong>Subject:</strong> ${ticket.subject}</p>
          <p><strong>Category:</strong> ${ticket.category}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p><strong>From:</strong> ${ticket.adminEmail}</p>
          <p><strong>Description:</strong></p>
          <p style="white-space: pre-wrap;">${ticket.description}</p>
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
  const limitNum = parseInt(limit) || 20
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
  const status = req.body.status
  if (!status) {
    res.status(400)
    throw new Error('Status is required')
  }
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

  const { sequelize } = require('../config/db')
  const [byCategory] = await sequelize.query(
    `SELECT category AS "_id", COUNT(*) AS count FROM support_tickets GROUP BY category`
  )
  const [byPriority] = await sequelize.query(
    `SELECT priority AS "_id", COUNT(*) AS count FROM support_tickets GROUP BY priority`
  )

  res.json({
    success: true,
    data: { total, open, inProgress, resolved, closed, byCategory, byPriority },
  })
})
