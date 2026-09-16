const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  bookingId: { type: DataTypes.UUID },
  customerId: { type: DataTypes.UUID, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  method: { type: DataTypes.ENUM('cash', 'card', 'upi', 'wallet', 'other'), defaultValue: 'cash' },
  status: { type: DataTypes.ENUM('pending', 'paid', 'completed', 'refunded', 'failed'), defaultValue: 'pending' },
}, { tableName: 'payments' })

module.exports = Payment
