const router = require('express').Router()
const { getDashboardData } = require('../controllers/dashboardController')
const auth = require('../middleware/auth')

router.use(auth)
router.get('/', getDashboardData)

module.exports = router
