const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

module.exports = apiLimiter;
