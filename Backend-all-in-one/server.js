require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const { connectDB } = require('./src/config/db')
const errorHandler = require('./src/middleware/errorHandler')
const rateLimiter = require('./src/middleware/rateLimiter')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./src/config/swagger')
require('./src/models/associations')

const app = express()

// Security headers — must be first middleware
app.use(helmet())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}))

// Warn at startup if FRONTEND_URL is missing in production — without it,
// the real frontend domain will be CORS-blocked and the fallback silently
// serves localhost:3000 which no browser will reach in production.
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.warn('\x1b[33m  ⚠  WARNING: FRONTEND_URL is not set. CORS will allow only localhost:3000.\x1b[0m')
}

// [SECURITY] Warn loudly if public self-registration is enabled in production.
// ALLOW_REGISTRATION=true is intended only for initial onboarding. If left on,
// anyone on the internet can create a 'stylist' account and gain authenticated
// access to customer PII, bookings, and payment records.
if (process.env.NODE_ENV === 'production' && process.env.ALLOW_REGISTRATION === 'true') {
  console.error('\x1b[31m\x1b[1m')
  console.error('  ╔══════════════════════════════════════════════════════╗')
  console.error('  ║  [SECURITY]  ALLOW_REGISTRATION=true in PRODUCTION  ║')
  console.error('  ║  Public self-registration is OPEN.                  ║')
  console.error('  ║  Anyone can create an account and access your data. ║')
  console.error('  ║  Set ALLOW_REGISTRATION=false immediately.          ║')
  console.error('  ╚══════════════════════════════════════════════════════╝')
  console.error('\x1b[0m')
}
// ── Webhook route MUST be mounted before express.json() ─────────────────────
// Razorpay signs the raw request bytes. express.raw() captures the buffer
// intact so the HMAC in webhookController can verify the real signature.
// express.json() is intentionally NOT applied here.
app.use('/api/webhooks', express.raw({ type: 'application/json' }), require('./src/routes/webhooks'))

app.use(express.json())

// ── API Docs (dev / test only) ───────────────────────────────────────────────
// Disabled in production — the interactive UI should never be publicly
// reachable on a live system. Helmet's CSP is relaxed for this path only
// because swagger-ui-express serves inline <script> and <iframe> tags.
if (process.env.NODE_ENV !== 'production') {
  app.use(
    '/api/docs',
    (req, res, next) => {
      // Temporarily disable CSP for the docs path so the Swagger UI loads
      helmet({ contentSecurityPolicy: false })(req, res, next)
    },
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true }),
  )
}

// Apply rate limiter globally to all API routes
app.use(rateLimiter)

// Routes
const routes = [
  { path: '/api/customers', file: './src/routes/customers' },
  { path: '/api/bookings',  file: './src/routes/bookings'  },
  { path: '/api/payments',  file: './src/routes/payments'  },
  { path: '/api/services',  file: './src/routes/services'  },
  { path: '/api/staff',     file: './src/routes/staff'     },
  { path: '/api/support',   file: './src/routes/support'   },
  { path: '/api/dashboard', file: './src/routes/dashboard' },
  { path: '/api/reports',   file: './src/routes/reports'   },
]

app.use('/api/auth', require('./src/routes/auth'))

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
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\x1b[32m  ✔  API Docs   \x1b[0m http://localhost:${PORT}/api/docs`)
    }
    console.log(`\x1b[35m${line}\x1b[0m`)
    console.log('\x1b[36m  Routes registered:\x1b[0m')
    routes.forEach(({ path }) => console.log(`\x1b[90m    POST/GET/PUT/DELETE  ${path}\x1b[0m`))
    console.log(`\x1b[90m    POST                 /api/webhooks/razorpay\x1b[0m`)
    console.log(`\x1b[90m    GET                  /api/health\x1b[0m`)
    console.log(`\x1b[35m${line}\x1b[0m\n`)
  })
}

start()
