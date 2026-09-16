const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const SupportTicket = sequelize.define('SupportTicket', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  ticketId: { type: DataTypes.STRING, allowNull: false, unique: true },
  subject: { type: DataTypes.STRING, allowNull: false },
  category: {
    type: DataTypes.ENUM('billing', 'technical', 'feature', 'bug', 'question'),
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('open', 'in-progress', 'resolved', 'closed'),
    defaultValue: 'open',
  },
  description: { type: DataTypes.TEXT, allowNull: false },
  adminEmail: { type: DataTypes.STRING, allowNull: false },
  // stored as JSON arrays
  attachments: { type: DataTypes.JSONB, defaultValue: [] },
  messages: { type: DataTypes.JSONB, defaultValue: [] },
  assignedTo: { type: DataTypes.STRING },
  resolvedAt: { type: DataTypes.DATE },
  emailSent: { type: DataTypes.BOOLEAN, defaultValue: false },
  emailSentAt: { type: DataTypes.DATE },
}, { tableName: 'support_tickets' })

module.exports = SupportTicket
