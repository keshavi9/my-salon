const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL, {
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

    const isProd = process.env.NODE_ENV === 'production'

    if (isProd) {
      // In production: sync with no options — Sequelize validates connectivity
      // and confirms tables exist, but makes ZERO schema changes.
      // Schema changes must go through proper migrations (Sequelize CLI / Umzug).
      // alter:true is intentionally banned here — it issues ALTER TABLE on every
      // restart, which can lock rows, drop columns, and silently corrupt data.
      await sequelize.sync()
      console.log('\x1b[32m  ✔  Database connected (production — no schema changes)\x1b[0m')
    } else {
      // In development/test: alter:true is convenient for iterating on models
      // without writing migration files. Never use this against a production DB.
      await sequelize.sync({ alter: true })
      console.log('\x1b[32m  ✔  Database synced (development — alter:true active)\x1b[0m')
    }
  } catch (err) {
    console.error('\x1b[31m  ✖  PostgreSQL connection error:\x1b[0m', err.message)
    process.exit(1)
  }
}

module.exports = { sequelize, connectDB }
