const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  customerId: { type: DataTypes.UUID, allowNull: false },
  staffId: { type: DataTypes.UUID },
  // services stored as JSON array of { serviceId, serviceName, price, duration, quantity }
  services: { type: DataTypes.JSONB, defaultValue: [] },
  date: { type: DataTypes.DATE, allowNull: false },
  startTime: { type: DataTypes.STRING },
  endTime: { type: DataTypes.STRING },
  duration: { type: DataTypes.INTEGER, defaultValue: 30 },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'),
    defaultValue: 'pending',
  },
  bookingType: { type: DataTypes.ENUM('Scheduled', 'Walk_In'), defaultValue: 'Scheduled' },
  attendanceStatus: {
    type: DataTypes.ENUM('Booked', 'Checked_In', 'In_Service', 'Completed'),
    defaultValue: 'Booked',
  },
  paymentModel: { type: DataTypes.ENUM('Pre-Paid', 'Post-Paid'), defaultValue: 'Post-Paid' },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  paidAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  paymentStatus: { type: DataTypes.ENUM('unpaid', 'partial', 'paid'), defaultValue: 'unpaid' },
  paymentMethod: { type: DataTypes.ENUM('cash', 'card', 'upi', 'wallet') },
  notes: { type: DataTypes.TEXT },
  razorpayOrderId: { type: DataTypes.STRING },
}, { tableName: 'bookings' })

module.exports = Booking
