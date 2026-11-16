const Booking = require('../models/Booking')
const Customer = require('../models/Customer')
const Staff = require('../models/Staff')
const Payment = require('../models/Payment')

Booking.belongsTo(Customer, { foreignKey: 'customerId' })
Booking.belongsTo(Staff, { foreignKey: 'staffId' })
Customer.hasMany(Booking, { foreignKey: 'customerId' })
Staff.hasMany(Booking, { foreignKey: 'staffId' })

// Payment ↔ Booking (bidirectional — both sides required for eager-loading)
Booking.hasMany(Payment, { foreignKey: 'bookingId' })   // ← was missing
Payment.belongsTo(Booking, { foreignKey: 'bookingId' })
Payment.belongsTo(Customer, { foreignKey: 'customerId' })
Customer.hasMany(Payment, { foreignKey: 'customerId' })
