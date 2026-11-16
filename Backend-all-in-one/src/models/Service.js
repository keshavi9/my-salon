const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Service = sequelize.define('Service', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  category: { type: DataTypes.ENUM('Hair', 'Nails', 'Facial', 'Waxing', 'Skin', 'Body', 'Makeup'), allowNull: false },
  // stored in paise, displayed in rupees
  price: { type: DataTypes.INTEGER, allowNull: false },
  duration: { type: DataTypes.INTEGER, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { 
  tableName: 'services',
  indexes: [
    { fields: ['category'] },
    { fields: ['isActive'] }
  ]
})


module.exports = Service
