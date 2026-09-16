require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { connectDB } = require('./src/config/db')
const errorHandler = require('./src/middleware/errorHandler')
const rateLimiter = require('./src/middleware/rateLimiter')
require('./src/models/associations')

const app = express()
app.use(morgan('dev'))

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}))
app.use(express.json())

// Routes
const routes = [
  { path: '/api/customers', file: './src/routes/customers' },
  { path: '/api/bookings',  file: './src/routes/bookings'  },
  { path: '/api/payments',  file: './src/routes/payments'  },
  { path: '/api/services',  file: './src/routes/services'  },
  { path: '/api/staff',     file: './src/routes/staff'     },
  { path: '/api/support',   file: './src/routes/support'   },
  { path: '/api/dashboard', file: './src/routes/dashboard' },
]

app.use('/api/auth', rateLimiter, require('./src/routes/auth'))

routes.forEach(({ path, file }) => app.use(path, require(file)))

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'SalonPro API running' }))

app.use(errorHandler)

const PORT = process.env.PORT || 5000

const start = async () => {
  await connectDB()

  app.listen(PORT, () => {
    const line = '─'.repeat(50)
    console.log(`\n\x1b[35m${line}\x1b[0m`)
    console.log(`\x1b[35m  ✂  SalonPro API\x1b[0m`)
    console.log(`\x1b[35m${line}\x1b[0m`)
    console.log(`\x1b[32m  ✔  Server     \x1b[0m http://localhost:${PORT}`)
    console.log(`\x1b[32m  ✔  Health     \x1b[0m http://localhost:${PORT}/api/health`)
    console.log(`\x1b[32m  ✔  Env        \x1b[0m ${process.env.NODE_ENV || 'development'}`)
    console.log(`\x1b[35m${line}\x1b[0m`)
    console.log('\x1b[36m  Routes registered:\x1b[0m')
    routes.forEach(({ path }) => console.log(`\x1b[90m    POST/GET/PUT/DELETE  ${path}\x1b[0m`))
    console.log(`\x1b[90m    GET                  /api/health\x1b[0m`)
    console.log(`\x1b[35m${line}\x1b[0m\n`)
  })
}

start()
