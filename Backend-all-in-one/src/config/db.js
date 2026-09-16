const { Sequelize } = require('sequelize')

const isTest = process.env.NODE_ENV === 'test';

const sequelize = isTest 
  ? new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false })
  : new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'production' ? false : console.log,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production'
          ? { require: true, rejectUnauthorized: false }
          : false,
      },
    })

const connectDB = async () => {
  try {
    console.log('\x1b[90m  Connecting to PostgreSQL...\x1b[0m')
    await sequelize.authenticate()
    console.log('\x1b[32m  ✔  PostgreSQL connected\x1b[0m')
    await sequelize.sync({ alter: true })
    console.log('\x1b[32m  ✔  Database synced\x1b[0m')
  } catch (err) {
    console.error('\x1b[31m  ✖  PostgreSQL connection error:\x1b[0m', err.message)
    process.exit(1)
  }
}

module.exports = { sequelize, connectDB }
