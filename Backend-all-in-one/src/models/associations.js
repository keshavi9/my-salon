const Booking = require('../models/Booking')
const Customer = require('../models/Customer')
const Staff = require('../models/Staff')
const Payment = require('../models/Payment')

Booking.belongsTo(Customer, { foreignKey: 'customerId' })
Booking.belongsTo(Staff, { foreignKey: 'staffId' })
Customer.hasMany(Booking, { foreignKey: 'customerId' })
Staff.hasMany(Booking, { foreignKey: 'staffId' })

Payment.belongsTo(Customer, { foreignKey: 'customerId' })
Payment.belongsTo(Booking, { foreignKey: 'bookingId' })
Customer.hasMany(Payment, { foreignKey: 'customerId' })
