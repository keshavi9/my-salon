const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Auth middleware performs two checks on every authenticated request:
// 1. JWT signature/expiry verification (stateless, fast)
// 2. DB lookup to confirm the user still exists and is still active
//    — this closes the "ghost user" gap where a deleted/deactivated
//    account remains authenticated for the full token lifetime (7 days).
module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ success: false, message: 'No token, unauthorized' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // DB check: reject if user was deleted or deactivated since this token was issued.
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'role', 'isActive'],
    })

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' })
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' })
    }

    // Attach fresh data from DB (not just the stale JWT payload) so that
    // role changes made after token issuance are also honoured.
    req.user = { id: user.id, role: user.role }
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}
