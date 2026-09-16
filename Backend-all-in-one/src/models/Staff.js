const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Staff = sequelize.define('Staff', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
  phone: { type: DataTypes.STRING },
  role: { type: DataTypes.ENUM('stylist', 'assistant', 'manager'), defaultValue: 'stylist' },
  specialization: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  commissionRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  workingDays: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'staff' })

module.exports = Staff
