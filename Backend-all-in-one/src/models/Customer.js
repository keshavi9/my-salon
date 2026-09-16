const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING },
  gender: { type: DataTypes.ENUM('male', 'female', 'other') },
  dateOfBirth: { type: DataTypes.DATEONLY },
  address: { type: DataTypes.TEXT },
  loyaltyPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalVisits: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalSpent: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  membershipTier: { type: DataTypes.ENUM('silver', 'gold', 'platinum') },
  notes: { type: DataTypes.TEXT },
}, { tableName: 'customers' })

module.exports = Customer
